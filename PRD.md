# PRD: Sistem Pembukuan UD. Bali Sejahtera

Disusun oleh Gian, dibantu Claude. Versi 1.0 (draf), 22 Oktober 2026.

## 1. Ringkasan

UD. Bali Sejahtera adalah usaha keluarga di level bandar besar untuk jual beli besi tua, aluminium, tembaga, kuningan, dan barang bekas lain. Usaha ini membeli dari banyak ranting dan menjual ke pabrik, dan sudah berjalan lebih dari 26 tahun. Hingga kini pencatatan dilakukan di nota kertas tulisan tangan.

Dokumen ini menjelaskan aplikasi web pembukuan yang sedang dibangun untuk menggantikan sebagian besar kerja mencatat dan menghitung itu: apa tujuannya, apa saja yang dibuat, mengapa memakai Python dan Django, dan urutan pengerjaan dari awal sampai aplikasi dipakai sehari-hari, termasuk pengujian keamanan dan peluncuran ke internet.

Prinsip utamanya: aplikasi hanya membantu mencatat, menghitung, dan merapikan. Cara kerja di gudang, timbangan, dan cara pembayaran tidak berubah.

## 2. Penjelasan sederhana untuk keluarga

* **Apa ini?** Buku nota digital yang menghitung sendiri. Pilih ranting, pilih barang, isi berat, dan harga serta total langsung muncul. Tidak ada lagi salah hitung atau salah baca angka.
* **Bagaimana cara kerjanya?** Ada tiga bagian. *Tampilan* adalah layar di HP atau laptop yang kita sentuh. *Server* adalah komputer di internet yang bekerja sebagai otak dan penjaga aturan. *Database* adalah lemari arsip tempat semua nota disimpan rapi.
* **Apakah aman?** Dijaga berlapis seperti brankas dengan beberapa kunci: kata sandi dan verifikasi tambahan, server yang dikunci, dan salinan cadangan (backup) di tempat lain setiap hari. Nota yang salah tidak dihapus, hanya ditandai batal beserta alasannya, jadi riwayat selalu ada.
* **Apa yang tidak berubah?** Timbangan, cara kerja di gudang, dan cara membayar ranting tetap seperti biasa. Aplikasi tidak menyimpan nomor rekening dan tidak memindahkan uang.
* **Bagaimana peralihannya?** Pelan-pelan. Beberapa minggu pertama nota kertas tetap dipakai berdampingan, lalu angkanya dicocokkan setiap hari. Nota kertas baru ditinggalkan kalau semuanya sudah yakin cocok.

## 3. Latar belakang dan masalah

* Nota ditulis tangan dan dihitung manual. Pada nota contoh tanggal 2 Januari 2026 ada angka yang bisa terbaca ganda, dan selisih kecil bisa lolos tanpa disadari.
* Rekap harian, total per jenis barang, dan pembelian per ranting harus dihitung ulang dengan tangan.
* Margin antara harga beli dan harga jual ke pabrik sulit dilihat.
* Data ada di kertas dan di ingatan, sehingga rawan hilang, rusak, atau terlupa.
* Mencatat memakan tenaga dan waktu setiap hari.

## 4. Tujuan dan bukan tujuan

**Tujuan**

1. Mencatat pembelian lebih cepat dan tanpa salah hitung.
2. Menampilkan rekap harian per barang, per kelompok barang, dan per ranting.
3. Menjaga riwayat data tetap aman, utuh, dan bisa ditelusuri.
4. Bisa dipakai nyaman di HP, tablet, dan laptop.
5. Melindungi data keuangan usaha dengan keamanan berlapis.
6. Sebagai tujuan sampingan, Gian belajar rekayasa perangkat lunak dengan proyek nyata.

**Bukan tujuan**

* Bukan untuk mengejar pertumbuhan atau target baru. Usaha berjalan untuk mencukupi kebutuhan sehari-hari, dan aplikasi mengikuti itu.
* Tidak mengubah cara kerja gudang dan cara bayar.
* Tidak memproses pembayaran dan tidak menyimpan data rekening atau kartu.
* Bukan aplikasi publik. Hanya keluarga dan orang yang diberi akses.
* Tidak menggantikan akuntan atau urusan pajak.

## 5. Pengguna dan peran

Peran berikut masih perlu dikonfirmasi bersama orang tua.

* **Pemilik dan penerus usaha (orang tua):** melihat semua data, mengubah harga, membatalkan nota, melihat rekap dan laporan.
* **Gian:** pengembang dan penanggung jawab teknis, termasuk memperbaiki masalah dan menjaga keamanan.
* **Penimbang atau staf (opsional, nanti):** hanya boleh mencatat nota, tanpa akses ke total keuangan.

Preferensi tampilan dari keluarga: warna putih (kakek) dan hijau (bunda), dengan kesan rapi, elegan, dan premium.

## 6. Ruang lingkup fitur dan status

| Fitur | Status |
| --- | --- |
| Login dan akun pengguna | Selesai (dasar) |
| Catat, lihat, dan ubah nota pembelian | Selesai, penghapusan baris saat ubah nota sedang diuji |
| Pembatalan nota dengan alasan, pelaku, dan waktu | Selesai |
| Daftar barang, harga, dan kelompok barang | Selesai |
| Daftar ranting beserta ringkasan pembelian | Selesai |
| Ringkasan harian per barang dan per kelompok | Selesai |
| Tampilan untuk HP, tablet, dan laptop | Selesai, perlu uji di perangkat nyata |
| Penjualan ke pabrik | Rencana (Fase 4) |
| Stok | Rencana (Fase 4) |
| Margin untung per jenis barang | Rencana (Fase 4) |
| Bon atau utang ranting | Rencana, perlu konfirmasi orang tua |
| Laporan, cetak nota, dan ekspor PDF atau Excel | Rencana (Fase 4) |
| Peran dan hak akses | Rencana (Fase 6) |
| Verifikasi dua langkah dan passkey (Face ID atau sidik jari) | Rencana, setelah online dengan domain |
| Scan nota tulisan tangan dengan AI | Rencana (fase lanjutan) |
| Backup otomatis | Wajib sebelum data asli masuk |

## 7. Aturan data yang tidak boleh dilanggar

* Uang dan berat disimpan sebagai angka desimal, bukan pecahan biasa, agar tidak ada pembulatan aneh.
* Harga tiap nota disimpan di nota itu sendiri. Mengubah harga barang hanya berlaku untuk nota baru, nota lama tidak berubah.
* Nota tidak pernah dihapus permanen. Nota yang salah ditandai dibatalkan dan tidak dihitung di ringkasan, tetapi jejaknya tetap ada.
* Barang dan ranting yang sudah dipakai di nota tidak bisa dihapus.
* Nama barang dan nama ranting tidak boleh kembar.
* Satu nota disimpan seluruhnya atau tidak sama sekali, tidak pernah setengah tersimpan.
* Total selalu dihitung dari baris-barisnya, tidak diketik manual.
* Berat penjualan ke pabrik dianggap sama dengan timbangan sendiri. Ini belum dikonfirmasi orang tua.

## 8. Kebutuhan non-fungsional

* **Mudah dipakai:** huruf dan tombol besar, minim mengetik, bahasa Indonesia sederhana, cocok untuk dipakai sambil berdiri di gudang.
* **Perangkat:** nyaman di HP, tablet, dan laptop.
* **Keandalan:** backup harian ke tempat terpisah dan uji pemulihan berkala.
* **Keamanan:** lihat bagian 11.
* **Kecepatan:** halaman terbuka cepat dengan sinyal biasa.
* **Perawatan:** seluruh kode tersimpan di Git, sehingga bisa dilanjutkan, ditinjau, dan dikembalikan bila ada kesalahan.

## 9. Pilihan teknologi dan alasannya

**Python** dipilih karena mudah dipelajari dan dibaca, kuat untuk hitung-hitungan dan laporan (termasuk Word dan Excel), mudah dihubungkan dengan AI untuk fitur scan nota, dan punya komunitas besar sehingga banyak contoh dan bantuan.

**Django** adalah kerangka kerja (framework) web berbasis Python. Alasannya:

* Sistem login, pengguna, dan hak akses sudah tersedia.
* Panel admin otomatis membantu pengujian awal.
* Database diatur lewat model, dan perubahan strukturnya tercatat rapi lewat migrasi.
* Perlindungan bawaan terhadap serangan umum seperti CSRF, XSS, dan SQL injection.
* Kita bisa fokus ke kebutuhan usaha dan belajar konsep, tanpa merakit semuanya dari nol.

**Alternatif yang dipertimbangkan:**

* Google Sheets: cepat dan gratis, tetapi terbatas untuk data besar dan banyak pengguna.
* Streamlit: cepat dibuat, tetapi kurang cocok untuk banyak pengguna dan kebutuhan keamanan.
* FastAPI: fleksibel, tetapi login dan banyak hal lain harus dirakit sendiri.
* Layanan terkelola (PaaS): perawatannya lebih ringan, tetapi lebih mahal dan kontrolnya terbatas. Karena Gian ingin belajar, dipilih VPS.

**Komponen lain:**

* Database: SQLite saat pengembangan, PostgreSQL saat online karena lebih kokoh dan cocok untuk banyak pengguna.
* Tampilan: HTML, CSS, dan JavaScript biasa, ringan dan mudah dirawat.
* Server: VPS dengan Nginx dan Gunicorn untuk menjalankan Django, ditambah Cloudflare untuk DNS dan perlindungan dasar.
* Git dan GitHub untuk riwayat kode. Repositori sebaiknya privat, dan kata sandi serta kunci rahasia tidak boleh masuk ke Git.

## 10. Alur pengerjaan dari hulu ke hilir

Bayangkan membangun rumah: ada gambar rencana, pondasi, bangunan dan interior, pemeriksaan kekuatan, lalu serah terima. Pengerjaan aplikasi ini mengikuti pola yang sama.

**Istilah penting.** *Frontend* adalah yang dilihat dan disentuh pengguna: tampilan, tombol, formulir. *Backend* adalah otak di belakangnya: menghitung, menyimpan, menjaga aturan, dan memeriksa login. *Database* adalah tempat data tersimpan.

**Catatan.** Frontend dan backend tidak murni berurutan. Kita mengerjakan per fitur: satu fitur dirancang, dibuat backend-nya, dibuat tampilannya, lalu diuji. Dengan cara ini orang tua bisa mencoba hasilnya lebih cepat dan memberi masukan sebelum fitur berikutnya dibangun.

### Fase 0. Perencanaan

Menyusun PRD ini, mengumpulkan kebutuhan dari orang tua, dan menetapkan batas. Hasil: dokumen ini dan daftar pertanyaan terbuka (bagian 15). Status: berlangsung.

### Fase 1. Rancangan data

Merancang apa yang disimpan dan hubungannya: ranting, barang, nota, dan baris barang di tiap nota. Fase ini paling menentukan karena kesalahan rancangan data mahal diperbaiki nanti. Status: tahap awal selesai, akan diperluas untuk penjualan dan stok.

### Fase 2. Backend dasar dan prototype

Membuat proyek Django, model data, panel admin, dan perhitungan total otomatis. Uji awalnya memakai nota nyata, dan hasilnya cocok dengan nota kertas (Rp 14.913.400). Status: selesai.

### Fase 3. Frontend

Membuat tampilan sendiri: menu, halaman ringkasan, formulir nota baru dengan harga otomatis, halaman barang dan ranting, tema putih-hijau, serta animasi. Status: sebagian besar selesai dan terus disempurnakan dari masukan.

### Fase 4. Fitur inti lanjutan

Penjualan ke pabrik, stok, margin, bon atau utang (bila perlu), serta laporan dan cetak nota. Setiap fitur melewati siklus yang sama: rancang data, buat backend, buat tampilan, uji. Status: berikutnya.

### Fase 5. Pengujian fungsi

* Tes otomatis untuk perhitungan penting (total nota, ringkasan, stok, margin), agar perubahan kode tidak diam-diam merusak angka.
* Uji dengan nota-nota nyata yang beragam.
* Uji di HP, tablet, dan laptop sungguhan.
* Uji pemakaian bersama orang tua: mereka mencoba mencatat nota sendiri sementara Gian mengamati bagian yang membingungkan.

### Fase 6. Keamanan

Menerapkan dan menguji lapisan pengamanan (bagian 11). Keamanan sudah dipikirkan sejak awal, misalnya semua halaman wajib login, tetapi di fase inilah semuanya diperiksa menyeluruh. Fase ini harus selesai sebelum data asli dimasukkan.

### Fase 7. Deploy

Deploy berarti memindahkan aplikasi dari laptop ke server yang menyala 24 jam sehingga bisa dibuka dari mana saja (bagian 12). Awalnya hanya dengan data contoh.

### Fase 8. Uji coba terbatas

Data asli mulai dicatat, tetapi nota kertas tetap dipakai. Setiap hari total di aplikasi dicocokkan dengan nota kertas selama sekitar dua sampai empat minggu. Selisih apa pun ditelusuri sampai penyebabnya jelas.

### Fase 9. Peluncuran dan perawatan

Nota kertas dihentikan bertahap. Setelah itu ada perawatan rutin: memperbarui perangkat lunak, memeriksa backup, memantau server, dan memperbaiki masukan baru.

### Fase lanjutan

Scan nota tulisan tangan dengan AI (hasil selalu dicek manusia sebelum disimpan), passkey, dan pemisahan peran penimbang dan pemilik.

**Posisi sekarang:** Fase 2 selesai, Fase 3 hampir selesai, dan Fase 4 akan dimulai. Tidak ada tenggat. Yang penting adalah urutannya, dan satu fase dianggap cukup bila syaratnya terpenuhi (bagian 14).

## 11. Rencana keamanan dan pengujian kerentanan

Tidak ada sistem yang 100% aman. Yang dibangun adalah banyak lapisan pengaman, sehingga satu lapisan yang bobol tidak langsung membuka semuanya.

### Lapisan pengamanan

**A. Akun dan login**

* Verifikasi dua langkah atau passkey untuk semua akun.
* Pembatasan percobaan login, sehingga tebakan kata sandi otomatis terkunci.
* Kata sandi panjang dan unik, dibantu pengelola kata sandi.
* Hak akses seperlunya saja per peran.
* Alamat panel admin diganti dari alamat standar.
* Kode cadangan dicetak dan disimpan di tempat aman.

**B. Aplikasi**

* Mode debug dimatikan di server.
* Kunci rahasia dan kata sandi database disimpan di variabel lingkungan, bukan di kode.
* Cookie aman, HTTPS dipaksa, dan header keamanan aktif.
* Semua halaman wajib login dan setiap masukan divalidasi.
* Riwayat perubahan data keuangan dicatat (siapa mengubah apa dan kapan).

**C. Server**

* Masuk ke server hanya dengan kunci SSH, bukan kata sandi.
* Firewall hanya membuka port yang perlu.
* Pemblokiran otomatis pengguna yang berkali-kali gagal masuk.
* Pembaruan keamanan otomatis.
* Database tidak terbuka ke internet.

**D. Data**

* Backup harian terenkripsi ke tempat terpisah dari server.
* Uji pemulihan backup secara berkala, karena backup yang belum pernah dicoba belum tentu bisa dipakai.

**E. Virus dan perangkat lunak berbahaya**

* Aplikasi tidak menerima unggahan sembarangan. Fitur scan nota hanya menerima gambar dengan jenis dan ukuran yang dibatasi, dan file tidak pernah dijalankan.
* Library yang dipakai diperiksa dari kelemahan yang sudah diketahui dan diperbarui rutin.
* Laptop dan HP pengguna perlu sistem yang diperbarui dan antivirus, serta tidak memasang aplikasi atau membuka tautan mencurigakan. Pencurian kata sandi lewat tautan palsu (phishing) lebih sering terjadi daripada serangan ke server.

### Pengujian kerentanan (sebelum data asli masuk)

1. Pemeriksaan otomatis Django untuk produksi sampai tidak ada peringatan.
2. Audit library yang dipakai dari kelemahan yang sudah dikenal.
3. Uji hak akses: pengguna tanpa login tidak bisa membuka halaman apa pun, dan peran terbatas tidak bisa membuka halaman pemilik.
4. Uji masukan berbahaya: SQL injection, XSS (skrip di kolom nama atau catatan), dan CSRF.
5. Uji login: tebakan kata sandi berulang harus terkunci.
6. Pemindaian aplikasi dengan alat gratis seperti OWASP ZAP, hanya terhadap sistem milik sendiri.
7. Pemeriksaan HTTPS dan header keamanan dengan alat daring seperti SSL Labs.
8. Uji pemulihan backup di server uji.
9. Tinjauan akhir oleh orang berpengalaman yang dipercaya sebelum data asli masuk. Ini sangat disarankan karena menyangkut data keuangan.

## 12. Deployment

Perintah runserver yang dipakai sekarang hanya untuk belajar: mati kalau terminal ditutup dan tidak aman untuk pengguna sungguhan. Di server, aplikasi berjalan sebagai layanan latar belakang yang menyala terus dan hidup kembali sendiri bila server dinyalakan ulang.

Langkahnya:

1. Membeli domain, yang juga dibutuhkan untuk HTTPS dan passkey.
2. Menyewa VPS di lokasi dekat (Singapura atau Jakarta).
3. Mengamankan server: kunci SSH, firewall, pembaruan otomatis.
4. Memasang Python, PostgreSQL, dan Nginx.
5. Menyalin kode dari GitHub dan mengatur variabel lingkungan.
6. Menjalankan migrasi database dan mengumpulkan file statis.
7. Menjalankan Django lewat Gunicorn sebagai layanan sistem.
8. Mengaktifkan HTTPS (misalnya Let’s Encrypt atau lewat Cloudflare).
9. Memasang backup otomatis dan pemantauan.
10. Menguji seluruh fitur di alamat online dengan data contoh.

Data asli baru masuk setelah semua langkah di atas dan pengujian keamanan di bagian 11 selesai.

## 13. Risiko dan penanganannya

| Risiko | Dampak | Penanganan |
| --- | --- | --- |
| Data hilang (server rusak atau salah hapus) | Tinggi | Backup harian terpisah, uji pemulihan, nota dibatalkan dan tidak dihapus |
| Akun dibobol | Tinggi | Verifikasi dua langkah atau passkey, batas percobaan login, hak akses per peran |
| Salah input angka | Sedang | Hitung otomatis, riwayat perubahan, hasil scan selalu dicek manusia |
| Orang tua sulit memakai | Tinggi | Uji bersama, tombol besar, masa paralel dengan nota kertas |
| Gian tidak sempat atau kesulitan memperbaiki masalah | Sedang | Kode di Git, dokumentasi, bantuan Claude, tinjauan ahli |
| Biaya server dan API AI | Rendah sampai sedang | Memantau biaya dan memeriksa harga terbaru |
| Internet di gudang lemah | Sedang | Halaman ringan, pertimbangkan mode offline nanti |
| Akses hanya diketahui satu orang | Sedang | Mendokumentasikan cara pemulihan akses dan menyimpan kode cadangan di tempat aman |

## 14. Kriteria berhasil

* Selama masa paralel (sekitar 2 sampai 4 minggu), total di aplikasi sama dengan nota kertas, dan setiap selisih bisa dijelaskan.
* Orang tua bisa mencatat nota sendiri tanpa dibantu.
* Mencatat satu nota lebih singkat dibanding cara lama (diukur pada beberapa nota nyata).
* Backup berhasil dipulihkan dalam uji.
* Tidak ada temuan keamanan kritis yang belum diperbaiki.
* Orang tua merasa data lebih rapi dan bersedia melanjutkan memakai aplikasi.

## 15. Pertanyaan terbuka untuk orang tua

* Apakah berat yang dibayar pabrik selalu sama dengan timbangan sendiri, atau kadang ada selisih (susut)?
* Apakah satu pengiriman ke pabrik biasanya campuran banyak jenis barang atau satu jenis?
* Siapa yang akan mencatat nota di gudang, dan memakai perangkat apa?
* Apakah bon atau utang ranting perlu dicatat?
* Laporan apa yang biasa dilihat tiap hari, minggu, atau bulan?
* Apakah harga satu barang bisa berbeda untuk ranting tertentu?
* Siapa saja yang boleh melihat total keuangan?
* Apakah nota perlu dicetak atau dikirim ke ranting lewat WhatsApp?

## 16. Glosarium

* **Frontend:** bagian aplikasi yang dilihat dan disentuh pengguna.
* **Backend:** bagian di belakang layar yang menghitung, menyimpan, dan menjaga aturan.
* **Database:** tempat data tersimpan secara terstruktur.
* **Framework:** kerangka kerja berisi alat siap pakai untuk membangun aplikasi lebih cepat dan rapi.
* **Django:** framework web berbasis Python yang dipakai di proyek ini.
* **Migrasi:** catatan perubahan struktur database yang bisa diterapkan atau dibatalkan dengan aman.
* **Deploy:** memindahkan aplikasi dari laptop ke server agar bisa dibuka dari mana saja.
* **VPS:** server virtual sewaan yang menyala terus dan bisa dikelola sendiri.
* **Domain:** alamat situs, misalnya namausaha.com.
* **HTTPS:** koneksi terenkripsi yang membuat data tidak bisa disadap di jalan.
* **Verifikasi dua langkah (2FA):** login dengan kata sandi ditambah bukti kedua, misalnya kode dari aplikasi di HP.
* **Passkey:** login dengan Face ID, sidik jari, atau kunci layar tanpa mengetik kata sandi.
* **Backup:** salinan data di tempat lain untuk berjaga bila data utama hilang atau rusak.
* **Hardening:** memperkuat server dan aplikasi dengan menutup celah dan membatasi akses.