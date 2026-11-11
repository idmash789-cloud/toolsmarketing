# Premium Login + Google Sheets (3 kolom)

## Status saat commit ini
Halaman login premium tersedia pada `/login.html`. `auth-config.js` diset ke
`enabled: false` agar website yang sudah online **tidak terkunci** sebelum backend siap.
Membuat file/kode di GitHub **tidak otomatis** membuat Google Spreadsheet, service
account, Worker, atau koneksi live. Semua langkah berikut harus dilakukan oleh pemilik.

## Isi spreadsheet — tepat 3 kolom

Buat spreadsheet Google **private** dengan tab bernama `Users`:

| A (Nama) | B (Email) | C (Password) |
|---|---|---|
| Nama pengguna | user@email.com | pbkdf2$... |

Baris 1 harus `Nama, Email, Password`.
**Kolom C bukan password teks biasa**, melainkan hash salted PBKDF2-SHA256.
Jangan menulis password asli langsung ke spreadsheet. Gunakan endpoint admin
di bawah untuk mendaftarkan pengguna (otomatis menambah A:B:C).
Jangan publikasi/share spreadsheet "Anyone with the link".

## Koneksi Google Cloud

1. Buat Google Cloud project dan aktifkan **Google Sheets API**.
2. Buat **Service Account** khusus project ini.
3. Buat JSON service-account key dan simpan **di perangkat admin saja**.
   Jangan unggah file JSON tersebut ke GitHub/ChatGPT.
4. Share spreadsheet ke `client_email` service account sebagai **Editor**.
5. Salin spreadsheet ID dari URL Google Sheets: bagian setelah `/d/` sebelum `/edit`.

## Deploy Cloudflare Worker

Di terminal (Node.js terinstal):

```bash
cd cloudflare-auth
npx wrangler login
npx wrangler secret put SHEET_ID
npx wrangler secret put GOOGLE_CLIENT_EMAIL
npx wrangler secret put GOOGLE_PRIVATE_KEY
npx wrangler secret put SESSION_SECRET
npx wrangler secret put ADMIN_SETUP_TOKEN
npx wrangler deploy
```

- `GOOGLE_PRIVATE_KEY`: isi `private_key` dari JSON service account (PEM).
- `SESSION_SECRET`: string acak >=32 karakter (gunakan nilai unik).
- `ADMIN_SETUP_TOKEN`: string acak >=32 karakter, berbeda dari session secret.
- Masukkan secrets di prompt terminal, **bukan** di GitHub commit atau browser.
- Worker menggunakan PBKDF2 untuk hash password dan signed HttpOnly cookie.
- Rate limiting login 6 percobaan/menit per IP via Cloudflare binding.
- Worker memvalidasi session dan status akun terhadap Google Sheets.

Pada Cloudflare, buka **Workers & Pages → toolsmarketing-auth → Settings →
Domains & Routes → Add → Custom Domain**:
`api.toolsmarketing.techo.web.id`.

Zona domain `techo.web.id` harus berada di Cloudflare yang Anda kelola.
Jangan mengganti CNAME website `toolsmarketing.techo.web.id` untuk ini.
Pastikan domain API memiliki HTTPS valid. Worker dan website berada di subdomain
dari domain yang sama agar cookie `SameSite=Lax` dapat digunakan.

## Tambahkan akun pertama

Jangan isi kolom Password manual dengan plaintext. Buat akun lewat API
**admin** (misalnya dengan PowerShell di Windows):

```powershell
$Api = "https://api.toolsmarketing.techo.web.id"
$AdminToken = Read-Host "Tempel ADMIN_SETUP_TOKEN"
$Password = Read-Host "Password akun (minimal 12 karakter)" -AsSecureString
$PasswordText = [System.Net.NetworkCredential]::new("", $Password).Password
$Body = @{ name = "Admin Tools"; email = "admin@contoh.com"; password = $PasswordText } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$Api/api/admin/users" `
  -Headers @{ Authorization = "Bearer $AdminToken" } `
  -ContentType "application/json" -Body $Body
Remove-Variable Body, PasswordText, AdminToken, Password
```

Ganti `admin@contoh.com` dengan email yang ingin didaftarkan.
API menambah baris baru ke Google Sheets: Nama, Email, dan hash Password.
Tidak ada fitur registrasi publik; semua akun dibuat admin.

Untuk mengganti password akun yang sudah ada, gunakan request admin serupa
ke `/api/admin/reset-password` dengan JSON `email` dan `password`.
Setelah reset, sesi lama tidak lolos validasi lagi.

## Aktifkan autentikasi website

1. Kunjungi `https://api.toolsmarketing.techo.web.id/api/health`
   dan pastikan `{"ok":true,"configured":true}`.
2. Uji login di `https://toolsmarketing.techo.web.id/login.html`.
3. Setelah berhasil, ubah `auth-config.js` menjadi `enabled: true`.
4. Deploy perubahan GitHub seperti biasanya.

Penting: karena situs di GitHub Pages adalah situs statis publik, **guard
JavaScript bukan pembatas akses yang kuat**. User yang paham teknis masih dapat
mengunduh file HTML/JS publik walaupun login diterapkan. Jika tujuan Anda
adalah mengunci akses ke tools secara nyata, migrasikan hosting static assets
ke Cloudflare Workers/Pages dengan middleware yang memverifikasi sesi **di
server sebelum mengirimkan file**. Jangan menyebutnya paywall aman sampai itu
terpasang. Sistem Worker di sini mengamankan credential, password hash,
API spreadsheet dan session, tetapi tidak membuat file GitHub Pages privat.

## Diagnostik

- Login gagal / status 503: secrets atau rate limiter belum ada.
- Gagal baca sheet: cek Google Sheets API aktif, nama tab Users dan izin Editor
  untuk service account.
- Browser CORS: pastikan `SITE_ORIGIN` tepat dengan URL website HTTPS dan API
  memakai custom domain yang benar.
- Cookie tidak tersimpan: hindari API `workers.dev` lintas-site untuk produksi.
- Jika spreadsheet diubah secara manual, kolom Password wajib tetap hash.
- Jangan masukkan spreadsheet data/credential ke file statis `app.js`,
  `login.js`, atau `auth-config.js`.
