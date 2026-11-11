# Tools Marketing Studio

Workspace premium untuk menyusun prompt Buyer Persona, Value Proposition Canvas, Copywriting, dan Narasi Konten. Setiap prompt dapat dibawa ke ChatGPT dan Gemini, tanpa integrasi API AI.

## Penggunaan sederhana
1. **Setelah pembeli membayar**, kirim tautan `https://toolsmarketing.techo.web.id/konfirmasi.html`.
2. Pembeli mengisi **Nama, Email, Password** untuk membuat akun yang tersimpan di browser/perangkat itu.
3. Pembeli kemudian login melalui `https://toolsmarketing.techo.web.id/login.html`.
4. Setelah login, halaman utama `https://toolsmarketing.techo.web.id/` menampilkan tools marketing.

Tidak ada panel admin, spreadsheet, backend atau database terpusat. Penyimpanan akun menggunakan `localStorage`. Password disimpan sebagai hash PBKDF2 dengan salt acak (bukan teks biasa). Sesi aktif hingga 30 hari atau sampai logout.

### Batasan penting
**Login ini bersifat kosmetik untuk pengalaman member dan bukan sistem keamanan atau lisensi.** Berkas situs tetap publik, script bisa diubah, dan tautan aktivasi bisa dibagikan. Akun berbeda untuk setiap browser/perangkat, dan dapat hilang jika pengguna menghapus data situs. Tidak ada sinkronisasi akun atau mekanisme untuk memeriksa apakah pengguna benar-benar sudah membayar.

Baca [SETUP-AUTH.md](SETUP-AUTH.md) untuk penjelasan alur dan keterbatasannya.
