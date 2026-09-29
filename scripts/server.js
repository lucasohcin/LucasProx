import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { scramjetPath } from "@mercuryworkshop/scramjet/path";
import { server as wisp, logging } from "@mercuryworkshop/wisp-js/server";
import { createBareServer } from "@tomphttp/bare-server-node";
import vercelBareHandler from "../api/bare.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const require = createRequire(import.meta.url);
const dirOf = (specifier) => path.dirname(require.resolve(specifier));

const PORT = Number(process.env.PORT) || 8080;

logging.set_level(logging.WARN);
wisp.options.dns_result_order = "ipv4first";
wisp.options.allow_udp_streams = true;
wisp.options.allow_tcp_streams = true;

const bareServer = createBareServer("/bare/", {
  connectionLimiter: {
    maxConnectionsPerIP: 2000,
    windowDuration: 60,
    blockDuration: 10,
  },
});

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

const MOUNT_POINTS = [
  { prefix: "/scram/", dir: scramjetPath },
  { prefix: "/scramjet/", dir: scramjetPath },
  { prefix: "/controller/", dir: dirOf("@mercuryworkshop/scramjet-controller") },
  { prefix: "/utils/", dir: dirOf("@mercuryworkshop/scramjet-utils") },
  { prefix: "/baremod/", dir: dirOf("@mercuryworkshop/bare-transport") },
  { prefix: "/libcurl/", dir: dirOf("@mercuryworkshop/libcurl-transport") },
  { prefix: "/epoxy/", dir: dirOf("@mercuryworkshop/epoxy-transport") },
];

function serveFile(res, filePath) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not Found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Resource-Policy": "same-origin",
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === "/api/bare" || pathname.startsWith("/api/bare/")) {
    void vercelBareHandler(req, res);
    return;
  }

  if (bareServer.shouldRoute(req)) {
    void bareServer.routeRequest(req, res);
    return;
  }

  if (pathname === "/api/status") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
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

  for (const { prefix, dir } of MOUNT_POINTS) {
    if (pathname.startsWith(prefix)) {
      const rel = pathname.slice(prefix.length);
      const target = path.resolve(dir, rel);
      if (target.startsWith(dir)) {
        serveFile(res, target);
        return;
      }
    }
  }

  const safeRel = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const publicTarget = path.resolve(publicDir, safeRel);
  if (publicTarget.startsWith(publicDir) && fs.existsSync(publicTarget) && fs.statSync(publicTarget).isFile()) {
    serveFile(res, publicTarget);
    return;
  }

  serveFile(res, path.join(publicDir, "index.html"));
});

server.on("upgrade", (req, socket, head) => {
  if (bareServer.shouldRoute(req)) {
    void bareServer.routeUpgrade(req, socket, head);
    return;
  }
  const pathname = new URL(req.url ?? "/", "http://localhost").pathname;
  if (pathname === "/wisp/" || pathname === "/wisp") {
    req.url = "/wisp/";
    wisp.routeRequest(req, socket, head);
    return;
  }
  socket.end();
});

server.listen(PORT, () => {
  console.log(`\n  ⚡ LucasProx (Scramjet 2.0 + Bare/Wisp) is running!`);
  console.log(`  ➜ Local:   http://localhost:${PORT}\n`);
});
