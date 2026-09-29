/* LucasProx Ultraviolet (UV) Configuration & XOR Codec */
(function () {
  function xorEncode(str) {
    if (!str) return str;
    return encodeURIComponent(
      str
        .toString()
        .split("")
        .map((char, ind) =>
          ind % 2 ? String.fromCharCode(char.charCodeAt(0) ^ 2) : char
        )
        .join("")
    );
  }

  function xorDecode(str) {
    if (!str) return str;
    const [input, ...search] = str.split("?");
    return (
      decodeURIComponent(input)
        .split("")
        .map((char, ind) =>
          ind % 2 ? String.fromCharCode(char.charCodeAt(0) ^ 2) : char
        )
        .join("") + (search.length ? "?" + search.join("?") : "")
    );
  }

  self.__uv$config = {
    prefix: "/service/uv/",
    bare: "/api/bare",
    encodeUrl: xorEncode,
    decodeUrl: xorDecode,
    handler: "/uv/uv.handler.js",
    client: "/uv/uv.client.js",
    bundle: "/uv/uv.bundle.js",
    config: "/uv/uv.config.js",
    sw: "/uv/uv.sw.js",
  };
})();
