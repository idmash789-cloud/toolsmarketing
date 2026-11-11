# Tools Marketing — Login & Halaman Konfirmasi Pengguna

## Alamat halaman

- Website utama: https://toolsmarketing.techo.web.id/
- Login anggota: https://toolsmarketing.techo.web.id/login.html
- Portal pemilik: https://toolsmarketing.techo.web.id/konfirmasi.html

Login tidak menyediakan pendaftaran publik. Hanya pemilik dapat membuat akun melalui halaman konfirmasi. Backend Cloudflare Worker memeriksa sesi dan identitas pemilik pada setiap request daftar/tambah pengguna.

## Google Sheets — persis 3 kolom

Buat Google Spreadsheet **private** dengan nama tab `Users` dan header:

`Nama | Email | Password`

Kolom Password harus berisi **hash PBKDF2**, bukan password asli. Ketika pemilik menambahkan akun melalui `/konfirmasi.html`, Worker yang melakukan hashing dan menulis satu baris ke Google Sheets. Jangan bagikan sheet sebagai publik.

## Persiapan koneksi

1. Di Google Cloud aktifkan Google Sheets API dan buat **Service Account**.
2. Simpan file JSON kredensial service account hanya di komputer Anda, bukan di GitHub atau chat.
3. Bagikan spreadsheet dengan akses **Editor** kepada alamat `client_email` pada service account.
4. Catat Spreadsheet ID (di URL sheet, sesudah `/d/`).
5. Deploy Worker di folder `cloudflare-auth` dan atur secrets:

```bash
cd cloudflare-auth
npx wrangler login
npx wrangler secret put SHEET_ID
npx wrangler secret put GOOGLE_CLIENT_EMAIL
npx wrangler secret put GOOGLE_PRIVATE_KEY
npx wrangler secret put SESSION_SECRET
npx wrangler secret put ADMIN_SETUP_TOKEN
npx wrangler secret put OWNER_EMAIL
npx wrangler deploy
```

`OWNER_EMAIL`: email pribadi yang akan Anda gunakan untuk login sebagai pemilik.
`SESSION_SECRET` dan `ADMIN_SETUP_TOKEN`: dua string acak berbeda, masing-masing minimal 32 karakter.
`GOOGLE_PRIVATE_KEY`: isi field `private_key` dari JSON service account. Secrets **tidak boleh** masuk ke `auth-config.js`, repositori, atau Google Sheets.

6. Di Cloudflare Workers & Pages, tambah **Custom Domain** Worker: `api.toolsmarketing.techo.web.id`. Pastikan HTTPS aktif. API ini berbeda dari host situs `toolsmarketing.techo.web.id`, tetapi masih berada di site yang sama untuk cookie `SameSite=Lax`.

## Membuat akun pemilik pertama

Setelah Worker dan spreadsheet siap, buat akun pemilik satu kali melalui request rahasia (bukan form publik).

Contoh di PowerShell Windows:

```powershell
$Api = "https://api.toolsmarketing.techo.web.id"
$Token = Read-Host "Masukkan ADMIN_SETUP_TOKEN"
$Nama = Read-Host "Nama akun pemilik"
$Password = Read-Host "Password akun pemilik (12+ karakter)" -AsSecureString
$Plain = [System.Net.NetworkCredential]::new("", $Password).Password
$Body = @{name=$Nama; password=$Plain} | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri "$Api/api/setup/owner" -Headers @{Authorization="Bearer $Token"} -ContentType "application/json" -Body $Body
Remove-Variable Token, Password, Plain, Body
```

Email pemilik diambil dari secret `OWNER_EMAIL`, tidak dikirim dari browser. Endpoint ini menolak pembuatan ulang jika akun pemilik sudah tercatat di spreadsheet.

## Mengaktifkan halaman

Saat ini `auth-config.js` sengaja memakai `enabled:false` agar website tidak langsung terkunci. Setelah akun pemilik dan Worker siap:

1. Periksa `https://api.toolsmarketing.techo.web.id/api/health` mengembalikan `configured:true`.
2. Ubah `enabled:false` menjadi `enabled:true` di `auth-config.js` dan deploy.
3. Buka `/login.html`, masuk memakai akun pemilik.
4. Buka `/konfirmasi.html`, isi **Nama, Email, Password**, klik **Konfirmasi & Simpan Pengguna**.
5. Baris baru muncul otomatis di tab `Users`. Akun anggota tersebut bisa login melalui `/login.html`.

Halaman `/konfirmasi.html` adalah file statis, sehingga sumber HTML-nya masih publik, namun hanya pemilik dengan sesi valid yang dapat memuat daftar akun atau melakukan penulisan ke spreadsheet. URL tersembunyi saja **bukan** pengamanan. Jika ingin menyembunyikan seluruh berkas/tools sampai login, hosting perlu middleware autentikasi server-side (Cloudflare Workers/Pages), bukan hanya JavaScript browser.

## Catatan

- Form login publik tidak memiliki tautan daftar.
- Password tidak disimpan dalam bentuk teks asli.
- Worker menolak percobaan login berulang dengan rate limit 6/menit per IP.
- Jika pengguna mencoba `/api/admin/users` tanpa sesi owner, mendapat HTTP 401 atau 403.
- Jangan mengubah password hash di Sheet secara manual.
