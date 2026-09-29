const NativeResponse = self.Response;
const NativeHeaders = self.Headers;
const NULL_BODY_STATUS = new Set([101, 204, 205, 304]);

function sanitizeSwResponseInit(init) {
  if (!init || typeof init !== "object") return init;
  const status =
    typeof init.status === "number" && init.status >= 200 && init.status <= 599
      ? init.status
      : 200;
  const statusText =
    String(init.statusText ?? "OK")
      .replace(/[^\t\x20-\x7e]/g, "")
      .trim() || "OK";

  let headers = init.headers;
  if (Array.isArray(init.headers)) {
    const safeHeaders = new NativeHeaders();
    for (const entry of init.headers) {
      if (!Array.isArray(entry) || entry.length < 2) continue;
      const key = String(entry[0] || "").trim();
      if (!key || key.startsWith(":")) continue;
      const lower = key.toLowerCase();
      if (
        lower === "content-encoding" ||
        lower === "content-length" ||
        lower === "transfer-encoding"
      ) {
        continue;
      }
      const values = Array.isArray(entry[1]) ? entry[1] : [entry[1]];
      for (const item of values) {
        if (item === undefined || item === null) continue;
        try {
          safeHeaders.append(
            key,
            String(item).replace(/[\r\n\0]+/g, " ").trim()
          );
        } catch {
          // Ignore malformed header entries
        }
      }
    }
    headers = safeHeaders;
  }

  return {
    ...init,
    status,
    statusText,
    headers,
  };
}

class SafeSwResponse extends NativeResponse {
  constructor(body, init) {
    const safeInit = sanitizeSwResponseInit(init);
    const safeBody =
      safeInit && NULL_BODY_STATUS.has(safeInit.status) ? null : body;
    super(safeBody, safeInit);
  }
}

self.Response = SafeSwResponse;

importScripts("/controller/controller.sw.js");

self.addEventListener("fetch", (event) => {
  if ($scramjetController.shouldRoute(event)) {
    event.respondWith($scramjetController.route(event));
  }
});
