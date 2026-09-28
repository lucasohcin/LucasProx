# ⚡ LucasProx

A fast, minimalistic web proxy service built on **Scramjet 2.0** (`@mercuryworkshop/scramjet`), **Bare V3** (`@tomphttp/bare-server-node` + `@mercuryworkshop/bare-transport`), and **Wisp v2** (`@mercuryworkshop/wisp-js` + Epoxy/Libcurl WebAssembly TLS transports).

## Features

- **Scramjet 2.0 Wasm Rewriter**: High-compatibility interception proxy engine with Service Worker routing (`/sw.js`).
- **Dual Deployment Support**:
  - **Netlify / Serverless Ready**: Uses `@mercuryworkshop/bare-transport` and a Netlify Serverless Function ([`netlify/functions/bare.mjs`](file:///Users/lucas/Downloads/LucasProx/netlify/functions/bare.mjs)) at `/bare/*`, while serving Scramjet Wasm & runtime bundles directly from Netlify's CDN via [`scripts/build.js`](file:///Users/lucas/Downloads/LucasProx/scripts/build.js).
  - **Local / VPS Ready**: Includes both Bare V3 (`/bare/`) and Wisp v2 (`/wisp/`) with **Epoxy TLS** (Rust/Wasm) and **Libcurl.js** (C/Wasm) in [`server.js`](file:///Users/lucas/Downloads/LucasProx/server.js).
- **Minimalistic Stealth UI**:
  - Clean omnibox supporting direct URLs (`wikipedia.org`, `news.ycombinator.com`, `example.com`) and instant web search (`DuckDuckGo`, `Brave`, `Wikipedia`, `Bing`).
  - Multi-tab workspace with background tab preservation, live page title syncing, and navigation history.
  - One-click `about:blank` tab cloaking and immersive fullscreen mode.
  - Keyboard shortcuts (`⌘K` / `Ctrl+K` to focus address bar, `Esc` to exit fullscreen).

## Local Quick Start

```bash
npm install
npm start
```

Then open **http://localhost:8080** in your browser.

## Deploying to Netlify

1. Connect your GitHub repository (`LucasProx`) in the [Netlify Dashboard](https://app.netlify.com/start).
2. Netlify will automatically detect [`netlify.toml`](file:///Users/lucas/Downloads/LucasProx/netlify.toml):
   - **Build command:** `npm run build`
   - **Publish directory:** `public`
   - **Functions directory:** `netlify/functions`
3. Click **Deploy site**!
