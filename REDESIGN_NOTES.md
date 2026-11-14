# Catatan redesign Crimson Red

## Keputusan

- Tema tunggal Crimson Red dengan latar merah, kartu hangat, header kapsul, navigasi bawah empat tab pada ponsel, Poppins lokal, dan Pixelify Sans untuk hero.
- Astro merender halaman statis. Data lama dipindahkan ke `src/data/`; gambar yang dipakai berada di `src/assets/img/` agar Astro menghasilkan varian WebP responsif.
- Katalog punya halaman detail statis per ID, filter gabungan, tab kategori, arsip, pencarian, dan placeholder saat cover belum tersedia. Daftar URL unduhan dan tautan sosial tetap mengikuti data sumber.
- Tidak memakai GSAP atau CDN. String ikon lama `fa-solid` masih tercatat di field data JSON, tetapi tidak memuat stylesheet/font ikon eksternal dan tidak dirender sebagai dependensi; data `site.json` dan `zalith.json` dipertahankan sesuai batasan.
- Pilihan terbaru di beranda menjadi grid tiga kolom pada tablet dan empat kolom di desktop. Tombol WhatsApp melayang dihilangkan dari halaman Komunitas yang sudah menyediakan CTA WhatsApp agar tidak menutupi tombol grup.
- Skrip audit diarahkan ke `localhost` agar bekerja pada server Astro di Windows. Screenshot full-page tersimpan sementara di `.audit/screenshots/` dan diabaikan Git.

## Verifikasi akhir

Build Astro menghasilkan 35 halaman. `npm run audit` lolos di viewport 360×800, 390×844, 412×915, 768×1024, dan 1280×800: nol overflow horizontal, target sentuh di bawah 44 px, gambar rusak, aset eksternal, error browser, atau kegagalan filter/tab/deep link/salin tautan. Audit juga membandingkan URL unduhan dengan sumber data.

Lighthouse mobile dijalankan pada preview hasil build. Skor Performance / Accessibility / Best Practices / SEO:

| Rute | Performance | Accessibility | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| Beranda | 99 | 95 | 100 | 100 |
| Katalog | 100 | 97 | 100 | 100 |
| Detail modpack (contoh) | 99 | 96 | 100 | 100 |
| Zalith | 100 | 95 | 100 | 100 |
| Komunitas | 100 | 100 | 100 | 100 |
| Casda Network | 100 | 100 | 100 | 100 |

Pemeriksaan visual full-page dilakukan di 412×915 dan 1280×800 untuk beranda, katalog, detail tanpa gambar, shader, resource pack, Zalith, Komunitas, Casda Network, dan 404. Di desktop header menampilkan menu penuh, BottomNav tersembunyi, serta grid kartu terbaru empat kolom. Screenshot tersimpan di `.audit/screenshots/` selama workspace lokal tersedia.

`astro check` dan build sebelumnya telah diperiksa pada Node 26. Build akhir sesi ini juga sukses pada Node 26.13.1; proyek mengunci target Node 22.x melalui `.nvmrc` dan `engines`, tetapi Node 22 tidak tersedia di mesin audit.

## Tindak lanjut Gyzenn

- Sediakan cover asli untuk 17 entri katalog yang masih memakai placeholder, jika aset resmi tersedia.
- Sebelum deploy, gunakan Node.js 22.x di Vercel dan verifikasi domain/tautan setelah publikasi.

## Status sesi terakhir

- Perubahan utama diamankan pada commit `ea34c9b`; commit akhir redesign dibuat setelah verifikasi.
- Build dan audit browser production lulus; Lighthouse mobile kedua rute sisa mendapat 100 pada semua kategori.
- Dokumentasi diperbarui dan audit visual dilakukan pada ukuran ponsel serta desktop.
- Belum ada push atau deploy.
- Server preview lokal dihentikan sebelum sesi selesai.

## Perapian setelah review (sesi lanjutan)

- Seluruh source `src/**` dan `scripts/` diformat ulang dengan Prettier (+ `prettier-plugin-astro`, aturan di `.prettierrc.json`): sebelumnya tiap file ditulis dalam satu baris panjang sehingga sulit diedit. Karakter BOM di awal file dibuang.
- `CoverPlaceholder`: karakter dekoratif yang rusak (mojibake) diganti `▦ ▪ ▦`; angka versi memakai Poppins 800 (angka "2" pada font pixel terbaca seperti "8", mis. "26.3" tampak "86.3").
- Header saat di-scroll dibuat lebih pekat (alpha 0,96) agar teks di bawahnya tidak tembus; posisi sticky tab katalog dirapatkan (`top: 74px`).
- Build dan `astro check` diverifikasi di Node 22 (0 error, 0 warning).
- Tindak lanjut yang belum dikerjakan: ikon kategori masih karakter Unicode (bisa tampil beda/emoji di sebagian HP Android); ganti dengan SVG inline.

## Tema merah

- Token tema di `src/styles/tokens.css`: `--bg: #A81B2B`, `--bg-deep: #7F1220`, `--card: #FFF5F5`, `--ink: #2B0F14`, `--muted: #6B4B50`, `--brand: #C9202F`, `--brand-edge: #8F1420`, dan `--glass-dark: rgb(60 8 16 / .96)`. Latar lembut serta pill memakai tint rose; latar gradien placeholder memakai `#8F1420` ke `#D62839`.
- Badge versi cover memakai latar maroon `#2B0F14` dengan teks putih agar menonjol di cover foto maupun placeholder. Hijau WhatsApp, ungu Discord, hijau status, dan emas tetap sesuai fungsi.
- `theme-color`, favicon SVG, dan favicon ICO diperbarui ke merah. ICO dibuat ulang dari SVG dengan ukuran 64×64; foto hero/cover tidak diedit.
- Kontras terhitung: teks putih pada `--bg` 7.35:1, pada `--bg-deep` 10.45:1, dan pada tombol `--brand` 5.63:1; `--muted` di atas `--card` 7.15:1; teks pill pada latar pill 7.58:1. Fokus memakai cincin kontras ganda untuk tetap terlihat di permukaan merah maupun kartu.
- Audit Playwright di preview lulus untuk 360×800, 390×844, 412×915, 768×1024, dan 1280×800 tanpa issue.
- Lighthouse mobile Beranda: Performance 99, Accessibility 100, Best Practices 100, SEO 100. Katalog: 99, 100, 100, 100.
- `rg` tidak menemukan lagi istilah atau hex tema lama yang diminta. Teks Discord tetap ungu karena warna layanan tersebut dipertahankan.
