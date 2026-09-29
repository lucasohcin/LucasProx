const STORAGE_KEYS = {
  transport: "lucasprox:transport",
  searchEngine: "lucasprox:search-engine",
};

const TRANSPORT_PATHS = {
  bare: "/baremod/index.mjs",
  epoxy: "/epoxy/index.mjs",
  libcurl: "/libcurl/index.mjs",
};

// DOM Elements
const tabStripEl = document.getElementById("tab-strip");
const framesStageEl = document.getElementById("frames-stage");
const launchpadEl = document.getElementById("launchpad");
const loadingBarEl = document.getElementById("loading-bar");

const statusPillEl = document.getElementById("status-pill");
const statusTextEl = document.getElementById("status-text");
const footerTransportEl = document.getElementById("footer-transport");
const footerIsolationEl = document.getElementById("footer-isolation");

const omniboxForm = document.getElementById("omnibox-form");
const addressInput = document.getElementById("address-input");
const heroForm = document.getElementById("hero-form");
const heroInput = document.getElementById("hero-input");

const btnBrand = document.getElementById("btn-brand");
const btnNewTab = document.getElementById("btn-new-tab");
const btnBack = document.getElementById("btn-back");
const btnForward = document.getElementById("btn-forward");
const btnReload = document.getElementById("btn-reload");
const btnHome = document.getElementById("btn-home");
const btnCloak = document.getElementById("btn-cloak");
const btnFullscreen = document.getElementById("btn-fullscreen");
const btnExitFullscreen = document.getElementById("btn-exit-fullscreen");

const selectTransport = document.getElementById("select-transport");
const selectSearch = document.getElementById("select-search");
const btnClearData = document.getElementById("btn-clear-data");

// State
let scramjetController = null;
let engineReadyPromise = null;
let sharedHttpCache = null;

const isLocalhost =
  location.hostname === "localhost" || location.hostname === "127.0.0.1";
const savedTransport = localStorage.getItem(STORAGE_KEYS.transport);
// On Netlify/serverless, always default to Bare V3 HTTP transport unless user explicitly switches
let currentTransportKind =
  !isLocalhost
    ? "bare"
    : savedTransport && TRANSPORT_PATHS[savedTransport]
    ? savedTransport
    : "bare";
let currentSearchTemplate =
  localStorage.getItem(STORAGE_KEYS.searchEngine) || "https://duckduckgo.com/?q=%s";

selectTransport.value = TRANSPORT_PATHS[currentTransportKind]
  ? currentTransportKind
  : "bare";
selectSearch.value = currentSearchTemplate;

const tabs = [];
let activeTabId = null;
let tabCounter = 0;
let addressInputFocused = false;

addressInput.addEventListener("focus", () => {
  addressInputFocused = true;
  addressInput.select();
});
addressInput.addEventListener("blur", () => {
  addressInputFocused = false;
});

// Keep top omnibox and hero input synchronized when on Launchpad
heroInput.addEventListener("input", () => {
  if (!addressInputFocused) {
    addressInput.value = heroInput.value;
  }
});
addressInput.addEventListener("input", () => {
  if (!launchpadEl.classList.contains("is-hidden")) {
    heroInput.value = addressInput.value;
  }
});

/**
 * Determine whether user input is a URL/hostname or a search query
 */
function resolveInput(rawInput) {
  const text = String(rawInput ?? "").trim();
  if (!text) return null;

  // Check if it already starts with http:// or https://
  if (/^https?:\/\//i.test(text)) {
    try {
      return new URL(text).href;
    } catch {
      // Fall through to search
    }
  }

  // Match domain-like strings (e.g., example.com, news.ycombinator.com/item?id=1)
  const looksLikeDomain =
    /^(?:(?:\d{1,3}\.){3}\d{1,3}|[^\s/?#@]+\.[a-z]{2,})(?::\d+)?(?:[/?#]\S*)?$/i;
  if (!text.includes(" ") && looksLikeDomain.test(text)) {
    try {
      return new URL(`https://${text}`).href;
    } catch {
      // Fall through to search
    }
  }

  // Otherwise treat as search query
  return currentSearchTemplate.replace("%s", encodeURIComponent(text));
}

function formatHostnameOrTitle(urlStr) {
  if (!urlStr) return "New Tab";
  try {
    const u = new URL(urlStr);
    return u.hostname.replace(/^www\./, "") || urlStr;
  } catch {
    return urlStr;
  }
}

function getWispUrl() {
  const proto = location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${location.host}/wisp/`;
}

function getBareUrl() {
  return new URL("/bare/", location.origin).href;
}

function updateFooterMetadata() {
  const labels = {
    bare: "Bare V3 HTTP (Netlify Ready)",
    epoxy: "Epoxy TLS / Wisp v2",
    libcurl: "Libcurl.js / Wisp v2",
  };
  const label = labels[currentTransportKind] || labels.bare;
  footerTransportEl.innerHTML = `<strong>Transport:</strong> ${label}`;
  footerIsolationEl.innerHTML = `<strong>Isolation:</strong> ${
    self.crossOriginIsolated ? "COOP/COEP Active" : "Standard"
  }`;
}

updateFooterMetadata();

const BARE_MAX_HEADER_VALUE = 3072;
const BARE_STRIP_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
]);

function toAsciiJson(obj) {
  return JSON.stringify(obj).replace(
    /[\u007f-\uffff]/g,
    (ch) => "\\u" + ch.charCodeAt(0).toString(16).padStart(4, "0")
  );
}

function splitBareHeaders(headers) {
  const output = new Headers(headers);
  if (headers.has("x-bare-headers")) {
    const value = headers.get("x-bare-headers") || "";
    if (value.length > BARE_MAX_HEADER_VALUE) {
      output.delete("x-bare-headers");
      let split = 0;
      for (let i = 0; i < value.length; i += BARE_MAX_HEADER_VALUE) {
        const part = value.slice(i, i + BARE_MAX_HEADER_VALUE);
        output.set(`x-bare-headers-${split++}`, `;${part}`);
      }
    }
  }
  return output;
}

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

/**
 * Hardened Bare V3 Transport tailored for Scramjet 2.0 + Netlify Serverless Functions.
 * - Avoids calling response.json() on non-JSON error pages (which throws SyntaxError in WebKit)
 * - Automatically falls back from /bare/v3/ to /.netlify/functions/bare/v3/ if needed
 * - Flattens array headers (like set-cookie) into [string, string][] pairs expected by Scramjet 2.0
 * - Strips content-encoding & content-length from inner headers since fetch() already decompresses
 * - Validates all header names/values and statusText so new Headers() / new Response() never throws
 */
class HardenedBareTransport {
  ready = true;

  constructor(serverUrl) {
    const primary = new URL("./v3/", serverUrl);
    const fallback = new URL("/.netlify/functions/bare/v3/", location.origin);
    this.endpoints = isLocalhost ? [primary.href] : [primary.href, fallback.href];
    this.activeEndpointIndex = 0;

    const wsUrl = new URL(primary.href);
    wsUrl.protocol = wsUrl.protocol === "https:" ? "wss:" : "ws:";
    this.wsUrl = wsUrl.href;
  }

  async init() {
    this.ready = true;
  }

  async meta() {}

  createBareRequestHeaders(remote, rawHeaders) {
    const headerMap = Object.create(null);
    if (Array.isArray(rawHeaders)) {
      for (const entry of rawHeaders) {
        if (!Array.isArray(entry) || entry.length < 2) continue;
        const key = String(entry[0]).trim();
        const val = String(entry[1] ?? "");
        const lower = key.toLowerCase();
        if (
          !key ||
          lower.startsWith(":") ||
          lower === "host" ||
          lower === "connection" ||
          lower === "content-length" ||
          lower === "transfer-encoding"
        ) {
          continue;
        }
        headerMap[key] = val;
      }
    }
    headerMap["Host"] = remote.host;

    const headers = new Headers();
    headers.set("x-bare-url", remote.toString());
    headers.set("x-bare-headers", toAsciiJson(headerMap));
    return splitBareHeaders(headers);
  }

  normalizeResponseHeaders(rawHeadersObj) {
    const normalized = [];
    const validator = new Headers();
    if (!rawHeadersObj || typeof rawHeadersObj !== "object") {
      return normalized;
    }

    const entries = Array.isArray(rawHeadersObj)
      ? rawHeadersObj
      : Object.entries(rawHeadersObj);

    for (const [rawKey, rawVal] of entries) {
      const key = String(rawKey || "").trim();
      if (!key || key.startsWith(":")) continue;
      const lower = key.toLowerCase();
      if (BARE_STRIP_RESPONSE_HEADERS.has(lower)) continue;

      const values = Array.isArray(rawVal) ? rawVal : [rawVal];
      for (const item of values) {
        if (item === undefined || item === null) continue;
        const strVal = String(item).replace(/[\r\n\0]+/g, " ").trim();
        try {
          validator.append(key, strVal);
          normalized.push([key, strVal]);
        } catch {
          // Skip invalid HTTP header name/value pairs that would throw SyntaxError in WebKit
        }
      }
    }
    return normalized;
  }

  async request(remote, method, body, headers, signal) {
    const remoteUrl = remote instanceof URL ? remote : new URL(String(remote));
    const upperMethod = String(method || "GET").toUpperCase();
    const bareHeaders = this.createBareRequestHeaders(remoteUrl, headers);

    const buildFetchOptions = () => {
      const opts = {
        credentials: "omit",
        method: upperMethod,
        headers: bareHeaders,
        signal,
      };
      if (
        body !== undefined &&
        body !== null &&
        upperMethod !== "GET" &&
        upperMethod !== "HEAD"
      ) {
        opts.body = body;
        opts.duplex = "half";
      }
      return opts;
    };

    const cacheParam = encodeURIComponent(remoteUrl.href).slice(0, 48);
    let response = null;

    for (let attempt = 0; attempt < this.endpoints.length; attempt++) {
      const idx = (this.activeEndpointIndex + attempt) % this.endpoints.length;
      const endpoint = this.endpoints[idx];
      const reqUrl = `${endpoint}?cache=${cacheParam}`;

      try {
        const candidate = await fetch(reqUrl, buildFetchOptions());
        const hasBareHeader =
          candidate.headers.has("x-bare-status") ||
          candidate.headers.has("x-bare-headers") ||
          candidate.headers.has("x-bare-headers-0");

        if (hasBareHeader) {
          this.activeEndpointIndex = idx;
          response = candidate;
          break;
        }

        // If primary endpoint returned 404 or static HTML without x-bare-status, try fallback
        if (attempt < this.endpoints.length - 1) {
          continue;
        }
        response = candidate;
      } catch (fetchErr) {
        if (attempt < this.endpoints.length - 1) {
          continue;
        }
        throw fetchErr;
      }
    }

    const joined = joinBareHeaders(response.headers);
    const xBareStatus = joined.get("x-bare-status");

    if (!response.ok && xBareStatus === null) {
      const errText = await response.text().catch(() => "");
      let errMsg = `Bare server responded with HTTP ${response.status}`;
      try {
        const parsed = JSON.parse(errText);
        if (parsed?.message) errMsg = parsed.message;
      } catch {
        if (errText && !errText.trim().startsWith("<")) {
          errMsg = errText.slice(0, 160);
        }
      }
      throw new Error(errMsg);
    }

    const status = xBareStatus ? parseInt(xBareStatus, 10) || 200 : response.status || 200;
    const rawStatusText = joined.get("x-bare-status-text") || response.statusText || "OK";
    const statusText =
      String(rawStatusText).replace(/[^\t\x20-\x7e]/g, "").trim() || "OK";

    let parsedBareHeaders = {};
    const xBareHeaders = joined.get("x-bare-headers");
    if (xBareHeaders) {
      try {
        parsedBareHeaders = JSON.parse(xBareHeaders);
      } catch {
        parsedBareHeaders = {};
      }
    }

    const normalizedHeaders = this.normalizeResponseHeaders(parsedBareHeaders);

    return {
      body: response.body,
      headers: normalizedHeaders,
      status,
      statusText,
    };
  }

  connect(url, protocols, requestHeaders = [], onopen, onmessage, onclose, onerror) {
    try {
      const ws = new WebSocket(this.wsUrl);
      const headerMap = Object.create(null);
      if (Array.isArray(requestHeaders)) {
        for (const [k, v] of requestHeaders) {
          if (k) headerMap[String(k)] = String(v ?? "");
        }
      }
      headerMap["Host"] = url.host;
      headerMap["Upgrade"] = "websocket";
      headerMap["Connection"] = "Upgrade";

      const cleanup = () => {
        ws.removeEventListener("close", closeListener);
        ws.removeEventListener("message", messageListener);
      };

      const messageListener = (event) => {
        cleanup();
        try {
          if (typeof event.data !== "string") {
            onerror?.(new TypeError("Invalid Bare WebSocket handshake frame"));
            ws.close();
            return;
          }
          const message = JSON.parse(event.data);
          if (message.type !== "open") {
            onerror?.(new Error("Bare WebSocket did not open"));
            ws.close();
            return;
          }
          onopen?.(message.protocol || "", "");
          ws.addEventListener("message", (ev) => onmessage?.(ev.data));
          ws.addEventListener("close", (ev) => onclose?.(ev.code, ev.reason));
        } catch (err) {
          onerror?.(err);
          ws.close();
        }
      };

      const closeListener = (event) => {
        onclose?.(event.code, event.reason);
        cleanup();
      };

      ws.addEventListener("message", messageListener);
      ws.addEventListener("close", closeListener);
      ws.addEventListener("error", (err) => onerror?.(err));
      ws.addEventListener(
        "open",
        () => {
          ws.send(
            JSON.stringify({
              type: "connect",
              remote: url.toString(),
              protocols: protocols || [],
              headers: headerMap,
              forwardHeaders: [],
            })
          );
        },
        { once: true }
      );

      return [
        (data) => {
          if (ws.readyState === WebSocket.OPEN) ws.send(data);
        },
        (code, reason) => {
          try {
            ws.close(code, reason);
          } catch {}
        },
      ];
    } catch (err) {
      queueMicrotask(() => onerror?.(err));
      return [() => {}, () => {}];
    }
  }
}

/**
 * Build and initialize the selected transport (Bare V3, Epoxy, or Libcurl)
 */
async function createTransport(kind) {
  if (kind === "bare" || !TRANSPORT_PATHS[kind]) {
    return new HardenedBareTransport(getBareUrl());
  }
  const modulePath = TRANSPORT_PATHS[kind];
  const mod = await import(modulePath);
  const TransportClass = mod.default;
  const transport = new TransportClass({ wisp: getWispUrl() });
  if (!transport.ready && typeof transport.init === "function") {
    await transport.init();
  }
  return transport;
}

/**
 * Register the `/sw.js` Service Worker and wait until it controls the page
 */
async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service Workers require HTTPS or localhost.");
  }

  const registration = await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
    updateViaCache: "none",
  });
  void registration.update();

  const readyReg = await navigator.serviceWorker.ready;
  if (!navigator.serviceWorker.controller) {
    await Promise.race([
      new Promise((resolve) =>
        navigator.serviceWorker.addEventListener("controllerchange", resolve, {
          once: true,
        })
      ),
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ]);
  }

  const sw = navigator.serviceWorker.controller ?? readyReg.active;
  if (!sw) {
    throw new Error("Service Worker registered but failed to activate.");
  }
  return sw;
}

/**
 * Boot Scramjet 2.0 Controller
 */
async function ensureEngineReady() {
  if (scramjetController) return scramjetController;
  if (engineReadyPromise) return engineReadyPromise;

  engineReadyPromise = (async () => {
    try {
      statusTextEl.textContent = "Booting Scramjet 2.0 Wasm...";
      const [serviceworker, transport] = await Promise.all([
        registerServiceWorker(),
        createTransport(currentTransportKind),
      ]);

      const { Controller } = globalThis.$scramjetController;
      const { HttpCachePlugin } = globalThis.$scramjetUtils;

      sharedHttpCache = new HttpCachePlugin();

      const ctrl = new Controller({
        serviceworker,
        transport,
        config: {
          scramjetPath: "/scram/scramjet.js",
          wasmPath: "/scram/scramjet.wasm",
          injectPath: "/controller/controller.inject.js",
        },
      });

      await ctrl.wait();
      scramjetController = ctrl;

      // Keep Service Worker alive periodically
      setInterval(() => {
        navigator.serviceWorker.controller?.postMessage({ type: "lucasprox-keepalive" });
      }, 15000);

      statusPillEl.classList.remove("is-error");
      statusPillEl.classList.add("is-ready");
      statusTextEl.textContent = `Scramjet 2.0 Ready • ${currentTransportKind.toUpperCase()} Active`;

      return ctrl;
    } catch (err) {
      engineReadyPromise = null;
      statusPillEl.classList.remove("is-ready");
      statusPillEl.classList.add("is-error");
      statusTextEl.textContent = `Engine Error: ${err.message || err}`;
      console.error("[LucasProx] Failed to initialize Scramjet:", err);
      throw err;
    }
  })();

  return engineReadyPromise;
}

/**
 * Create a custom plugin that watches proxied document <title>, load state, and sanitizes response headers
 */
function createPageLifecyclePlugin(onTitle, onReady, onError) {
  const { ManagedPlugin } = globalThis.$scramjetController;

  class PageLifecyclePlugin extends ManagedPlugin {
    constructor() {
      super("lucasprox-lifecycle", []);
    }

    install(frame) {
      super.install(frame);

      this.tap(frame.hooks.fetch.response, (_ctx, state) => {
        if (!state?.response) return;
        const res = state.response;
        res.statusText =
          String(res.statusText || "OK").replace(/[^\t\x20-\x7e]/g, "").trim() ||
          "OK";
        if (res.headers && typeof res.headers.delete === "function") {
          res.headers.delete("content-encoding");
          res.headers.delete("content-length");
          res.headers.delete("transfer-encoding");
        }
      });

      this.tap(frame.hooks.init.post, (ctx) => {
        if (!ctx.isTopLevel) return;
        onReady();

        const doc = ctx.window.document;
        const emitTitle = () => {
          const t = doc.title?.trim();
          if (t) onTitle(t);
        };
        emitTitle();

        const target = doc.querySelector("title") ?? doc.head ?? doc.documentElement;
        if (target) {
          new MutationObserver(emitTitle).observe(target, {
            childList: true,
            subtree: true,
            characterData: true,
          });
        }
      });

      this.tap(frame.hooks.error.request, (ctx) => {
        if (ctx.rawrequest?.destination === "document" || ctx.rawrequest?.destination === "iframe") {
          onError(ctx.error);
        }
      });
    }
  }

  return new PageLifecyclePlugin();
}

/**
 * Tab Management
 */
function getActiveTab() {
  return tabs.find((t) => t.id === activeTabId) || null;
}

function createTab({ select = true } = {}) {
  const id = `tab-${++tabCounter}`;
  const iframe = document.createElement("iframe");
  iframe.className = "proxy-frame";
  iframe.setAttribute("title", `LucasProx Tab ${tabCounter}`);
  framesStageEl.appendChild(iframe);

  const tab = {
    id,
    title: "New Tab",
    url: "",
    showLaunchpad: true,
    loading: false,
    iframe,
    sjFrame: null,
    history: [],
    historyIndex: -1,
  };

  iframe.addEventListener("load", () => {
    if (tab.loading) {
      tab.loading = false;
      renderUI();
    }
  });

  tabs.push(tab);
  if (select) {
    selectTab(id);
  } else {
    renderUI();
  }
  return tab;
}

function selectTab(id) {
  activeTabId = id;
  for (const tab of tabs) {
    const isCurrent = tab.id === id;
    tab.iframe.classList.toggle("is-active", isCurrent && !tab.showLaunchpad);
  }

  const active = getActiveTab();
  if (active) {
    addressInput.value = active.url;
    heroInput.value = active.showLaunchpad ? "" : active.url;
  }

  renderUI();
}

function closeTab(id) {
  const index = tabs.findIndex((t) => t.id === id);
  if (index === -1) return;

  const [removed] = tabs.splice(index, 1);
  removed.iframe.remove();

  if (scramjetController && removed.sjFrame) {
    const fIdx = scramjetController.frames.indexOf(removed.sjFrame);
    if (fIdx !== -1) scramjetController.frames.splice(fIdx, 1);
  }

  if (tabs.length === 0) {
    createTab({ select: true });
    return;
  }

  if (activeTabId === id) {
    const nextTab = tabs[Math.min(index, tabs.length - 1)];
    selectTab(nextTab.id);
  } else {
    renderUI();
  }
}

function recordTabUrl(tab, url) {
  if (!url || url === "about:blank") return;
  tab.url = url;
  if (!tab.title || tab.title === "New Tab" || tab.title === "Loading...") {
    tab.title = formatHostnameOrTitle(url);
  }

  if (tab.history[tab.historyIndex] === url) return;

  const backMatch = tab.history.lastIndexOf(url, tab.historyIndex - 1);
  if (backMatch >= 0) {
    tab.historyIndex = backMatch;
    return;
  }

  tab.history.splice(tab.historyIndex + 1);
  tab.history.push(url);
  tab.historyIndex = tab.history.length - 1;
}

async function ensureTabScramjetFrame(tab) {
  if (tab.sjFrame) return tab.sjFrame;

  const ctrl = await ensureEngineReady();
  const { UrlWatcherPlugin, CatchEscapedLinksPlugin } = globalThis.$scramjetUtils;

  const urlWatcher = new UrlWatcherPlugin((newUrl) => {
    recordTabUrl(tab, newUrl);
    if (tab.id === activeTabId && !addressInputFocused) {
      addressInput.value = newUrl;
    }
    renderUI();
  });

  const escapedLinks = new CatchEscapedLinksPlugin(
    (escapedUrl) =>
      new URL(`/?url=${encodeURIComponent(escapedUrl.href)}`, location.origin)
  );

  const lifecycle = createPageLifecyclePlugin(
    (newTitle) => {
      tab.title = newTitle;
      renderUI();
    },
    () => {
      tab.loading = false;
      renderUI();
    },
    () => {
      tab.loading = false;
      renderUI();
    }
  );

  tab.sjFrame = ctrl.createFrame(tab.iframe, {
    plugins: [sharedHttpCache, urlWatcher, escapedLinks, lifecycle],
  });

  return tab.sjFrame;
}

/**
 * Navigate the active tab to a target URL or search query
 */
async function navigateTo(rawInput, { pushHistory = true } = {}) {
  const targetUrl = resolveInput(rawInput);
  if (!targetUrl) return;

  let tab = getActiveTab();
  if (!tab) {
    tab = createTab({ select: true });
  }

  tab.showLaunchpad = false;
  tab.loading = true;
  tab.url = targetUrl;
  tab.title = formatHostnameOrTitle(targetUrl);

  if (pushHistory) {
    recordTabUrl(tab, targetUrl);
  }

  addressInput.value = targetUrl;
  addressInput.blur();
  heroInput.blur();
  renderUI();

  try {
    const sjFrame = await ensureTabScramjetFrame(tab);
    sjFrame.go(targetUrl);
  } catch (err) {
    tab.loading = false;
    tab.showLaunchpad = true;
    renderUI();
  }
}

/**
 * Render Tab Strip, Toolbar State, and Viewport Visibility
 */
function renderUI() {
  const active = getActiveTab();

  // Render tabs
  const tabNodes = tabs.map((tab) => {
    const btn = document.createElement("div");
    const classes = ["tab"];
    if (tab.id === activeTabId) classes.push("tab--active");
    if (tab.loading) classes.push("tab--loading");
    btn.className = classes.join(" ");
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", String(tab.id === activeTabId));
    btn.tabIndex = 0;

    const dot = document.createElement("span");
    dot.className = "tab__dot";

    const titleSpan = document.createElement("span");
    titleSpan.className = "tab__title";
    titleSpan.textContent = tab.title || "New Tab";
    titleSpan.title = tab.url || tab.title;

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "tab__close";
    closeBtn.setAttribute("aria-label", `Close ${tab.title}`);
    closeBtn.textContent = "×";
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeTab(tab.id);
    });

    btn.append(dot, titleSpan, closeBtn);
    btn.addEventListener("click", () => selectTab(tab.id));
    btn.addEventListener("auxclick", (e) => {
      if (e.button === 1) {
        e.preventDefault();
        closeTab(tab.id);
      }
    });
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectTab(tab.id);
      }
    });

    return btn;
  });

  tabStripEl.replaceChildren(...tabNodes);

  if (!active) return;

  // Toggle Launchpad vs Iframe
  launchpadEl.classList.toggle("is-hidden", !active.showLaunchpad);
  for (const tab of tabs) {
    tab.iframe.classList.toggle(
      "is-active",
      tab.id === active.id && !active.showLaunchpad
    );
  }

  // Update loading bar
  loadingBarEl.classList.toggle("is-active", active.loading);

  // Update back/forward buttons
  btnBack.disabled = active.historyIndex <= 0;
  btnForward.disabled =
    active.historyIndex < 0 || active.historyIndex >= active.history.length - 1;
}

// Event Listeners
omniboxForm.addEventListener("submit", (e) => {
  e.preventDefault();
  void navigateTo(addressInput.value);
});

heroForm.addEventListener("submit", (e) => {
  e.preventDefault();
  void navigateTo(heroInput.value);
});

document.querySelectorAll(".quick-card").forEach((card) => {
  card.addEventListener("click", () => {
    const url = card.getAttribute("data-url");
    if (url) void navigateTo(url);
  });
});

btnNewTab.addEventListener("click", () => {
  createTab({ select: true });
  heroInput.focus();
});

btnBrand.addEventListener("click", () => {
  const active = getActiveTab();
  if (!active) return;
  active.showLaunchpad = true;
  renderUI();
  heroInput.focus();
});

btnHome.addEventListener("click", () => {
  const active = getActiveTab();
  if (!active) return;
  active.showLaunchpad = !active.url ? true : !active.showLaunchpad;
  renderUI();
  if (active.showLaunchpad) heroInput.focus();
});

btnBack.addEventListener("click", () => {
  const active = getActiveTab();
  if (!active || active.historyIndex <= 0) return;
  const target = active.history[--active.historyIndex];
  if (target) void navigateTo(target, { pushHistory: false });
});

btnForward.addEventListener("click", () => {
  const active = getActiveTab();
  if (!active || active.historyIndex >= active.history.length - 1) return;
  const target = active.history[++active.historyIndex];
  if (target) void navigateTo(target, { pushHistory: false });
});

btnReload.addEventListener("click", () => {
  const active = getActiveTab();
  if (!active) return;
  if (active.sjFrame && !active.showLaunchpad) {
    active.loading = true;
    renderUI();
    active.sjFrame.reload();
  } else if (active.url) {
    void navigateTo(active.url, { pushHistory: false });
  }
});

// Cloak in about:blank
btnCloak.addEventListener("click", () => {
  const popup = window.open("about:blank", "_blank");
  if (!popup) {
    // Fallback: disguise current tab title
    document.title = "Google Docs";
    return;
  }
  const doc = popup.document;
  doc.title = "New Tab";
  const iframe = doc.createElement("iframe");
  iframe.src = location.href;
  iframe.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;border:none;margin:0;padding:0;";
  doc.body.style.margin = "0";
  doc.body.appendChild(iframe);
});

// Immersive Fullscreen Toggle
function setFullscreenMode(enabled) {
  document.body.classList.toggle("is-fullscreen", enabled);
  btnExitFullscreen.hidden = !enabled;
}

btnFullscreen.addEventListener("click", () => {
  setFullscreenMode(!document.body.classList.contains("is-fullscreen"));
});

btnExitFullscreen.addEventListener("click", () => {
  setFullscreenMode(false);
});

// Settings Handlers
selectTransport.addEventListener("change", async () => {
  const nextKind = selectTransport.value;
  if (!TRANSPORT_PATHS[nextKind]) return;
  currentTransportKind = nextKind;
  localStorage.setItem(STORAGE_KEYS.transport, nextKind);
  updateFooterMetadata();

  if (scramjetController) {
    statusTextEl.textContent = `Switching to ${nextKind.toUpperCase()}...`;
    const newTransport = await createTransport(nextKind);
    scramjetController.setTransport(newTransport);
    statusTextEl.textContent = `Scramjet 2.0 Ready • ${nextKind.toUpperCase()} Active`;
  }
});

selectSearch.addEventListener("change", () => {
  currentSearchTemplate = selectSearch.value;
  localStorage.setItem(STORAGE_KEYS.searchEngine, currentSearchTemplate);
});

btnClearData.addEventListener("click", async () => {
  if (sharedHttpCache) {
    await sharedHttpCache.bust();
  }
  if (scramjetController?.cookieJar) {
    scramjetController.cookieJar.clear();
    await scramjetController.persistCookies();
  }
  btnClearData.textContent = "Cleared!";
  setTimeout(() => {
    btnClearData.textContent = "Clear Proxy Cache & Cookies";
  }, 1500);
});

// Global Keyboard Shortcuts
window.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    const active = getActiveTab();
    if (active?.showLaunchpad) {
      heroInput.focus();
      heroInput.select();
    } else {
      addressInput.focus();
      addressInput.select();
    }
  } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "e") {
    e.preventDefault();
    addressInput.focus();
    addressInput.select();
  } else if (e.key === "Escape" && document.body.classList.contains("is-fullscreen")) {
    setFullscreenMode(false);
  }
});

// Boot Initial Tab & Pre-warm Scramjet Engine
createTab({ select: true });

void ensureEngineReady().then(() => {
  const initialUrl = new URLSearchParams(location.search).get("url");
  if (initialUrl) {
    window.history.replaceState({}, "", "/");
    void navigateTo(initialUrl);
  }
});
