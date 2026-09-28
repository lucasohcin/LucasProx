import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import express from "express";
import { scramjetPath } from "@mercuryworkshop/scramjet/path";
import { server as wisp, logging } from "@mercuryworkshop/wisp-js/server";
import { createBareServer } from "@tomphttp/bare-server-node";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const dirOf = (specifier) => path.dirname(require.resolve(specifier));

const PORT = Number(process.env.PORT) || 8080;

// Configure Wisp server for fast DNS resolution and clean logs
logging.set_level(logging.WARN);
wisp.options.dns_result_order = "ipv4first";
wisp.options.allow_udp_streams = true;
wisp.options.allow_tcp_streams = true;

// Configure Bare V3 server (works over standard HTTP request/response & WebSockets)
const bareServer = createBareServer("/bare/", {
  connectionLimiter: {
    maxConnectionsPerIP: 2000,
    windowDuration: 60,
    blockDuration: 10,
  },
});

const app = express();

// Cross-origin isolation headers required by Wasm transports (Epoxy / Libcurl)
app.use((_req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  next();
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

// Serve Scramjet runtime bundles & Wasm
app.use("/scram/", express.static(scramjetPath));
app.use("/scramjet/", express.static(scramjetPath));
app.use(
  "/controller/",
  express.static(dirOf("@mercuryworkshop/scramjet-controller"))
);
app.use("/utils/", express.static(dirOf("@mercuryworkshop/scramjet-utils")));

// Serve Bare & Wisp transports
app.use(
  "/baremod/",
  express.static(dirOf("@mercuryworkshop/bare-transport"))
);
app.use(
  "/libcurl/",
  express.static(dirOf("@mercuryworkshop/libcurl-transport"))
);
app.use("/epoxy/", express.static(dirOf("@mercuryworkshop/epoxy-transport")));

// Serve static frontend assets
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

// Fallback to index.html for SPA routes that aren't proxied
app.get("/", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

const server = http.createServer((req, res) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeRequest(req, res);
    return;
  }
  app(req, res);
});

// Route WebSocket upgrades to Bare or Wisp
server.on("upgrade", (req, socket, head) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeUpgrade(req, socket, head);
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
