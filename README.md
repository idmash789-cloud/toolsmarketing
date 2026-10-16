# Tools Marketing

Web app statis (tanpa backend) berisi 4 tool untuk riset & produksi iklan Meta Ads:

1. **Buyer Persona** — profil pembeli lengkap + angle iklan per segmen
2. **Value Proposition Canvas** — kanvas fitur → benefit → emosi → kekhawatiran pembeli
3. **Copywriting** — headline, primary text panjang/pendek, variasi angle, saran CTA
4. **Narasi Konten** — skrip video iklan berdurasi (15/20/30 detik, 1 menit) dengan formula klasik & racikan original, pola hook original, CTA, gaya bahasa, dan funnel TOFU/MOFU/BOFU

## Dua mode generate

- **Mode Prompt (gratis, default):** hasil generate adalah *prompt* detail berbahasa Indonesia, siap ditempel ke ChatGPT / Gemini / AI favoritmu.
- **Mode AI (BYOK):** prompt yang sama dikirim ke LLM pilihanmu dan menghasilkan *hasil akhir* langsung di web ini.

Provider yang didukung (Mode AI): OpenAI, OpenRouter, Groq (default resmi `openai/gpt-oss-120b`), Google Gemini, 9Router (endpoint lokal `http://localhost:20128/v1`), dan Custom OpenAI-compatible.

## Privasi API key

API key dimasukkan lewat ikon ⚙️ **Pengaturan AI** dan disimpan **hanya di browser pengunjung** (localStorage). Tidak ada di kode, tidak ada di repo ini. Jangan kirim API key lewat chat ke siapa pun.

## Menjalankan

Cukup buka `index.html` di browser, atau hosting statis apa pun (GitHub Pages, Netlify, dsb). Tidak perlu build step.

## Chaining

Hasil Buyer Persona & Value Proposition Canvas tersimpan otomatis di browser. Tool Copywriting & Narasi Konten punya tombol **"Pakai VPC terakhir"** untuk mengisi otomatis.
