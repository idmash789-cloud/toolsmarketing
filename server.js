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
 * Untuk endpoint Arsant (https://arsant.my.id) yang memblokir CORS:
 *   Provider = Custom (OpenAI-compatible),
 *   Base URL = http://localhost:8090/proxy-arsant/v1,
 *   Model    = nama persis dari halaman model Arsant (mis. Gemini-3.8-flash),
 *   API Key  = key Arsant-mu.
 * Server ini meneruskan panggilannya dari sisi server, jadi browser
 * tidak lagi dicegat CORS oleh Arsant.
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
const https = require("https");
const fs = require("fs");
const path = require("path");

const APP_DIR = __dirname;
const PORT = parseInt(process.env.PORT || "8090", 10);
const HOST = "127.0.0.1";
const ROUTER_HOST = "127.0.0.1";
const ROUTER_PORT = 20128;
// Arsant (https://arsant.my.id): gateway token OpenAI-compatible yang tidak
// mengirim header CORS — browser memblokir panggilan langsung ke sana.
// (ARSANT_HOST/ARSANT_PORT bisa di-override lewat env untuk pengujian.)
const ARSANT_HOST = process.env.ARSANT_HOST || "arsant.my.id";
const ARSANT_PORT = parseInt(process.env.ARSANT_PORT || "443", 10);
const ARSANT_MOD = ARSANT_PORT === 443 ? https : http;

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

function handleProxy(req, res, rest, upstream) {
  // upstream: { mod, host, port, label, downMsg }
  // Jawab preflight CORS langsung (defensif; penggunaan same-origin tak perlu).
  // Header Access-Control-Allow-Private-Network penting bila aplikasi dibuka
  // dari situs HTTPS (toolsmarketing.techo.web.id) lalu memanggil proxy ini
  // di localhost (Chrome Private Network Access).
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": req.headers["access-control-request-headers"] || "*",
      "Access-Control-Allow-Private-Network": "true",
      "Access-Control-Max-Age": "86400",
    });
    return res.end();
  }

  // Forward: /proxy9/<sisa> -> http://127.0.0.1:20128/<sisa>
  //          /proxy-arsant/<sisa> -> https://arsant.my.id/<sisa>
  const upstreamPath = "/" + rest.replace(/^\/+/, "");
  const headers = Object.assign({}, req.headers);
  delete headers["host"];
  headers["host"] = upstream.port === 443 ? upstream.host : upstream.host + ":" + upstream.port;
  // Jangan meneruskan header Origin dari browser ke upstream
  delete headers["origin"];
  delete headers["referer"];

  const upReq = upstream.mod.request(
    {
      host: upstream.host,
      port: upstream.port,
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
      outHeaders["Access-Control-Allow-Private-Network"] = "true";
      res.writeHead(upRes.statusCode, outHeaders);
      upRes.pipe(res);
    }
  );

  upReq.on("error", () => {
    res.writeHead(502, {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(JSON.stringify({ error: upstream.downMsg }));
  });

  req.pipe(upReq);
}

const server = http.createServer((req, res) => {
  try {
    const pathname = decodeURIComponent(req.url.split("?")[0]);
    if (pathname === "/proxy9" || pathname.startsWith("/proxy9/")) {
      const rest = req.url.slice("/proxy9".length); // pertahankan query string
      return handleProxy(req, res, rest, {
        mod: http,
        host: ROUTER_HOST,
        port: ROUTER_PORT,
        label: "9Router",
        downMsg:
          "9Router tidak terjangkau di " +
          ROUTER_HOST +
          ":" +
          ROUTER_PORT +
          " — pastikan aplikasi 9Router sedang jalan (dashboard: http://localhost:20128/dashboard).",
      });
    }
    if (pathname === "/proxy-arsant" || pathname.startsWith("/proxy-arsant/")) {
      const rest = req.url.slice("/proxy-arsant".length); // pertahankan query string
      return handleProxy(req, res, rest, {
        mod: ARSANT_MOD,
        host: ARSANT_HOST,
        port: ARSANT_PORT,
        label: "Arsant",
        downMsg: "arsant.my.id tidak terjangkau — periksa koneksi internet.",
      });
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
  console.log("  Untuk endpoint Arsant (CORS diblokir):");
  console.log("    Provider : Custom (OpenAI-compatible)");
  console.log("    Base URL : http://localhost:" + PORT + "/proxy-arsant/v1");
  console.log("    Model    : nama persis dari halaman model Arsant");
  console.log("               (mis. Gemini-3.8-flash)");
  console.log("    API Key  : key Arsant-mu");
  console.log("  (Buka aplikasi dari alamat ini, bukan dari situs HTTPS,");
  console.log("   supaya pengaturan tersimpan di origin yang sama.)");
  console.log("");
  console.log("  Tekan Ctrl+C untuk menghentikan server.");
  console.log("");
});
