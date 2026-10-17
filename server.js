#!/usr/bin/env node
/* Tools Marketing — server lokal anti-CORS untuk Mode AI via 9Router
 *
 * Cara pakai (di folder aplikasi ini):
 *   1. Pastikan 9Router sedang jalan (Endpoint http://localhost:20128/v1).
 *   2. Jalankan:  node server.js
 *   3. Buka di browser:  http://localhost:8090
 *   4. Di panel AI (ikon ⚙): Provider = 9Router (lokal),
 *      Base URL = http://localhost:8090/proxy9/v1,
 *      Model & API Key = sama seperti di dashboard 9Router-mu.
 *
 * Kenapa perlu? Browser ke 9Router langsung (http://localhost:20128/v1)
 * kadang gagal dengan "Failed to fetch" karena preflight CORS (OPTIONS
 * tanpa API key) ditolak middleware auth 9Router (upstream issue #1381).
 * Server ini menyajikan aplikasi dan meneruskan API-nya dari SATU origin
 * yang sama, sehingga browser tidak perlu CORS ke 9Router sama sekali.
 *
 * Nol dependensi npm — hanya modul bawaan Node (http/fs/path).
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const APP_DIR = __dirname;
const PORT = parseInt(process.env.PORT || "8090", 10);
const HOST = "127.0.0.1";
const ROUTER_HOST = "127.0.0.1";
const ROUTER_PORT = 20128;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function sendText(res, status, text, contentType) {
  res.writeHead(status, { "Content-Type": contentType || "text/plain; charset=utf-8" });
  res.end(text);
}

function serveStatic(req, res, pathname) {
  // Hapus query string, lindungi dari path traversal
  let rel = decodeURIComponent(pathname.split("?")[0]);
  if (rel === "/" || rel === "") rel = "/index.html";
  const safe = path.normalize(rel).replace(/^(\.\.[\/\\])+/, "").replace(/^[/\\]+/, "");
  const file = path.join(APP_DIR, safe);

  // Blokir kalau hasilnya keluar dari folder aplikasi
  if (!file.startsWith(APP_DIR + path.sep)) {
    return sendText(res, 403, "Forbidden");
  }
  // Hanya file aplikasi yang boleh disajikan
  const allowed = ["index.html", "style.css", "app.js", "ai.js", "README.md"];
  if (!allowed.includes(path.basename(file)) || path.dirname(file) !== APP_DIR) {
    return sendText(res, 404, "Not found");
  }

  fs.readFile(file, (err, data) => {
    if (err) return sendText(res, 404, "Not found");
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}

function handleProxy(req, res, rest) {
  // Jawab preflight CORS langsung (defensif; penggunaan same-origin tak perlu)
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": req.headers["access-control-request-headers"] || "*",
      "Access-Control-Max-Age": "86400",
    });
    return res.end();
  }

  // Forward ke 9Router: /proxy9/<sisa> -> http://127.0.0.1:20128/<sisa>
  const upstreamPath = "/" + rest.replace(/^\/+/, "");
  const headers = Object.assign({}, req.headers);
  delete headers["host"];
  headers["host"] = ROUTER_HOST + ":" + ROUTER_PORT;
  // Jangan meneruskan header Origin dari browser ke 9Router
  delete headers["origin"];
  delete headers["referer"];

  const upReq = http.request(
    {
      host: ROUTER_HOST,
      port: ROUTER_PORT,
      method: req.method,
      path: upstreamPath,
      headers,
    },
    (upRes) => {
      const outHeaders = Object.assign({}, upRes.headers);
      delete outHeaders["transfer-encoding"];
      outHeaders["Access-Control-Allow-Origin"] = "*";
      outHeaders["Access-Control-Allow-Methods"] = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
      outHeaders["Access-Control-Allow-Headers"] = "*";
      res.writeHead(upRes.statusCode, outHeaders);
      upRes.pipe(res);
    }
  );

  upReq.on("error", () => {
    const msg =
      "9Router tidak terjangkau di " +
      ROUTER_HOST +
      ":" +
      ROUTER_PORT +
      " — pastikan aplikasi 9Router sedang jalan (dashboard: http://localhost:20128/dashboard).";
    res.writeHead(502, {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(JSON.stringify({ error: msg }));
  });

  req.pipe(upReq);
}

const server = http.createServer((req, res) => {
  try {
    const pathname = decodeURIComponent(req.url.split("?")[0]);
    if (pathname === "/proxy9" || pathname.startsWith("/proxy9/")) {
      const rest = req.url.slice("/proxy9".length); // pertahankan query string
      return handleProxy(req, res, rest);
    }
    return serveStatic(req, res, pathname);
  } catch (e) {
    sendText(res, 500, "Server error: " + e.message);
  }
});

server.listen(PORT, HOST, () => {
  console.log("");
  console.log("==========================================================");
  console.log("  Tools Marketing — server lokal siap!");
  console.log("==========================================================");
  console.log("");
  console.log("  BUKA DI BROWSER:  http://localhost:" + PORT);
  console.log("");
  console.log("  Pengaturan AI di aplikasi (ikon ⚙):");
  console.log("    Provider : 9Router (lokal)");
  console.log("    Base URL : http://localhost:" + PORT + "/proxy9/v1");
  console.log("    Model    : sama seperti di dashboard 9Router");
  console.log("               (mis. kr/claude-sonnet-4.5 atau nama combo)");
  console.log("    API Key  : Default Key dari dashboard 9Router");
  console.log("               (key hanya tersimpan di browser ini)");
  console.log("");
  console.log("  Pastikan 9Router sedang jalan di komputer ini");
  console.log("  (dashboard: http://localhost:20128/dashboard).");
  console.log("");
  console.log("  Tekan Ctrl+C untuk menghentikan server.");
  console.log("");
});
