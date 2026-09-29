import http from "node:http";
import https from "node:https";
import zlib from "node:zlib";

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

const USER_AGENTS = {
  default:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  chrome:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  safari:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
  iphone:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  android:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
  bot:
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
};

const ADBLOCK_DOMAINS = [
  "doubleclick.net",
  "googlesyndication.com",
  "googleadservices.com",
  "google-analytics.com",
  "googletagmanager.com",
  "adservice.google.com",
  "pagead2.googlesyndication.com",
  "connect.facebook.net",
  "analytics.tiktok.com",
  "ads-twitter.com",
  "scorecardresearch.com",
  "adnxs.com",
  "criteo.com",
  "taboola.com",
  "outbrain.com",
  "amazon-adsystem.com",
  "hotjar.com",
  "clarity.ms",
  "popads.net",
  "popcash.net",
  "propellerads.com",
  "moatads.com",
  "quantserve.com",
  "rubiconproject.com",
  "openx.net",
  "pubmatic.com",
];

const STRIP_HEADERS = new Set([
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
  "cross-origin-opener-policy",
  "cross-origin-embedder-policy",
  "cross-origin-resource-policy",
  "permissions-policy",
  "feature-policy",
  "report-to",
  "reporting-endpoints",
  "clear-site-data",
]);

export function uvEncode(str) {
  if (!str) return "";
  return encodeURIComponent(
    String(str)
      .split("")
      .map((ch, idx) =>
        idx % 2 ? String.fromCharCode(ch.charCodeAt(0) ^ 2) : ch
      )
      .join("")
  );
}

export function uvDecode(str) {
  if (!str) return "";
  try {
    const [input, ...search] = String(str).split("?");
    const decoded = decodeURIComponent(input)
      .split("")
      .map((ch, idx) =>
        idx % 2 ? String.fromCharCode(ch.charCodeAt(0) ^ 2) : ch
      )
      .join("");
    return decoded + (search.length ? "?" + search.join("?") : "");
  } catch {
    return "";
  }
}

function isBlockedDomain(hostname) {
  const host = String(hostname || "").toLowerCase();
  return ADBLOCK_DOMAINS.some(
    (domain) => host === domain || host.endsWith(`.${domain}`)
  );
}

function fetchUpstream(targetUrl, options = {}, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 6) {
      reject(new Error("Too many redirects"));
      return;
    }

    const isHttps = targetUrl.protocol === "https:";
    const requestFn = isHttps ? https.request : http.request;

    const req = requestFn(
      targetUrl,
      {
        method: options.method || "GET",
        headers: options.headers || {},
        agent: isHttps ? httpsAgent : httpAgent,
        timeout: 22000,
      },
      (res) => {
        const status = res.statusCode || 200;
        const location = res.headers.location;
        if (
          [301, 302, 303, 307, 308].includes(status) &&
          location &&
          (options.method === "GET" || options.method === "HEAD" || status === 303)
        ) {
          res.resume();
          try {
            const nextUrl = new URL(location, targetUrl);
            const nextHeaders = { ...options.headers, Host: nextUrl.host };
            fetchUpstream(
              nextUrl,
              {
                ...options,
                method: status === 303 ? "GET" : options.method,
                headers: nextHeaders,
              },
              redirectCount + 1
            )
              .then(resolve)
              .catch(reject);
            return;
          } catch {
            // Fall through if Location header is malformed
          }
        }
        resolve({ res, finalUrl: targetUrl });
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error("Upstream request timed out"));
    });
    req.on("error", reject);

    if (options.body && options.method !== "GET" && options.method !== "HEAD") {
      req.write(options.body);
    }
    req.end();
  });
}

function createDecompressedStream(res) {
  const encoding = String(res.headers["content-encoding"] || "")
    .toLowerCase()
    .trim();
  if (encoding === "gzip" || encoding === "x-gzip") {
    return res.pipe(
      zlib.createGunzip({
        flush: zlib.constants.Z_SYNC_FLUSH,
        finishFlush: zlib.constants.Z_SYNC_FLUSH,
      })
    );
  }
  if (encoding === "deflate") {
    return res.pipe(zlib.createInflate());
  }
  if (encoding === "br") {
    return res.pipe(zlib.createBrotliDecompress());
  }
  return res;
}

function readStreamToBuffer(stream, maxBytes = 15 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    stream.on("data", (chunk) => {
      total += chunk.length;
      if (total <= maxBytes) {
        chunks.push(chunk);
      }
    });
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

function buildProxyUrl(rawUrl, baseUrl, engine, ua, adblock) {
  if (!rawUrl) return rawUrl;
  const trimmed = String(rawUrl).trim();
  if (
    !trimmed ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:") ||
    trimmed.startsWith("/api/proxy") ||
    trimmed.startsWith("/service/uv/")
  ) {
    return rawUrl;
  }

  let resolved;
  try {
    resolved = new URL(trimmed, baseUrl).href;
  } catch {
    return rawUrl;
  }

  const params = new URLSearchParams();
  if (ua && ua !== "default") params.set("ua", ua);
  if (adblock) params.set("adblock", "1");
  const suffix = params.toString() ? `?${params.toString()}` : "";

  if (engine === "uv") {
    return `/service/uv/${uvEncode(resolved)}${suffix}`;
  }
  params.set("engine", engine || "direct");
  params.set("url", resolved);
  return `/api/proxy?${params.toString()}`;
}

function rewriteCss(cssText, baseUrl, engine, ua, adblock) {
  return String(cssText)
    .replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (match, quote, urlVal) => {
      const rewritten = buildProxyUrl(urlVal, baseUrl, engine, ua, adblock);
      return `url(${quote}${rewritten}${quote})`;
    })
    .replace(/@import\s+(['"])([^'"]+)\1/gi, (match, quote, urlVal) => {
      const rewritten = buildProxyUrl(urlVal, baseUrl, engine, ua, adblock);
      return `@import ${quote}${rewritten}${quote}`;
    });
}

function buildInjectedRuntimeScript(finalUrlHref, engine, ua, adblock) {
  const configJson = JSON.stringify({
    baseUrl: finalUrlHref,
    engine: engine || "direct",
    ua: ua || "default",
    adblock: Boolean(adblock),
  });

  return `<script data-lucasprox-injected="1">
(function(){
  const CFG = ${configJson};
  function uvEncode(str) {
    if (!str) return "";
    return encodeURIComponent(
      String(str).split("").map((ch, idx) => idx % 2 ? String.fromCharCode(ch.charCodeAt(0) ^ 2) : ch).join("")
    );
  }
  function wrapUrl(raw, base) {
    if (!raw) return raw;
    const s = String(raw).trim();
    if (!s || s.startsWith("#") || s.startsWith("data:") || s.startsWith("blob:") || s.startsWith("javascript:") || s.startsWith("mailto:") || s.startsWith("/api/proxy") || s.startsWith("/service/uv/") || s.startsWith(location.origin + "/api/proxy") || s.startsWith(location.origin + "/service/uv/")) {
      return raw;
    }
    try {
      const resolved = new URL(s, base || CFG.baseUrl).href;
      if (resolved.startsWith(location.origin + "/")) {
        const subPath = resolved.slice(location.origin.length);
        if (subPath.startsWith("/api/") || subPath.startsWith("/service/")) return raw;
        const originBase = new URL(CFG.baseUrl).origin;
        return wrapUrl(originBase + subPath, CFG.baseUrl);
      }
      if (CFG.engine === "uv") {
        const q = [];
        if (CFG.ua && CFG.ua !== "default") q.push("ua=" + encodeURIComponent(CFG.ua));
        if (CFG.adblock) q.push("adblock=1");
        return "/service/uv/" + uvEncode(resolved) + (q.length ? "?" + q.join("&") : "");
      }
      const p = new URLSearchParams();
      p.set("engine", CFG.engine);
      p.set("url", resolved);
      if (CFG.ua && CFG.ua !== "default") p.set("ua", CFG.ua);
      if (CFG.adblock) p.set("adblock", "1");
      return "/api/proxy?" + p.toString();
    } catch {
      return raw;
    }
  }

  // Notify parent frame of URL and Title
  function notifyParent() {
    try {
      window.parent.postMessage({
        type: "lucasprox:page-state",
        url: CFG.baseUrl,
        title: document.title || CFG.baseUrl,
        engine: CFG.engine
      }, "*");
    } catch {}
  }
  window.addEventListener("DOMContentLoaded", notifyParent);
  window.addEventListener("load", notifyParent);
  setTimeout(notifyParent, 150);

  // Forward console events to LucasProx DevTools
  ["log", "info", "warn", "error"].forEach((level) => {
    const orig = console[level];
    console[level] = function(...args) {
      try {
        window.parent.postMessage({
          type: "lucasprox:console",
          level,
          message: args.map((a) => {
            try { return typeof a === "object" ? JSON.stringify(a) : String(a); }
            catch { return String(a); }
          }).join(" "),
          timestamp: Date.now()
        }, "*");
      } catch {}
      return orig.apply(this, args);
    };
  });

  // Intercept fetch
  const origFetch = window.fetch;
  if (origFetch) {
    window.fetch = function(input, init) {
      try {
        if (typeof input === "string" || input instanceof URL) {
          const proxied = wrapUrl(String(input), CFG.baseUrl);
          window.parent.postMessage({ type: "lucasprox:net", method: (init && init.method) || "GET", url: String(input), engine: CFG.engine }, "*");
          return origFetch.call(this, proxied, init);
        } else if (input && typeof input.url === "string") {
          const proxied = wrapUrl(input.url, CFG.baseUrl);
          return origFetch.call(this, proxied, init);
        }
      } catch {}
      return origFetch.call(this, input, init);
    };
  }

  // Intercept XHR
  const origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    try {
      const proxied = wrapUrl(String(url), CFG.baseUrl);
      window.parent.postMessage({ type: "lucasprox:net", method: method || "GET", url: String(url), engine: CFG.engine }, "*");
      return origOpen.call(this, method, proxied, ...rest);
    } catch {
      return origOpen.call(this, method, url, ...rest);
    }
  };

  // Intercept window.open
  const origWinOpen = window.open;
  window.open = function(url) {
    if (url) {
      location.href = wrapUrl(String(url), CFG.baseUrl);
      return window;
    }
    return origWinOpen ? origWinOpen.apply(this, arguments) : null;
  };

  // Intercept link clicks and form submissions
  document.addEventListener("click", function(e) {
    const anchor = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!anchor) return;
    const rawHref = anchor.getAttribute("href");
    if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("javascript:")) return;
    if (anchor.target === "_blank" || anchor.target === "_top" || anchor.target === "_parent") {
      anchor.removeAttribute("target");
    }
    if (!rawHref.startsWith("/api/proxy") && !rawHref.startsWith("/service/uv/")) {
      e.preventDefault();
      location.href = wrapUrl(rawHref, CFG.baseUrl);
    }
  }, true);

  document.addEventListener("submit", function(e) {
    const form = e.target;
    if (!form || form.tagName !== "FORM") return;
    const method = (form.method || "GET").toUpperCase();
    const rawAction = form.getAttribute("action") || CFG.baseUrl;
    if (method === "GET") {
      e.preventDefault();
      const targetUrl = new URL(rawAction, CFG.baseUrl);
      const fd = new FormData(form);
      for (const [k, v] of fd.entries()) {
        targetUrl.searchParams.set(k, String(v));
      }
      location.href = wrapUrl(targetUrl.href, CFG.baseUrl);
    } else if (!rawAction.startsWith("/api/proxy") && !rawAction.startsWith("/service/uv/")) {
      form.action = wrapUrl(rawAction, CFG.baseUrl);
    }
  }, true);
})();
</script>`;
}

function rewriteHtml(htmlText, finalUrl, engine, ua, adblock) {
  const baseUrl = finalUrl.href;
  let output = String(htmlText);

  // Remove existing CSP or base tags that could conflict
  output = output.replace(
    /<meta[^>]+http-equiv\s*=\s*['"]?content-security-policy['"]?[^>]*>/gi,
    ""
  );
  output = output.replace(/\sintegrity\s*=\s*(['"])[^'"]*\1/gi, "");
  output = output.replace(/\scrossorigin(?:\s*=\s*(['"])[^'"]*\1)?/gi, "");

  // Rewrite standard URL attributes: href, src, action, poster, data-src
  output = output.replace(
    /\b(href|src|action|poster|data-src)\s*=\s*(['"])([^'"]+)\2/gi,
    (match, attr, quote, val) => {
      const rewritten = buildProxyUrl(val, baseUrl, engine, ua, adblock);
      return `${attr}=${quote}${rewritten}${quote}`;
    }
  );

  // Rewrite srcset
  output = output.replace(
    /\bsrcset\s*=\s*(['"])([^'"]+)\1/gi,
    (match, quote, srcsetVal) => {
      const parts = srcsetVal
        .split(",")
        .map((entry) => {
          const trimmed = entry.trim();
          if (!trimmed) return "";
          const spaceIdx = trimmed.search(/\s/);
          if (spaceIdx === -1) {
            return buildProxyUrl(trimmed, baseUrl, engine, ua, adblock);
          }
          const urlPart = trimmed.slice(0, spaceIdx);
          const descPart = trimmed.slice(spaceIdx);
          return `${buildProxyUrl(urlPart, baseUrl, engine, ua, adblock)}${descPart}`;
        })
        .filter(Boolean);
      return `srcset=${quote}${parts.join(", ")}${quote}`;
    }
  );

  // Rewrite inline styleblocks
  output = output.replace(
    /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi,
    (match, openTag, cssContent, closeTag) =>
      `${openTag}${rewriteCss(cssContent, baseUrl, engine, ua, adblock)}${closeTag}`
  );

  // Strip target="_top" / "_parent" / "_blank" so navigation stays inside proxy frame
  output = output.replace(/\btarget\s*=\s*(['"])_(?:top|parent|blank)\1/gi, 'target="_self"');

  const runtimeScript = buildInjectedRuntimeScript(baseUrl, engine, ua, adblock);
  if (/<head[^>]*>/i.test(output)) {
    output = output.replace(/<head[^>]*>/i, (m) => `${m}${runtimeScript}`);
  } else {
    output = `${runtimeScript}${output}`;
  }

  return output;
}

function renderReaderModeHtml(rawHtml, finalUrl, ua, adblock) {
  const html = String(rawHtml);
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const rawTitle = titleMatch
    ? titleMatch[1].replace(/\s+/g, " ").trim()
    : finalUrl.hostname;

  // Strip scripts, styles, nav, footer, svg, noscript, iframe
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "");

  // Prefer <article> or <main> if present
  const articleMatch =
    cleaned.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
    cleaned.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
    cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

  let bodyHtml = articleMatch ? articleMatch[1] : cleaned;

  // Rewrite links and images inside reader view to stay proxied in reader mode
  bodyHtml = bodyHtml.replace(
    /\b(href|src)\s*=\s*(['"])([^'"]+)\2/gi,
    (match, attr, quote, val) => {
      const mode = attr.toLowerCase() === "href" ? "reader" : "direct";
      const proxied = buildProxyUrl(val, finalUrl.href, mode, ua, adblock);
      return `${attr}=${quote}${proxied}${quote}`;
    }
  );

  // Calculate rough word count & reading time
  const plainText = bodyHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = plainText ? plainText.split(" ").length : 0;
  const readingMinutes = Math.max(1, Math.round(wordCount / 200));

  const fullModeUrl = buildProxyUrl(finalUrl.href, finalUrl.href, "uv", ua, adblock);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${rawTitle} • LucasProx Reader</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0b0d13;
      --surface: #121621;
      --border: rgba(255,255,255,0.09);
      --text: #e8ecf4;
      --muted: #94a0b8;
      --accent: #7c5cff;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 36px 20px 80px;
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
      line-height: 1.72;
      font-size: 17px;
    }
    .reader-shell {
      max-width: 760px;
      margin: 0 auto;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 32px 36px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.45);
    }
    .reader-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-bottom: 18px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border);
      font-size: 13px;
      color: var(--muted);
    }
    .reader-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 999px;
      background: rgba(124,92,255,0.16);
      color: #b7a5ff;
      font-weight: 600;
    }
    .reader-actions a {
      color: #b7a5ff;
      text-decoration: none;
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid rgba(124,92,255,0.35);
    }
    h1.reader-title {
      font-size: 28px;
      line-height: 1.3;
      margin: 0 0 12px;
      color: #fff;
    }
    .reader-domain {
      color: var(--muted);
      font-size: 14px;
      margin-bottom: 28px;
      word-break: break-all;
    }
    .reader-content img, .reader-content video {
      max-width: 100%;
      height: auto;
      border-radius: 10px;
    }
    .reader-content a {
      color: #65d2ff;
    }
    .reader-content pre, .reader-content code {
      background: rgba(0,0,0,0.35);
      border-radius: 6px;
      padding: 2px 6px;
      overflow-x: auto;
      font-size: 0.92em;
    }
    .reader-content pre {
      padding: 14px;
    }
  </style>
</head>
<body>
  <div class="reader-shell">
    <div class="reader-bar">
      <div>
        <span class="reader-badge">⚡ LucasProx ReaderLite</span>
        <span style="margin-left:10px;">${wordCount.toLocaleString()} words • ~${readingMinutes} min read</span>
      </div>
      <div class="reader-actions">
        <a href="${fullModeUrl}">Switch to Full Proxy View →</a>
      </div>
    </div>
    <h1 class="reader-title">${rawTitle}</h1>
    <div class="reader-domain">${finalUrl.href}</div>
    <div class="reader-content">${bodyHtml}</div>
  </div>
  ${buildInjectedRuntimeScript(finalUrl.href, "reader", ua, adblock)}
</body>
</html>`;
}

export default async function proxyHandler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    const reqUrl = new URL(req.url || "/", "http://localhost");
    let engine = (reqUrl.searchParams.get("engine") || "direct").toLowerCase();
    const uaKey = (reqUrl.searchParams.get("ua") || "default").toLowerCase();
    const adblock = reqUrl.searchParams.get("adblock") === "1";

    let rawTarget = reqUrl.searchParams.get("url") || "";

    // Support /service/uv/<xor_encoded_url> path routing
    if (!rawTarget && reqUrl.pathname.startsWith("/service/uv/")) {
      engine = "uv";
      const encodedPart = reqUrl.pathname.slice("/service/uv/".length);
      rawTarget = uvDecode(encodedPart);
    }

    if (!rawTarget) {
      res.setHeader("content-type", "application/json");
      res.writeHead(400);
      res.end(
        JSON.stringify({
          error: "Missing target URL",
          engines: ["scramjet", "uv", "aero", "direct", "reader"],
        })
      );
      return;
    }

    let targetUrl;
    try {
      targetUrl = new URL(rawTarget);
    } catch {
      targetUrl = new URL(`https://${rawTarget}`);
    }

    // Ad & Tracker Blocker check
    if (adblock && isBlockedDomain(targetUrl.hostname)) {
      res.setHeader("x-lucasprox-blocked", "1");
      res.writeHead(204);
      res.end();
      return;
    }

    const userAgent = USER_AGENTS[uaKey] || USER_AGENTS.default;
    const sendHeaders = {
      Host: targetUrl.host,
      "User-Agent": userAgent,
      Accept:
        req.headers["accept"] ||
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": req.headers["accept-language"] || "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      Referer: targetUrl.origin + "/",
    };

    if (req.headers["content-type"]) {
      sendHeaders["Content-Type"] = req.headers["content-type"];
    }

    let reqBody = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
      reqBody = await readStreamToBuffer(req, 5 * 1024 * 1024);
    }

    const { res: upstreamRes, finalUrl } = await fetchUpstream(targetUrl, {
      method: req.method || "GET",
      headers: sendHeaders,
      body: reqBody,
    });

    const statusCode = upstreamRes.statusCode || 200;
    const contentType = String(upstreamRes.headers["content-type"] || "");

    for (const [k, v] of Object.entries(upstreamRes.headers)) {
      if (v === undefined) continue;
      const lower = k.toLowerCase();
      if (STRIP_HEADERS.has(lower)) continue;
      if (lower === "set-cookie") continue;
      try {
        res.setHeader(k, v);
      } catch {
        // Ignore invalid upstream headers
      }
    }

    res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
    res.setHeader("X-LucasProx-Engine", engine);
    res.setHeader("X-LucasProx-Final-Url", finalUrl.href);

    const stream = createDecompressedStream(upstreamRes);

    // Rewrite HTML or CSS documents
    if (
      contentType.includes("text/html") ||
      contentType.includes("application/xhtml+xml")
    ) {
      const buf = await readStreamToBuffer(stream);
      const rawHtml = buf.toString("utf-8");
      const rewrittenHtml =
        engine === "reader"
          ? renderReaderModeHtml(rawHtml, finalUrl, uaKey, adblock)
          : rewriteHtml(rawHtml, finalUrl, engine, uaKey, adblock);

      res.setHeader("content-type", "text/html; charset=utf-8");
      res.writeHead(statusCode);
      res.end(rewrittenHtml);
      return;
    }

    if (contentType.includes("text/css")) {
      const buf = await readStreamToBuffer(stream);
      const rawCss = buf.toString("utf-8");
      const rewrittenCss = rewriteCss(rawCss, finalUrl.href, engine, uaKey, adblock);
      res.setHeader("content-type", "text/css; charset=utf-8");
      res.writeHead(statusCode);
      res.end(rewrittenCss);
      return;
    }

    // Stream binary / JSON / JS / media assets directly
    res.writeHead(statusCode);
    stream.on("error", () => {
      if (!res.writableEnded) res.end();
    });
    stream.pipe(res);
  } catch (err) {
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.writeHead(502);
    res.end(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Proxy Connection Error • LucasProx</title>
  <style>
    body { margin:0; min-height:100vh; display:grid; place-items:center; background:#090a0f; color:#f3f5fa; font-family:system-ui,sans-serif; padding:24px; }
    .card { max-width:520px; background:#121521; border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:28px; text-align:center; }
    h2 { margin:0 0 10px; color:#ff6b81; }
    p { color:#9aa4bc; line-height:1.5; font-size:14px; }
    code { display:block; margin:14px 0; padding:10px; background:rgba(0,0,0,0.35); border-radius:8px; color:#ffb8c6; font-size:12px; word-break:break-all; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Site Temporarily Unavailable</h2>
    <p>This site didn't respond on the current proxy route. Click <strong>Switch Proxy</strong> in the top bar to try another route.</p>
    <code>${String(err?.message || err).replace(/[<>&]/g, "")}</code>
  </div>
</body>
</html>`);
  }
}
