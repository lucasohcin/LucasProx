import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import vercelBareHandler from "./api/bare.js";
import proxyHandler, { uvDecode } from "./api/proxy.js";
import gamesHandler from "./api/games.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");

const app = express();

// Ensure cross-origin HTML5 & 3D WebGL game iframes and thumbnails embed without COEP restrictions
app.use((_req, res, next) => {
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

// Route tunnel requests
app.all(["/bare", "/bare/*", "/api/bare", "/api/bare/*"], (req, res) => {
  void vercelBareHandler(req, res);
});

// Route multi-proxy requests
app.all(["/api/proxy", "/api/proxy/*", "/service/uv/*"], (req, res) => {
  void proxyHandler(req, res);
});

// Route 1,000+ HTML5 & AAA Cloud Games API
app.get("/api/games", (req, res) => {
  void gamesHandler(req, res);
});

// Health & latency ping endpoint
app.get("/api/status", (_req, res) => {
  res.json({
    name: "LucasProx",
    routes: ["auto", "route1", "route2", "route3", "route4"],
    timestamp: Date.now(),
    status: "online",
  });
});

// Serve static files from public/
app.use(express.static(publicDir));

/**
 * Extract target origin from Referer header or __lp_origin cookie
 * so root-relative requests (/_next/..., /assets/..., /static/...) from proxied sites
 * are automatically proxied instead of hitting the SPA index.html fallback!
 */
function extractProxiedOrigin(req) {
  const referer = req.headers.referer || "";
  if (referer) {
    try {
      const refUrl = new URL(referer);
      if (refUrl.pathname.startsWith("/api/proxy")) {
        const rawTarget = refUrl.searchParams.get("url");
        if (rawTarget) return new URL(rawTarget).origin;
      } else if (refUrl.pathname.startsWith("/service/uv/")) {
        const encoded = refUrl.pathname.slice("/service/uv/".length);
        const decoded = uvDecode(encoded);
        if (decoded) return new URL(decoded).origin;
      }
    } catch {}
  }

  const cookieHeader = req.headers.cookie || "";
  const match = cookieHeader.match(/(?:^|;\s*)__lp_origin=([^;]+)/);
  if (match && match[1]) {
    try {
      return new URL(decodeURIComponent(match[1])).origin;
    } catch {}
  }

  return null;
}

app.all("*", (req, res) => {
  if (req.path !== "/" && req.path !== "/index.html") {
    const targetOrigin = extractProxiedOrigin(req);
    if (targetOrigin) {
      const resolvedUrl = `${targetOrigin}${req.originalUrl}`;
      req.url = `/api/proxy?engine=direct&url=${encodeURIComponent(resolvedUrl)}`;
      void proxyHandler(req, res);
      return;
    }
  }
  res.sendFile(path.join(publicDir, "index.html"));
});

export default app;

// Only start standalone HTTP + WebSocket listener when running locally (not inside Vercel Serverless)
if (!process.env.VERCEL) {
  const PORT = Number(process.env.PORT) || 8080;
  const server = http.createServer(app);

  import("@mercuryworkshop/wisp-js/server")
    .then(({ server: wisp, logging }) => {
      logging.set_level(logging.WARN);
      wisp.options.dns_result_order = "ipv4first";
      wisp.options.allow_udp_streams = true;
      wisp.options.allow_tcp_streams = true;

      server.on("upgrade", (req, socket, head) => {
        const pathname = new URL(req.url ?? "/", "http://localhost").pathname;
        if (pathname === "/wisp/" || pathname === "/wisp") {
          req.url = "/wisp/";
          wisp.routeRequest(req, socket, head);
          return;
        }
        socket.end();
      });
    })
    .catch(() => {});

  server.listen(PORT, () => {
    console.log(`\n  ⚡ LucasProx is running!`);
    console.log(`  ➜ Local:   http://localhost:${PORT}\n`);
  });
}
