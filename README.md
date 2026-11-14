# Gyzenn Community

Situs komunitas Minecraft Indonesia yang dibuat dengan Astro dan dirender statis.

## Menjalankan lokal

Gunakan Node.js 22.x (`.nvmrc`). Jalankan `npm install`, `npm run dev`, atau `npm run build`. Untuk melihat hasil build, gunakan `npm run preview`.

## Struktur

- `src/pages/` berisi Beranda, katalog, detail dinamis, Zalith, Komunitas, Casda, 404, dan sitemap.
- `src/components/` berisi navigasi, kartu katalog, placeholder cover, dan elemen global.
- `src/data/` berisi salinan data JSON dan helper katalog bertipe.
- `src/assets/img/` berisi gambar yang diolah Astro menjadi WebP responsif.
- `src/styles/` berisi design tokens dan CSS dasar.
- `public/` berisi favicon serta `robots.txt`.

## Skema data modpack

Data katalog ada di `src/data/modpacks.json`. Field yang ada: `id`, `type`, `name`, `displayTitle`, `edition`, `version`, `minecraft`, `loader`, `loaderVersion`, `categories[]`, `status`, `isNew`, `isRecommended`, `isArchived`, `badges[]`, `theme`, `image`, `imageAlt`, `description`, `features[]`, `note{type,text}`, `downloads[{label,url,host,type}]`, `additionalMods[]`, `resourcepacks[]`, `extraMods[]`, `extraModsNote`, `mods[]`, `verify[]`, dan `ticker`. Beberapa field opsional atau bernilai null. ID harus unik dan setiap entri harus punya URL unduhan.

### Menambahkan modpack

Tambahkan entri dengan ID unik dan semua URL unduhan di `src/data/modpacks.json`. Untuk cover asli, tempatkan berkas di `src/assets/img/`, lalu isi `image` dengan `/assets/img/nama-file.webp` dan `imageAlt` dengan deskripsi gambar. Pemetaan gambar memakai nama file pada field `image`; Astro mengolah cover sebagai WebP responsif. Jika `image` null, halaman menampilkan placeholder. Kategori otomatis muncul di filter.

### Memperbarui Zalith

Perbarui versi, changelog, dan daftar APK pada `src/data/zalith.json`; pertahankan URL rilis yang benar. Beranda dan halaman Zalith menggunakan data yang sama.

## Deploy ke Vercel

Hubungkan repository pada Vercel dengan preset Astro, perintah build `npm run build`, dan output `dist`. Proyek ini menghasilkan situs statis.
