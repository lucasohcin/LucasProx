import http from "node:http";
import https from "node:https";
import { Readable } from "node:stream";
import zlib from "node:zlib";

const MAX_HEADER_VALUE = 3072;

const CORS_HEADERS = {
  "x-robots-tag": "noindex",
  "access-control-allow-headers": "*",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "*",
  "access-control-expose-headers": "*",
  "access-control-max-age": "7200",
};

const FORBIDDEN_SEND_HEADERS = new Set([
  "connection",
  "content-length",
  "transfer-encoding",
  "keep-alive",
  "upgrade",
  "http2-settings",
]);

// Strip headers that become invalid after stream decompression or that bloat
// serverless response headers past AWS Lambda's 6KB header limit (Scramjet strips CSP/frame headers anyway).
const STRIP_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
  "keep-alive",
  "content-security-policy",
  "content-security-policy-report-only",
  "x-frame-options",
  "x-xss-protection",
  "strict-transport-security",
  "report-to",
  "reporting-endpoints",
  "nel",
  "permissions-policy",
  "feature-policy",
  "expect-ct",
  "clear-site-data",
  "alt-svc",
  "server-timing",
  "cross-origin-opener-policy",
  "cross-origin-embedder-policy",
  "cross-origin-resource-policy",
]);

const NULL_BODY_STATUS = new Set([101, 204, 205, 304]);

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

function joinBareHeaders(headers) {
  const output = new Headers(headers);
  const prefix = "x-bare-headers";
  if (headers.has(`${prefix}-0`)) {
    const join = [];
    for (const [header, value] of headers) {
      if (!header.toLowerCase().startsWith(prefix)) continue;
      const rawVal = value.startsWith(";") ? value.slice(1) : value;
      const id = parseInt(header.slice(prefix.length + 1), 10);
      if (!Number.isNaN(id)) {
        join[id] = rawVal;
      }
      output.delete(header);
    }
    output.set(prefix, join.join(""));
  }
  return output;
}

function splitBareHeaders(headers) {
  const output = new Headers(headers);
  if (headers.has("x-bare-headers")) {
    const value = headers.get("x-bare-headers") || "";
    if (value.length > MAX_HEADER_VALUE) {
      output.delete("x-bare-headers");
      let split = 0;
      for (let i = 0; i < value.length; i += MAX_HEADER_VALUE) {
        const part = value.slice(i, i + MAX_HEADER_VALUE);
        output.set(`x-bare-headers-${split++}`, `;${part}`);
      }
    }
  }
  return output;
}

function toAsciiJson(obj) {
  return JSON.stringify(obj).replace(
    /[\u007f-\uffff]/g,
    (ch) => "\\u" + ch.charCodeAt(0).toString(16).padStart(4, "0")
  );
}

function performUpstreamRequest(remoteUrl, method, sendHeaders, reqBodyStream) {
  return new Promise((resolve, reject) => {
    const isHttps = remoteUrl.protocol === "https:";
    const requestFn = isHttps ? https.request : http.request;

    const outgoing = requestFn(remoteUrl, {
      method,
      headers: sendHeaders,
      setHost: false,
      agent: isHttps ? httpsAgent : httpAgent,
      timeout: 25000,
    });

    outgoing.on("response", (res) => resolve(res));
    outgoing.on("timeout", () => {
      outgoing.destroy(new Error("Upstream request timed out"));
    });
    outgoing.on("error", (err) => reject(err));

    if (reqBodyStream && method !== "GET" && method !== "HEAD") {
      Readable.fromWeb(reqBodyStream).pipe(outgoing);
    } else {
      outgoing.end();
    }
  });
}

function decodeUpstreamStream(res, method) {
  if (method === "HEAD" || NULL_BODY_STATUS.has(res.statusCode)) {
    res.resume();
    return null;
  }

  const encoding = String(res.headers["content-encoding"] || "")
    .toLowerCase()
    .trim();

  let stream = res;
  const onStreamError = () => {
    // Prevent uncaught stream errors on prematurely closed upstream responses
  };

  if (encoding === "gzip" || encoding === "x-gzip") {
    const gunzip = zlib.createGunzip({
      flush: zlib.constants.Z_SYNC_FLUSH,
      finishFlush: zlib.constants.Z_SYNC_FLUSH,
    });
    gunzip.on("error", onStreamError);
    stream = res.pipe(gunzip);
  } else if (encoding === "deflate") {
    const inflate = zlib.createInflate();
    inflate.on("error", onStreamError);
    stream = res.pipe(inflate);
  } else if (encoding === "br") {
    const brotli = zlib.createBrotliDecompress();
    brotli.on("error", onStreamError);
    stream = res.pipe(brotli);
  }

  return Readable.toWeb(stream);
}

function collectBareResponseHeaders(res) {
  const result = Object.create(null);

  for (const [key, val] of Object.entries(res.headers)) {
    if (val === undefined) continue;
    const lower = key.toLowerCase();
    if (STRIP_RESPONSE_HEADERS.has(lower)) continue;
    result[lower] = val;
  }

  return result;
}

export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const reqHeaders = joinBareHeaders(request.headers);
    const xBareUrl = reqHeaders.get("x-bare-url");

    // If x-bare-url is not provided, return Bare Server instance metadata
    if (!xBareUrl) {
      return Response.json(
        {
          versions: ["v1", "v2", "v3"],
          language: "NodeJS",
          memoryUsage: 0,
          project: {
            name: "LucasProx Bare V3 Server",
            description: "Serverless Bare V3 HTTP Proxy",
            version: "3.0.0",
          },
        },
        { status: 200, headers: CORS_HEADERS }
      );
    }

    const remoteUrl = new URL(xBareUrl);
    const xBareHeadersRaw = reqHeaders.get("x-bare-headers") || "{}";
    let parsedHeaders;
    try {
      parsedHeaders = JSON.parse(xBareHeadersRaw);
    } catch {
      parsedHeaders = {};
    }

    const sendHeaders = Object.create(null);
    for (const [key, value] of Object.entries(parsedHeaders)) {
      const lower = key.toLowerCase();
      if (FORBIDDEN_SEND_HEADERS.has(lower) || lower.startsWith(":")) continue;
      if (typeof value === "string" || Array.isArray(value)) {
        sendHeaders[key] = value;
      }
    }

    // Ensure Host and a supported Accept-Encoding are set
    sendHeaders["Host"] = remoteUrl.host;
    sendHeaders["accept-encoding"] = "gzip, deflate, br";

    if (!sendHeaders["accept-language"] && !sendHeaders["Accept-Language"]) {
      const lang = request.headers.get("accept-language");
      if (lang) sendHeaders["Accept-Language"] = lang;
    }

    const upstreamRes = await performUpstreamRequest(
      remoteUrl,
      request.method,
      sendHeaders,
      request.body
    );

    const statusCode = upstreamRes.statusCode || 200;
    const statusText =
      String(upstreamRes.statusMessage || "OK").replace(/[^\t\x20-\x7e]/g, "") ||
      "OK";
    const bareHeadersObj = collectBareResponseHeaders(upstreamRes);

    const outHeaders = new Headers(CORS_HEADERS);
    outHeaders.set("cache-control", "no-store");
    outHeaders.set("x-bare-status", String(statusCode));
    outHeaders.set("x-bare-status-text", statusText);
    outHeaders.set("x-bare-headers", toAsciiJson(bareHeadersObj));

    const contentType = upstreamRes.headers["content-type"];
    if (typeof contentType === "string") {
      outHeaders.set("content-type", contentType);
    }

    const finalHeaders = splitBareHeaders(outHeaders);
    const bodyStream = decodeUpstreamStream(upstreamRes, request.method);

    return new Response(bodyStream, {
      status: 200,
      statusText: "OK",
      headers: finalHeaders,
    });
  } catch (err) {
    const code =
      err?.code === "ENOTFOUND"
        ? "HOST_NOT_FOUND"
        : err?.code === "ECONNREFUSED"
        ? "CONNECTION_REFUSED"
        : err?.code === "ECONNRESET"
        ? "CONNECTION_RESET"
        : "UNKNOWN";

    return Response.json(
      {
        code,
        id: "request",
        message: err?.message || String(err),
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
};
