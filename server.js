import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vercelBareHandler from "./api/bare.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".map": "application/json; charset=utf-8",
};

function serveFile(res, filePath) {
  try {
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) return false;
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
    res.writeHead(200);
    fs.createReadStream(filePath).pipe(res);
    return true;
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");

  const url = new URL(req.url ?? "/", "http://localhost");
  let pathname = url.pathname;
  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    // Keep raw pathname if malformed
  }

  // Route Bare V3 proxy requests (/bare/* and /api/bare*)
  if (
    pathname === "/bare" ||
    pathname.startsWith("/bare/") ||
    pathname === "/api/bare" ||
    pathname.startsWith("/api/bare/")
  ) {
    await vercelBareHandler(req, res);
    return;
  }

  // Health & status endpoint
  if (pathname === "/api/status") {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.writeHead(200);
    res.end(
      JSON.stringify({
        name: "LucasProx",
        engine: "Scramjet 2.0",
        wisp: "/wisp/",
        bare: "/bare/",
        transports: ["bare", "epoxy", "libcurl"],
        status: "online",
      })
    );
    return;
  }

  // Serve static files from public/ (includes /scram, /controller, /utils, /baremod, etc. after npm run build)
  const relPath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const candidate = path.resolve(publicDir, relPath);
  if (candidate.startsWith(publicDir) && serveFile(res, candidate)) {
    return;
  }

  // SPA fallback to index.html
  if (serveFile(res, path.join(publicDir, "index.html"))) {
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not Found");
}

// Only start standalone HTTP + WebSocket listener when running locally (not inside Vercel Serverless)
if (!process.env.VERCEL) {
  const PORT = Number(process.env.PORT) || 8080;
  const server = http.createServer((req, res) => {
    void handler(req, res);
  });

  // Attach Wisp WebSocket server dynamically for local dev
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
