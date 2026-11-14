# TUGAS: Rombak total website Gyzenn Community (Astro) — kerjakan sekali jalan sampai selesai

Folder proyek: `C:\Users\Gyzenn\Documents\Website\GyzennCommunityy`
Shell: Windows PowerShell. Node 22.x (lihat `.nvmrc`). Framework: Astro (static, deploy Vercel).

Kamu bekerja otonom dari awal sampai akhir. Jangan berhenti untuk bertanya. Jika ada hal ambigu, ambil keputusan terbaik sesuai dokumen ini, lalu catat keputusan itu di `REDESIGN_NOTES.md`. Selesaikan SEMUA bagian, jalankan verifikasi, perbaiki masalah yang ditemukan, baru laporkan.

---

## 0. LANGKAH PERTAMA: BACKUP

Sebelum mengubah apa pun:

1. Salin seluruh folder (kecuali `node_modules`, `dist`, `.git`) ke `C:\Users\Gyzenn\Documents\Website\GyzennCommunityy_BACKUP_<yyyyMMdd-HHmm>`.
2. Jika folder belum berupa repo git, jalankan `git init` dan commit awal "baseline sebelum redesign". Jika sudah repo git, buat branch `redesign-sky-blue` dan kerjakan di sana. Commit per tahap besar dengan pesan jelas.

---

## 1. KONTEKS PROYEK SAAT INI (hasil audit, sudah diverifikasi)

Situs komunitas Minecraft Indonesia "Gyzenn Community" (kreator: @giovmare). Isi: katalog modpack/shader/resource pack (unduhan), launcher Android Zalith, tautan komunitas (TikTok, WhatsApp, Discord), halaman server "Casda Network" (coming soon), dukungan Saweria. Bahasa antarmuka: **Bahasa Indonesia**.

Struktur lama:
- `src/layouts/BaseLayout.astro`
- `src/components/`: Ticker, Header, MobileDrawer, BottomBar, Footer, ModpackCard (258 baris), RetroCanvas, BackToTop, Toast
- `src/pages/`: `index.astro`, `komunitas/`, `modpacks/`, `zalith/`, `casda-network/`, `404.astro`, `sitemap.xml.ts`
- `src/styles/`: `global.css` (1195 baris), `pages/{home,komunitas,modpacks,zalith,casda}.css`
- `public/assets/data/`: `site.json` (link, statistik, ticker), `modpacks.json` (29 entri), `zalith.json` (5 APK)
- `public/assets/js/`: `main.js`, `effects.js`, `particles.js`, `pages/*.js` (dimuat `is:inline`)
- `public/assets/img/`: 20 gambar
- `scripts/audit/`, `scratch/`: sisa skrip dan screenshot lama

Masalah nyata yang HARUS diperbaiki (jangan diulang di versi baru):
1. **Filter kategori salah:** `data-category` hanya diisi `categories[0]`, sehingga modpack multi-kategori hilang saat difilter (mis. Gyzenn Vanilla++ `['SURVIVAL','VISUAL','FPS BOOST']` tidak muncul di filter FPS BOOST).
2. **Tombol "Gaming Mode" palsu:** kelas `gaming-mode` dipasang ke elemen yang bukan induk grid kartu, jadi tidak berefek. Fitur ini DIHAPUS.
3. Kode mati bertema Retro/Memphis: `RetroCanvas`, `particles.js`, `effects.js`, kelas `memphis-*`, font `VT323` yang tak dimuat, kata "retro" di 58 tempat.
4. GSAP + ScrollTrigger dan Font Awesome penuh dimuat dari CDN di semua halaman.
5. 7 gambar tidak terpakai (±9 MB): `casda.jpg`, `cobraserver.jpg`, `cobraserver.webp`, `gyzen-optimized.png`, `preview.png`, `server-mania.png`. JPG besar dipakai sebagai cover padahal ada versi WebP.
6. Menu navigasi ditulis ulang di 4 komponen (Header, MobileDrawer, BottomBar, Footer); di HP ada 3 navigasi sekaligus.
7. JS di `public/` tidak di-bundle; ada fungsi tak terpakai (`esc()`), logika partikel ganda.
8. CSS global tanpa scope, 21 `!important`, 32 atribut `style=` inline, 66 warna hex berbeda, 3 generasi token CSS.
9. `ModpackCard.astro` membangun HTML sebagai string + `set:html`, props bertipe `any`, `onerror` inline, loader default `0.19.5` ditulis keras.
10. SEO: `og:image` relatif, sama di semua halaman; `lastmod` sitemap selalu tanggal build; favicon lewat data-URI padahal `public/favicon.svg` ada.
11. Hampir semua teks KAPITAL kecil; ticker berjalan tanpa tombol jeda.
12. README menyebut folder `_legacy/` yang tidak ada dan skema field yang sudah berbeda dari JSON asli.

---

## 2. TUJUAN & PRINSIP

- **Mobile-first mutlak.** Mayoritas pengunjung memakai HP Android (lebar 360–412 px), sebagian kecil desktop. Desain, urutan konten, ukuran tap, dan performa dioptimalkan untuk HP dulu; desktop adalah pelebaran dari layout yang sama.
- **Tidak boleh ada bug tampilan di HP:** tanpa scroll horizontal, tanpa elemen tertimpa/terpotong, tanpa tombol melayang yang menutupi konten penting, tanpa lompatan layout.
- **Mudah dipakai jempol:** area tap ≥ 48 px, jarak antar tombol ≥ 8 px, navigasi utama di zona jempol (bottom bar), tombol Unduh besar dan jelas.
- **Ringan:** tanpa pustaka animasi berat, tanpa CDN pihak ketiga, tanpa blur di mana-mana.
- **Satu bahasa desain:** buang total gaya Soft Brutalism/Retro/Memphis lama. Jangan ada sisa kelas, komentar, atau label "retro".
- **Konten tidak boleh hilang atau berubah makna:** semua URL unduhan, link sosial, data modpack, APK Zalith, dan teks informatif dipertahankan. Jangan mengarang klaim, statistik, atau fitur baru. Teks boleh dirapikan (huruf kapital berlebih jadi sentence case) tetapi isi tetap.

---

## 3. ARAH DESAIN: "CRIMSON RED PLAYFUL" (terinspirasi toko Minecraft bergaya biru cerah)

Referensi gaya (bukan untuk disalin persis; JANGAN pakai logo, nama, teks, gambar, atau angka milik pihak lain):
- Latar halaman biru langit jenuh. Hero: gambar penuh yang memudar ke warna latar biru di bagian bawah (bukan ke hitam).
- Header berupa **kapsul kaca mengambang** (tidak menempel ke tepi layar), sudut besar.
- Judul hero berfont blok bergaya Minecraft, putih dengan bayangan gelap.
- Tiga kotak statistik kaca di hero.
- Ubin kategori putih berikon, bisa digeser horizontal; ubin aktif biru gelap dengan garis bawah putih.
- Kartu putih kebiruan, sudut membulat besar, gambar besar di atas, badge di pojok kanan atas, tag pill berwarna berikon, tombol biru lebar penuh di bawah kartu.
- Tombol WhatsApp hijau kapsul berbingkai putih.
- **Hanya satu tema (cerah).** Hapus dark mode, tombol tema, skrip `localStorage` tema, dan semua `[data-theme]`. Pakai `color-scheme: light`.

### 3.1 Design tokens (file `src/styles/tokens.css`, satu-satunya sumber nilai)

Nilai berikut adalah titik awal; boleh disetel halus selama kontras teks memenuhi WCAG AA (≥ 4.5:1 teks biasa, ≥ 3:1 teks besar/ikon) dan tampilan tetap bergaya sama.

```css
:root {
  color-scheme: light;

  /* warna */
  --bg:#A81B2B;            --bg-deep:#7F1220;
  --card:#F4F9FD;          --card-edge:rgb(255 255 255 / .7);
  --ink:#0F2A43;           --muted:#5B6B7F;
  --brand:#C9202F;         --brand-edge:#8F1420;   --on-brand:#FFFFFF;
  --glass:rgb(255 255 255 / .14);   --glass-dark:rgb(6 40 70 / .65);
  --ok:#16A34A; --gold:#D99A06; --purple:#7C5CFA; --danger:#E11D48;
  --discord:#5865F2; --wa:#25D366;
  --on-bg:#FFFFFF;         /* teks di atas latar biru */

  /* bentuk */
  --r-btn:10px; --r-card:16px; --r-tile:12px; --r-pill:999px; --r-badge:6px;

  /* ukuran */
  --tap:48px; --bar-h:64px; --gap:12px; --gutter:16px; --container:1200px;

  /* z-index */
  --z-header:50; --z-bar:60; --z-float:55; --z-toast:80;

  /* font */
  --font-display:'Pixelify Sans', ui-monospace, monospace;
  --font-body:'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;

  /* gerak */
  --ease:cubic-bezier(.2,.8,.2,1); --dur:.2s;
}
```

Aturan warna: latar halaman = `--bg` (boleh gradasi halus ke `--bg-deep` ke bawah). Kartu = `--card` dengan teks `--ink`. Teks langsung di atas latar biru = putih tebal (pastikan ≥ 4.5:1 atau gunakan ukuran besar + bayangan teks halus). Tombol utama = `--brand` + teks putih tebal + tepi bawah `--brand-edge` 3 px (efek timbul tipis); saat ditekan turun 2 px. Warna kategori hanya dipakai sebagai tint tipis + teks senada + ikon (hijau, emas, ungu, biru, merah muda), bukan fill pekat.

### 3.2 Tipografi
- Instal font **self-hosted** via `@fontsource` (tanpa Google Fonts/CDN): `@fontsource/poppins` (400, 600, 700, 800) dan font pixel `@fontsource/pixelify-sans` (700) — atau varian `@fontsource-variable/*` bila tersedia. Jika Pixelify Sans tidak cocok, gunakan Jersey 10 atau Silkscreen. Jangan memakai file font Minecraft berlisensi tidak jelas.
- Font pixel HANYA untuk judul hero dan logo teks. Semua lainnya Poppins.
- Judul hero: KAPITAL, `clamp(1.75rem, 7vw, 3.5rem)`, putih, `text-shadow` gelap halus.
- Judul section 18–22 px bold (sentence case). Judul kartu 15–16 px bold. Isi teks 14–16 px (jangan di bawah 14 px). Label kecil 11–12 px semibold; huruf kapital hanya untuk label kecil.
- `font-display: swap`; preload hanya font yang dipakai di atas lipatan.

### 3.3 Aturan komponen
- **Tombol:** tinggi minimal 48 px, radius 10 px, font semibold. Varian: primary (biru timbul), secondary (putih/kartu, teks biru), ghost, discord (`--discord`), wa (`--wa`, bingkai putih 2 px). Ada state `:hover` (hanya `@media (hover:hover)`), `:active`, `:focus-visible` (outline putih 3 px + offset yang jelas di atas biru), dan `[aria-disabled]`.
- **Kartu:** `--card`, radius 16 px, border 1 px `--card-edge`, bayangan lembut `0 6px 18px rgb(0 40 80 / .18)`. Tanpa bayangan keras ala brutalism.
- **Chip/tag pill:** tinggi ≥ 24 px, ikon 14 px, tint tipis.
- **Kaca (glass):** `backdrop-filter: blur(10px)` HANYA di header kapsul dan 3 kotak statistik hero. Sediakan fallback warna solid via `@supports not (backdrop-filter: blur(1px))`.
- **Ikon:** jangan pakai Font Awesome/CDN. Gunakan `astro-icon` dengan `@iconify-json/lucide` + `@iconify-json/simple-icons` (untuk logo TikTok, WhatsApp, Discord), atau komponen `Icon.astro` berisi SVG inline. Hanya sertakan ikon yang dipakai.
- **Gerak:** hanya CSS transition (≤ 0.2 s) dan reveal ringan berbasis `IntersectionObserver` (fade + naik 8 px). Hormati `prefers-reduced-motion: reduce` (matikan semua animasi). Jangan pakai GSAP.

---

## 4. ARSITEKTUR KODE BARU

```
src/
  layouts/BaseLayout.astro        # head SEO, font, slot, komponen global
  components/
    SiteHeader.astro  BottomNav.astro  SiteFooter.astro  FloatWhatsApp.astro
    Button.astro  Tag.astro  Icon.astro(atau astro-icon)  SectionHeader.astro  StatTile.astro
    ModpackCard.astro  CoverPlaceholder.astro  CategoryTile.astro  ApkRow.astro  Toast.astro
  data/
    nav.ts          # satu-satunya daftar menu (dipakai Header, BottomNav, Footer)
    site.json  modpacks.json  zalith.json   # dipindah dari public/assets/data
    types.ts        # interface Modpack, Download, Site, Apk
    modpacks.ts     # helper: ambil/urut/filter/derive kategori & versi
  assets/img/       # gambar yang dipakai (diimpor via astro:assets)
  pages/
    index.astro
    modpacks/index.astro
    modpacks/[id].astro        # BARU: detail per modpack/shader/resource pack
    zalith/index.astro
    komunitas/index.astro
    casda-network/index.astro
    404.astro
    sitemap.xml.ts
  scripts/          # TypeScript, dipakai lewat <script> di komponen/halaman (ter-bundle Vite)
    catalog.ts  reveal.ts  header.ts  copy-link.ts
  styles/
    tokens.css  base.css          # reset, tipografi dasar, util kecil
```

Aturan kode:
- CSS komponen ditulis dengan `<style>` ber-scope di tiap `.astro`; `tokens.css` + `base.css` diimpor sekali di `BaseLayout`. **Tanpa `!important`, tanpa `style=` inline** (kecuali nilai dinamis yang tak terhindarkan, mis. CSS variable per kartu). Pendekatan mobile-first dengan `min-width` (640 px dan 1024 px).
- Semua JS dalam TypeScript di `src/scripts` atau `<script>` Astro (ter-bundle). **Hapus seluruh `public/assets/js`.** Tidak ada `is:inline` kecuali benar-benar perlu.
- Pindahkan data JSON dari `public/assets/data` ke `src/data` dan beri tipe TypeScript (tanpa `any`). Boleh memakai Content Collections jika lebih sederhana dan skemanya divalidasi zod; jika tidak, impor JSON biasa + validasi ringan saat build (build gagal jika `id` ganda atau URL unduhan kosong).
- Gambar via `astro:assets` (`<Image>`/`<Picture>`) dengan `widths`/`sizes` responsif, format WebP/AVIF, `loading="lazy"` kecuali hero (`fetchpriority="high"`). Pindahkan hanya gambar yang dipakai ke `src/assets/img`, petakan nama file di JSON ke impor via `import.meta.glob`. **Hapus 7 gambar yatim** yang disebut di bagian 1 (cek ulang dengan pencarian sebelum menghapus). Semua cover wajib diberi `aspect-ratio: 16/10` + `object-fit: cover` + `width/height` agar tidak ada area kosong dan tidak ada layout shift.
- Hapus: `RetroCanvas`, `Ticker`, `MobileDrawer`, `BackToTop`, semua file `src/styles/**` lama, `scratch/`, `scripts/audit/` (pastikan tidak ada yang dirujuk `package.json`), CDN GSAP/FontAwesome/Google Fonts, skrip tema.
- Jangan ubah versi dependency yang ada kecuali `npm install` gagal. Boleh menambah: `@fontsource/*`, `astro-icon`, `@iconify-json/lucide`, `@iconify-json/simple-icons`, `playwright` (devDependency, untuk verifikasi).
- Ubah `viewport` menjadi `width=device-width, initial-scale=1, viewport-fit=cover` (tetap izinkan zoom). Gunakan `100dvh` bukan `100vh`. Hormati `env(safe-area-inset-*)`.

---

## 5. NAVIGASI & KERANGKA GLOBAL

**Daftar menu satu pintu (`src/data/nav.ts`):** Beranda `/`, Modpack `/modpacks/`, Zalith `/zalith/`, Komunitas `/komunitas/`, Casda Network `/casda-network/`. Active state dihitung satu kali dari `Astro.url.pathname` (komponen bersama), `aria-current="page"`.

**SiteHeader (kapsul kaca mengambang):** `position: sticky; top: 10px`, margin horizontal 12 px, radius 16 px, tinggi 56–64 px, latar `--glass` (di atas gambar) yang berubah menjadi `--glass-dark` saat halaman di-scroll > 20 px (gunakan sentinel `IntersectionObserver`, bukan event scroll). Isi:
- HP (< 1024 px): logo (ikon kubus pixel + teks "GYZENN") di kiri, tombol "Unduh" (primary, ke `/modpacks/`) di kanan. **Tidak ada hamburger dan tidak ada drawer.**
- Desktop (≥ 1024 px): logo, menu horizontal 5 tautan (pill; aktif = pill putih transparan), tombol "Gabung Discord" (varian discord) di kanan.

**BottomNav (hanya < 1024 px):** 4 tab: Beranda, Modpack, Zalith, Komunitas; ikon 22 px + label 11–12 px; tinggi `var(--bar-h)` + `env(safe-area-inset-bottom)`; tab aktif = pill putih dengan ikon biru; seluruh tab ≥ 48 px area tap. Casda Network di HP diakses dari Beranda, Komunitas, dan footer. Beri `padding-bottom` pada `body` sebesar tinggi bar agar konten terakhir tidak tertutup.

**FloatWhatsApp:** kapsul hijau "Gabung WhatsApp" (ikon saja di layar < 380 px), berbingkai putih 2 px, hanya tampil di Beranda dan Komunitas, diposisikan `right: 12px; bottom: calc(var(--bar-h) + env(safe-area-inset-bottom) + 12px)` di HP sehingga TIDAK menutupi bottom bar. Pastikan tidak menimpa tombol Unduh atau konten penting (beri ruang `padding-bottom` ekstra di akhir halaman). Tautan ke `site.links.whatsappChannel`.

**SiteFooter:** 1 kolom di HP, 3 kolom di desktop: (1) Halaman (dari `nav.ts`), (2) Modpack terbaru (maks. 6, tautan ke `/modpacks/<id>/`), (3) Dukungan: teks singkat + tombol Saweria + Linktree. Baris bawah: hak cipta dan "Device uji: …" dari `site.json`. Teks sentence case.

Hapus Ticker. Informasi "terbaru" cukup tampil di baris "Terbaru" di Beranda.

---

## 6. SPESIFIKASI HALAMAN

### 6.1 Beranda `/`
Urutan section (semua satu kolom di HP):
1. **Hero** (tinggi ≈ 78 dvh di HP, min 520 px): gambar `preview` (shader) penuh sebagai latar, overlay gradasi `transparan → var(--bg)` di bagian bawah. Judul pixel "GYZENN COMMUNITY" (dua baris di HP), subjudul 1 kalimat dari konten yang ada ("Modpack, shader, dan launcher Minecraft untuk pemain Indonesia" atau yang setara dari teks lama), tombol primary "Lihat modpack" (`/modpacks/`) dan secondary "Unduh Zalith" (`/zalith/`). Di bawahnya **3 StatTile kaca** sejajar (3 kolom, font kecil di HP): jumlah modpack (hitung dari data, hanya `type==='modpack'`, tidak arsip), pengikut TikTok, pengikut saluran WhatsApp (dari `site.json`; format ribuan Indonesia).
2. **Terbaru:** baris kartu yang bisa digeser horizontal (`scroll-snap-type: x mandatory`, ±1.15 kartu terlihat di HP agar jelas bisa digeser), isi = modpack `isNew` dulu lalu `isRecommended`, maks. 6. Judul section + tautan "Lihat semua".
3. **Pilih sesuai kebutuhan:** ubin kategori (`CategoryTile`) FPS Boost, Survival, CPvP, Server, Visual, yang menautkan ke `/modpacks/?kategori=<slug>`. Grid 2 kolom di HP (3 di tablet, 5 di desktop), tiap ubin berikon + nama + jumlah modpack.
4. **Zalith:** strip kartu dengan versi dari `zalith.json`, satu kalimat penjelasan, tombol "Unduh Zalith".
5. **Komunitas:** 3 kartu mini (TikTok, Saluran WhatsApp, Discord) berisi angka/teks dari `site.json` dan tombol; tautan "Lihat semua" ke `/komunitas/`. Sertakan satu kartu kecil Casda Network ("Dalam pengembangan") ke `/casda-network/`.
6. **Dukungan:** kartu tipis Saweria (teks dari versi lama, dipersingkat), tombol "Dukung di Saweria". Tanpa efek ledakan partikel.

Hapus: polaroid, stiker, chip spesifikasi laptop di hero (info device cukup di footer), 4 kartu teaser besar, poster Saweria raksasa.

### 6.2 Katalog `/modpacks/`
- Header halaman singkat (judul "Modpack, shader & resource pack" + 1 kalimat).
- **Tab 3 segmen** (sticky di bawah header, bisa digeser): `Modpack` · `Shader` · `Resource Pack`. Semua konten dirender server (tanpa JS tetap terbaca); JS hanya menampilkan/menyembunyikan panel dan menyinkronkan hash (`#modpack`, `#shader`, `#resourcepack`). Panel Shader menampilkan entri `type==='shader'` (DERIVATIVE), panel Resource Pack menampilkan `type==='resourcepack'` (Better Sound Java) memakai `ModpackCard` yang sama.
- **Panel Modpack:**
  - Bar filter: kolom cari (nama), deretan chip kategori yang bisa digeser horizontal (Semua + semua kategori yang ADA di data, dihitung otomatis dari gabungan SEMUA `categories` semua modpack), dan `<select>` versi Minecraft (dihitung otomatis dari data, urut terbaru ke lama). Ada tombol/switch "Tampilkan versi lama" (arsip, default mati). Tampilkan jumlah hasil ("12 modpack") dan state kosong yang ramah ("Tidak ada hasil, coba hapus filter") dengan tombol "Reset filter".
  - **Perbaikan bug filter:** setiap kartu membawa `data-categories="FPS BOOST|SURVIVAL|VISUAL"` (semua kategori) dan `data-mc="1.21.11"`, `data-name` (huruf kecil), `data-archived`. Logika filter mencocokkan kategori terhadap daftar itu (bukan `includes` pada string), kombinasi kategori + versi + pencarian bersifat AND. Status filter disimpan di URL (`?kategori=fps-boost&v=1.21.11&q=...&lama=1`) dan dibaca saat load (agar ubin Beranda berfungsi dan hasil bisa dibagikan). Tanpa JS, semua kartu aktif tetap tampil.
  - **Grid kartu:** 2 kolom di HP (`gap: 12px`), 3 kolom ≥ 768 px, 4 kolom ≥ 1100 px. Kartu arsip dirender dalam grup terpisah berjudul "Versi lama" yang disembunyikan sampai tombol dinyalakan.
  - Deep link lama `/modpacks/#<id>`: jika `location.hash` cocok dengan `id` modpack, arahkan dengan `location.replace('/modpacks/<id>/')`.

### 6.3 ModpackCard (komponen)
Props bertipe jelas (`Modpack`), tanpa `set:html` dan tanpa HTML-string. Anatomi dari atas ke bawah:
1. **Cover** 16:10 (gambar `astro:assets` bila ada, kalau tidak `CoverPlaceholder`). Pojok kanan atas: badge versi Minecraft (mis. "1.21.11") merah/`--danger` radius 6 px; pojok kiri atas: pill "BARU" emas jika `isNew` atau "REKOMENDASI" jika `isRecommended` (pilih satu, prioritas BARU).
2. **Tag kategori** (maks. 2 yang paling relevan, pill berwarna + ikon): FPS BOOST biru (petir), SURVIVAL hijau (tenda), CPVP/PVP merah muda (crosshair), SERVER ungu (server), VISUAL emas (tongkat sihir), OPTIMIZATION biru muda, UTILITY abu.
3. **Nama** (maks. 2 baris, `line-clamp`).
4. **Baris meta kecil:** `<loader> · <versi MC>` (loader dari data; JANGAN menulis "Fabric Loader 0.19.5" bila tidak ada di data; tampilkan `loaderVersion` hanya jika ada).
5. **Tombol Unduh** lebar penuh (primary) ke unduhan pertama, di dasar kartu (`margin-top:auto` agar rata bawah). Tautan eksternal: `target="_blank" rel="noopener noreferrer"`. Jika ada lebih dari satu unduhan, tombol kedua "Detail" menuju halaman detail; selalu sediakan tautan nama kartu ke halaman detail.
Deskripsi panjang, daftar mod, catatan, dan unduhan lain TIDAK ditampilkan di kartu (pindah ke halaman detail).

Pastikan di lebar 360 px kartu 2 kolom (±160 px) tidak ada teks yang meluber: gunakan `min-width:0`, `overflow-wrap:anywhere` untuk nama, dan ukuran font kartu 13–15 px.

**CoverPlaceholder:** komponen CSS/SVG murni (tanpa file gambar): latar biru berpola blok pixel halus, ikon kategori besar semi-transparan, dan angka versi MC besar bergaya font pixel. Warna aksen berbeda per kategori utama. Dipakai untuk modpack tanpa gambar (17 dari 27 saat ini) agar semua kartu seragam dan tidak ada area kosong.

### 6.4 Detail `/modpacks/[id]/`
Dibuat dengan `getStaticPaths` dari SEMUA entri (modpack, arsip, shader, resource pack). Title/description unik per halaman (gunakan nama + versi + deskripsi dipotong 155 karakter). Isi:
- Breadcrumb: Modpack › nama (shader/resource pack menyesuaikan tab asal).
- Cover (16:10), nama, baris tag/chip (versi MC, loader, kategori, status BARU/REKOMENDASI/ARSIP).
- Deskripsi lengkap (teks apa adanya), daftar `features` (centang), `note` (callout; gaya peringatan jika `type==='warning'`; pertahankan format `Settings > …` memakai `<code>`), `extraMods`/`additionalMods`/`resourcepacks` di dalam `<details>` yang dilipat (pertahankan `extraModsNote`).
- **Semua tombol unduhan** (label dari data), dan info "Ekstrak dulu sebelum dipakai" bila URL/label mengandung kata ekstrak.
- Tombol "Salin tautan" (Clipboard API, tampilkan Toast "Tautan disalin" dengan `aria-live="polite"`; fallback bila Clipboard API tidak ada).
- **CTA lengket di HP:** bar tipis berisi tombol Unduh utama, `position: sticky/fixed` tepat di atas BottomNav (`bottom: calc(var(--bar-h) + env(safe-area-inset-bottom))`), tidak menutupi konten (beri padding bawah).
- Bagian "Modpack lain" (3 kartu serupa berdasarkan kategori yang sama).
- Untuk shader (DERIVATIVE) tampilkan juga daftar fitur/spesifikasi dan "Performance tip", serta kredit "Edit & optimized by Gyzenn", sebagaimana teks lama di halaman modpacks. Untuk resource pack tampilkan spesifikasinya. Ambil teks dari halaman lama (`src/pages/modpacks/index.astro` versi sebelum dirombak, lihat backup/git) dan jangan hilangkan satu pun fakta.

### 6.5 Zalith `/zalith/`
- Header singkat: "Zalith Launcher <versi>" + pengembang dari `zalith.json` + deskripsi lama.
- **Tiga langkah** (kartu bernomor 1–3): pilih tipe perangkat → unduh APK yang sesuai → pasang (izinkan sumber tidak dikenal). Tulis teks langkah singkat dan akurat; jangan menambah klaim teknis yang tidak ada di data.
- **Rekomendasi:** kartu besar untuk APK `arm64-v8a` (tombol Unduh besar, ukuran file, keterangan "Rekomendasi untuk sebagian besar HP Android 64-bit"). Di bawahnya tautan teks "Tidak yakin? Pakai versi Universal".
- **Daftar semua APK** sebagai baris (`ApkRow`): ikon, nama file (font monospace kecil, boleh wrap/`overflow-wrap:anywhere`), deskripsi, ukuran, tombol Unduh; baris Universal diberi sorotan lembut.
- **Changelog** di dalam `<details>` (default tertutup).
- Hapus "installer progress bar" palsu dan judul `.EXE`.
- Tambahkan JSON-LD `SoftwareApplication` (nama, versi, sistem operasi Android, kategori GameApplication, tautan unduh).

### 6.6 Komunitas `/komunitas/`
Grid bento (1 kolom di HP, 2 kolom ≥ 768 px): TikTok (@giovmare + 3 angka: suka, pengikut, mengikuti), Saluran WhatsApp (angka pengikut + tombol), Grup WhatsApp (2 tombol "Gabung grup 1/2"), Discord (kartu lebar penuh, tombol `discord`, 3 poin singkat dari teks lama), dan kartu kecil Casda Network. Angka ditampilkan statis dengan format Indonesia (tanpa animasi counter, atau animasi ringan yang langsung final bila `prefers-reduced-motion`). Hapus segel/blok dekoratif dan bintang.

### 6.7 Casda Network `/casda-network/`
Satu layar status: gambar `casda` (WebP via astro:assets), badge "Dalam pengembangan", judul, deskripsi dari teks lama, info (Platform: Java + Bedrock; Versi: akan diumumkan; IP: akan diumumkan), daftar "Rencana mode" sederhana (Survival, PvP Arena, Economy, Community) dengan status "Segera", dan tombol "Kabari saya lewat Discord" (`site.links.discordCasda`). Hapus tombol "IP segera rilis" yang berpura-pura bisa disalin, hapus partikel.

### 6.8 404
Ilustrasi sederhana (angka 404 font pixel), teks singkat, tombol "Kembali ke beranda" dan 3 tautan populer (Modpack, Zalith, Komunitas). Tanpa jendela bergaya Windows.

---

## 7. SEO, METADATA, AKSESIBILITAS

- `BaseLayout` menerima `title`, `description`, `image?`, `type?`. `og:image` dan `twitter:image` harus **URL absolut** (`new URL(path, Astro.site)`), unik per halaman bila ada gambar relevan (modpack detail memakai cover; selebihnya `preview`). Canonical absolut. Hapus meta `keywords`.
- Favicon: pakai `public/favicon.svg` + `favicon.ico` melalui `<link>`; perbarui `favicon.svg` menjadi kubus pixel merah agar sesuai merek baru. `theme-color` = `#A81B2B`.
- Sitemap: sertakan semua halaman termasuk `/modpacks/<id>/`; `lastmod` boleh dihilangkan atau memakai tanggal build; perbarui `robots.txt` jika perlu.
- Semantik: satu `<h1>` per halaman, urutan heading benar, `<nav aria-label>`, landmark `<main id="main">`, tautan "Lewati ke konten" yang muncul saat fokus. Semua gambar punya `alt` bermakna (dekoratif = `alt=""`). Tombol ikon-saja punya `aria-label`. Chip filter memakai `button` dengan `aria-pressed`. Tab memakai pola ARIA tabs yang benar (atau tautan biasa bila lebih sederhana).
- Fokus keyboard terlihat jelas di semua elemen interaktif. Tidak ada informasi yang hanya mengandalkan warna.
- Hormati `prefers-reduced-motion`. Tidak ada fitur yang hanya bisa diakses lewat hover.

---

## 8. PERFORMA (target di emulasi HP, jaringan 4G)

- Nol request ke domain pihak ketiga untuk aset render (font, ikon, script semuanya lokal; tautan keluar tentu boleh).
- LCP hero < 2.5 s; CLS < 0.05; Lighthouse Mobile: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- JS total halaman < 30 KB gzip; CSS per halaman < 40 KB gzip.
- Gambar responsif dengan `srcset`; hero dipreload; cover lain `loading="lazy"` dan `decoding="async"`.

---

## 9. VERIFIKASI WAJIB (kerjakan, jangan dilewati)

1. `npm install`, lalu `npm run build` harus sukses tanpa error/peringatan penting; jalankan `npx astro check` dan perbaiki error tipe.
2. Jalankan `npm run preview` dan uji dengan **Playwright** (Chromium) pada viewport: **360×800, 390×844, 412×915, 768×1024, 1280×800** untuk SEMUA rute (`/`, `/modpacks/`, 2–3 contoh `/modpacks/<id>/` termasuk satu tanpa gambar, satu shader, satu resource pack, `/zalith/`, `/komunitas/`, `/casda-network/`, URL tak ada untuk 404). Simpan screenshot ke folder `.audit/screenshots/` (tambahkan `.audit/` ke `.gitignore`).
3. Otomatis cek di setiap halaman & viewport HP: `document.documentElement.scrollWidth <= window.innerWidth` (tanpa scroll horizontal); tidak ada elemen interaktif dengan area < 44×44 px (kecuali tautan inline di paragraf); tidak ada error/peringatan console; tidak ada request gagal (404) dan tidak ada request ke domain eksternal untuk aset; tombol WhatsApp melayang tidak beririsan dengan BottomNav.
4. Uji fungsi: filter kategori (pastikan "Gyzenn Vanilla++" muncul di FPS BOOST, SURVIVAL, dan VISUAL), kombinasi filter + pencarian + versi, state kosong, tombol versi lama, deep link `?kategori=`, redirect `#id` lama, tab Shader/Resource Pack, tombol salin tautan, tombol unduh membuka URL yang benar (bandingkan dengan JSON, tidak ada URL yang berubah).
5. Periksa **kontras** teks/tombol (AA) pada kombinasi utama: teks putih di atas `--bg`, teks putih di atas `--brand`, teks `--ink` di atas `--card`, teks tag di atas tint-nya. Perbaiki bila gagal.
6. Jalankan Lighthouse (mobile) untuk `/`, `/modpacks/`, satu detail, `/zalith/`; catat skor. Perbaiki sampai target bagian 8 tercapai atau catat alasan teknis jika tidak mungkin.
7. Lihat sendiri screenshot HP (360 px dan 412 px) dan perbaiki setiap cacat visual: teks terpotong, tumpang tindih, jarak janggal, gambar kosong/putih, bayangan kasar, kartu tidak rata bawah, header menutupi anchor (gunakan `scroll-margin-top`).
8. `rg -i "retro|memphis|brutal|gaming-mode|gsap|fontawesome|fa-solid|VT323|data-theme|is:inline"` pada `src/` dan `public/` tidak boleh menemukan sisa (kecuali komentar yang menjelaskan penghapusan, yang sebaiknya juga tidak ada).

---

## 10. DOKUMENTASI & PEMBERSIHAN AKHIR

- Tulis ulang `README.md` (Bahasa Indonesia): struktur folder baru, cara menjalankan, **skema field modpack yang SEBENARNYA dipakai** (periksa `modpacks.json` apa adanya: `id, type, name, displayTitle, version, minecraft, loader, loaderVersion, categories[], status, isNew, isRecommended, isArchived, badges[], image, imageAlt, description, features[], extraMods[], extraModsNote, additionalMods[], resourcepacks[], note{type,text}, downloads[{label,type,url}], theme, edition, ticker, mods, verify` — sesuaikan dengan kenyataan setelah dibaca), cara menambah modpack baru (termasuk cara menambah cover), cara memperbarui Zalith, cara deploy ke Vercel. Hapus referensi ke `_legacy/`.
- Biarkan `AGENTS.md` dan `CLAUDE.md` apa adanya. Pastikan `.gitignore` memuat `node_modules`, `dist`, `.astro`, `.audit`.
- Buat `REDESIGN_NOTES.md`: daftar keputusan yang kamu ambil, hal yang diubah dari spesifikasi ini beserta alasannya, hasil Lighthouse, dan daftar tugas lanjutan (mis. modpack yang belum punya cover asli).
- Commit akhir dengan pesan ringkas. Jangan push dan jangan deploy.

---

## 11. BATASAN KERAS

- Jangan mengubah isi URL unduhan, link sosial, atau data pada `site.json`, `modpacks.json`, `zalith.json` kecuali memindahkan lokasi file dan menambah tipe. Jangan menghapus entri modpack.
- Jangan menyalin logo, nama, gambar, teks, atau angka milik toko/situs lain. Gaya visual saja yang terinspirasi.
- Jangan menambah fitur, klaim, atau statistik yang tidak ada di data. Jangan mengarang cover atau tangkapan layar modpack; gunakan `CoverPlaceholder`.
- Jangan membuat akun, memanggil API eksternal, atau mengirim data ke mana pun.
- Jangan menghapus file di luar folder proyek. Jangan menyentuh folder backup.
- Jika sebuah dependency gagal dipasang, gunakan alternatif lokal (mis. SVG inline untuk ikon) dan catat di `REDESIGN_NOTES.md`.

---

## 12. LAPORAN AKHIR (jawaban terakhirmu, Bahasa Indonesia, ringkas)

Berikan: (1) apa yang selesai, (2) struktur folder akhir (pohon singkat), (3) hasil verifikasi (viewport yang diuji, hasil cek overflow, skor Lighthouse, hasil uji filter), (4) keputusan/penyimpangan penting, (5) daftar hal yang perlu tindakan Gyzenn (mis. cover asli untuk modpack tanpa gambar), (6) cara menjalankan lokal (`npm install`, `npm run dev`, `npm run build`).
