# Catatan redesign

## Keputusan dan perubahan

- Backup awal dibuat di `C:\Users\Gyzenn\Documents\Website\GyzennCommunityy_BACKUP_20261114-1422`; pengerjaan berlangsung pada branch `redesign-sky-blue`.
- Data JSON asli dipindahkan ke `src/data` tanpa mengubah isinya. Validasi build memeriksa ID ganda dan tautan unduhan kosong.
- Navigasi menjadi satu daftar bersama; navigasi bawah menggantikan drawer pada layar ponsel. Situs hanya memakai tema terang.
- Cover yang tidak tersedia memakai placeholder. Data gambar tetap disajikan dari `public/assets/img` untuk mencegah perubahan URL asset yang dirujuk data; hanya gambar yatim yang aman akan dihapus setelah pencarian referensi.
- Deskripsi dan fakta DERIVATIVE/Better Sound lama yang dahulu tertulis di markup turut ditambahkan di halaman detail jika entri JSON tidak menyediakan rincian tersebut.
- Font menggunakan paket lokal @fontsource. Playwright ditambahkan untuk audit tampilan dan interaksi.

## Verifikasi

Belum dijalankan; akan dicatat setelah build, type check, dan audit browser.

## Tindak lanjut Gyzenn

- Tambahkan cover asli untuk entri tanpa gambar bila tersedia; placeholder dipakai sementara.
- Tinjau target Lighthouse setelah deployment dan jaringan uji mobile.
