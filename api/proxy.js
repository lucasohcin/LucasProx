import http from "node:http";
import https from "node:https";
import zlib from "node:zlib";

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

const DEFAULT_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

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
];

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
  "cross-origin-opener-policy",
  "cross-origin-embedder-policy",
  "cross-origin-resource-policy",
  "permissions-policy",
  "feature-policy",
  "report-to",
  "reporting-endpoints",
  "clear-site-data",
  "x-content-type-options",
  "alt-svc",
]);

const SKIP_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "content-length",
  "transfer-encoding",
  "keep-alive",
  "upgrade",
  "accept-encoding",
  "origin",
  "referer",
  "cookie",
  "sec-fetch-site",
  "sec-fetch-mode",
  "sec-fetch-dest",
  "sec-fetch-user",
  "x-forwarded-for",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-forwarded-port",
  "x-real-ip",
  "x-vercel-id",
  "x-vercel-deployment-url",
  "x-vercel-forwarded-for",
  "x-vercel-ip-city",
  "x-vercel-ip-continent",
  "x-vercel-ip-country",
  "x-vercel-ip-country-region",
  "x-vercel-ip-latitude",
  "x-vercel-ip-longitude",
  "x-vercel-ip-timezone",
  "x-vercel-ja4-digest",
  "x-vercel-proxied-for",
  "x-vercel-sc-headers",
  "x-vercel-sc-host",
  "x-vercel-sc-basepath",
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
            const nextHeaders = {
              ...options.headers,
              Host: nextUrl.host,
              Origin: nextUrl.origin,
              Referer: targetUrl.href,
            };
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
          } catch {}
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

function buildProxyUrl(rawUrl, baseUrl, engine, adblock) {
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
  if (adblock) params.set("adblock", "1");
  const suffix = params.toString() ? `?${params.toString()}` : "";

  if (engine === "uv") {
    return `/service/uv/${uvEncode(resolved)}${suffix}`;
  }
  params.set("engine", engine || "direct");
  params.set("url", resolved);
  return `/api/proxy?${params.toString()}`;
}

function rewriteCss(cssText, baseUrl, engine, adblock) {
  return String(cssText)
    .replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (match, quote, urlVal) => {
      const rewritten = buildProxyUrl(urlVal, baseUrl, engine, adblock);
      return `url(${quote}${rewritten}${quote})`;
    })
    .replace(/@import\s+(['"])([^'"]+)\1/gi, (match, quote, urlVal) => {
      const rewritten = buildProxyUrl(urlVal, baseUrl, engine, adblock);
      return `@import ${quote}${rewritten}${quote}`;
    });
}

/**
 * Neutralize proxy/iframe detection & spoof hostname/origin checks inside JS code
 */
function rewriteJsAntiDetection(jsText) {
  return String(jsText)
    .replace(/window\.top\s*!==?\s*window\.self/g, "false")
    .replace(/window\.self\s*!==?\s*window\.top/g, "false")
    .replace(/window\.top\s*===\s*window\.self/g, "true")
    .replace(/window\.self\s*===\s*window\.top/g, "true")
    .replace(/\bwindow\.location\.hostname\b/g, "(window.__lpLoc?window.__lpLoc.hostname:window.location.hostname)")
    .replace(/\bwindow\.location\.origin\b/g, "(window.__lpLoc?window.__lpLoc.origin:window.location.origin)")
    .replace(/\bwindow\.location\.host\b/g, "(window.__lpLoc?window.__lpLoc.host:window.location.host)")
    .replace(/\bdocument\.location\.hostname\b/g, "(window.__lpLoc?window.__lpLoc.hostname:document.location.hostname)")
    .replace(/\bdocument\.location\.origin\b/g, "(window.__lpLoc?window.__lpLoc.origin:document.location.origin)");
}

function buildInjectedRuntimeScript(finalUrlHref, engine, adblock) {
  const configJson = JSON.stringify({
    baseUrl: finalUrlHref,
    engine: engine || "uv",
    adblock: Boolean(adblock),
  });

  return `<script data-lucasprox-injected="1">
(function(){
  const CFG = ${configJson};
  let TARGET_URL = new URL(CFG.baseUrl);

  const origPushState = History.prototype.pushState;
  const origReplaceState = History.prototype.replaceState;

  // CRITICAL FOR SPA ROUTERS (Xbox, Next.js, React Router, Vue, Angular):
  // Immediately restore window.location.pathname + search + hash to the real target path
  // BEFORE any page script executes so client-side routers match routes instead of showing 404 / "cannot be found"!
  try {
    const initialCleanPath = (TARGET_URL.pathname || "/") + (TARGET_URL.search || "") + (TARGET_URL.hash || "");
    origReplaceState.call(history, history.state, "", initialCleanPath);
  } catch {}

  // Spoof location metadata & anti-bot properties so sites never detect proxy host
  window.__lpLoc = {
    get href() { return CFG.baseUrl; },
    set href(v) { window.location.href = wrapUrl(v, CFG.baseUrl); },
    get origin() { return TARGET_URL.origin; },
    get protocol() { return TARGET_URL.protocol; },
    get host() { return TARGET_URL.host; },
    get hostname() { return TARGET_URL.hostname; },
    get port() { return TARGET_URL.port; },
    get pathname() { return TARGET_URL.pathname; },
    get search() { return TARGET_URL.search; },
    get hash() { return window.location.hash || TARGET_URL.hash; },
    assign(v) { window.location.href = wrapUrl(v, CFG.baseUrl); },
    replace(v) { window.location.replace(wrapUrl(v, CFG.baseUrl)); },
    reload() { window.location.reload(); },
    toString() { return CFG.baseUrl; }
  };

  try {
    Object.defineProperty( navigator, "webdriver", { get: () => false, configurable: true });
  } catch {}
  try {
    Object.defineProperty(document, "domain", {
      get: () => TARGET_URL.hostname,
      set: () => {},
      configurable: true
    });
    Object.defineProperty(document, "referrer", {
      get: () => TARGET_URL.origin + "/",
      configurable: true
    });
    Object.defineProperty(document, "URL", {
      get: () => CFG.baseUrl,
      configurable: true
    });
    Object.defineProperty(document, "documentURI", {
      get: () => CFG.baseUrl,
      configurable: true
    });
    Object.defineProperty(window, "origin", {
      get: () => TARGET_URL.origin,
      configurable: true
    });
  } catch {}

  function uvEncode(str) {
    if (!str) return "";
    return encodeURIComponent(
      String(str).split("").map((ch, idx) => idx % 2 ? String.fromCharCode(ch.charCodeAt(0) ^ 2) : ch).join("")
    );
  }

  function resolveAgainstTarget(raw, base) {
    const s = String(raw || "").trim();
    if (!s) return CFG.baseUrl;
    if (s.startsWith("//")) return TARGET_URL.protocol + s;
    if (s.startsWith("/")) return TARGET_URL.origin + s;
    const resolved = new URL(s, base || CFG.baseUrl).href;
    if (resolved.startsWith(location.origin + "/")) {
      const subPath = resolved.slice(location.origin.length);
      if (!subPath.startsWith("/api/") && !subPath.startsWith("/service/")) {
        return TARGET_URL.origin + subPath;
      }
    }
    return resolved;
  }

  function wrapUrl(raw, base) {
    if (!raw) return raw;
    const s = String(raw).trim();
    if (
      !s ||
      s.startsWith("#") ||
      s.startsWith("data:") ||
      s.startsWith("blob:") ||
      s.startsWith("javascript:") ||
      s.startsWith("mailto:") ||
      s.startsWith("tel:") ||
      s.startsWith("/api/proxy") ||
      s.startsWith("/service/uv/") ||
      s.startsWith(location.origin + "/api/proxy") ||
      s.startsWith(location.origin + "/service/uv/")
    ) {
      return raw;
    }
    try {
      const resolved = resolveAgainstTarget(s, base);
      if (resolved.startsWith(location.origin + "/api/") || resolved.startsWith(location.origin + "/service/")) {
        return raw;
      }
      if (CFG.engine === "uv") {
        return "/service/uv/" + uvEncode(resolved) + (CFG.adblock ? "?adblock=1" : "");
      }
      const p = new URLSearchParams();
      p.set("engine", CFG.engine);
      p.set("url", resolved);
      if (CFG.adblock) p.set("adblock", "1");
      return "/api/proxy?" + p.toString();
    } catch {
      return raw;
    }
  }

  // Keep window.location.pathname clean when SPA routers call pushState / replaceState
  function handleSpaStateChange(origFn, state, title, url) {
    try {
      if (url !== undefined && url !== null && String(url) !== "") {
        const rawStr = String(url);
        let nextTarget;
        if (rawStr.startsWith("/service/uv/")) {
          nextTarget = TARGET_URL;
        } else {
          nextTarget = new URL(resolveAgainstTarget(rawStr, CFG.baseUrl));
        }
        CFG.baseUrl = nextTarget.href;
        TARGET_URL = nextTarget;
        const cleanPath = (nextTarget.pathname || "/") + (nextTarget.search || "") + (nextTarget.hash || "");
        const res = origFn.call(history, state, title, cleanPath);
        notifyParent();
        return res;
      }
      return origFn.call(history, state, title);
    } catch {
      return undefined;
    }
  }

  History.prototype.pushState = function(state, title, url) {
    return handleSpaStateChange(origPushState, state, title, url);
  };
  History.prototype.replaceState = function(state, title, url) {
    return handleSpaStateChange(origReplaceState, state, title, url);
  };

  // Intercept setAttribute for dynamic scripts, images, links, iframes
  const origSetAttr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(name, value) {
    const lower = String(name || "").toLowerCase();
    if (lower === "integrity" || lower === "crossorigin" || lower === "nonce") {
      return;
    }
    if (lower === "src" || lower === "href" || lower === "action" || lower === "poster") {
      value = wrapUrl(value, CFG.baseUrl);
    }
    return origSetAttr.call(this, name, value);
  };

  // Intercept direct .src and .href property assignments on DOM elements
  function hookUrlProperty(Proto, prop) {
    if (!Proto || !Proto.prototype) return;
    const desc = Object.getOwnPropertyDescriptor(Proto.prototype, prop);
    if (!desc || !desc.set) return;
    Object.defineProperty(Proto.prototype, prop, {
      get: desc.get,
      set(val) {
        desc.set.call(this, wrapUrl(val, CFG.baseUrl));
      },
      configurable: true,
      enumerable: true,
    });
  }
  hookUrlProperty(window.HTMLScriptElement, "src");
  hookUrlProperty(window.HTMLImageElement, "src");
  hookUrlProperty(window.HTMLLinkElement, "href");
  hookUrlProperty(window.HTMLIFrameElement, "src");
  hookUrlProperty(window.HTMLMediaElement, "src");
  hookUrlProperty(window.HTMLSourceElement, "src");

  // Notify parent frame of URL and Title
  function notifyParent() {
    try {
      window.parent.postMessage({
        type: "lucasprox:page-state",
        url: CFG.baseUrl,
        title: document.title || TARGET_URL.hostname,
        engine: CFG.engine
      }, "*");
    } catch {}
  }
  window.addEventListener("DOMContentLoaded", notifyParent);
  window.addEventListener("load", notifyParent);
  setTimeout(notifyParent, 150);

  // Forward console events
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

  // Intercept fetch (preserving Request objects, custom headers, method, and body!)
  const origFetch = window.fetch;
  if (origFetch) {
    window.fetch = function(input, init) {
      try {
        if (typeof input === "string" || input instanceof URL) {
          const rawUrl = String(input);
          const proxied = wrapUrl(rawUrl, CFG.baseUrl);
          window.parent.postMessage({ type: "lucasprox:net", method: (init && init.method) || "GET", url: rawUrl, engine: CFG.engine }, "*");
          return origFetch.call(this, proxied, init);
        } else if (input && typeof input === "object" && typeof input.url === "string") {
          const rawUrl = input.url;
          const proxied = wrapUrl(rawUrl, CFG.baseUrl);
          window.parent.postMessage({ type: "lucasprox:net", method: (init && init.method) || input.method || "GET", url: rawUrl, engine: CFG.engine }, "*");
          const clonedReq = new Request(proxied, input);
          return origFetch.call(this, clonedReq, init);
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

  // Intercept navigator.sendBeacon
  if (navigator.sendBeacon) {
    const origBeacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = function(url, data) {
      try {
        return origBeacon(wrapUrl(String(url), CFG.baseUrl), data);
      } catch {
        return false;
      }
    };
  }

  // Intercept WebWorker
  const OrigWorker = window.Worker;
  if (OrigWorker) {
    window.Worker = function(scriptURL, options) {
      return new OrigWorker(wrapUrl(String(scriptURL), CFG.baseUrl), options);
    };
  }

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
      const targetUrl = new URL(resolveAgainstTarget(rawAction, CFG.baseUrl));
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

function rewriteHtml(htmlText, finalUrl, engine, adblock) {
  const baseUrl = finalUrl.href;
  let output = String(htmlText);

  // Strip CSP, X-Frame, SRI integrity, and crossorigin attributes that block proxied execution
  output = output.replace(
    /<meta[^>]+http-equiv\s*=\s*['"]?(?:content-security-policy|x-frame-options|refresh)['"]?[^>]*>/gi,
    ""
  );
  output = output.replace(/<base[^>]*>/gi, "");
  output = output.replace(/\sintegrity\s*=\s*(['"])[^'"]*\1/gi, "");
  output = output.replace(/\scrossorigin(?:\s*=\s*(['"])[^'"]*\1)?/gi, "");
  output = output.replace(/\snonce\s*=\s*(['"])[^'"]*\1/gi, "");

  // Protect inline <script> bodies (e.g., Next.js __NEXT_DATA__ JSON blobs) from HTML attribute regex corruption
  const scriptBlocks = [];
  output = output.replace(
    /(<script\b[^>]*>)([\s\S]*?)(<\/script>)/gi,
    (_match, openTag, body, closeTag) => {
      const idx = scriptBlocks.length;
      const isJson = /type\s*=\s*(['"])application\/(?:ld\+)?json\1/i.test(openTag) || /id\s*=\s*(['"])__NEXT_DATA__\1/i.test(openTag);
      scriptBlocks.push({
        body: isJson ? body : rewriteJsAntiDetection(body),
        closeTag,
      });
      return `${openTag}__LP_SCRIPT_BODY_${idx}__`;
    }
  );

  // Rewrite standard URL attributes on HTML tags (both double and single quoted)
  output = output.replace(
    /\b(href|src|action|poster|data-src|data-href)\s*=\s*(['"])([^'"]+)\2/gi,
    (match, attr, quote, val) => {
      const rewritten = buildProxyUrl(val, baseUrl, engine, adblock);
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
            return buildProxyUrl(trimmed, baseUrl, engine, adblock);
          }
          const urlPart = trimmed.slice(0, spaceIdx);
          const descPart = trimmed.slice(spaceIdx);
          return `${buildProxyUrl(urlPart, baseUrl, engine, adblock)}${descPart}`;
        })
        .filter(Boolean);
      return `srcset=${quote}${parts.join(", ")}${quote}`;
    }
  );

  // Rewrite inline style blocks
  output = output.replace(
    /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi,
    (match, openTag, cssContent, closeTag) =>
      `${openTag}${rewriteCss(cssContent, baseUrl, engine, adblock)}${closeTag}`
  );

  // Rewrite inline style="...url(...)..."
  output = output.replace(
    /\bstyle\s*=\s*(['"])([\s\S]*?)\1/gi,
    (match, quote, styleText) => {
      if (!styleText.toLowerCase().includes("url(")) return match;
      return `style=${quote}${rewriteCss(styleText, baseUrl, engine, adblock)}${quote}`;
    }
  );

  // Keep links inside proxy frame
  output = output.replace(
    /\btarget\s*=\s*(['"])_(?:top|parent|blank)\1/gi,
    'target="_self"'
  );

  // Restore inline <script> bodies
  output = output.replace(/__LP_SCRIPT_BODY_(\d+)__/g, (_m, idxStr) => {
    const item = scriptBlocks[Number(idxStr)];
    return item ? `${item.body}${item.closeTag}` : "";
  });

  const runtimeScript = buildInjectedRuntimeScript(baseUrl, engine, adblock);
  if (/<head[^>]*>/i.test(output)) {
    output = output.replace(/<head[^>]*>/i, (m) => `${m}${runtimeScript}`);
  } else {
    output = `${runtimeScript}${output}`;
  }

  return output;
}

function renderReaderModeHtml(rawHtml, finalUrl, adblock) {
  const html = String(rawHtml);
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const rawTitle = titleMatch
    ? titleMatch[1].replace(/\s+/g, " ").trim()
    : finalUrl.hostname;

  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "");

  const articleMatch =
    cleaned.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
    cleaned.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
    cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

  let bodyHtml = articleMatch ? articleMatch[1] : cleaned;

  bodyHtml = bodyHtml.replace(
    /\b(href|src)\s*=\s*(['"])([^'"]+)\2/gi,
    (match, attr, quote, val) => {
      const mode = attr.toLowerCase() === "href" ? "reader" : "direct";
      const proxied = buildProxyUrl(val, finalUrl.href, mode, adblock);
      return `${attr}=${quote}${proxied}${quote}`;
    }
  );

  const plainText = bodyHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = plainText ? plainText.split(" ").length : 0;
  const readingMinutes = Math.max(1, Math.round(wordCount / 200));

  const fullModeUrl = buildProxyUrl(finalUrl.href, finalUrl.href, "uv", adblock);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${rawTitle}</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0b0d13;
      --surface: #121621;
      --border: rgba(255,255,255,0.09);
      --text: #e8ecf4;
      --muted: #94a0b8;
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
  </style>
</head>
<body>
  <div class="reader-shell">
    <div class="reader-bar">
      <div>
        <span class="reader-badge">Reader View</span>
        <span style="margin-left:10px;">${wordCount.toLocaleString()} words • ~${readingMinutes} min read</span>
      </div>
      <div class="reader-actions">
        <a href="${fullModeUrl}">Exit Reader View →</a>
      </div>
    </div>
    <h1 class="reader-title">${rawTitle}</h1>
    <div class="reader-domain">${finalUrl.href}</div>
    <div class="reader-content">${bodyHtml}</div>
  </div>
  ${buildInjectedRuntimeScript(finalUrl.href, "reader", adblock)}
</body>
</html>`;
}

function sanitizeSetCookieHeaders(rawSetCookies) {
  if (!rawSetCookies) return [];
  const list = Array.isArray(rawSetCookies) ? rawSetCookies : [rawSetCookies];
  return list
    .map((cookieStr) =>
      String(cookieStr)
        .replace(/;\s*Domain=[^;]+/gi, "")
        .replace(/;\s*SameSite=None/gi, "; SameSite=Lax")
        .replace(/;\s*Secure/gi, "")
        .replace(/;\s*Partitioned/gi, "")
    )
    .filter(Boolean);
}

export default async function proxyHandler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    const reqUrl = new URL(req.url || "/", "http://localhost");
    let engine = (reqUrl.searchParams.get("engine") || "uv").toLowerCase();
    const adblock = reqUrl.searchParams.get("adblock") === "1";

    let rawTarget = reqUrl.searchParams.get("url") || "";

    if (!rawTarget && reqUrl.pathname.startsWith("/service/uv/")) {
      engine = "uv";
      const encodedPart = reqUrl.pathname.slice("/service/uv/".length);
      rawTarget = uvDecode(encodedPart);
    }

    if (!rawTarget) {
      res.setHeader("content-type", "application/json");
      res.writeHead(400);
      res.end(JSON.stringify({ error: "Missing target URL" }));
      return;
    }

    let targetUrl;
    try {
      targetUrl = new URL(rawTarget);
    } catch {
      targetUrl = new URL(`https://${rawTarget}`);
    }

    if (adblock && isBlockedDomain(targetUrl.hostname)) {
      res.writeHead(204);
      res.end();
      return;
    }

    // Forward custom API headers (e.g. ms-cv, calling-app-name, authorization, x-ms-api-version)
    // so sites like Xbox Cloud, Twitch, Reddit, etc. never reject backend API fetches
    const sendHeaders = Object.create(null);
    for (const [k, v] of Object.entries(req.headers || {})) {
      if (v === undefined) continue;
      const lower = k.toLowerCase();
      if (SKIP_REQUEST_HEADERS.has(lower) || lower.startsWith(":")) continue;
      sendHeaders[k] = v;
    }

    // Forward non-internal cookies
    if (req.headers.cookie) {
      const cleanedCookies = String(req.headers.cookie)
        .split(";")
        .map((c) => c.trim())
        .filter((c) => c && !c.startsWith("__lp_origin="))
        .join("; ");
      if (cleanedCookies) {
        sendHeaders["Cookie"] = cleanedCookies;
      }
    }

    sendHeaders["Host"] = targetUrl.host;
    sendHeaders["User-Agent"] = req.headers["user-agent"] || DEFAULT_UA;
    sendHeaders["Accept"] =
      req.headers["accept"] ||
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8";
    sendHeaders["Accept-Language"] =
      req.headers["accept-language"] || "en-US,en;q=0.9";
    sendHeaders["Accept-Encoding"] = "gzip, deflate, br";
    sendHeaders["Referer"] = targetUrl.href;
    sendHeaders["Origin"] = targetUrl.origin;

    let reqBody = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
      reqBody = await readStreamToBuffer(req, 8 * 1024 * 1024);
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
      if (STRIP_RESPONSE_HEADERS.has(lower)) continue;
      if (lower === "set-cookie") continue;
      try {
        res.setHeader(k, v);
      } catch {}
    }

    const sanitizedCookies = sanitizeSetCookieHeaders(upstreamRes.headers["set-cookie"]);

    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
    res.setHeader("Access-Control-Allow-Origin", "*");

    const stream = createDecompressedStream(upstreamRes);

    if (
      contentType.includes("text/html") ||
      contentType.includes("application/xhtml+xml")
    ) {
      // Remember current target origin in a cookie so any un-rewritten root-relative assets (/assets/..., /_next/...) can be auto-proxied by server.js!
      const originCookie = `__lp_origin=${encodeURIComponent(finalUrl.origin)}; Path=/; SameSite=Lax`;
      res.setHeader("Set-Cookie", [...sanitizedCookies, originCookie]);

      const buf = await readStreamToBuffer(stream);
      const rawHtml = buf.toString("utf-8");
      const rewrittenHtml =
        engine === "reader"
          ? renderReaderModeHtml(rawHtml, finalUrl, adblock)
          : rewriteHtml(rawHtml, finalUrl, engine, adblock);

      res.setHeader("content-type", "text/html; charset=utf-8");
      res.writeHead(statusCode);
      res.end(rewrittenHtml);
      return;
    }

    if (sanitizedCookies.length > 0) {
      res.setHeader("Set-Cookie", sanitizedCookies);
    }

    if (contentType.includes("text/css")) {
      const buf = await readStreamToBuffer(stream);
      const rawCss = buf.toString("utf-8");
      const rewrittenCss = rewriteCss(rawCss, finalUrl.href, engine, adblock);
      res.setHeader("content-type", "text/css; charset=utf-8");
      res.writeHead(statusCode);
      res.end(rewrittenCss);
      return;
    }

    if (
      contentType.includes("javascript") ||
      contentType.includes("ecmascript")
    ) {
      const buf = await readStreamToBuffer(stream);
      const rawJs = buf.toString("utf-8");
      const rewrittenJs = rewriteJsAntiDetection(rawJs);
      res.setHeader("content-type", contentType || "application/javascript; charset=utf-8");
      res.writeHead(statusCode);
      res.end(rewrittenJs);
      return;
    }

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
  <title>Site Temporarily Unavailable</title>
  <style>
    body { margin:0; min-height:100vh; display:grid; place-items:center; background:#121318; color:#f1f3f9; font-family:system-ui,sans-serif; padding:24px; }
    .card { max-width:480px; background:#1e2028; border:1px solid rgba(255,255,255,0.09); border-radius:16px; padding:28px; text-align:center; }
    h2 { margin:0 0 10px; color:#f43f5e; font-size:20px; }
    p { color:#9aa0b4; line-height:1.5; font-size:14px; }
    code { display:block; margin:14px 0 0; padding:10px; background:rgba(0,0,0,0.3); border-radius:8px; color:#fda4af; font-size:12px; word-break:break-all; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Site Temporarily Unavailable</h2>
    <p>This site didn't respond on the current route. Click the <strong>Proxy</strong> button in the top bar to switch routes.</p>
    <code>${String(err?.message || err).replace(/[<>&]/g, "")}</code>
  </div>
</body>
</html>`);
  }
}
