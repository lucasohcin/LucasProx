import http from "node:http";
import https from "node:https";
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

function joinBareHeadersFromObject(rawHeaders) {
  const joined = Object.create(null);
  for (const [k, v] of Object.entries(rawHeaders || {})) {
    if (v !== undefined) {
      joined[k.toLowerCase()] = Array.isArray(v) ? v.join(", ") : String(v);
    }
  }
  const prefix = "x-bare-headers";
  if (`${prefix}-0` in joined) {
    const parts = [];
    for (const [key, value] of Object.entries(joined)) {
      if (!key.startsWith(`${prefix}-`)) continue;
      const rawVal = value.startsWith(";") ? value.slice(1) : value;
      const id = parseInt(key.slice(prefix.length + 1), 10);
      if (!Number.isNaN(id)) {
        parts[id] = rawVal;
      }
      delete joined[key];
    }
    joined[prefix] = parts.join("");
  }
  return joined;
}

function toAsciiJson(obj) {
  return JSON.stringify(obj).replace(
    /[\u007f-\uffff]/g,
    (ch) => "\\u" + ch.charCodeAt(0).toString(16).padStart(4, "0")
  );
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

function performUpstreamRequest(remoteUrl, method, sendHeaders, incomingReq) {
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

    if (method !== "GET" && method !== "HEAD") {
      incomingReq.pipe(outgoing);
    } else {
      outgoing.end();
    }
  });
}

export default async function handler(req, res) {
  for (const [k, v] of Object.entries(CORS_HEADERS)) {
    res.setHeader(k, v);
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    const reqHeaders = joinBareHeadersFromObject(req.headers);
    const xBareUrl = reqHeaders["x-bare-url"];

    if (!xBareUrl) {
      const info = JSON.stringify({
        versions: ["v1", "v2", "v3"],
        language: "NodeJS",
        memoryUsage: 0,
        project: {
          name: "LucasProx Bare V3 Server",
          description: "Vercel Serverless Bare V3 HTTP Proxy",
          version: "3.0.0",
        },
      });
      res.setHeader("content-type", "application/json");
      res.writeHead(200);
      res.end(info);
      return;
    }

    const remoteUrl = new URL(xBareUrl);
    const xBareHeadersRaw = reqHeaders["x-bare-headers"] || "{}";
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

    sendHeaders["Host"] = remoteUrl.host;
    sendHeaders["accept-encoding"] = "gzip, deflate, br";

    if (!sendHeaders["accept-language"] && !sendHeaders["Accept-Language"]) {
      const lang = reqHeaders["accept-language"];
      if (lang) sendHeaders["Accept-Language"] = lang;
    }

    const upstreamRes = await performUpstreamRequest(
      remoteUrl,
      req.method || "GET",
      sendHeaders,
      req
    );

    const statusCode = upstreamRes.statusCode || 200;
    const statusText =
      String(upstreamRes.statusMessage || "OK").replace(/[^\t\x20-\x7e]/g, "") ||
      "OK";
    const bareHeadersObj = collectBareResponseHeaders(upstreamRes);
    const bareHeadersStr = toAsciiJson(bareHeadersObj);

    res.setHeader("cache-control", "no-store");
    res.setHeader("x-bare-status", String(statusCode));
    res.setHeader("x-bare-status-text", statusText);

    if (bareHeadersStr.length > MAX_HEADER_VALUE) {
      let split = 0;
      for (let i = 0; i < bareHeadersStr.length; i += MAX_HEADER_VALUE) {
        const part = bareHeadersStr.slice(i, i + MAX_HEADER_VALUE);
        res.setHeader(`x-bare-headers-${split++}`, `;${part}`);
      }
    } else {
      res.setHeader("x-bare-headers", bareHeadersStr);
    }

    const contentType = upstreamRes.headers["content-type"];
    if (typeof contentType === "string") {
      res.setHeader("content-type", contentType);
    }

    res.writeHead(200, "OK");

    if (req.method === "HEAD" || NULL_BODY_STATUS.has(statusCode)) {
      upstreamRes.resume();
      res.end();
      return;
    }

    const encoding = String(upstreamRes.headers["content-encoding"] || "")
      .toLowerCase()
      .trim();

    let stream = upstreamRes;
    const onStreamError = () => {
      if (!res.writableEnded) res.end();
    };

    if (encoding === "gzip" || encoding === "x-gzip") {
      const gunzip = zlib.createGunzip({
        flush: zlib.constants.Z_SYNC_FLUSH,
        finishFlush: zlib.constants.Z_SYNC_FLUSH,
      });
      gunzip.on("error", onStreamError);
      stream = upstreamRes.pipe(gunzip);
    } else if (encoding === "deflate") {
      const inflate = zlib.createInflate();
      inflate.on("error", onStreamError);
      stream = upstreamRes.pipe(inflate);
    } else if (encoding === "br") {
      const brotli = zlib.createBrotliDecompress();
      brotli.on("error", onStreamError);
      stream = upstreamRes.pipe(brotli);
    }

    stream.on("error", onStreamError);
    stream.pipe(res);
  } catch (err) {
    const code =
      err?.code === "ENOTFOUND"
        ? "HOST_NOT_FOUND"
        : err?.code === "ECONNREFUSED"
        ? "CONNECTION_REFUSED"
        : err?.code === "ECONNRESET"
        ? "CONNECTION_RESET"
        : "UNKNOWN";

    res.setHeader("content-type", "application/json");
    res.writeHead(500);
    res.end(
      JSON.stringify({
        code,
        id: "request",
        message: err?.message || String(err),
      })
    );
  }
}
