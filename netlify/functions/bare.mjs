import EventEmitter from "node:events";
import { createBareServer } from "@tomphttp/bare-server-node";

const bareServer = createBareServer("/bare/", {
  database: new Map(),
  connectionLimiter: {
    maxConnectionsPerIP: 2000,
    windowDuration: 60,
    blockDuration: 10,
  },
});

export default async (request) => {
  const url = new URL(request.url);

  let service = url.pathname;
  if (service.startsWith("/.netlify/functions/bare")) {
    service = service.slice("/.netlify/functions/bare".length) || "/";
  } else if (service.startsWith("/bare")) {
    service = service.slice("/bare".length) || "/";
  }
  if (!service.startsWith("/")) {
    service = "/" + service;
  }

  let response;
  try {
    if (request.method === "OPTIONS") {
      response = new Response(null, { status: 200 });
    } else if (service === "/") {
      response = Response.json(bareServer.instanceInfo, { status: 200 });
    } else if (bareServer.routes.has(service)) {
      const call = bareServer.routes.get(service);
      const fakeNative = new EventEmitter();
      fakeNative.complete = true;
      request.native = fakeNative;
      const fakeRes = new EventEmitter();
      response = await call(request, fakeRes, bareServer.options);
    } else {
      response = Response.json(
        { code: "UNKNOWN", id: "error.NotFound", message: `Unknown bare route: ${service}` },
        { status: 404 }
      );
    }
  } catch (err) {
    const status = err?.status || err?.statusCode || 500;
    const body = err?.body || {
      code: "UNKNOWN",
      id: `error.${err?.name || "Exception"}`,
      message: err?.message || String(err),
    };
    response = Response.json(body, { status });
  }

  const headers = new Headers(response.headers);
  headers.set("x-robots-tag", "noindex");
  headers.set("access-control-allow-headers", "*");
  headers.set("access-control-allow-origin", "*");
  headers.set("access-control-allow-methods", "*");
  headers.set("access-control-expose-headers", "*");
  headers.set("access-control-max-age", "7200");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export const config = {
  path: ["/bare", "/bare/*"],
};
