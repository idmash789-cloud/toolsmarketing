# Tools Marketing Studio

Workspace marketing dengan tampilan premium dark untuk membuat prompt iklan Meta Ads. Situs statis; tidak memerlukan backend, provider AI, atau API key.

## 4 tools

1. **Buyer Persona** — riset profil pembeli dan angle iklan.
2. **Value Proposition Canvas** — analisis fitur, benefit, emosi, dan kebutuhan pelanggan.
3. **Copywriting** — headline, primary text, variasi angle, dan CTA.
4. **Narasi Konten** — skrip video iklan, struktur, durasi, hook, dan CTA.

## Alur pengguna

1. Pilih salah satu tool.
2. Isi brief lalu klik **Generate Prompt**.
3. Pilih **Buka ChatGPT** atau **Buka Gemini**.
   - ChatGPT dibuka dengan URL prefill ketika panjang prompt memungkinkan; prompt juga disalin ke clipboard sebagai cadangan.
   - Gemini dibuka di tab baru dan prompt disalin ke clipboard. Tempel dengan Ctrl+V karena prefill URL tidak tersedia secara bawaan dan konsisten.
4. Hasil Persona dan VPC disimpan di localStorage dan dapat dipakai ulang di tool berikutnya.

## Teknologi dan privasi

HTML/CSS/JavaScript murni; tanpa build step. Form, hasil, dan riwayat input berada di browser pengguna. Tidak ada integrasi API AI dan tidak perlu memasukkan API key. Saat membuka ChatGPT/Gemini, situs AI tujuan menerima teks yang pengguna tempel atau masukkan.

## Menjalankan

Buka `index.html` di browser atau deploy ke GitHub Pages/hosting statis. File `CNAME` digunakan untuk domain kustom.


## Login anggota dan portal konfirmasi pemilik

Halaman login member berada di `login.html` (tanpa pendaftaran publik).
Hanya pemilik dapat mengelola pengguna melalui `konfirmasi.html`, menggunakan server-side owner session verification.
Data akun tersimpan di Google Sheets private dengan 3 kolom: Nama, Email, Password (hash).

Integrasi belum aktif (config `enabled:false`) sampai Google Sheets, service account, Cloudflare Worker, dan akun pemilik dipasang. Ikuti [SETUP-AUTH.md](SETUP-AUTH.md).
