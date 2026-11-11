# Aktivasi Akun Lokal — Tools Marketing Studio

## Link untuk pembeli

- Halaman aktivasi setelah pembayaran: `https://toolsmarketing.techo.web.id/konfirmasi.html`
- Halaman login: `https://toolsmarketing.techo.web.id/login.html`
- Halaman tools: `https://toolsmarketing.techo.web.id/`

Kirim tautan `/konfirmasi.html` setelah pembeli melakukan pembayaran. Pembeli membuat akun dengan Nama, Email, dan Password di browser tersebut, lalu sistem mengarahkan ke halaman login. Setelah login, pembeli dapat memakai tool.

## Penyimpanan
Semua akun dan sesi disimpan pada **localStorage** di browser pengguna, **bukan Google Sheets** dan bukan database server.
Password tidak disimpan mentah; browser membuat salt acak dan hash PBKDF2-SHA256.
Browser harus memakai HTTPS agar Web Crypto API tersedia. Sesi tersimpan hingga 30 hari atau sampai logout.

## Batasan utama
Ini hanyalah **login sederhana untuk tampilan premium**, bukan paywall atau proteksi lisensi.

- Akun yang dibuat di Chrome laptop tidak otomatis ada di Chrome HP, Firefox, atau perangkat lain.
- Data browser dihapus / incognito ditutup = akun mungkin hilang.
- Pembeli bisa membagikan URL konfirmasi ke orang yang belum membeli.
- Berkas HTML/JS situs statis tetap publik dan bisa diakses tanpa sistem izin backend.
- Browser storage dapat diubah sehingga login bukan kontrol akses yang kuat.
- Tidak ada pemeriksaan pembayaran, pembatasan satu akun per pembeli, atau pengelolaan akun secara terpusat.

Untuk versi yang benar-benar membatasi akses pelanggan berbayar, diperlukan autentikasi server dan aktivasi berdasarkan pembayaran/kode undangan yang unik.
