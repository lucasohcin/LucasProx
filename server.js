import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import vercelBareHandler from "./api/bare.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");

const app = express();

// Cross-origin isolation headers for Scramjet & Wasm transports
app.use((_req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  next();
});

// Route Bare V3 proxy requests (/bare, /bare/*, /api/bare, /api/bare/*)
app.all(["/bare", "/bare/*", "/api/bare", "/api/bare/*"], (req, res) => {
  void vercelBareHandler(req, res);
});

// Health & proxy metadata endpoint
app.get("/api/status", (_req, res) => {
  res.json({
    name: "LucasProx",
    engine: "Scramjet 2.0",
    wisp: "/wisp/",
    bare: "/bare/",
    transports: ["bare", "epoxy", "libcurl"],
    status: "online",
  });
});

// Serve static files from public/ (includes /scram, /controller, /utils, /baremod, etc. copied by npm run build)
app.use(express.static(publicDir));

// SPA fallback to index.html
app.get("*", (_req, res) => {
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
    console.log(`\n  ⚡ LucasProx (Scramjet 2.0 + Bare/Wisp) is running!`);
    console.log(`  ➜ Local:   http://localhost:${PORT}\n`);
  });
}
