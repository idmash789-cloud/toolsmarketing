# Tools Marketing

Web app statis (tanpa backend) berisi 4 tool untuk riset & produksi iklan Meta Ads:

1. **Buyer Persona** — profil pembeli lengkap + angle iklan per segmen
2. **Value Proposition Canvas** — kanvas fitur → benefit → emosi → kekhawatiran pembeli
3. **Copywriting** — headline, primary text panjang/pendek, variasi angle, saran CTA
4. **Narasi Konten** — skrip video iklan berdurasi (15/20/30 detik, 1 menit) dengan formula klasik & racikan original, pola hook original, CTA, gaya bahasa, dan funnel TOFU/MOFU/BOFU

## Dua mode generate

- **Mode Prompt (gratis, default):** hasil generate adalah *prompt* detail berbahasa Indonesia, siap ditempel ke ChatGPT / Gemini / AI favoritmu.
- **Mode AI (BYOK):** prompt yang sama dikirim ke LLM pilihanmu dan menghasilkan *hasil akhir* langsung di web ini.

Provider yang didukung (Mode AI): OpenAI, OpenRouter, Groq (default resmi `openai/gpt-oss-120b`), Google Gemini, **Kie AI** (chat via api.kie.ai), 9Router (endpoint lokal `http://localhost:20128/v1`), dan Custom OpenAI-compatible.

## Privasi API key

API key dimasukkan lewat ikon ⚙️ **Pengaturan AI** dan disimpan **hanya di browser pengunjung** (localStorage). Tidak ada di kode, tidak ada di repo ini. Jangan kirim API key lewat chat ke siapa pun.

## Mode AI via 9Router (jalur anti-CORS)

Panggilan browser langsung ke `http://localhost:20128/v1` kadang gagal dengan
"Failed to fetch" karena masalah CORS di 9Router (preflight OPTIONS ditolak).
Jalur server lokal ini mem-bypass itu sepenuhnya — browser bicara ke server ini
(same-origin), server yang meneruskan ke 9Router.

1. Pastikan 9Router sedang jalan (dashboard: `http://localhost:20128/dashboard`).
2. Di folder aplikasi ini jalankan: `node server.js`
3. Buka di browser: `http://localhost:8090`
4. Panel AI (ikon ⚙): Provider = **9Router (lokal)**, Base URL =
   `http://localhost:8090/proxy9/v1`, Model & API Key = sama seperti di
   dashboard 9Router-mu.

Butuh Node.js terinstal (tanpa dependensi npm tambahan).

## Provider Kie AI

Kie AI tidak memakai skema base-URL + model-di-body seperti OpenAI — nama
model ada di **jalur URL**: `https://api.kie.ai/{model}/v1/chat/completions`.
Aplikasi ini sudah menanganinya khusus lewat provider **Kie AI**:

1. Buat API key di `kie.ai/api-key`.
2. Panel AI (ikon ⚙): Provider = **Kie AI**, API Key = key dari kie.ai.
   Kolom Base URL tidak perlu diisi (default `https://api.kie.ai`).
3. Klik **🔄 Ambil daftar model dari endpoint** — pilih salah satu model
   chat yang muncul (default: `gemini-3-flash`).
4. Simpan, lalu Generate seperti biasa.

Catatan: model keluarga **Claude tidak didukung** di jalur ini (format
protokolnya berbeda — Anthropic Messages). Pakai model Gemini atau model
chat lainnya.

## Menjalankan

Cukup buka `index.html` di browser, atau hosting statis apa pun (GitHub Pages, Netlify, dsb). Tidak perlu build step.

## Chaining

Hasil Buyer Persona & Value Proposition Canvas tersimpan otomatis di browser. Tool Copywriting & Narasi Konten punya tombol **"Pakai VPC terakhir"** untuk mengisi otomatis.
