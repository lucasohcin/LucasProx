const STORAGE_KEYS = {
  engine: "lucasprox:engine",
  transport: "lucasprox:transport",
  searchEngine: "lucasprox:search-engine",
  theme: "lucasprox:theme",
  accentColor: "lucasprox:accent-color",
  glowIntensity: "lucasprox:glow-intensity",
  bgStyle: "lucasprox:bg-style",
  bgUrl: "lucasprox:bg-url",
  density: "lucasprox:density",
  font: "lucasprox:font",
  bookmarksBar: "lucasprox:bookmarks-bar",
  cloakPreset: "lucasprox:cloak-preset",
  customTitle: "lucasprox:custom-title",
  customFavicon: "lucasprox:custom-favicon",
  panicUrl: "lucasprox:panic-url",
  adblock: "lucasprox:adblock",
  userAgent: "lucasprox:user-agent",
  bookmarks: "lucasprox:bookmarks",
  shortcuts: "lucasprox:shortcuts",
  history: "lucasprox:history",
  notes: "lucasprox:notes",
};

const TRANSPORT_PATHS = {
  bare: "/baremod/index.mjs",
  epoxy: "/epoxy/index.mjs",
  libcurl: "/libcurl/index.mjs",
};

const ENGINE_LABELS = {
  scramjet: "Scramjet 2.0",
  uv: "Ultraviolet",
  aero: "AeroStream",
  direct: "DirectEdge",
  reader: "ReaderLite",
  auto: "Auto-Switch",
};

const USER_AGENT_STRINGS = {
  default: navigator.userAgent,
  chrome:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  safari:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
  iphone:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  android:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
  bot: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
};

const CLOAK_PRESETS = {
  default: {
    title: "LucasProx — 10X Multi-Engine Stealth Web Proxy",
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='24' fill='%237c5cff'/><path d='M30 70L50 26L70 70H57L50 53L43 70H30Z' fill='white'/></svg>",
  },
  docs: {
    title: "Untitled document - Google Docs",
    icon: "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico",
  },
  drive: {
    title: "My Drive - Google Drive",
    icon: "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png",
  },
  classroom: {
    title: "Classes - Google Classroom",
    icon: "https://ssl.gstatic.com/classroom/favicon.png",
  },
  canvas: {
    title: "Dashboard | Canvas",
    icon: "https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico",
  },
  wikipedia: {
    title: "Wikipedia, the free encyclopedia",
    icon: "https://en.wikipedia.org/static/favicon/wikipedia.ico",
  },
};

const SEARCH_BANGS = {
  "!g": "https://www.google.com/search?q=%s",
  "!ddg": "https://duckduckgo.com/?q=%s",
  "!b": "https://search.brave.com/search?q=%s",
  "!yt": "https://www.youtube.com/results?search_query=%s",
  "!w": "https://en.wikipedia.org/w/index.php?search=%s",
  "!r": "https://www.reddit.com/search/?q=%s",
  "!gh": "https://github.com/search?q=%s",
  "!hn": "https://hn.algolia.com/?q=%s",
};

const ADBLOCK_HOST_PATTERNS = [
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
  "moatads.com",
  "quantserve.com",
];

const DEFAULT_SHORTCUTS = [
  { title: "DuckDuckGo", url: "https://duckduckgo.com", icon: "D" },
  { title: "Wikipedia", url: "https://www.wikipedia.org", icon: "W" },
  { title: "Hacker News", url: "https://news.ycombinator.com", icon: "Y" },
  { title: "Reddit", url: "https://old.reddit.com", icon: "R" },
  { title: "GitHub", url: "https://github.com", icon: "G" },
  { title: "Brave Search", url: "https://search.brave.com", icon: "B" },
  { title: "Archive.org", url: "https://archive.org", icon: "A" },
  { title: "Example.com", url: "https://example.com", icon: "E" },
];

const DEFAULT_BOOKMARKS = [
  { title: "DuckDuckGo", url: "https://duckduckgo.com" },
  { title: "Wikipedia", url: "https://www.wikipedia.org" },
  { title: "Hacker News", url: "https://news.ycombinator.com" },
  { title: "Old Reddit", url: "https://old.reddit.com" },
  { title: "Archive.org", url: "https://archive.org" },
];

// DOM References
const htmlEl = document.documentElement;
const ambientBgEl = document.getElementById("ambient-bg");
const faviconEl = document.getElementById("page-favicon");

const tabStripEl = document.getElementById("tab-strip");
const framesStageEl = document.getElementById("frames-stage");
const launchpadEl = document.getElementById("launchpad");
const loadingBarEl = document.getElementById("loading-bar");

const statusPillEl = document.getElementById("status-pill");
const statusTextEl = document.getElementById("status-text");
const footerEngineEl = document.getElementById("footer-engine");
const footerTransportEl = document.getElementById("footer-transport");
const footerIsolationEl = document.getElementById("footer-isolation");
const footerShieldEl = document.getElementById("footer-shield");

const pingTextEl = document.getElementById("ping-text");
const btnPanic = document.getElementById("btn-panic");

const omniboxForm = document.getElementById("omnibox-form");
const addressInput = document.getElementById("address-input");
const omniboxSuggestionsEl = document.getElementById("omnibox-suggestions");
const btnBookmarkStar = document.getElementById("btn-bookmark-star");
const btnReaderToggle = document.getElementById("btn-reader-toggle");

const heroForm = document.getElementById("hero-form");
const heroInput = document.getElementById("hero-input");
const selectEngineEl = document.getElementById("select-engine");
const launchpadEnginePills = document.getElementById("launchpad-engine-pills");
const quickGridEl = document.getElementById("quick-grid");
const btnAddShortcut = document.getElementById("btn-add-shortcut");

const btnBrand = document.getElementById("btn-brand");
const btnNewTab = document.getElementById("btn-new-tab");
const btnDuplicateTab = document.getElementById("btn-duplicate-tab");
const btnPinTab = document.getElementById("btn-pin-tab");
const btnBack = document.getElementById("btn-back");
const btnForward = document.getElementById("btn-forward");
const btnReload = document.getElementById("btn-reload");
const btnHome = document.getElementById("btn-home");

const btnAdblock = document.getElementById("btn-adblock");
const adblockCountEl = document.getElementById("adblock-count");
const btnSplitView = document.getElementById("btn-split-view");
const btnZoomMenu = document.getElementById("btn-zoom-menu");
const zoomBtnText = document.getElementById("zoom-btn-text");
const zoomPopoverEl = document.getElementById("zoom-popover");
const btnZoomOut = document.getElementById("btn-zoom-out");
const btnZoomIn = document.getElementById("btn-zoom-in");
const btnZoomReset = document.getElementById("btn-zoom-reset");
const zoomValueDisplay = document.getElementById("zoom-value-display");
const selectUaEl = document.getElementById("select-ua");

const btnHistory = document.getElementById("btn-history");
const btnNotes = document.getElementById("btn-notes");
const btnDevtools = document.getElementById("btn-devtools");
const btnCommandPalette = document.getElementById("btn-command-palette");
const btnCustomize = document.getElementById("btn-customize");
const btnCloak = document.getElementById("btn-cloak");
const btnFullscreen = document.getElementById("btn-fullscreen");
const btnExitFullscreen = document.getElementById("btn-exit-fullscreen");

const bookmarksBarEl = document.getElementById("bookmarks-bar");
const bookmarksListEl = document.getElementById("bookmarks-list");
const btnExportSnapshot = document.getElementById("btn-export-snapshot");
const btnPopoutPip = document.getElementById("btn-popout-pip");

// DevTools DOM
const devtoolsDockEl = document.getElementById("devtools-dock");
const devNetCountEl = document.getElementById("dev-net-count");
const devConsoleCountEl = document.getElementById("dev-console-count");
const devNetworkListEl = document.getElementById("dev-network-list");
const devConsoleListEl = document.getElementById("dev-console-list");
const devConsoleForm = document.getElementById("dev-console-form");
const devConsoleInput = document.getElementById("dev-console-input");
const inspectorGridEl = document.getElementById("inspector-grid");
const btnDevClear = document.getElementById("btn-dev-clear");
const btnDevClose = document.getElementById("btn-dev-close");

// Modals & Drawers DOM
const commandPaletteModal = document.getElementById("command-palette-modal");
const cpInput = document.getElementById("cp-input");
const cpResults = document.getElementById("cp-results");
const btnCpClose = document.getElementById("btn-cp-close");

const customizeModal = document.getElementById("customize-modal");
const btnStudioClose = document.getElementById("btn-studio-close");
const themeGridEl = document.getElementById("theme-grid");
const inputAccentColor = document.getElementById("input-accent-color");
const accentHexLabel = document.getElementById("accent-hex-label");
const btnResetAccent = document.getElementById("btn-reset-accent");
const inputGlowIntensity = document.getElementById("input-glow-intensity");
const glowValLabel = document.getElementById("glow-val-label");
const cloakPresetsEl = document.getElementById("cloak-presets");
const inputCustomTitle = document.getElementById("input-custom-title");
const inputCustomFavicon = document.getElementById("input-custom-favicon");
const selectBgStyle = document.getElementById("select-bg-style");
const inputBgUrl = document.getElementById("input-bg-url");
const selectDensity = document.getElementById("select-density");
const selectFont = document.getElementById("select-font");
const selectBookmarksBar = document.getElementById("select-bookmarks-bar");
const inputPanicUrl = document.getElementById("input-panic-url");
const selectTransport = document.getElementById("select-transport");
const selectSearch = document.getElementById("select-search");
const btnExportSession = document.getElementById("btn-export-session");
const btnImportSession = document.getElementById("btn-import-session");
const btnClearData = document.getElementById("btn-clear-data");

const historyDrawer = document.getElementById("history-drawer");
const historySearchInput = document.getElementById("history-search-input");
const historyListEl = document.getElementById("history-list");
const btnReopenClosed = document.getElementById("btn-reopen-closed");
const btnClearHistory = document.getElementById("btn-clear-history");
const btnHistoryClose = document.getElementById("btn-history-close");

const notesDrawer = document.getElementById("notes-drawer");
const scratchpadTextarea = document.getElementById("scratchpad-textarea");
const btnDownloadNotes = document.getElementById("btn-download-notes");
const btnNotesClose = document.getElementById("btn-notes-close");

// Runtime State
let scramjetController = null;
let engineReadyPromise = null;
let sharedHttpCache = null;

const isLocalhost =
  location.hostname === "localhost" || location.hostname === "127.0.0.1";

let currentEngine = localStorage.getItem(STORAGE_KEYS.engine) || "scramjet";
if (!ENGINE_LABELS[currentEngine]) currentEngine = "scramjet";

const savedTransport = localStorage.getItem(STORAGE_KEYS.transport);
let currentTransportKind = !isLocalhost
  ? "bare"
  : savedTransport && TRANSPORT_PATHS[savedTransport]
  ? savedTransport
  : "bare";

let currentSearchTemplate =
  localStorage.getItem(STORAGE_KEYS.searchEngine) ||
  "https://duckduckgo.com/?q=%s";
let adblockEnabled = localStorage.getItem(STORAGE_KEYS.adblock) !== "0";
let blockedAdsCount = 0;
let currentUserAgent = localStorage.getItem(STORAGE_KEYS.userAgent) || "default";
let currentZoom = 100;
let currentViewport = "desktop";
let splitScreenEnabled = false;
let secondaryTabId = null;

let bookmarks = loadJsonStorage(STORAGE_KEYS.bookmarks, DEFAULT_BOOKMARKS);
let shortcuts = loadJsonStorage(STORAGE_KEYS.shortcuts, DEFAULT_SHORTCUTS);
let historyEntries = loadJsonStorage(STORAGE_KEYS.history, []);
const closedTabsStack = [];
const devNetworkLogs = [];
const devConsoleLogs = [];

const tabs = [];
let activeTabId = null;
let tabCounter = 0;
let addressInputFocused = false;

function loadJsonStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return structuredClone(fallback);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}

function saveJsonStorage(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

function isAdblockedHost(hostname) {
  if (!adblockEnabled) return false;
  const host = String(hostname || "").toLowerCase();
  return ADBLOCK_HOST_PATTERNS.some(
    (d) => host === d || host.endsWith(`.${d}`)
  );
}

function incrementBlockedAds(urlStr) {
  blockedAdsCount++;
  adblockCountEl.textContent = String(blockedAdsCount);
  logNetworkEvent("BLOCKED", urlStr, "AdShield");
}

/**
 * DevTools Logging Helpers
 */
function logNetworkEvent(method, url, engineOrStatus) {
  devNetworkLogs.unshift({
    method: method || "GET",
    url: String(url || ""),
    badge: String(engineOrStatus || currentEngine),
    time: new Date().toLocaleTimeString(),
  });
  if (devNetworkLogs.length > 120) devNetworkLogs.pop();
  devNetCountEl.textContent = String(devNetworkLogs.length);
  if (!devtoolsDockEl.hidden) renderDevTools();
}

function logConsoleEvent(level, message) {
  devConsoleLogs.push({
    level: level || "log",
    message: String(message || ""),
    time: new Date().toLocaleTimeString(),
  });
  if (devConsoleLogs.length > 150) devConsoleLogs.shift();
  devConsoleCountEl.textContent = String(devConsoleLogs.length);
  if (!devtoolsDockEl.hidden) renderDevTools();
}

function renderDevTools() {
  devNetworkListEl.replaceChildren(
    ...devNetworkLogs.slice(0, 60).map((item) => {
      const row = document.createElement("div");
      row.className = "dev-row";
      row.innerHTML = `<span class="dev-row__badge">${escapeHtml(
        item.method
      )}</span><span class="dev-row__badge">${escapeHtml(
        item.badge
      )}</span><span class="dev-row__url" title="${escapeHtml(
        item.url
      )}">${escapeHtml(item.url)}</span><small>${escapeHtml(
        item.time
      )}</small>`;
      return row;
    })
  );

  devConsoleListEl.replaceChildren(
    ...devConsoleLogs.map((item) => {
      const row = document.createElement("div");
      row.className = `dev-row dev-row--${item.level}`;
      row.innerHTML = `<span class="dev-row__badge">${escapeHtml(
        item.level.toUpperCase()
      )}</span><span class="dev-row__url">${escapeHtml(
        item.message
      )}</span><small>${escapeHtml(item.time)}</small>`;
      return row;
    })
  );

  const active = getActiveTab();
  const cards = [
    { label: "Active Proxy Engine", value: ENGINE_LABELS[active?.engine || currentEngine] },
    { label: "Low-Level Transport", value: currentTransportKind.toUpperCase() },
    { label: "COOP/COEP Isolation", value: self.crossOriginIsolated ? "Active (SharedArrayBuffer Ready)" : "Standard" },
    { label: "User-Agent Spoof", value: currentUserAgent.toUpperCase() },
    { label: "Ad & Tracker Shield", value: `${adblockEnabled ? "Enabled" : "Paused"} (${blockedAdsCount} blocked)` },
    { label: "Viewport & Zoom", value: `${currentViewport.toUpperCase()} @ ${currentZoom}%` },
    { label: "Active Target URL", value: active?.url || "Launchpad (Idle)" },
  ];

  inspectorGridEl.replaceChildren(
    ...cards.map((c) => {
      const div = document.createElement("div");
      div.className = "inspector-card";
      div.innerHTML = `<small>${escapeHtml(c.label)}</small><strong>${escapeHtml(
        c.value
      )}</strong>`;
      return div;
    })
  );
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Apply & Persist 5 Customization Suites
 */
function applyCustomizationsFromStorage() {
  // 1. Theme
  const theme = localStorage.getItem(STORAGE_KEYS.theme) || "midnight";
  htmlEl.setAttribute("data-theme", theme);
  themeGridEl.querySelectorAll(".theme-card").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.themeVal === theme);
  });

  // 2. Custom Accent & Glow
  const savedAccent = localStorage.getItem(STORAGE_KEYS.accentColor);
  if (savedAccent) {
    htmlEl.style.setProperty("--accent", savedAccent);
    inputAccentColor.value = savedAccent;
    accentHexLabel.textContent = savedAccent;
  } else {
    htmlEl.style.removeProperty("--accent");
  }

  const savedGlow = localStorage.getItem(STORAGE_KEYS.glowIntensity) ?? "100";
  const glowNum = Number(savedGlow);
  htmlEl.style.setProperty("--glow-opacity", String(glowNum / 100));
  inputGlowIntensity.value = String(glowNum);
  glowValLabel.textContent = `${glowNum}%`;

  // 3. Tab Cloak / Disguise
  const cloakPreset = localStorage.getItem(STORAGE_KEYS.cloakPreset) || "default";
  const customTitle = localStorage.getItem(STORAGE_KEYS.customTitle) || "";
  const customFavicon = localStorage.getItem(STORAGE_KEYS.customFavicon) || "";
  inputCustomTitle.value = customTitle;
  inputCustomFavicon.value = customFavicon;

  const preset = CLOAK_PRESETS[cloakPreset] || CLOAK_PRESETS.default;
  document.title = customTitle || preset.title;
  if (faviconEl) {
    faviconEl.href = customFavicon || preset.icon;
  }

  // 4. Background Style & Custom URL
  const bgStyle = localStorage.getItem(STORAGE_KEYS.bgStyle) || "aurora";
  const bgUrl = localStorage.getItem(STORAGE_KEYS.bgUrl) || "";
  htmlEl.setAttribute("data-bg", bgStyle);
  selectBgStyle.value = bgStyle;
  inputBgUrl.value = bgUrl;
  if (bgStyle === "custom" && bgUrl) {
    ambientBgEl.style.backgroundImage = `linear-gradient(rgba(9,10,15,0.72), rgba(9,10,15,0.82)), url("${bgUrl.replace(/"/g, "")}")`;
  } else {
    ambientBgEl.style.removeProperty("background-image");
  }

  // 5. Density, Font, Bookmarks Bar, Panic URL
  const density = localStorage.getItem(STORAGE_KEYS.density) || "comfortable";
  const font = localStorage.getItem(STORAGE_KEYS.font) || "sans";
  const bbar = localStorage.getItem(STORAGE_KEYS.bookmarksBar) || "show";
  const panicUrl =
    localStorage.getItem(STORAGE_KEYS.panicUrl) || "https://classroom.google.com";

  htmlEl.setAttribute("data-density", density);
  htmlEl.setAttribute("data-font", font);
  selectDensity.value = density;
  selectFont.value = font;
  selectBookmarksBar.value = bbar;
  bookmarksBarEl.classList.toggle("is-hidden", bbar === "hide");
  inputPanicUrl.value = panicUrl;

  // Sync Engine, Transport, Search, Adblock, UserAgent UI
  selectEngineEl.value = currentEngine;
  selectTransport.value = currentTransportKind;
  selectSearch.value = currentSearchTemplate;
  selectUaEl.value = currentUserAgent;
  btnAdblock.classList.toggle("is-active", adblockEnabled);
  adblockCountEl.textContent = String(blockedAdsCount);
  scratchpadTextarea.value = localStorage.getItem(STORAGE_KEYS.notes) || "";

  syncEnginePillsUI();
  updateFooterMetadata();
}

function syncEnginePillsUI() {
  selectEngineEl.value = currentEngine;
  launchpadEnginePills.querySelectorAll(".engine-chip").forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.engine === currentEngine);
  });
}

function updateFooterMetadata() {
  const transportLabels = {
    bare: "Bare V3 HTTP",
    epoxy: "Epoxy TLS / Wisp",
    libcurl: "Libcurl.js / Wisp",
  };
  footerEngineEl.innerHTML = `<strong>Engine:</strong> ${
    ENGINE_LABELS[currentEngine] || "Scramjet 2.0"
  }`;
  footerTransportEl.innerHTML = `<strong>Transport:</strong> ${
    transportLabels[currentTransportKind] || transportLabels.bare
  }`;
  footerIsolationEl.innerHTML = `<strong>Isolation:</strong> ${
    self.crossOriginIsolated ? "COOP/COEP Active" : "Standard"
  }`;
  footerShieldEl.innerHTML = `<strong>AdShield:</strong> ${
    adblockEnabled ? `Active (${blockedAdsCount})` : "Paused"
  }`;
}

/**
 * Resolve User Input (Supports !g, !yt, !w, !ddg, !r, !gh, !b bangs, URLs, or Search)
 */
function resolveInput(rawInput) {
  const text = String(rawInput ?? "").trim();
  if (!text) return null;

  // Check search bangs (e.g. "!yt veritasium" or "!w quantum computing")
  const parts = text.split(/\s+/);
  const firstWord = parts[0].toLowerCase();
  if (SEARCH_BANGS[firstWord] && parts.length > 1) {
    const query = parts.slice(1).join(" ");
    return SEARCH_BANGS[firstWord].replace("%s", encodeURIComponent(query));
  }

  if (/^https?:\/\//i.test(text)) {
    try {
      return new URL(text).href;
    } catch {}
  }

  const looksLikeDomain =
    /^(?:(?:\d{1,3}\.){3}\d{1,3}|[^\s/?#@]+\.[a-z]{2,})(?::\d+)?(?:[/?#]\S*)?$/i;
  if (!text.includes(" ") && looksLikeDomain.test(text)) {
    try {
      return new URL(`https://${text}`).href;
    } catch {}
  }

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

/**
 * Hardened Bare V3 Transport with AdShield, User-Agent Spoofing & DevTools Network Hooks
 */
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

class HardenedBareTransport {
  ready = true;

  constructor(serverUrl) {
    const primary = new URL("./v3/", serverUrl);
    const vercelApi = new URL("/api/bare", location.origin);
    const netlifyFn = new URL("/.netlify/functions/bare/v3/", location.origin);
    const isVercel = location.hostname.endsWith(".vercel.app");

    this.endpoints = isLocalhost
      ? [primary.href]
      : isVercel
      ? [vercelApi.href, primary.href]
      : [primary.href, vercelApi.href, netlifyFn.href];
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
    if (currentUserAgent !== "default" && USER_AGENT_STRINGS[currentUserAgent]) {
      headerMap["User-Agent"] = USER_AGENT_STRINGS[currentUserAgent];
    }

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
        } catch {}
      }
    }
    return normalized;
  }

  async request(remote, method, body, headers, signal) {
    const remoteUrl = remote instanceof URL ? remote : new URL(String(remote));
    const upperMethod = String(method || "GET").toUpperCase();

    // AdShield check inside Bare transport
    if (isAdblockedHost(remoteUrl.hostname)) {
      incrementBlockedAds(remoteUrl.href);
      return {
        body: null,
        headers: [],
        status: 204,
        statusText: "No Content",
      };
    }

    logNetworkEvent(upperMethod, remoteUrl.href, "Scramjet");

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

        if (attempt < this.endpoints.length - 1) continue;
        response = candidate;
      } catch (fetchErr) {
        if (attempt < this.endpoints.length - 1) continue;
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

    const status = xBareStatus
      ? parseInt(xBareStatus, 10) || 200
      : response.status || 200;
    const rawStatusText =
      joined.get("x-bare-status-text") || response.statusText || "OK";
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

async function ensureEngineReady() {
  if (scramjetController) return scramjetController;
  if (engineReadyPromise) return engineReadyPromise;

  engineReadyPromise = (async () => {
    try {
      statusTextEl.textContent = "Booting Multi-Proxy Engine (Scramjet + UV + Aero)...";
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

      setInterval(() => {
        navigator.serviceWorker.controller?.postMessage({
          type: "lucasprox-keepalive",
        });
      }, 15000);

      updateStatusPillReady();
      return ctrl;
    } catch (err) {
      engineReadyPromise = null;
      statusPillEl.classList.remove("is-ready");
      statusPillEl.classList.add("is-ready");
      statusTextEl.textContent = `Server Engines Ready (UV / Aero / Direct Active)`;
      console.warn("[LucasProx] Scramjet SW fallback mode:", err);
      throw err;
    }
  })();

  return engineReadyPromise;
}

function updateStatusPillReady() {
  statusPillEl.classList.remove("is-error");
  statusPillEl.classList.add("is-ready");
  statusTextEl.textContent = `${
    ENGINE_LABELS[currentEngine] || "Scramjet 2.0"
  } Ready • ${currentTransportKind.toUpperCase()} Active`;
}

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
          String(res.statusText || "OK")
            .replace(/[^\t\x20-\x7e]/g, "")
            .trim() || "OK";
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

        const target =
          doc.querySelector("title") ?? doc.head ?? doc.documentElement;
        if (target) {
          new MutationObserver(emitTitle).observe(target, {
            childList: true,
            subtree: true,
            characterData: true,
          });
        }
      });

      this.tap(frame.hooks.error.request, (ctx) => {
        if (
          ctx.rawrequest?.destination === "document" ||
          ctx.rawrequest?.destination === "iframe"
        ) {
          onError(ctx.error);
        }
      });
    }
  }

  return new PageLifecyclePlugin();
}

/**
 * Construct Server/UV Proxy URL for non-Scramjet engines (uv, aero, direct, reader)
 */
function buildServerEngineIframeSrc(targetUrl, engineKind) {
  const params = new URLSearchParams();
  if (currentUserAgent && currentUserAgent !== "default") {
    params.set("ua", currentUserAgent);
  }
  if (adblockEnabled) {
    params.set("adblock", "1");
  }

  if (engineKind === "uv") {
    const encoded =
      globalThis.__uv$config?.encodeUrl?.(targetUrl) ||
      encodeURIComponent(targetUrl);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return `/service/uv/${encoded}${qs}`;
  }

  params.set("engine", engineKind);
  params.set("url", targetUrl);
  return `/api/proxy?${params.toString()}`;
}

/**
 * Listen for postMessage events from Ultraviolet / AeroStream / DirectEdge / ReaderLite iframes
 */
window.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || typeof data !== "object") return;

  if (data.type === "lucasprox:page-state" && data.url) {
    const matchingTab =
      tabs.find((t) => t.iframe.contentWindow === event.source) ||
      getActiveTab();
    if (matchingTab) {
      matchingTab.loading = false;
      if (data.title) matchingTab.title = data.title;
      recordTabUrl(matchingTab, data.url);
      if (matchingTab.id === activeTabId && !addressInputFocused) {
        addressInput.value = data.url;
      }
      renderUI();
    }
  } else if (data.type === "lucasprox:net") {
    logNetworkEvent(data.method || "GET", data.url, data.engine || currentEngine);
  } else if (data.type === "lucasprox:console") {
    logConsoleEvent(data.level || "log", data.message);
  }
});

/**
 * Tab Management (Supports Pinning, Duplication, Split-Screen, Reopen Closed)
 */
function getActiveTab() {
  return tabs.find((t) => t.id === activeTabId) || null;
}

function createTab({ select = true, url = "", engine = currentEngine } = {}) {
  const id = `tab-${++tabCounter}`;
  const iframe = document.createElement("iframe");
  iframe.className = "proxy-frame";
  iframe.setAttribute("title", `LucasProx Tab ${tabCounter}`);
  framesStageEl.appendChild(iframe);

  const tab = {
    id,
    title: "New Tab",
    url: "",
    engine,
    pinned: false,
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

  // Make clicking a frame in split-screen mode focus that tab
  iframe.addEventListener("mouseenter", () => {
    if (splitScreenEnabled && !tab.showLaunchpad && tab.id !== activeTabId) {
      // Allow easy interaction with split frame
    }
  });

  tabs.push(tab);
  applyZoomToIframe(iframe);

  if (select) {
    selectTab(id);
  } else {
    renderUI();
  }

  if (url) {
    void navigateTo(url, { tab });
  }
  return tab;
}

function selectTab(id) {
  if (splitScreenEnabled && activeTabId && activeTabId !== id) {
    secondaryTabId = activeTabId;
  }
  activeTabId = id;

  const active = getActiveTab();
  if (active) {
    addressInput.value = active.url;
    heroInput.value = active.showLaunchpad ? "" : active.url;
    if (active.engine && ENGINE_LABELS[active.engine]) {
      currentEngine = active.engine;
      syncEnginePillsUI();
    }
  }

  renderUI();
}

function closeTab(id) {
  const index = tabs.findIndex((t) => t.id === id);
  if (index === -1) return;

  // Prevent closing pinned tab unless forced
  const [removed] = tabs.splice(index, 1);
  if (removed.url) {
    closedTabsStack.push({
      url: removed.url,
      title: removed.title,
      engine: removed.engine,
    });
  }
  removed.iframe.remove();

  if (scramjetController && removed.sjFrame) {
    const fIdx = scramjetController.frames.indexOf(removed.sjFrame);
    if (fIdx !== -1) scramjetController.frames.splice(fIdx, 1);
  }

  if (secondaryTabId === id) {
    secondaryTabId = null;
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

function reopenLastClosedTab() {
  const last = closedTabsStack.pop();
  if (!last) return;
  createTab({ select: true, url: last.url, engine: last.engine || currentEngine });
}

function recordTabUrl(tab, url) {
  if (!url || url === "about:blank") return;
  tab.url = url;
  if (!tab.title || tab.title === "New Tab" || tab.title === "Loading...") {
    tab.title = formatHostnameOrTitle(url);
  }

  // Record in persistent history
  addHistoryEntry(url, tab.title, tab.engine || currentEngine);

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

function addHistoryEntry(url, title, engine) {
  if (!url || url.startsWith("about:")) return;
  const top = historyEntries[0];
  if (top && top.url === url) {
    top.title = title || top.title;
    top.time = Date.now();
    saveJsonStorage(STORAGE_KEYS.history, historyEntries);
    return;
  }
  historyEntries.unshift({
    url,
    title: title || formatHostnameOrTitle(url),
    engine: engine || currentEngine,
    time: Date.now(),
  });
  if (historyEntries.length > 200) historyEntries.pop();
  saveJsonStorage(STORAGE_KEYS.history, historyEntries);
}

async function ensureTabScramjetFrame(tab) {
  if (tab.sjFrame) return tab.sjFrame;

  const ctrl = await ensureEngineReady();
  const { UrlWatcherPlugin, CatchEscapedLinksPlugin } =
    globalThis.$scramjetUtils;

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
      // If in Auto-Switch mode and Scramjet fails, automatically failover to Ultraviolet!
      if (tab.engine === "auto" && tab.url) {
        logConsoleEvent(
          "warn",
          `Auto-Switch failover triggered for ${tab.url} -> Switching to Ultraviolet (UV)`
        );
        tab.iframe.src = buildServerEngineIframeSrc(tab.url, "uv");
      }
      renderUI();
    }
  );

  tab.sjFrame = ctrl.createFrame(tab.iframe, {
    plugins: [sharedHttpCache, urlWatcher, escapedLinks, lifecycle],
  });

  return tab.sjFrame;
}

/**
 * Navigate Tab using Selected Proxy Engine (Scramjet 2.0, Ultraviolet, AeroStream, DirectEdge, ReaderLite, or Auto)
 */
async function navigateTo(rawInput, { pushHistory = true, tab = null, forceEngine = null } = {}) {
  const targetUrl = resolveInput(rawInput);
  if (!targetUrl) return;

  let targetTab = tab || getActiveTab();
  if (!targetTab) {
    targetTab = createTab({ select: true });
  }

  const engineToUse = forceEngine || currentEngine || "scramjet";
  targetTab.engine = engineToUse;
  targetTab.showLaunchpad = false;
  targetTab.loading = true;
  targetTab.url = targetUrl;
  targetTab.title = formatHostnameOrTitle(targetUrl);

  if (pushHistory) {
    recordTabUrl(targetTab, targetUrl);
  }

  if (targetTab.id === activeTabId) {
    addressInput.value = targetUrl;
  }
  omniboxSuggestionsEl.hidden = true;
  addressInput.blur();
  heroInput.blur();
  renderUI();

  // Route via selected engine
  if (engineToUse === "scramjet" || engineToUse === "auto") {
    try {
      const sjFrame = await ensureTabScramjetFrame(targetTab);
      sjFrame.go(targetUrl);
      return;
    } catch (err) {
      logConsoleEvent(
        "warn",
        `Scramjet unavailable (${err?.message || err}), falling back to Ultraviolet (UV)`
      );
      const fallbackSrc = buildServerEngineIframeSrc(targetUrl, "uv");
      logNetworkEvent("GET", targetUrl, "UV-Failover");
      targetTab.iframe.src = fallbackSrc;
      return;
    }
  }

  // Server-powered proxy engines: Ultraviolet (uv), AeroStream (aero), DirectEdge (direct), ReaderLite (reader)
  const serverSrc = buildServerEngineIframeSrc(targetUrl, engineToUse);
  logNetworkEvent("GET", targetUrl, ENGINE_LABELS[engineToUse] || engineToUse);
  targetTab.iframe.src = serverSrc;
}

/**
 * Render Tab Strip, Bookmarks, Shortcuts, Split-Screen, and Toolbar State
 */
function renderUI() {
  const active = getActiveTab();

  // Sort pinned tabs first
  const orderedTabs = [
    ...tabs.filter((t) => t.pinned),
    ...tabs.filter((t) => !t.pinned),
  ];

  const tabNodes = orderedTabs.map((tab) => {
    const btn = document.createElement("div");
    const classes = ["tab"];
    if (tab.id === activeTabId) classes.push("tab--active");
    if (splitScreenEnabled && tab.id === secondaryTabId) classes.push("tab--split");
    if (tab.loading) classes.push("tab--loading");
    if (tab.pinned) classes.push("tab--pinned");
    btn.className = classes.join(" ");
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", String(tab.id === activeTabId));
    btn.tabIndex = 0;

    const dot = document.createElement("span");
    dot.className = "tab__dot";

    const engineBadge = document.createElement("span");
    engineBadge.className = "tab__engine-tag";
    const shortEngine =
      tab.engine === "scramjet"
        ? "SJ"
        : tab.engine === "uv"
        ? "UV"
        : tab.engine === "aero"
        ? "AE"
        : tab.engine === "direct"
        ? "DE"
        : tab.engine === "reader"
        ? "RD"
        : "AU";
    engineBadge.textContent = tab.pinned ? `📌` : shortEngine;

    const titleSpan = document.createElement("span");
    titleSpan.className = "tab__title";
    titleSpan.textContent = tab.title || "New Tab";
    titleSpan.title = `${tab.title} (${ENGINE_LABELS[tab.engine] || "Scramjet"})\n${
      tab.url || "Launchpad"
    }`;

    btn.append(dot, engineBadge, titleSpan);

    if (!tab.pinned || tabs.length === 1) {
      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "tab__close";
      closeBtn.setAttribute("aria-label", `Close ${tab.title}`);
      closeBtn.textContent = "×";
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        closeTab(tab.id);
      });
      btn.appendChild(closeBtn);
    }

    btn.addEventListener("click", () => selectTab(tab.id));
    btn.addEventListener("auxclick", (e) => {
      if (e.button === 1) {
        e.preventDefault();
        closeTab(tab.id);
      }
    });

    return btn;
  });

  tabStripEl.replaceChildren(...tabNodes);

  if (!active) return;

  // Toggle Pin button state
  btnPinTab.classList.toggle("is-active", Boolean(active.pinned));

  // Toggle Bookmark star state
  const isBookmarked =
    active.url && bookmarks.some((b) => b.url === active.url);
  btnBookmarkStar.textContent = isBookmarked ? "★" : "☆";
  btnBookmarkStar.classList.toggle("is-starred", Boolean(isBookmarked));

  // Toggle Reader button state
  btnReaderToggle.classList.toggle("is-active", active.engine === "reader");

  // Launchpad vs Iframe stage visibility
  const anySplitVisible =
    splitScreenEnabled &&
    secondaryTabId &&
    tabs.some((t) => t.id === secondaryTabId && !t.showLaunchpad);

  const showLaunchpadOverlay = active.showLaunchpad && !anySplitVisible;
  launchpadEl.classList.toggle("is-hidden", !showLaunchpadOverlay);

  framesStageEl.classList.toggle("is-split", Boolean(splitScreenEnabled && secondaryTabId));
  btnSplitView.classList.toggle("is-active", splitScreenEnabled);

  for (const tab of tabs) {
    const isPrimary = tab.id === active.id && !tab.showLaunchpad;
    const isSecondary =
      splitScreenEnabled && tab.id === secondaryTabId && !tab.showLaunchpad;
    tab.iframe.classList.toggle("is-active", isPrimary);
    tab.iframe.classList.toggle("is-split-visible", isSecondary);
  }

  loadingBarEl.classList.toggle("is-active", active.loading);

  btnBack.disabled = active.historyIndex <= 0;
  btnForward.disabled =
    active.historyIndex < 0 || active.historyIndex >= active.history.length - 1;

  updateFooterMetadata();
  if (!devtoolsDockEl.hidden) renderDevTools();
}

/**
 * Render Bookmarks Bar & Launchpad Shortcuts
 */
function renderBookmarks() {
  const nodes = bookmarks.map((bm, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "bookmark-pill";
    btn.title = bm.url;

    const label = document.createElement("span");
    label.textContent = `★ ${bm.title}`;

    const del = document.createElement("span");
    del.className = "bookmark-pill__del";
    del.textContent = "×";
    del.title = "Remove bookmark";
    del.addEventListener("click", (e) => {
      e.stopPropagation();
      bookmarks.splice(idx, 1);
      saveJsonStorage(STORAGE_KEYS.bookmarks, bookmarks);
      renderBookmarks();
      renderUI();
    });

    btn.append(label, del);
    btn.addEventListener("click", () => void navigateTo(bm.url));
    return btn;
  });
  bookmarksListEl.replaceChildren(...nodes);
}

function renderShortcuts() {
  const nodes = shortcuts.map((item, idx) => {
    const card = document.createElement("div");
    card.className = "quick-card";
    card.tabIndex = 0;

    const icon = document.createElement("span");
    icon.className = "quick-icon";
    icon.textContent = (item.icon || item.title?.[0] || "⚡").toUpperCase();

    const info = document.createElement("div");
    info.className = "quick-card__info";
    const title = document.createElement("span");
    title.className = "quick-card__title";
    title.textContent = item.title;
    info.appendChild(title);

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "quick-card__del";
    delBtn.textContent = "✕";
    delBtn.title = "Remove shortcut";
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      shortcuts.splice(idx, 1);
      saveJsonStorage(STORAGE_KEYS.shortcuts, shortcuts);
      renderShortcuts();
    });

    card.append(icon, info, delBtn);
    card.addEventListener("click", () => void navigateTo(item.url));
    return card;
  });
  quickGridEl.replaceChildren(...nodes);
}

/**
 * Omnibox Autocomplete & Search Bang Suggestions
 */
function updateOmniboxSuggestions(query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) {
    omniboxSuggestionsEl.hidden = true;
    return;
  }

  const matches = [];

  // Bang hints
  for (const [bang, tpl] of Object.entries(SEARCH_BANGS)) {
    if (bang.startsWith(q) || q.startsWith(bang + " ")) {
      matches.push({
        label: `Search with ${bang.toUpperCase()}`,
        sub: tpl.split("/")[2],
        value: q.startsWith(bang) ? query : `${bang} ${query}`,
      });
    }
  }

  // Bookmarks & Shortcuts
  for (const bm of [...bookmarks, ...shortcuts]) {
    if (
      bm.title.toLowerCase().includes(q) ||
      bm.url.toLowerCase().includes(q)
    ) {
      if (!matches.some((m) => m.value === bm.url)) {
        matches.push({ label: `★ ${bm.title}`, sub: bm.url, value: bm.url });
      }
    }
  }

  // History
  for (const h of historyEntries.slice(0, 30)) {
    if (
      h.title.toLowerCase().includes(q) ||
      h.url.toLowerCase().includes(q)
    ) {
      if (!matches.some((m) => m.value === h.url)) {
        matches.push({ label: `🕒 ${h.title}`, sub: h.url, value: h.url });
      }
    }
  }

  if (matches.length === 0) {
    omniboxSuggestionsEl.hidden = true;
    return;
  }

  omniboxSuggestionsEl.replaceChildren(
    ...matches.slice(0, 6).map((m) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "suggestion-item";
      btn.innerHTML = `<span>${escapeHtml(m.label)}</span><small>${escapeHtml(
        m.sub
      )}</small>`;
      btn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        addressInput.value = m.value;
        omniboxSuggestionsEl.hidden = true;
        void navigateTo(m.value);
      });
      return btn;
    })
  );
  omniboxSuggestionsEl.hidden = false;
}

/**
 * Page Zoom & Viewport Simulator
 */
function applyZoomToIframe(iframe) {
  if (!iframe) return;
  iframe.style.zoom = `${currentZoom}%`;
}

function setPageZoom(nextZoom) {
  currentZoom = Math.min(200, Math.max(50, nextZoom));
  zoomBtnText.textContent = `${currentZoom}%`;
  zoomValueDisplay.textContent = `${currentZoom}%`;
  tabs.forEach((t) => applyZoomToIframe(t.iframe));
}

/**
 * Switch Active Proxy Engine
 */
function setProxyEngine(nextEngine, { reloadCurrent = true } = {}) {
  if (!ENGINE_LABELS[nextEngine]) return;
  currentEngine = nextEngine;
  localStorage.setItem(STORAGE_KEYS.engine, nextEngine);
  syncEnginePillsUI();
  updateStatusPillReady();
  updateFooterMetadata();

  const active = getActiveTab();
  if (active) {
    active.engine = nextEngine;
    if (reloadCurrent && active.url && !active.showLaunchpad) {
      void navigateTo(active.url, { pushHistory: false, tab: active, forceEngine: nextEngine });
    } else {
      renderUI();
    }
  }
}

/**
 * Command Palette (Ctrl+P / Cmd+P)
 */
function getCommandPaletteActions() {
  return [
    {
      title: "⚡ Switch Proxy Engine → Scramjet 2.0 (Wasm SW)",
      tag: "Engine",
      run: () => setProxyEngine("scramjet"),
    },
    {
      title: "🟣 Switch Proxy Engine → Ultraviolet (UV XOR)",
      tag: "Engine",
      run: () => setProxyEngine("uv"),
    },
    {
      title: "🌊 Switch Proxy Engine → AeroStream (Stealth Rewriter)",
      tag: "Engine",
      run: () => setProxyEngine("aero"),
    },
    {
      title: "🚀 Switch Proxy Engine → DirectEdge (Fast Server Stream)",
      tag: "Engine",
      run: () => setProxyEngine("direct"),
    },
    {
      title: "📖 Switch Proxy Engine → ReaderLite (Distraction-Free Text)",
      tag: "Engine",
      run: () => setProxyEngine("reader"),
    },
    {
      title: "🔄 Switch Proxy Engine → Smart Auto-Switch (Failover)",
      tag: "Engine",
      run: () => setProxyEngine("auto"),
    },
    {
      title: "➕ Open New Proxy Tab",
      tag: "Ctrl+T",
      run: () => createTab({ select: true }),
    },
    {
      title: "🪟 Toggle Split-Screen Dual View",
      tag: "Split View",
      run: () => toggleSplitScreen(),
    },
    {
      title: "🛡 Toggle Ad & Tracker Shield",
      tag: adblockEnabled ? "On" : "Off",
      run: () => toggleAdblock(),
    },
    {
      title: "💻 Toggle Built-in Proxy DevTools & Inspector",
      tag: "F12",
      run: () => toggleDevTools(),
    },
    {
      title: "🎨 Open Customization Studio & Themes",
      tag: "Studio",
      run: () => (customizeModal.hidden = false),
    },
    {
      title: "🕵️ Cloak LucasProx in about:blank Popup",
      tag: "Stealth",
      run: () => openAboutBlankCloak(),
    },
    {
      title: "📄 Disguise Tab as Google Docs",
      tag: "Cloak",
      run: () => applyCloakPreset("docs"),
    },
    {
      title: "🎓 Disguise Tab as Google Classroom",
      tag: "Cloak",
      run: () => applyCloakPreset("classroom"),
    },
    {
      title: "🚨 Trigger Panic Redirect Now",
      tag: "F2 / `",
      run: () => triggerPanicRedirect(),
    },
    {
      title: "↩ Reopen Last Closed Tab",
      tag: "Ctrl+Shift+T",
      run: () => reopenLastClosedTab(),
    },
    {
      title: "🕒 Open Browsing History Drawer",
      tag: "Ctrl+H",
      run: () => openHistoryDrawer(),
    },
    {
      title: "📝 Open Quick Scratchpad Notes",
      tag: "Notes",
      run: () => (notesDrawer.hidden = false),
    },
    {
      title: "🌙 Theme: Midnight Stealth",
      tag: "Theme",
      run: () => setTheme("midnight"),
    },
    {
      title: "⚡ Theme: Cyberpunk Neon",
      tag: "Theme",
      run: () => setTheme("cyberpunk"),
    },
    {
      title: "❄️ Theme: Nordic Frost",
      tag: "Theme",
      run: () => setTheme("nord"),
    },
    {
      title: "🧛 Theme: Dracula Pro",
      tag: "Theme",
      run: () => setTheme("dracula"),
    },
    {
      title: "🟢 Theme: Emerald Matrix",
      tag: "Theme",
      run: () => setTheme("matrix"),
    },
    {
      title: "⚫ Theme: OLED Pitch Black",
      tag: "Theme",
      run: () => setTheme("oled"),
    },
  ];
}

function openCommandPalette() {
  commandPaletteModal.hidden = false;
  cpInput.value = "";
  renderCommandPaletteResults("");
  cpInput.focus();
}

function renderCommandPaletteResults(filterText) {
  const q = String(filterText || "").trim().toLowerCase();
  const allActions = getCommandPaletteActions();
  const filtered = q
    ? allActions.filter(
        (a) =>
          a.title.toLowerCase().includes(q) || a.tag.toLowerCase().includes(q)
      )
    : allActions;

  cpResults.replaceChildren(
    ...filtered.map((item, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `cp-item ${idx === 0 ? "is-selected" : ""}`;
      btn.innerHTML = `<span>${escapeHtml(
        item.title
      )}</span><span class="cp-item__tag">${escapeHtml(item.tag)}</span>`;
      btn.addEventListener("click", () => {
        commandPaletteModal.hidden = true;
        item.run();
      });
      return btn;
    })
  );
}

/**
 * Feature Helpers (Split Screen, Adblock, Panic, Cloak, History, Snapshot, PiP)
 */
function toggleSplitScreen() {
  splitScreenEnabled = !splitScreenEnabled;
  if (splitScreenEnabled) {
    const otherTab = tabs.find((t) => t.id !== activeTabId);
    if (otherTab) {
      secondaryTabId = otherTab.id;
      if (otherTab.showLaunchpad && !otherTab.url) {
        void navigateTo("https://www.wikipedia.org", { tab: otherTab });
      }
    } else {
      const newSecondary = createTab({
        select: false,
        url: "https://www.wikipedia.org",
      });
      secondaryTabId = newSecondary.id;
    }
  } else {
    secondaryTabId = null;
  }
  renderUI();
}

function toggleAdblock() {
  adblockEnabled = !adblockEnabled;
  localStorage.setItem(STORAGE_KEYS.adblock, adblockEnabled ? "1" : "0");
  btnAdblock.classList.toggle("is-active", adblockEnabled);
  updateFooterMetadata();
}

function toggleDevTools() {
  devtoolsDockEl.hidden = !devtoolsDockEl.hidden;
  btnDevtools.classList.toggle("is-active", !devtoolsDockEl.hidden);
  if (!devtoolsDockEl.hidden) renderDevTools();
}

function triggerPanicRedirect() {
  const url =
    localStorage.getItem(STORAGE_KEYS.panicUrl) ||
    "https://classroom.google.com";
  window.location.replace(url);
}

function openAboutBlankCloak() {
  const popup = window.open("about:blank", "_blank");
  if (!popup) {
    applyCloakPreset("docs");
    return;
  }
  const doc = popup.document;
  doc.title = "Untitled document - Google Docs";
  const link = doc.createElement("link");
  link.rel = "icon";
  link.href = "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico";
  doc.head.appendChild(link);

  const iframe = doc.createElement("iframe");
  iframe.src = location.href;
  iframe.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;border:none;margin:0;padding:0;";
  doc.body.style.margin = "0";
  doc.body.appendChild(iframe);
}

function setTheme(themeName) {
  localStorage.setItem(STORAGE_KEYS.theme, themeName);
  applyCustomizationsFromStorage();
}

function applyCloakPreset(presetKey) {
  localStorage.setItem(STORAGE_KEYS.cloakPreset, presetKey);
  localStorage.removeItem(STORAGE_KEYS.customTitle);
  localStorage.removeItem(STORAGE_KEYS.customFavicon);
  applyCustomizationsFromStorage();
}

function openHistoryDrawer() {
  historyDrawer.hidden = false;
  historySearchInput.value = "";
  renderHistoryList("");
}

function renderHistoryList(filterText) {
  const q = String(filterText || "").trim().toLowerCase();
  const items = q
    ? historyEntries.filter(
        (h) =>
          h.title.toLowerCase().includes(q) || h.url.toLowerCase().includes(q)
      )
    : historyEntries;

  if (items.length === 0) {
    historyListEl.innerHTML = `<p class="drawer-hint">No browsing history matching filter.</p>`;
    return;
  }

  historyListEl.replaceChildren(
    ...items.map((h) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "history-item";
      const timeStr = new Date(h.time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      btn.innerHTML = `<div class="history-item__top"><span>${escapeHtml(
        h.title
      )}</span><small>${escapeHtml(
        ENGINE_LABELS[h.engine] || h.engine
      )} • ${escapeHtml(timeStr)}</small></div><div class="history-item__url">${escapeHtml(
        h.url
      )}</div>`;
      btn.addEventListener("click", () => {
        historyDrawer.hidden = true;
        void navigateTo(h.url, { forceEngine: h.engine });
      });
      return btn;
    })
  );
}

/**
 * Live Latency / Ping Health Monitor
 */
async function measureServerPing() {
  const start = performance.now();
  try {
    const res = await fetch(`/api/status?t=${Date.now()}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const ms = Math.max(1, Math.round(performance.now() - start));
      pingTextEl.textContent = `${ms} ms`;
    }
  } catch {
    pingTextEl.textContent = "offline";
  }
}

setInterval(() => void measureServerPing(), 12000);
void measureServerPing();

/**
 * Event Listeners
 */
addressInput.addEventListener("focus", () => {
  addressInputFocused = true;
  addressInput.select();
  updateOmniboxSuggestions(addressInput.value);
});

addressInput.addEventListener("blur", () => {
  addressInputFocused = false;
  setTimeout(() => {
    omniboxSuggestionsEl.hidden = true;
  }, 180);
});

addressInput.addEventListener("input", () => {
  if (!launchpadEl.classList.contains("is-hidden")) {
    heroInput.value = addressInput.value;
  }
  updateOmniboxSuggestions(addressInput.value);
});

heroInput.addEventListener("input", () => {
  if (!addressInputFocused) {
    addressInput.value = heroInput.value;
  }
});

omniboxForm.addEventListener("submit", (e) => {
  e.preventDefault();
  omniboxSuggestionsEl.hidden = true;
  void navigateTo(addressInput.value);
});

heroForm.addEventListener("submit", (e) => {
  e.preventDefault();
  void navigateTo(heroInput.value);
});

selectEngineEl.addEventListener("change", () => {
  setProxyEngine(selectEngineEl.value, { reloadCurrent: true });
});

launchpadEnginePills.querySelectorAll(".engine-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    setProxyEngine(chip.dataset.engine, { reloadCurrent: true });
  });
});

btnNewTab.addEventListener("click", () => {
  createTab({ select: true });
  heroInput.focus();
});

btnDuplicateTab.addEventListener("click", () => {
  const active = getActiveTab();
  if (!active) return;
  createTab({
    select: true,
    url: active.url,
    engine: active.engine || currentEngine,
  });
});

btnPinTab.addEventListener("click", () => {
  const active = getActiveTab();
  if (!active) return;
  active.pinned = !active.pinned;
  renderUI();
});

btnPanic.addEventListener("click", () => triggerPanicRedirect());

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
  if (active.engine === "scramjet" && active.sjFrame && !active.showLaunchpad) {
    active.loading = true;
    renderUI();
    active.sjFrame.reload();
  } else if (active.url) {
    void navigateTo(active.url, { pushHistory: false, tab: active });
  }
});

// Bookmark Star Toggle
btnBookmarkStar.addEventListener("click", () => {
  const active = getActiveTab();
  const url = active?.url || resolveInput(addressInput.value);
  if (!url) return;
  const existingIdx = bookmarks.findIndex((b) => b.url === url);
  if (existingIdx >= 0) {
    bookmarks.splice(existingIdx, 1);
  } else {
    bookmarks.push({
      title: active?.title || formatHostnameOrTitle(url),
      url,
    });
  }
  saveJsonStorage(STORAGE_KEYS.bookmarks, bookmarks);
  renderBookmarks();
  renderUI();
});

// ReaderLite Mode Quick Toggle
btnReaderToggle.addEventListener("click", () => {
  const active = getActiveTab();
  if (!active || !active.url) {
    setProxyEngine(currentEngine === "reader" ? "scramjet" : "reader");
    return;
  }
  const nextEngine = active.engine === "reader" ? "scramjet" : "reader";
  setProxyEngine(nextEngine, { reloadCurrent: true });
});

// Add Custom Quick Launch Shortcut
btnAddShortcut.addEventListener("click", () => {
  const urlInput = window.prompt(
    "Enter website URL for your new Launchpad shortcut:",
    "https://"
  );
  if (!urlInput) return;
  const resolved = resolveInput(urlInput);
  if (!resolved) return;
  const defaultTitle = formatHostnameOrTitle(resolved);
  const titleInput =
    window.prompt("Shortcut Name:", defaultTitle) || defaultTitle;
  shortcuts.push({
    title: titleInput,
    url: resolved,
    icon: titleInput[0]?.toUpperCase() || "⚡",
  });
  saveJsonStorage(STORAGE_KEYS.shortcuts, shortcuts);
  renderShortcuts();
});

// Adblock, Split View, Zoom/Viewport, History, Notes, DevTools, Command Palette, Studio
btnAdblock.addEventListener("click", () => toggleAdblock());
btnSplitView.addEventListener("click", () => toggleSplitScreen());

btnZoomMenu.addEventListener("click", () => {
  zoomPopoverEl.hidden = !zoomPopoverEl.hidden;
});
btnZoomOut.addEventListener("click", () => setPageZoom(currentZoom - 10));
btnZoomIn.addEventListener("click", () => setPageZoom(currentZoom + 10));
btnZoomReset.addEventListener("click", () => setPageZoom(100));

zoomPopoverEl.querySelectorAll("[data-viewport]").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentViewport = btn.dataset.viewport;
    framesStageEl.setAttribute("data-viewport", currentViewport);
    zoomPopoverEl.querySelectorAll("[data-viewport]").forEach((b) => {
      b.classList.toggle("is-active", b === btn);
    });
    if (!devtoolsDockEl.hidden) renderDevTools();
  });
});

selectUaEl.addEventListener("change", () => {
  currentUserAgent = selectUaEl.value;
  localStorage.setItem(STORAGE_KEYS.userAgent, currentUserAgent);
  const active = getActiveTab();
  if (active?.url && !active.showLaunchpad) {
    void navigateTo(active.url, { pushHistory: false, tab: active });
  }
});

btnHistory.addEventListener("click", () => openHistoryDrawer());
btnHistoryClose.addEventListener("click", () => (historyDrawer.hidden = true));
historySearchInput.addEventListener("input", () =>
  renderHistoryList(historySearchInput.value)
);
btnClearHistory.addEventListener("click", () => {
  historyEntries = [];
  saveJsonStorage(STORAGE_KEYS.history, historyEntries);
  renderHistoryList("");
});
btnReopenClosed.addEventListener("click", () => {
  historyDrawer.hidden = true;
  reopenLastClosedTab();
});

btnNotes.addEventListener("click", () => {
  notesDrawer.hidden = !notesDrawer.hidden;
});
btnNotesClose.addEventListener("click", () => (notesDrawer.hidden = true));
scratchpadTextarea.addEventListener("input", () => {
  localStorage.setItem(STORAGE_KEYS.notes, scratchpadTextarea.value);
});
btnDownloadNotes.addEventListener("click", () => {
  const blob = new Blob([scratchpadTextarea.value || ""], {
    type: "text/plain;charset=utf-8",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `lucasprox-notes-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
});

// DevTools Events
btnDevtools.addEventListener("click", () => toggleDevTools());
btnDevClose.addEventListener("click", () => toggleDevTools());
btnDevClear.addEventListener("click", () => {
  devNetworkLogs.length = 0;
  devConsoleLogs.length = 0;
  devNetCountEl.textContent = "0";
  devConsoleCountEl.textContent = "0";
  renderDevTools();
});

devtoolsDockEl.querySelectorAll(".devtools-tab").forEach((tabBtn) => {
  tabBtn.addEventListener("click", () => {
    const target = tabBtn.dataset.devtab;
    devtoolsDockEl.querySelectorAll(".devtools-tab").forEach((b) => {
      b.classList.toggle("is-active", b === tabBtn);
    });
    devtoolsDockEl.querySelectorAll(".devtools-pane").forEach((pane) => {
      pane.classList.toggle("is-active", pane.id === `devpane-${target}`);
    });
    renderDevTools();
  });
});

devConsoleForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const code = devConsoleInput.value.trim();
  if (!code) return;
  devConsoleInput.value = "";
  logConsoleEvent("info", `> ${code}`);
  try {
    const active = getActiveTab();
    const win = active?.iframe?.contentWindow;
    if (win) {
      const result = win.eval(code);
      logConsoleEvent("log", String(result));
    } else {
      logConsoleEvent("warn", "No active proxy frame to evaluate in.");
    }
  } catch (err) {
    logConsoleEvent("error", String(err?.message || err));
  }
});

// Snapshot & Popout Mini-Window
btnExportSnapshot.addEventListener("click", async () => {
  const active = getActiveTab();
  if (!active || !active.url) {
    alert("Navigate to a website first to export an HTML snapshot.");
    return;
  }
  try {
    const docHtml =
      active.iframe.contentDocument?.documentElement?.outerHTML ||
      `<!-- Snapshot of ${active.url} via LucasProx -->`;
    const blob = new Blob([docHtml], { type: "text/html;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${formatHostnameOrTitle(active.url)}-snapshot.html`;
    a.click();
  } catch {
    // Copy shareable link fallback
    const shareUrl = `${location.origin}/?url=${encodeURIComponent(
      active.url
    )}&engine=${encodeURIComponent(active.engine || currentEngine)}`;
    await navigator.clipboard?.writeText(shareUrl).catch(() => {});
    alert(`Shareable proxy link copied to clipboard:\n${shareUrl}`);
  }
});

btnPopoutPip.addEventListener("click", () => {
  const active = getActiveTab();
  const target = active?.url
    ? `${location.origin}/?url=${encodeURIComponent(active.url)}&engine=${
        active.engine || currentEngine
      }`
    : location.href;
  window.open(
    target,
    "LucasProxMini",
    "width=480,height=680,menubar=no,toolbar=no,location=no,status=no"
  );
});

// Command Palette Events
btnCommandPalette.addEventListener("click", () => openCommandPalette());
btnCpClose.addEventListener("click", () => (commandPaletteModal.hidden = true));
commandPaletteModal.addEventListener("click", (e) => {
  if (e.target === commandPaletteModal) commandPaletteModal.hidden = true;
});
cpInput.addEventListener("input", () =>
  renderCommandPaletteResults(cpInput.value)
);
cpInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const first = cpResults.querySelector(".cp-item");
    if (first) first.click();
  } else if (e.key === "Escape") {
    commandPaletteModal.hidden = true;
  }
});

// Customization Studio Events
btnCustomize.addEventListener("click", () => {
  customizeModal.hidden = false;
});
btnStudioClose.addEventListener("click", () => {
  customizeModal.hidden = true;
});
customizeModal.addEventListener("click", (e) => {
  if (e.target === customizeModal) customizeModal.hidden = true;
});

themeGridEl.querySelectorAll(".theme-card").forEach((card) => {
  card.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEYS.accentColor);
    setTheme(card.dataset.themeVal);
  });
});

inputAccentColor.addEventListener("input", () => {
  localStorage.setItem(STORAGE_KEYS.accentColor, inputAccentColor.value);
  applyCustomizationsFromStorage();
});

btnResetAccent.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEYS.accentColor);
  applyCustomizationsFromStorage();
});

inputGlowIntensity.addEventListener("input", () => {
  localStorage.setItem(STORAGE_KEYS.glowIntensity, inputGlowIntensity.value);
  applyCustomizationsFromStorage();
});

cloakPresetsEl.querySelectorAll("[data-cloak]").forEach((btn) => {
  btn.addEventListener("click", () => applyCloakPreset(btn.dataset.cloak));
});

inputCustomTitle.addEventListener("input", () => {
  localStorage.setItem(STORAGE_KEYS.customTitle, inputCustomTitle.value.trim());
  applyCustomizationsFromStorage();
});

inputCustomFavicon.addEventListener("input", () => {
  localStorage.setItem(
    STORAGE_KEYS.customFavicon,
    inputCustomFavicon.value.trim()
  );
  applyCustomizationsFromStorage();
});

selectBgStyle.addEventListener("change", () => {
  localStorage.setItem(STORAGE_KEYS.bgStyle, selectBgStyle.value);
  applyCustomizationsFromStorage();
});

inputBgUrl.addEventListener("input", () => {
  localStorage.setItem(STORAGE_KEYS.bgUrl, inputBgUrl.value.trim());
  if (inputBgUrl.value.trim()) {
    localStorage.setItem(STORAGE_KEYS.bgStyle, "custom");
  }
  applyCustomizationsFromStorage();
});

selectDensity.addEventListener("change", () => {
  localStorage.setItem(STORAGE_KEYS.density, selectDensity.value);
  applyCustomizationsFromStorage();
});

selectFont.addEventListener("change", () => {
  localStorage.setItem(STORAGE_KEYS.font, selectFont.value);
  applyCustomizationsFromStorage();
});

selectBookmarksBar.addEventListener("change", () => {
  localStorage.setItem(STORAGE_KEYS.bookmarksBar, selectBookmarksBar.value);
  applyCustomizationsFromStorage();
});

inputPanicUrl.addEventListener("change", () => {
  localStorage.setItem(STORAGE_KEYS.panicUrl, inputPanicUrl.value.trim());
});

selectTransport.addEventListener("change", async () => {
  const nextKind = selectTransport.value;
  if (!TRANSPORT_PATHS[nextKind]) return;
  currentTransportKind = nextKind;
  localStorage.setItem(STORAGE_KEYS.transport, nextKind);
  updateFooterMetadata();

  if (scramjetController) {
    statusTextEl.textContent = `Switching transport to ${nextKind.toUpperCase()}...`;
    const newTransport = await createTransport(nextKind);
    scramjetController.setTransport(newTransport);
    updateStatusPillReady();
  }
});

selectSearch.addEventListener("change", () => {
  currentSearchTemplate = selectSearch.value;
  localStorage.setItem(STORAGE_KEYS.searchEngine, currentSearchTemplate);
});

// Session JSON Export & Import
btnExportSession.addEventListener("click", () => {
  const payload = {
    version: "10X",
    exportedAt: new Date().toISOString(),
    engine: currentEngine,
    theme: localStorage.getItem(STORAGE_KEYS.theme) || "midnight",
    bookmarks,
    shortcuts,
    history: historyEntries.slice(0, 50),
    notes: scratchpadTextarea.value || "",
    openTabs: tabs.map((t) => ({
      title: t.title,
      url: t.url,
      engine: t.engine,
      pinned: t.pinned,
    })),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `lucasprox-session-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
});

btnImportSession.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (Array.isArray(data.bookmarks)) {
        bookmarks = data.bookmarks;
        saveJsonStorage(STORAGE_KEYS.bookmarks, bookmarks);
        renderBookmarks();
      }
      if (Array.isArray(data.shortcuts)) {
        shortcuts = data.shortcuts;
        saveJsonStorage(STORAGE_KEYS.shortcuts, shortcuts);
        renderShortcuts();
      }
      if (typeof data.notes === "string") {
        localStorage.setItem(STORAGE_KEYS.notes, data.notes);
      }
      if (data.theme) {
        localStorage.setItem(STORAGE_KEYS.theme, data.theme);
      }
      applyCustomizationsFromStorage();
      alert("Session imported successfully!");
    } catch {
      alert("Invalid session JSON file.");
    }
  });
  input.click();
});

btnClearData.addEventListener("click", async () => {
  if (sharedHttpCache) {
    await sharedHttpCache.bust();
  }
  if (scramjetController?.cookieJar) {
    scramjetController.cookieJar.clear();
    await scramjetController.persistCookies();
  }
  btnClearData.textContent = "✓ Cache & Cookies Cleared!";
  setTimeout(() => {
    btnClearData.textContent = "🗑 Clear Proxy Cache & Cookies";
  }, 1500);
});

btnCloak.addEventListener("click", () => openAboutBlankCloak());

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

// Global Keyboard Shortcuts
window.addEventListener("keydown", (e) => {
  const tag = document.activeElement?.tagName;
  const isTyping = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "p") {
    e.preventDefault();
    openCommandPalette();
  } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    const active = getActiveTab();
    if (active?.showLaunchpad) {
      heroInput.focus();
      heroInput.select();
    } else {
      addressInput.focus();
      addressInput.select();
    }
  } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "t") {
    e.preventDefault();
    reopenLastClosedTab();
  } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "h") {
    e.preventDefault();
    openHistoryDrawer();
  } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d") {
    e.preventDefault();
    btnBookmarkStar.click();
  } else if (e.key === "F12") {
    e.preventDefault();
    toggleDevTools();
  } else if (e.key === "F2" || (!isTyping && e.key === "`")) {
    e.preventDefault();
    triggerPanicRedirect();
  } else if (e.key === "Escape") {
    if (!commandPaletteModal.hidden) commandPaletteModal.hidden = true;
    else if (!customizeModal.hidden) customizeModal.hidden = true;
    else if (!historyDrawer.hidden) historyDrawer.hidden = true;
    else if (!notesDrawer.hidden) notesDrawer.hidden = true;
    else if (document.body.classList.contains("is-fullscreen")) {
      setFullscreenMode(false);
    }
  }
});

// Initialize Customizations, Bookmarks, Shortcuts & Initial Tab
applyCustomizationsFromStorage();
renderBookmarks();
renderShortcuts();
createTab({ select: true });

void ensureEngineReady()
  .catch(() => {})
  .finally(() => {
    const params = new URLSearchParams(location.search);
    const initialUrl = params.get("url");
    const initialEngine = params.get("engine");
    if (initialEngine && ENGINE_LABELS[initialEngine]) {
      setProxyEngine(initialEngine, { reloadCurrent: false });
    }
    if (initialUrl) {
      window.history.replaceState({}, "", "/");
      void navigateTo(initialUrl);
    }
  });
