import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { scramjetPath } from "@mercuryworkshop/scramjet/path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const require = createRequire(import.meta.url);

const dirOf = (specifier) => path.dirname(require.resolve(specifier));

const targets = [
  { src: scramjetPath, dest: path.join(publicDir, "scram") },
  { src: scramjetPath, dest: path.join(publicDir, "scramjet") },
  {
    src: dirOf("@mercuryworkshop/scramjet-controller"),
    dest: path.join(publicDir, "controller"),
  },
  {
    src: dirOf("@mercuryworkshop/scramjet-utils"),
    dest: path.join(publicDir, "utils"),
  },
  {
    src: dirOf("@mercuryworkshop/bare-transport"),
    dest: path.join(publicDir, "baremod"),
  },
  {
    src: dirOf("@mercuryworkshop/epoxy-transport"),
    dest: path.join(publicDir, "epoxy"),
  },
  {
    src: dirOf("@mercuryworkshop/libcurl-transport"),
    dest: path.join(publicDir, "libcurl"),
  },
];

for (const { src, dest } of targets) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(src, dest, { recursive: true });
  console.log(`Copied ${path.relative(rootDir, src)} -> ${path.relative(rootDir, dest)}`);
}

console.log("Build complete! Static Scramjet assets are ready in public/.");
