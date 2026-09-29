const STORAGE_KEYS = {
  engine: "lucasprox:engine",
  searchEngine: "lucasbrowse:search-engine:v3",
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
  bookmarks: "lucasbrowse:bookmarks:v3",
  shortcuts: "lucasbrowse:shortcuts:v3",
  history: "lucasprox:history",
  notes: "lucasprox:notes",
};

// Generic, unbranded proxy route cycle
const PROXY_CYCLE_ORDER = ["auto", "scramjet", "uv", "aero", "direct", "embed"];

const ROUTE_LABELS = {
  auto: "Auto",
  scramjet: "Proxy 1",
  uv: "Proxy 2",
  aero: "Proxy 3",
  direct: "Proxy 4",
  embed: "Direct",
  reader: "Reader",
};

const CLOAK_PRESETS = {
  default: {
    title: "LucasBrowse",
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
  "!lb": "lucasbrowse://search?q=%s",
  "!g": "lucasbrowse://search?q=%s",
  "!ddg": "lucasbrowse://search?q=%s",
  "!b": "lucasbrowse://search?q=%s",
  "!yt": "https://inv.nadeko.net/search?q=%s",
  "!w": "https://en.wikipedia.org/w/index.php?search=%s",
  "!r": "https://old.reddit.com/search?q=%s",
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
  { title: "Games Hub", url: "lucasprox://games", icon: "🎮" },
  { title: "LucasBrowse", url: "lucasbrowse://search?q=", icon: "🔍" },
  { title: "Red Dead 3D", url: "https://html5.gamemonetize.co/a44bnhgsoo8ge4lr9s85lt83p7cz2h8d/", icon: "🤠" },
  { title: "GTA NY 3D", url: "https://html5.gamemonetize.co/zt4qt847w9o5z06a4ayj5kwy2p9eyifi/", icon: "🚓" },
  { title: "Slope 3D", url: "https://html5.gamemonetize.co/2tscjd5hjy09sm7owo0saawmk6lbo3i3/", icon: "🟢" },
  { title: "Wikipedia", url: "https://www.wikipedia.org", icon: "W" },
  { title: "Reddit", url: "https://old.reddit.com", icon: "R" },
];

const DEFAULT_BOOKMARKS = [
  { title: "🎮 Games Hub (1,430+)", url: "lucasprox://games" },
  { title: "🔍 LucasBrowse Search", url: "lucasbrowse://search?q=" },
  { title: "🤠 Red Dead 3D", url: "https://html5.gamemonetize.co/a44bnhgsoo8ge4lr9s85lt83p7cz2h8d/" },
  { title: "🚓 GTA New York 3D", url: "https://html5.gamemonetize.co/zt4qt847w9o5z06a4ayj5kwy2p9eyifi/" },
  { title: "🔫 Call of Ops 3", url: "https://html5.gamemonetize.co/n3hf4ijzvtj1dycfglrh4d1ydp5wet5k/" },
  { title: "⛏ Minecraft 3D", url: "https://html5.gamemonetize.co/cznxajp3hzb8l7gtebaq96s0pbrfa33m/" },
  { title: "🟢 Slope 3D", url: "https://html5.gamemonetize.co/2tscjd5hjy09sm7owo0saawmk6lbo3i3/" },
];

// Instant-load verified free games while /api/games loads the full 1,430+ catalog
const STARTER_GAMES = [
  {
    id: "gm-a44bnhgsoo8ge4lr9s85lt83p7cz2h8d",
    title: "Red Dead: Wild West Clash 3D",
    category: "aaa",
    badge: "3D Western",
    studio: "Free 3D WebGL • Instant Play",
    thumb: "https://img.gamemonetize.com/a44bnhgsoo8ge4lr9s85lt83p7cz2h8d/512x384.jpg",
    url: "https://html5.gamemonetize.co/a44bnhgsoo8ge4lr9s85lt83p7cz2h8d/",
    directEmbed: true,
  },
  {
    id: "gm-8lkfexr7sk4l1o4ej8nc9iviciv1a0pj",
    title: "Red Dead: Gunslinger Western Duel",
    category: "aaa",
    badge: "Western Duel",
    studio: "Free Instant Play",
    thumb: "https://img.gamemonetize.com/8lkfexr7sk4l1o4ej8nc9iviciv1a0pj/512x384.jpg",
    url: "https://html5.gamemonetize.co/8lkfexr7sk4l1o4ej8nc9iviciv1a0pj/",
    directEmbed: true,
  },
  {
    id: "gm-zt4qt847w9o5z06a4ayj5kwy2p9eyifi",
    title: "Grand Theft Auto: New York 3D",
    category: "aaa",
    badge: "3D Open World",
    studio: "Free 3D WebGL • Instant Play",
    thumb: "https://img.gamemonetize.com/zt4qt847w9o5z06a4ayj5kwy2p9eyifi/512x384.jpg",
    url: "https://html5.gamemonetize.co/zt4qt847w9o5z06a4ayj5kwy2p9eyifi/",
    directEmbed: true,
  },
  {
    id: "gm-ywgsu1e8jqboj8d4tbnomnm111ro0vpy",
    title: "GTA Crime Simulator 3D",
    category: "aaa",
    badge: "3D Open World",
    studio: "Free 3D WebGL • Instant Play",
    thumb: "https://img.gamemonetize.com/ywgsu1e8jqboj8d4tbnomnm111ro0vpy/512x384.jpg",
    url: "https://html5.gamemonetize.co/ywgsu1e8jqboj8d4tbnomnm111ro0vpy/",
    directEmbed: true,
  },
  {
    id: "gm-n3hf4ijzvtj1dycfglrh4d1ydp5wet5k",
    title: "Call of Ops 3: Modern Warfare 3D",
    category: "aaa",
    badge: "3D Tactical FPS",
    studio: "Free 3D WebGL • Instant Play",
    thumb: "https://img.gamemonetize.com/n3hf4ijzvtj1dycfglrh4d1ydp5wet5k/512x384.jpg",
    url: "https://html5.gamemonetize.co/n3hf4ijzvtj1dycfglrh4d1ydp5wet5k/",
    directEmbed: true,
  },
  {
    id: "gm-6rm2gmqb5vs4zm6akpzjiwf4cuxkqsyw",
    title: "Counter-Strike: Survival 3D",
    category: "aaa",
    badge: "3D Tactical FPS",
    studio: "Free 3D WebGL • Instant Play",
    thumb: "https://img.gamemonetize.com/6rm2gmqb5vs4zm6akpzjiwf4cuxkqsyw/512x384.jpg",
    url: "https://html5.gamemonetize.co/6rm2gmqb5vs4zm6akpzjiwf4cuxkqsyw/",
    directEmbed: true,
  },
  {
    id: "gm-hwx6v25biq7www5qh9jxe7vjda61r1fg",
    title: "Fort Clash Survival: Battle Royale 3D",
    category: "aaa",
    badge: "3D Battle Royale",
    studio: "Free 3D WebGL • Instant Play",
    thumb: "https://img.gamemonetize.com/hwx6v25biq7www5qh9jxe7vjda61r1fg/512x384.jpg",
    url: "https://html5.gamemonetize.co/hwx6v25biq7www5qh9jxe7vjda61r1fg/",
    directEmbed: true,
  },
  {
    id: "gm-df7z81myzi5v27zgqrvayg8rmxv7tork",
    title: "Cyberpunk 2077: Drift City 3D",
    category: "aaa",
    badge: "3D Cyber Racing",
    studio: "Free 3D WebGL • Instant Play",
    thumb: "https://img.gamemonetize.com/df7z81myzi5v27zgqrvayg8rmxv7tork/512x384.jpg",
    url: "https://html5.gamemonetize.co/df7z81myzi5v27zgqrvayg8rmxv7tork/",
    directEmbed: true,
  },
  {
    id: "gm-t34z5o1hxwvn0fzanw148uxis4ix8b7p",
    title: "DOOM: Iron Breach 3D FPS",
    category: "aaa",
    badge: "3D Arena FPS",
    studio: "Free 3D WebGL • Instant Play",
    thumb: "https://img.gamemonetize.com/t34z5o1hxwvn0fzanw148uxis4ix8b7p/512x384.jpg",
    url: "https://html5.gamemonetize.co/t34z5o1hxwvn0fzanw148uxis4ix8b7p/",
    directEmbed: true,
  },
  {
    id: "gm-cznxajp3hzb8l7gtebaq96s0pbrfa33m",
    title: "Minecraft Remake 3D",
    category: "aaa",
    badge: "3D Voxel Sandbox",
    studio: "Free 3D WebGL • Instant Play",
    thumb: "https://img.gamemonetize.com/cznxajp3hzb8l7gtebaq96s0pbrfa33m/512x384.jpg",
    url: "https://html5.gamemonetize.co/cznxajp3hzb8l7gtebaq96s0pbrfa33m/",
    directEmbed: true,
  },
  {
    id: "gm-xvrvr5zo8wbhensz0a8de13xn23lfjmc",
    title: "Forza Street Highway 3D",
    category: "aaa",
    badge: "3D Street Racing",
    studio: "Free 3D WebGL • Instant Play",
    thumb: "https://img.gamemonetize.com/xvrvr5zo8wbhensz0a8de13xn23lfjmc/512x384.jpg",
    url: "https://html5.gamemonetize.co/xvrvr5zo8wbhensz0a8de13xn23lfjmc/",
    directEmbed: true,
  },
  {
    id: "gm-2tscjd5hjy09sm7owo0saawmk6lbo3i3",
    title: "Slope 3D Original",
    category: "arcade",
    badge: "Popular 3D",
    studio: "Free 3D WebGL • Instant Play",
    thumb: "https://img.gamemonetize.com/2tscjd5hjy09sm7owo0saawmk6lbo3i3/512x384.jpg",
    url: "https://html5.gamemonetize.co/2tscjd5hjy09sm7owo0saawmk6lbo3i3/",
    directEmbed: true,
  },
];

// DOM References
const htmlEl = document.documentElement;
const ambientBgEl = document.getElementById("ambient-bg");
const faviconEl = document.getElementById("page-favicon");

const tabStripEl = document.getElementById("tab-strip");
const framesStageEl = document.getElementById("frames-stage");
const launchpadEl = document.getElementById("launchpad");
const loadingBarEl = document.getElementById("loading-bar");

// LucasBrowse Native Search View DOM
const lbSearchViewEl = document.getElementById("lb-search-view");
const lbSearchLogoBtn =
  document.getElementById("lb-search-home-btn") ||
  document.getElementById("lb-search-logo");
const lbSearchForm = document.getElementById("lb-search-form");
const lbSearchInput = document.getElementById("lb-search-input");
const lbSearchTabsEl = document.getElementById("lb-search-tabs");
const lbSearchResultsEl = document.getElementById("lb-search-results");
const lbSearchInstantEl = document.getElementById("lb-search-instant");

const pingTextEl = document.getElementById("ping-text");
const btnPanic = document.getElementById("btn-panic");

const omniboxForm = document.getElementById("omnibox-form");
const addressInput = document.getElementById("address-input");
const omniboxSuggestionsEl = document.getElementById("omnibox-suggestions");
const btnBookmarkStar = document.getElementById("btn-bookmark-star");
const btnReaderToggle = document.getElementById("btn-reader-toggle");

const heroForm = document.getElementById("hero-form");
const heroInput = document.getElementById("hero-input");
const quickGridEl = document.getElementById("quick-grid");

const btnBrand = document.getElementById("btn-brand");
const btnNewTab = document.getElementById("btn-new-tab");
const btnBack = document.getElementById("btn-back");
const btnForward = document.getElementById("btn-forward");
const btnReload = document.getElementById("btn-reload");
const btnHome = document.getElementById("btn-home");

const btnGamesHub = document.getElementById("btn-games-hub");
const btnSwitchProxy = document.getElementById("btn-switch-proxy");
const proxyRouteLabelEl = document.getElementById("proxy-route-label");
const btnAdblock = document.getElementById("btn-adblock");
const btnSplitView = document.getElementById("btn-split-view");
const btnMoreMenu = document.getElementById("btn-more-menu");
const chromeDropdownEl = document.getElementById("chrome-dropdown");

const menuNewTab = document.getElementById("menu-new-tab");
const menuGames = document.getElementById("menu-games");
const menuDuplicateTab = document.getElementById("menu-duplicate-tab");
const menuPinTab = document.getElementById("menu-pin-tab");
const menuReopenClosed = document.getElementById("menu-reopen-closed");
const menuHistory = document.getElementById("menu-history");
const menuNotes = document.getElementById("menu-notes");
const menuSnapshot = document.getElementById("menu-snapshot");
const menuPopout = document.getElementById("menu-popout");
const menuCloak = document.getElementById("menu-cloak");
const menuFullscreen = document.getElementById("menu-fullscreen");
const menuCommandPalette = document.getElementById("menu-command-palette");
const menuDevtools = document.getElementById("menu-devtools");
const menuCustomize = document.getElementById("menu-customize");

const btnCustomize = document.getElementById("btn-customize");
const btnExitFullscreen = document.getElementById("btn-exit-fullscreen");

const bookmarksBarEl = document.getElementById("bookmarks-bar");
const bookmarksListEl = document.getElementById("bookmarks-list");

// Games Hub DOM
const gamesModal = document.getElementById("games-modal");
const gamesTotalBadge = document.getElementById("games-total-badge");
const btnGamesClose = document.getElementById("btn-games-close");
const gamesSearchInput = document.getElementById("games-search-input");
const gamesCategoriesEl = document.getElementById("games-categories");
const gamesGridEl = document.getElementById("games-grid");
const gamesLoadMoreWrap = document.getElementById("games-load-more-wrap");
const btnLoadMoreGames = document.getElementById("btn-load-more-games");

// DevTools DOM
const devtoolsDockEl = document.getElementById("devtools-dock");
const devNetCountEl = document.getElementById("dev-net-count");
const devConsoleCountEl = document.getElementById("dev-console-count");
const devNetworkListEl = document.getElementById("dev-network-list");
const devConsoleListEl = document.getElementById("dev-console-list");
const devConsoleForm = document.getElementById("dev-console-form");
const devConsoleInput = document.getElementById("dev-console-input");
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

let currentEngine = localStorage.getItem(STORAGE_KEYS.engine) || "auto";
if (!ROUTE_LABELS[currentEngine]) currentEngine = "auto";

let currentSearchTemplate =
  localStorage.getItem(STORAGE_KEYS.searchEngine) ||
  "lucasbrowse://search?q=%s";
let currentSearchFilter = "all";
let adblockEnabled = localStorage.getItem(STORAGE_KEYS.adblock) !== "0";
let splitScreenEnabled = false;
let secondaryTabId = null;

let bookmarks = loadJsonStorage(STORAGE_KEYS.bookmarks, DEFAULT_BOOKMARKS);
let shortcuts = loadJsonStorage(STORAGE_KEYS.shortcuts, DEFAULT_SHORTCUTS);
let historyEntries = loadJsonStorage(STORAGE_KEYS.history, []);
const closedTabsStack = [];
const devNetworkLogs = [];
const devConsoleLogs = [];

// Games State
let allGamesCatalog = [...STARTER_GAMES];
let gamesLoadedFromApi = false;
let currentGameCategory = "all";
let currentGamesRenderLimit = 48;

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

/**
 * Console & Network Logging
 */
function logNetworkEvent(method, url, routeKey) {
  devNetworkLogs.unshift({
    method: method || "GET",
    url: String(url || ""),
    badge: ROUTE_LABELS[routeKey] || String(routeKey || "Auto"),
    time: new Date().toLocaleTimeString(),
  });
  if (devNetworkLogs.length > 100) devNetworkLogs.pop();
  devNetCountEl.textContent = String(devNetworkLogs.length);
  if (!devtoolsDockEl.hidden) renderDevTools();
}

function logConsoleEvent(level, message) {
  devConsoleLogs.push({
    level: level || "log",
    message: String(message || ""),
    time: new Date().toLocaleTimeString(),
  });
  if (devConsoleLogs.length > 120) devConsoleLogs.shift();
  devConsoleCountEl.textContent = String(devConsoleLogs.length);
  if (!devtoolsDockEl.hidden) renderDevTools();
}

function renderDevTools() {
  devNetworkListEl.replaceChildren(
    ...devNetworkLogs.slice(0, 50).map((item) => {
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
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Apply & Persist Customizations
 */
function applyCustomizationsFromStorage() {
  const theme = localStorage.getItem(STORAGE_KEYS.theme) || "midnight";
  htmlEl.setAttribute("data-theme", theme);
  themeGridEl.querySelectorAll(".theme-card").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.themeVal === theme);
  });

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

  const bgStyle = localStorage.getItem(STORAGE_KEYS.bgStyle) || "aurora";
  const bgUrl = localStorage.getItem(STORAGE_KEYS.bgUrl) || "";
  htmlEl.setAttribute("data-bg", bgStyle);
  selectBgStyle.value = bgStyle;
  inputBgUrl.value = bgUrl;
  if (bgStyle === "custom" && bgUrl) {
    ambientBgEl.style.backgroundImage = `linear-gradient(rgba(9,10,15,0.68), rgba(9,10,15,0.78)), url("${bgUrl.replace(/"/g, "")}")`;
  } else {
    ambientBgEl.style.removeProperty("background-image");
  }

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

  selectSearch.value = currentSearchTemplate;
  btnAdblock.classList.toggle("is-active", adblockEnabled);
  scratchpadTextarea.value = localStorage.getItem(STORAGE_KEYS.notes) || "";

  syncProxyRouteLabel();
}

function syncProxyRouteLabel() {
  proxyRouteLabelEl.textContent = ROUTE_LABELS[currentEngine] || "Auto";
}

/**
 * Intercept blocked third-party search engine URLs and convert them to LucasBrowse Search
 */
function interceptExternalSearchUrl(urlStr) {
  try {
    const u = new URL(urlStr);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    if (
      host === "duckduckgo.com" ||
      host === "html.duckduckgo.com" ||
      host === "lite.duckduckgo.com" ||
      host === "start.duckduckgo.com"
    ) {
      const q = u.searchParams.get("q") || "";
      return `lucasbrowse://search?q=${encodeURIComponent(q)}`;
    }
    if (
      (host === "google.com" || host === "bing.com" || host === "search.brave.com") &&
      (u.pathname === "/" || u.pathname.startsWith("/search"))
    ) {
      const q = u.searchParams.get("q") || "";
      return `lucasbrowse://search?q=${encodeURIComponent(q)}`;
    }
  } catch {}
  return null;
}

/**
 * Resolve User Input
 */
function resolveInput(rawInput) {
  const text = String(rawInput ?? "").trim();
  if (!text) return null;

  if (text === "lucasprox://games" || text === "lucasbrowse://games") {
    return "lucasprox://games";
  }

  if (/^lucas(?:browse|prox):\/\/search/i.test(text)) {
    const qIndex = text.indexOf("?");
    const qs = qIndex >= 0 ? text.slice(qIndex) : "?q=";
    return `lucasbrowse://search${qs}`;
  }

  const parts = text.split(/\s+/);
  const firstWord = parts[0].toLowerCase();
  if (SEARCH_BANGS[firstWord] && parts.length > 1) {
    const query = parts.slice(1).join(" ");
    return SEARCH_BANGS[firstWord].replace("%s", encodeURIComponent(query));
  }

  if (/^https?:\/\//i.test(text)) {
    try {
      const href = new URL(text).href;
      return interceptExternalSearchUrl(href) || href;
    } catch {}
  }

  const looksLikeDomain =
    /^(?:(?:\d{1,3}\.){3}\d{1,3}|[^\s/?#@]+\.[a-z]{2,})(?::\d+)?(?:[/?#]\S*)?$/i;
  if (!text.includes(" ") && looksLikeDomain.test(text)) {
    try {
      const href = new URL(`https://${text}`).href;
      return interceptExternalSearchUrl(href) || href;
    } catch {}
  }

  const resolvedSearch = currentSearchTemplate.replace(
    "%s",
    encodeURIComponent(text)
  );
  return interceptExternalSearchUrl(resolvedSearch) || resolvedSearch;
}

function formatHostnameOrTitle(urlStr) {
  if (!urlStr) return "New Tab";
  if (urlStr.startsWith("lucasbrowse://search")) {
    try {
      const qs = urlStr.split("?")[1] || "";
      const q = new URLSearchParams(qs).get("q") || "";
      return q ? `${q} - LucasBrowse` : "LucasBrowse Search";
    } catch {
      return "LucasBrowse Search";
    }
  }
  try {
    const u = new URL(urlStr);
    return u.hostname.replace(/^www\./, "") || urlStr;
  } catch {
    return urlStr;
  }
}

function getBareUrl() {
  return new URL("/bare/", location.origin).href;
}

/**
 * Hardened HTTP Transport
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

    if (isAdblockedHost(remoteUrl.hostname)) {
      logNetworkEvent("BLOCKED", remoteUrl.href, "Shield");
      return {
        body: new ArrayBuffer(0),
        headers: [],
        status: 204,
        statusText: "No Content",
      };
    }

    logNetworkEvent(upperMethod, remoteUrl.href, "scramjet");

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
      throw new Error(`HTTP ${response.status}`);
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
    const bodyBuffer =
      status === 101 || status === 204 || status === 205 || status === 304
        ? new ArrayBuffer(0)
        : await response.arrayBuffer();

    return {
      body: bodyBuffer,
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
            ws.close();
            return;
          }
          const message = JSON.parse(event.data);
          if (message.type !== "open") {
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
    throw new Error("Service Worker failed to activate.");
  }
  return sw;
}

async function ensureEngineReady() {
  if (scramjetController) return scramjetController;
  if (engineReadyPromise) return engineReadyPromise;

  engineReadyPromise = (async () => {
    try {
      const [serviceworker, transport] = await Promise.all([
        registerServiceWorker(),
        new HardenedBareTransport(getBareUrl()),
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
        scramjetConfig: {
          flags: {
            allowInvalidJs: true,
            allowFailedIntercepts: true,
            sourcemaps: false,
            syncxhr: false,
          },
        },
      });

      await ctrl.wait();
      scramjetController = ctrl;

      setInterval(() => {
        navigator.serviceWorker.controller?.postMessage({
          type: "lucasprox-keepalive",
        });
      }, 15000);

      return ctrl;
    } catch (err) {
      engineReadyPromise = null;
      throw err;
    }
  })();

  return engineReadyPromise;
}

function createPageLifecyclePlugin(onTitle, onReady, onError) {
  const { ManagedPlugin } = globalThis.$scramjetController;

  class PageLifecyclePlugin extends ManagedPlugin {
    hasLoadedTopDocument = false;

    constructor() {
      super("lucasprox-lifecycle", []);
    }

    install(frame) {
      super.install(frame);

      this.tap(frame.hooks.fetch.response, async (_ctx, state) => {
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
        if (typeof ReadableStream !== "undefined" && res.body instanceof ReadableStream) {
          try {
            res.body = await new Response(res.body).arrayBuffer();
          } catch {
            res.body = new ArrayBuffer(0);
          }
        }
      });

      this.tap(frame.hooks.init.post, (ctx) => {
        if (!ctx.isTopLevel) return;
        this.hasLoadedTopDocument = true;
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
          ctx.rawrequest?.destination === "document" &&
          !this.hasLoadedTopDocument
        ) {
          onError(ctx.error);
        }
      });
    }
  }

  return new PageLifecyclePlugin();
}

function buildServerEngineIframeSrc(targetUrl, engineKind) {
  if (engineKind === "embed") {
    return targetUrl;
  }

  const params = new URLSearchParams();
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

  params.set("engine", engineKind === "auto" ? "uv" : engineKind);
  params.set("url", targetUrl);
  return `/api/proxy?${params.toString()}`;
}

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
 * Tab Management
 */
function getActiveTab() {
  return tabs.find((t) => t.id === activeTabId) || null;
}

function createTab({ select = true, url = "", engine = currentEngine } = {}) {
  const id = `tab-${++tabCounter}`;
  const iframe = document.createElement("iframe");
  iframe.className = "proxy-frame";
  iframe.setAttribute("title", `Tab ${tabCounter}`);
  iframe.setAttribute(
    "allow",
    "autoplay; fullscreen; gamepad; pointer-lock; clipboard-read; clipboard-write"
  );
  framesStageEl.appendChild(iframe);

  const tab = {
    id,
    title: "New Tab",
    url: "",
    engine,
    pinned: false,
    showLaunchpad: true,
    showSearch: false,
    searchQuery: "",
    searchData: null,
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
    addressInput.value = active.showSearch
      ? active.searchQuery || active.url
      : active.url;
    heroInput.value = active.showLaunchpad ? "" : active.url;
    if (active.showSearch && lbSearchInput) {
      lbSearchInput.value = active.searchQuery || "";
      renderLucasBrowseSearchResults(active);
    }
    if (active.engine && ROUTE_LABELS[active.engine]) {
      currentEngine = active.engine;
      syncProxyRouteLabel();
    }
  }

  renderUI();
}

function closeTab(id) {
  const index = tabs.findIndex((t) => t.id === id);
  if (index === -1) return;

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
  const { UrlWatcherPlugin } = globalThis.$scramjetUtils;

  const urlWatcher = new UrlWatcherPlugin((newUrl) => {
    recordTabUrl(tab, newUrl);
    if (tab.id === activeTabId && !addressInputFocused) {
      addressInput.value = newUrl;
    }
    renderUI();
  });

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
      if (tab.url) {
        tab.iframe.src = buildServerEngineIframeSrc(tab.url, "uv");
      }
      renderUI();
    }
  );

  tab.sjFrame = ctrl.createFrame(tab.iframe, {
    plugins: [urlWatcher, lifecycle],
  });

  return tab.sjFrame;
}

/**
 * Domains known to embed directly with 60 FPS WebGL when unblocked
 */
const DIRECT_EMBED_DOMAINS = [
  "html5.gamemonetize.co",
  "gamemonetize.co",
  "html5.gamedistribution.com",
  "classic.minecraft.net",
  "play2048.co",
  "chromedino.com",
  "flappybird.io",
  "freepacman.org",
  "wordleunlimited.org",
];

function shouldDirectEmbedInAuto(urlStr) {
  try {
    const host = new URL(urlStr).hostname.toLowerCase();
    return DIRECT_EMBED_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

const AST_WASM_DOMAINS = [
  "xbox.com",
  "xboxservices.com",
  "gamepass.com",
  "discord.com",
  "geforcenow.com",
  "now.gg",
];

function shouldUseWasmInAuto(urlStr) {
  try {
    const host = new URL(urlStr).hostname.toLowerCase();
    return AST_WASM_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

function resetTabIframeIfHooked(tab) {
  if (!tab.sjFrame) return;
  if (scramjetController) {
    const fIdx = scramjetController.frames.indexOf(tab.sjFrame);
    if (fIdx !== -1) scramjetController.frames.splice(fIdx, 1);
  }
  tab.sjFrame = null;

  const freshIframe = document.createElement("iframe");
  freshIframe.className = tab.iframe.className;
  freshIframe.setAttribute("title", tab.iframe.getAttribute("title") || "Tab");
  freshIframe.setAttribute(
    "allow",
    "autoplay; fullscreen; gamepad; pointer-lock; clipboard-read; clipboard-write"
  );
  freshIframe.addEventListener("load", () => {
    if (tab.loading) {
      tab.loading = false;
      renderUI();
    }
  });
  tab.iframe.replaceWith(freshIframe);
  tab.iframe = freshIframe;
}

/**
 * Native Unblockable LucasBrowse Search Engine
 */
function findMatchingGamesForQuery(query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return allGamesCatalog.slice(0, 8);
  const words = q.split(/\s+/).filter(Boolean);
  return allGamesCatalog
    .filter((g) => {
      const hay = `${g.title} ${g.badge || ""} ${g.category || ""} ${g.studio || ""}`.toLowerCase();
      return hay.includes(q) || words.every((w) => hay.includes(w));
    })
    .slice(0, 8);
}

async function performLucasBrowseSearch(query, tab) {
  const cleanQuery = String(query || "").trim();
  const matchedGames = findMatchingGamesForQuery(cleanQuery);

  if (lbSearchInput && tab.id === activeTabId) {
    lbSearchInput.value = cleanQuery;
  }

  if (!cleanQuery) {
    tab.loading = false;
    tab.searchData = {
      query: "",
      apiData: { results: [], instant: null },
      matchedGames,
    };
    if (tab.id === activeTabId) {
      renderLucasBrowseSearchResults(tab);
    }
    renderUI();
    return;
  }

  logNetworkEvent(
    "SEARCH",
    `/api/search?q=${encodeURIComponent(cleanQuery)}`,
    "LucasBrowse"
  );

  if (tab.id === activeTabId && lbSearchResultsEl) {
    lbSearchResultsEl.innerHTML = `<div class="lb-empty-state">Searching LucasBrowse for <strong>${escapeHtml(
      cleanQuery
    )}</strong>...</div>`;
    if (lbSearchInstantEl) lbSearchInstantEl.hidden = true;
  }

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(cleanQuery)}`);
    const apiData = res.ok ? await res.json() : { results: [], instant: null };
    tab.searchData = {
      query: cleanQuery,
      apiData,
      matchedGames: findMatchingGamesForQuery(cleanQuery),
    };
  } catch {
    tab.searchData = {
      query: cleanQuery,
      apiData: { results: [], instant: null },
      matchedGames,
    };
  } finally {
    tab.loading = false;
    if (tab.id === activeTabId) {
      renderLucasBrowseSearchResults(tab);
    }
    renderUI();
  }
}

function renderLucasBrowseSearchResults(tab) {
  if (!lbSearchResultsEl || !tab) return;
  const data = tab.searchData || {
    query: tab.searchQuery || "",
    apiData: { results: [], instant: null },
    matchedGames: findMatchingGamesForQuery(tab.searchQuery || ""),
  };

  const query = data.query || "";
  const rawResults = Array.isArray(data.apiData?.results)
    ? data.apiData.results
    : [];
  const instant = data.apiData?.instant || null;
  const matchedGames = Array.isArray(data.matchedGames)
    ? data.matchedGames
    : [];

  const nodes = [];

  // If query is empty, show Quick Search topics & Featured Games
  if (!query) {
    const exploreCard = document.createElement("div");
    exploreCard.className = "lb-result-card";
    exploreCard.innerHTML = `
      <div class="lb-result-card__meta">
        <span class="lb-result-card__source">LucasBrowse Engine</span>
        <span>Unblockable Built-in Web & Game Search</span>
      </div>
      <div class="lb-result-card__title">Search anything without captchas or proxy blocks</div>
      <div class="lb-result-card__snippet">
        Type any topic, website, or game above. LucasBrowse searches the web, Wikipedia, and 1,430+ instant-play 3D & HTML5 games directly from the server so search engines never block you.
      </div>
    `;
    const chipsWrap = document.createElement("div");
    chipsWrap.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;";
    const sampleQueries = [
      "Red Dead Redemption",
      "Grand Theft Auto",
      "Minecraft",
      "Wikipedia",
      "Reddit",
      "GitHub",
      "Space Exploration",
      "World History",
      "Cyberpunk",
      "Call of Duty",
    ];
    for (const sample of sampleQueries) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "bookmark-pill";
      chip.textContent = `🔍 ${sample}`;
      chip.addEventListener("click", () => {
        void navigateTo(`lucasbrowse://search?q=${encodeURIComponent(sample)}`);
      });
      chipsWrap.appendChild(chip);
    }
    exploreCard.appendChild(chipsWrap);
    nodes.push(exploreCard);
  }

  // 1. Playable Games Strip (when filter is "all" or "games")
  if (
    (currentSearchFilter === "all" || currentSearchFilter === "games") &&
    matchedGames.length > 0
  ) {
    const gamesBox = document.createElement("div");
    gamesBox.className = "lb-search-games-strip";
    gamesBox.innerHTML = `
      <div class="lb-search-games-strip__header">
        <span>🎮 Instant-Play Games (${matchedGames.length} matches)</span>
        <button type="button" class="bookmark-pill" id="lb-open-all-games">Browse All 1,430+ Games →</button>
      </div>
      <div class="lb-search-games-row"></div>
    `;
    const openAllBtn = gamesBox.querySelector("#lb-open-all-games");
    openAllBtn?.addEventListener("click", () => openGamesHub());

    const rowEl = gamesBox.querySelector(".lb-search-games-row");
    for (const game of matchedGames) {
      const gBtn = document.createElement("button");
      gBtn.type = "button";
      gBtn.className = "lb-mini-game";
      gBtn.innerHTML = `
        ${
          game.thumb
            ? `<img src="${escapeHtml(game.thumb)}" alt="${escapeHtml(
                game.title
              )}" loading="lazy" />`
            : ""
        }
        <div class="lb-mini-game__info">
          <div class="lb-mini-game__title">${escapeHtml(game.title)}</div>
          <div class="lb-mini-game__sub">${escapeHtml(
            game.badge || "Instant Play"
          )}</div>
        </div>
      `;
      gBtn.addEventListener("click", () => {
        const forceEngine = game.directEmbed !== false ? "embed" : null;
        void navigateTo(game.url, { forceEngine, customTitle: game.title });
      });
      rowEl?.appendChild(gBtn);
    }
    nodes.push(gamesBox);
  }

  // 2. Filter Web Results
  if (currentSearchFilter !== "games") {
    const filteredResults = rawResults.filter((r) => {
      if (currentSearchFilter === "wiki") {
        return (
          String(r.source || "")
            .toLowerCase()
            .includes("wikipedia") ||
          String(r.url || "").includes("wikipedia.org")
        );
      }
      return true;
    });

    for (const item of filteredResults) {
      const card = document.createElement("div");
      card.className = "lb-result-card";

      let domain = "";
      try {
        domain = new URL(item.url).hostname.replace(/^www\./, "");
      } catch {
        domain = item.url;
      }

      card.innerHTML = `
        <div class="lb-result-card__meta">
          <span class="lb-result-card__source">${escapeHtml(
            item.source || "Web"
          )}</span>
          <span class="lb-result-card__domain">${escapeHtml(domain)}</span>
        </div>
        <div class="lb-result-card__title">${escapeHtml(item.title)}</div>
        <div class="lb-result-card__snippet">${escapeHtml(
          item.snippet || ""
        )}</div>
        <div style="display:flex;gap:8px;margin-top:6px;">
          <button type="button" class="bookmark-pill" data-action="open">Open in LucasBrowse</button>
          <button type="button" class="bookmark-pill" data-action="reader" title="Guaranteed unblockable clean article view">📖 Reader Mode</button>
          <button type="button" class="bookmark-pill" data-action="newtab">↗ New Tab</button>
        </div>
      `;

      const openSite = () =>
        void navigateTo(item.url, { customTitle: item.title });

      card
        .querySelector(".lb-result-card__title")
        ?.addEventListener("click", openSite);
      card
        .querySelector('[data-action="open"]')
        ?.addEventListener("click", (e) => {
          e.stopPropagation();
          openSite();
        });
      card
        .querySelector('[data-action="reader"]')
        ?.addEventListener("click", (e) => {
          e.stopPropagation();
          void navigateTo(item.url, {
            forceEngine: "reader",
            customTitle: item.title,
          });
        });
      card
        .querySelector('[data-action="newtab"]')
        ?.addEventListener("click", (e) => {
          e.stopPropagation();
          createTab({ select: true, url: item.url });
        });

      nodes.push(card);
    }

    if (query && filteredResults.length === 0 && matchedGames.length === 0) {
      const empty = document.createElement("div");
      empty.className = "lb-empty-state";
      empty.textContent = `No results found for "${query}". Try another search term or enter a direct website URL.`;
      nodes.push(empty);
    }
  }

  lbSearchResultsEl.replaceChildren(...nodes);

  // 3. Instant Knowledge Panel
  if (lbSearchInstantEl) {
    if (instant && (instant.abstract || instant.title)) {
      lbSearchInstantEl.hidden = false;
      lbSearchInstantEl.innerHTML = `
        ${
          instant.image
            ? `<img class="lb-instant-card__img" src="${escapeHtml(
                instant.image
              )}" alt="${escapeHtml(instant.title)}" loading="lazy" />`
            : ""
        }
        <h3 class="lb-instant-card__title">${escapeHtml(instant.title)}</h3>
        ${
          instant.subtitle
            ? `<div class="lb-instant-card__sub">${escapeHtml(
                instant.subtitle
              )}</div>`
            : ""
        }
        <p class="lb-instant-card__text">${escapeHtml(
          instant.abstract || ""
        )}</p>
        ${
          instant.url
            ? `<div style="display:flex;gap:8px;margin-top:12px;">
                <button type="button" class="bookmark-pill" id="lb-instant-open">Open Article →</button>
                <button type="button" class="bookmark-pill" id="lb-instant-reader">📖 Reader Mode</button>
              </div>`
            : ""
        }
      `;
      lbSearchInstantEl
        .querySelector("#lb-instant-open")
        ?.addEventListener("click", () => {
          void navigateTo(instant.url, { customTitle: instant.title });
        });
      lbSearchInstantEl
        .querySelector("#lb-instant-reader")
        ?.addEventListener("click", () => {
          void navigateTo(instant.url, {
            forceEngine: "reader",
            customTitle: instant.title,
          });
        });
    } else {
      lbSearchInstantEl.hidden = true;
      lbSearchInstantEl.innerHTML = "";
    }
  }
}

/**
 * Navigate Tab (Guaranteed Load across all websites, searches & games)
 */
async function navigateTo(
  rawInput,
  { pushHistory = true, tab = null, forceEngine = null, customTitle = null } = {}
) {
  const targetUrl = resolveInput(rawInput);
  if (!targetUrl) return;

  if (targetUrl === "lucasprox://games") {
    openGamesHub();
    return;
  }

  let targetTab = tab || getActiveTab();
  if (!targetTab) {
    targetTab = createTab({ select: true });
  }

  // Handle Built-in Unblockable LucasBrowse Search
  if (targetUrl.startsWith("lucasbrowse://search")) {
    const qs = targetUrl.split("?")[1] || "";
    const searchQuery = new URLSearchParams(qs).get("q") || "";
    targetTab.showLaunchpad = false;
    targetTab.showSearch = true;
    targetTab.searchQuery = searchQuery;
    targetTab.loading = Boolean(searchQuery);
    targetTab.url = targetUrl;
    targetTab.title =
      customTitle ||
      (searchQuery ? `${searchQuery} - LucasBrowse` : "LucasBrowse Search");

    if (pushHistory) {
      recordTabUrl(targetTab, targetUrl);
    }

    if (targetTab.id === activeTabId) {
      addressInput.value = searchQuery || "lucasbrowse://search";
    }
    omniboxSuggestionsEl.hidden = true;
    addressInput.blur();
    heroInput.blur();
    renderUI();

    await performLucasBrowseSearch(searchQuery, targetTab);
    return;
  }

  const matchedGame = allGamesCatalog.find((g) => g.url === targetUrl);
  const resolvedTitle =
    customTitle || matchedGame?.title || formatHostnameOrTitle(targetUrl);

  const engineToUse =
    forceEngine || (matchedGame?.directEmbed ? "embed" : currentEngine || "auto");
  if (!forceEngine && engineToUse !== "embed") {
    targetTab.engine = engineToUse;
  }
  targetTab.showLaunchpad = false;
  targetTab.showSearch = false;
  targetTab.loading = true;
  targetTab.url = targetUrl;
  targetTab.title = resolvedTitle;

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

  // Safety timer so loading bar never hangs on long-polling game/site streams
  setTimeout(() => {
    if (targetTab.loading && targetTab.url === targetUrl) {
      targetTab.loading = false;
      renderUI();
    }
  }, 2500);

  // Direct high-FPS embed for HTML5 & 3D WebGL game CDNs when in Auto or Direct mode
  if (
    engineToUse === "embed" ||
    (engineToUse === "auto" && shouldDirectEmbedInAuto(targetUrl))
  ) {
    resetTabIframeIfHooked(targetTab);
    logNetworkEvent("GET", targetUrl, "embed");
    targetTab.iframe.src = targetUrl;
    targetTab.iframe.addEventListener(
      "load",
      () => {
        try {
          targetTab.iframe.focus();
        } catch {}
      },
      { once: true }
    );
    return;
  }

  // Use Scramjet Wasm Service Worker when Proxy 1 is selected or in Auto mode for heavy AST-virtualized apps (Xbox, Discord, etc.)
  if (
    engineToUse === "scramjet" ||
    (engineToUse === "auto" && shouldUseWasmInAuto(targetUrl))
  ) {
    try {
      const sjFrame = await Promise.race([
        ensureTabScramjetFrame(targetTab),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("SW timeout")), 4500)
        ),
      ]);
      logNetworkEvent("GET", targetUrl, engineToUse);
      sjFrame.go(targetUrl);
      return;
    } catch {
      resetTabIframeIfHooked(targetTab);
      const fallbackSrc = buildServerEngineIframeSrc(targetUrl, "uv");
      logNetworkEvent("GET", targetUrl, "uv");
      targetTab.iframe.src = fallbackSrc;
      return;
    }
  }

  // In Auto mode (for search engines & standard web) and Proxy 2 / Proxy 3 / Proxy 4 / Reader:
  // Route immediately via server-rewritten proxy with escaped-asset & form recovery
  resetTabIframeIfHooked(targetTab);
  const effectiveEngine = engineToUse === "auto" ? "uv" : engineToUse;
  const serverSrc = buildServerEngineIframeSrc(targetUrl, effectiveEngine);
  logNetworkEvent("GET", targetUrl, engineToUse);
  targetTab.iframe.src = serverSrc;
}

/**
 * Render Chrome Tab Strip, Bookmarks, Shortcuts & Viewport
 */
function renderUI() {
  const active = getActiveTab();

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

    const titleSpan = document.createElement("span");
    titleSpan.className = "tab__title";
    titleSpan.textContent = tab.pinned ? "📌" : tab.title || "New Tab";
    titleSpan.title = tab.url || tab.title;

    btn.append(dot, titleSpan);

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

  const isBookmarked =
    active.url && bookmarks.some((b) => b.url === active.url);
  btnBookmarkStar.textContent = isBookmarked ? "★" : "☆";
  btnBookmarkStar.classList.toggle("is-starred", Boolean(isBookmarked));

  btnReaderToggle.classList.toggle("is-active", active.engine === "reader");

  const anySplitVisible =
    splitScreenEnabled &&
    secondaryTabId &&
    tabs.some((t) => t.id === secondaryTabId && !t.showLaunchpad);

  const showLaunchpadOverlay = active.showLaunchpad && !anySplitVisible;
  launchpadEl.classList.toggle("is-hidden", !showLaunchpadOverlay);

  const showSearchOverlay =
    Boolean(active.showSearch) && !active.showLaunchpad && !anySplitVisible;
  if (lbSearchViewEl) {
    lbSearchViewEl.hidden = !showSearchOverlay;
  }

  framesStageEl.classList.toggle("is-split", Boolean(splitScreenEnabled && secondaryTabId));
  btnSplitView.classList.toggle("is-active", splitScreenEnabled);

  for (const tab of tabs) {
    const isPrimary =
      tab.id === active.id && !tab.showLaunchpad && !tab.showSearch;
    const isSecondary =
      splitScreenEnabled &&
      tab.id === secondaryTabId &&
      !tab.showLaunchpad &&
      !tab.showSearch;
    tab.iframe.classList.toggle("is-active", isPrimary);
    tab.iframe.classList.toggle("is-split-visible", isSecondary);
  }

  loadingBarEl.classList.toggle("is-active", active.loading);

  btnBack.disabled = active.historyIndex <= 0;
  btnForward.disabled =
    active.historyIndex < 0 || active.historyIndex >= active.history.length - 1;

  if (!devtoolsDockEl.hidden) renderDevTools();
}

function renderBookmarks() {
  const nodes = bookmarks.map((bm, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "bookmark-pill";
    btn.title = bm.url;

    const label = document.createElement("span");
    label.textContent = bm.title;

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
    btn.addEventListener("click", () =>
      void navigateTo(bm.url, { customTitle: bm.title.replace(/^[^\w]+/, "").trim() })
    );
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
    icon.textContent = (item.icon || item.title?.[0] || "•").toUpperCase();

    const title = document.createElement("span");
    title.className = "quick-card__title";
    title.textContent = item.title;

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

    card.append(icon, title, delBtn);
    card.addEventListener("click", () =>
      void navigateTo(item.url, { customTitle: item.title })
    );
    return card;
  });

  const addCard = document.createElement("div");
  addCard.className = "quick-card";
  addCard.tabIndex = 0;
  addCard.innerHTML = `<span class="quick-icon">+</span><span class="quick-card__title">Add shortcut</span>`;
  addCard.addEventListener("click", () => promptAddShortcut());
  nodes.push(addCard);

  quickGridEl.replaceChildren(...nodes);
}

function promptAddShortcut() {
  const urlInput = window.prompt("Enter website URL:", "https://");
  if (!urlInput) return;
  const resolved = resolveInput(urlInput);
  if (!resolved) return;
  const defaultTitle = formatHostnameOrTitle(resolved);
  const titleInput = window.prompt("Name:", defaultTitle) || defaultTitle;
  shortcuts.push({
    title: titleInput,
    url: resolved,
    icon: titleInput[0]?.toUpperCase() || "•",
  });
  saveJsonStorage(STORAGE_KEYS.shortcuts, shortcuts);
  renderShortcuts();
}

/**
 * Games Hub (1,430+ Free Instant-Play 3D WebGL & HTML5 Games)
 */
async function ensureGamesLoaded() {
  if (gamesLoadedFromApi) return;
  try {
    const res = await fetch("/api/games");
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data.games) && data.games.length > 0) {
      allGamesCatalog = data.games;
      gamesLoadedFromApi = true;
      gamesTotalBadge.textContent = `${data.games.length.toLocaleString()} Free Games`;
      if (!gamesModal.hidden) {
        renderGamesGrid();
      }
      const active = getActiveTab();
      if (active?.showSearch && active.searchData) {
        active.searchData.matchedGames = findMatchingGamesForQuery(
          active.searchQuery || ""
        );
        renderLucasBrowseSearchResults(active);
      }
    }
  } catch {}
}

function openGamesHub() {
  gamesModal.hidden = false;
  currentGamesRenderLimit = 60;
  renderGamesGrid();
  gamesSearchInput.focus();
  void ensureGamesLoaded();
}

function getFilteredGames() {
  const q = gamesSearchInput.value.trim().toLowerCase();
  return allGamesCatalog.filter((g) => {
    const catMatch =
      currentGameCategory === "all" || g.category === currentGameCategory;
    if (!catMatch) return false;
    if (!q) return true;
    return (
      g.title.toLowerCase().includes(q) ||
      (g.badge && g.badge.toLowerCase().includes(q)) ||
      (g.studio && g.studio.toLowerCase().includes(q))
    );
  });
}

function renderGamesGrid() {
  const filtered = getFilteredGames();
  const visible = filtered.slice(0, currentGamesRenderLimit);

  gamesLoadMoreWrap.style.display =
    filtered.length > currentGamesRenderLimit ? "flex" : "none";

  const cards = visible.map((game) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `game-card ${game.category === "aaa" ? "game-card--aaa" : ""}`;

    const thumbHtml = game.thumb
      ? `<img src="${escapeHtml(game.thumb)}" alt="${escapeHtml(
          game.title
        )}" loading="lazy" />`
      : `<span class="game-card__icon">${escapeHtml(
          game.title[0] || "🎮"
        )}</span>`;

    btn.innerHTML = `
      <div class="game-card__thumb">
        ${thumbHtml}
        <span class="game-card__badge">${escapeHtml(game.badge || "HTML5")}</span>
      </div>
      <div class="game-card__body">
        <div class="game-card__title">${escapeHtml(game.title)}</div>
        <div class="game-card__sub">${escapeHtml(
          game.studio || "Free Instant Play"
        )}</div>
      </div>
    `;

    btn.addEventListener("click", () => {
      gamesModal.hidden = true;
      const forceEngine = game.directEmbed !== false ? "embed" : null;
      void navigateTo(game.url, { forceEngine, customTitle: game.title });
    });

    return btn;
  });

  gamesGridEl.replaceChildren(...cards);
}

function updateOmniboxSuggestions(query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) {
    omniboxSuggestionsEl.hidden = true;
    return;
  }

  const matches = [];

  for (const [bang, tpl] of Object.entries(SEARCH_BANGS)) {
    if (bang.startsWith(q) || q.startsWith(bang + " ")) {
      matches.push({
        label: `Search with ${bang.toUpperCase()}`,
        sub: tpl.split("/")[2],
        value: q.startsWith(bang) ? query : `${bang} ${query}`,
      });
    }
  }

  // Match games in omnibox!
  for (const g of allGamesCatalog.slice(0, 80)) {
    if (g.title.toLowerCase().includes(q)) {
      matches.push({
        label: `🎮 ${g.title}`,
        sub: g.badge || "Game",
        value: g.url,
      });
      if (matches.length >= 4) break;
    }
  }

  for (const bm of [...bookmarks, ...shortcuts]) {
    if (
      bm.title.toLowerCase().includes(q) ||
      bm.url.toLowerCase().includes(q)
    ) {
      if (!matches.some((m) => m.value === bm.url)) {
        matches.push({ label: bm.title, sub: bm.url, value: bm.url });
      }
    }
  }

  for (const h of historyEntries.slice(0, 30)) {
    if (
      h.title.toLowerCase().includes(q) ||
      h.url.toLowerCase().includes(q)
    ) {
      if (!matches.some((m) => m.value === h.url)) {
        matches.push({ label: h.title, sub: h.url, value: h.url });
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
 * One-Click Cycle Proxy Route
 */
function setProxyEngine(nextEngine, { reloadCurrent = true } = {}) {
  if (!ROUTE_LABELS[nextEngine]) return;
  currentEngine = nextEngine;
  localStorage.setItem(STORAGE_KEYS.engine, nextEngine);
  syncProxyRouteLabel();

  const active = getActiveTab();
  if (active) {
    active.engine = nextEngine;
    if (reloadCurrent && active.url && !active.showLaunchpad) {
      void navigateTo(active.url, {
        pushHistory: false,
        tab: active,
        forceEngine: nextEngine,
      });
    } else {
      renderUI();
    }
  }
}

function cycleNextProxy() {
  const idx = PROXY_CYCLE_ORDER.indexOf(currentEngine);
  const next =
    PROXY_CYCLE_ORDER[(idx + 1) % PROXY_CYCLE_ORDER.length] || "auto";
  setProxyEngine(next, { reloadCurrent: true });
}

/**
 * Command Bar Actions
 */
function getCommandPaletteActions() {
  return [
    {
      title: "🎮 Open Games Hub (1,100+ HTML5 & AAA Cloud Games)",
      tag: "Games",
      run: () => openGamesHub(),
    },
    {
      title: "Switch Proxy Route (Cycle Next)",
      tag: ROUTE_LABELS[currentEngine] || "Auto",
      run: () => cycleNextProxy(),
    },
    {
      title: "Use Auto Proxy Selection (Recommended)",
      tag: "Auto",
      run: () => setProxyEngine("auto"),
    },
    {
      title: "New Tab",
      tag: "⌘T",
      run: () => createTab({ select: true }),
    },
    {
      title: "Toggle Split Screen",
      tag: "Split",
      run: () => toggleSplitScreen(),
    },
    {
      title: "Toggle Clean Reader View",
      tag: "Reader",
      run: () => btnReaderToggle.click(),
    },
    {
      title: "Toggle Ad & Tracker Blocker",
      tag: adblockEnabled ? "On" : "Off",
      run: () => toggleAdblock(),
    },
    {
      title: "Customize Theme & Appearance",
      tag: "Customize",
      run: () => (customizeModal.hidden = false),
    },
    {
      title: "Open in about:blank Cloak",
      tag: "Cloak",
      run: () => openAboutBlankCloak(),
    },
    {
      title: "Disguise Tab as Google Docs",
      tag: "Cloak",
      run: () => applyCloakPreset("docs"),
    },
    {
      title: "Disguise Tab as Google Classroom",
      tag: "Cloak",
      run: () => applyCloakPreset("classroom"),
    },
    {
      title: "Quick Exit (Panic Redirect)",
      tag: "F2 / `",
      run: () => triggerPanicRedirect(),
    },
    {
      title: "Reopen Closed Tab",
      tag: "⌘⇧T",
      run: () => reopenLastClosedTab(),
    },
    {
      title: "Open History",
      tag: "⌘H",
      run: () => openHistoryDrawer(),
    },
    {
      title: "Open Quick Notes",
      tag: "Notes",
      run: () => (notesDrawer.hidden = false),
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
 * Feature Helpers
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
}

function toggleDevTools() {
  devtoolsDockEl.hidden = !devtoolsDockEl.hidden;
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
    historyListEl.innerHTML = `<p class="drawer-hint">No browsing history yet.</p>`;
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
      )}</span><small>${escapeHtml(timeStr)}</small></div><div class="history-item__url">${escapeHtml(
        h.url
      )}</div>`;
      btn.addEventListener("click", () => {
        historyDrawer.hidden = true;
        void navigateTo(h.url);
      });
      return btn;
    })
  );
}

async function exportSnapshotOrCopyLink() {
  const active = getActiveTab();
  if (!active || !active.url) {
    alert("Open a website first to save or copy its link.");
    return;
  }
  try {
    const docHtml = active.iframe.contentDocument?.documentElement?.outerHTML;
    if (docHtml) {
      const blob = new Blob([docHtml], { type: "text/html;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${formatHostnameOrTitle(active.url)}.html`;
      a.click();
      return;
    }
  } catch {}
  const shareUrl = `${location.origin}/?url=${encodeURIComponent(active.url)}`;
  await navigator.clipboard?.writeText(shareUrl).catch(() => {});
  alert(`Link copied to clipboard:\n${shareUrl}`);
}

function openPopoutWindow() {
  const active = getActiveTab();
  const target = active?.url
    ? `${location.origin}/?url=${encodeURIComponent(active.url)}`
    : location.href;
  window.open(
    target,
    "LucasProxMini",
    "width=480,height=680,menubar=no,toolbar=no,location=no,status=no"
  );
}

/**
 * Live Server Latency Ping
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

lbSearchForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const val = lbSearchInput?.value?.trim() || "";
  if (!val) return;
  if (/^https?:\/\//i.test(val) || (!val.includes(" ") && /\.[a-z]{2,}$/i.test(val))) {
    void navigateTo(val);
  } else {
    void navigateTo(`lucasbrowse://search?q=${encodeURIComponent(val)}`);
  }
});

lbSearchLogoBtn?.addEventListener("click", () => {
  const active = getActiveTab();
  if (!active) return;
  active.showLaunchpad = true;
  active.showSearch = false;
  renderUI();
  heroInput.focus();
});

lbSearchTabsEl?.querySelectorAll(".lb-search-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentSearchFilter = btn.dataset.lbtab || btn.dataset.searchTab || "all";
    lbSearchTabsEl.querySelectorAll(".lb-search-tab").forEach((b) => {
      b.classList.toggle("is-active", b === btn);
    });
    const active = getActiveTab();
    if (active?.showSearch) {
      renderLucasBrowseSearchResults(active);
    }
  });
});

btnGamesHub.addEventListener("click", () => openGamesHub());
btnGamesClose.addEventListener("click", () => (gamesModal.hidden = true));
gamesModal.addEventListener("click", (e) => {
  if (e.target === gamesModal) gamesModal.hidden = true;
});

gamesSearchInput.addEventListener("input", () => {
  currentGamesRenderLimit = 48;
  renderGamesGrid();
});

gamesCategoriesEl.querySelectorAll(".game-cat-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentGameCategory = btn.dataset.cat;
    currentGamesRenderLimit = 48;
    gamesCategoriesEl.querySelectorAll(".game-cat-btn").forEach((b) => {
      b.classList.toggle("is-active", b === btn);
    });
    renderGamesGrid();
  });
});

btnLoadMoreGames.addEventListener("click", () => {
  currentGamesRenderLimit += 72;
  renderGamesGrid();
});

btnSwitchProxy.addEventListener("click", () => {
  cycleNextProxy();
});

btnNewTab.addEventListener("click", () => {
  createTab({ select: true });
  heroInput.focus();
});

btnPanic.addEventListener("click", () => triggerPanicRedirect());

btnBrand.addEventListener("click", () => {
  const active = getActiveTab();
  if (!active) return;
  active.showLaunchpad = true;
  active.showSearch = false;
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

btnReaderToggle.addEventListener("click", () => {
  const active = getActiveTab();
  if (!active || !active.url) {
    setProxyEngine(currentEngine === "reader" ? "auto" : "reader");
    return;
  }
  const nextEngine = active.engine === "reader" ? "auto" : "reader";
  setProxyEngine(nextEngine, { reloadCurrent: true });
});

btnAdblock.addEventListener("click", () => toggleAdblock());
btnSplitView.addEventListener("click", () => toggleSplitScreen());

// Chrome 3-Dots Menu
btnMoreMenu.addEventListener("click", (e) => {
  e.stopPropagation();
  chromeDropdownEl.hidden = !chromeDropdownEl.hidden;
});

document.addEventListener("click", () => {
  chromeDropdownEl.hidden = true;
});

menuNewTab.addEventListener("click", () => createTab({ select: true }));
menuGames.addEventListener("click", () => openGamesHub());
menuDuplicateTab.addEventListener("click", () => {
  const active = getActiveTab();
  if (active) {
    createTab({
      select: true,
      url: active.url,
      engine: active.engine || currentEngine,
    });
  }
});
menuPinTab.addEventListener("click", () => {
  const active = getActiveTab();
  if (active) {
    active.pinned = !active.pinned;
    renderUI();
  }
});
menuReopenClosed.addEventListener("click", () => reopenLastClosedTab());
menuHistory.addEventListener("click", () => openHistoryDrawer());
menuNotes.addEventListener("click", () => (notesDrawer.hidden = false));
menuSnapshot.addEventListener("click", () => void exportSnapshotOrCopyLink());
menuPopout.addEventListener("click", () => openPopoutWindow());
menuCloak.addEventListener("click", () => openAboutBlankCloak());
menuFullscreen.addEventListener("click", () =>
  setFullscreenMode(!document.body.classList.contains("is-fullscreen"))
);
menuCommandPalette.addEventListener("click", () => openCommandPalette());
menuDevtools.addEventListener("click", () => toggleDevTools());
menuCustomize.addEventListener("click", () => (customizeModal.hidden = false));

// History & Notes Drawers
btnHistoryClose.addEventListener("click", () => (historyDrawer.hidden = true));
historyDrawer.addEventListener("click", (e) => {
  if (e.target === historyDrawer) historyDrawer.hidden = true;
});
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

btnNotesClose.addEventListener("click", () => (notesDrawer.hidden = true));
notesDrawer.addEventListener("click", (e) => {
  if (e.target === notesDrawer) notesDrawer.hidden = true;
});
scratchpadTextarea.addEventListener("input", () => {
  localStorage.setItem(STORAGE_KEYS.notes, scratchpadTextarea.value);
});
btnDownloadNotes.addEventListener("click", () => {
  const blob = new Blob([scratchpadTextarea.value || ""], {
    type: "text/plain;charset=utf-8",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `notes-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
});

// Developer Console Dock
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
    }
  } catch (err) {
    logConsoleEvent("error", String(err?.message || err));
  }
});

// Command Bar
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

// Customize Modal
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

selectSearch.addEventListener("change", () => {
  currentSearchTemplate = selectSearch.value;
  localStorage.setItem(STORAGE_KEYS.searchEngine, currentSearchTemplate);
});

btnExportSession.addEventListener("click", () => {
  const payload = {
    exportedAt: new Date().toISOString(),
    theme: localStorage.getItem(STORAGE_KEYS.theme) || "midnight",
    bookmarks,
    shortcuts,
    history: historyEntries.slice(0, 50),
    notes: scratchpadTextarea.value || "",
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `lucasprox-backup-${new Date().toISOString().slice(0, 10)}.json`;
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
    } catch {
      alert("Invalid backup file.");
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
  btnClearData.textContent = "✓ Cleared!";
  setTimeout(() => {
    btnClearData.textContent = "Clear Browsing Data";
  }, 1500);
});

function setFullscreenMode(enabled) {
  document.body.classList.toggle("is-fullscreen", enabled);
  btnExitFullscreen.hidden = !enabled;
}

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
  } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "t" && !e.shiftKey) {
    e.preventDefault();
    createTab({ select: true });
    heroInput.focus();
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
  } else if (e.key === "F2" || (!isTyping && e.key === "`")) {
    e.preventDefault();
    triggerPanicRedirect();
  } else if (e.key === "Escape") {
    if (!gamesModal.hidden) gamesModal.hidden = true;
    else if (!commandPaletteModal.hidden) commandPaletteModal.hidden = true;
    else if (!customizeModal.hidden) customizeModal.hidden = true;
    else if (!historyDrawer.hidden) historyDrawer.hidden = true;
    else if (!notesDrawer.hidden) notesDrawer.hidden = true;
    else if (document.body.classList.contains("is-fullscreen")) {
      setFullscreenMode(false);
    }
  }
});

/**
 * Guard against Google AdSense Auto Ads mutating parent heights or injecting layout-breaking banners
 */
function installAdSenseLayoutGuard() {
  const protectedEls = [
    document.documentElement,
    document.body,
    document.querySelector(".app-shell"),
    document.querySelector(".chrome-bar"),
    document.getElementById("viewport"),
    launchpadEl,
    framesStageEl,
    document.getElementById("bottom-ad-bar"),
    document.querySelector(".bottom-ad-bar__slot"),
  ].filter(Boolean);

  const cleanLayoutMutations = () => {
    for (const el of protectedEls) {
      if (el.style?.height) el.style.removeProperty("height");
      if (el.style?.minHeight) el.style.removeProperty("min-height");
      if (el.style?.maxHeight) el.style.removeProperty("max-height");
      if (el.style?.paddingBottom) el.style.removeProperty("padding-bottom");
      if (el.style?.paddingTop) el.style.removeProperty("padding-top");
    }

    // Remove any random Auto Ads placements injected outside our tiny corner ad pill
    document
      .querySelectorAll(
        ".google-auto-placed, .adsbygoogle-noablate, ins.adsbygoogle:not(#lucasbrowse-ad-unit)"
      )
      .forEach((node) => node.remove());

    // Hide the corner ad pill if AdSense reports unfilled
    const adUnit = document.getElementById("lucasbrowse-ad-unit");
    const adBar = document.getElementById("bottom-ad-bar");
    if (adUnit && adBar) {
      const status = adUnit.getAttribute("data-ad-status");
      if (status === "unfilled") {
        adBar.hidden = true;
      }
    }
  };

  cleanLayoutMutations();
  const observer = new MutationObserver(cleanLayoutMutations);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["style", "data-ad-status"],
    childList: true,
    subtree: true,
  });
}

// Boot Initial State
installAdSenseLayoutGuard();
applyCustomizationsFromStorage();
renderBookmarks();
renderShortcuts();
createTab({ select: true });
void ensureGamesLoaded();

void ensureEngineReady()
  .catch(() => {})
  .finally(() => {
    const params = new URLSearchParams(location.search);
    const initialUrl = params.get("url");
    if (initialUrl) {
      window.history.replaceState({}, "", "/");
      void navigateTo(initialUrl);
    }
  });
