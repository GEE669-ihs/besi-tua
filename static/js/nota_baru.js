(function () {
  const daftar = document.getElementById("daftar-baris");
  const tpl = document.getElementById("baris-kosong");
  const jumlahForm = document.getElementById("id_item-TOTAL_FORMS");
  const totalEl = document.getElementById("total-nota");
  const infoBarang = JSON.parse(document.getElementById("harga-barang").textContent);
  const fmt = new Intl.NumberFormat("id-ID");
  totalEl.dataset.nilai = 0;

  const terlihat = function () {
    return Array.from(daftar.querySelectorAll(".baris-item")).filter(function (b) {
      return !b.classList.contains("dihapus");
    });
  };

  function angka(el) {
    const v = parseFloat(el.value);
    return isNaN(v) ? 0 : v;
  }

  function tandaiKelompok(baris) {
    const info = infoBarang[baris.querySelector('select[name$="-barang"]').value];
    baris.dataset.kelompok = info ? info.kelompok : "";
  }

  function hitung() {
    let total = 0;
    terlihat().forEach(function (b) {
      const jml = angka(b.querySelector('[name$="-berat_kg"]')) * angka(b.querySelector('[name$="-harga_per_kg"]'));
      b.querySelector(".jumlah-baris").textContent = "Rp " + fmt.format(Math.round(jml));
      total += jml;
    });
    window.animasiAngka(totalEl, total, "Rp ");
  }

  // Django mengharuskan nomor baris berurutan (0, 1, 2, ...), jadi kita nomori ulang.
  function nomori() {
    const baris = daftar.querySelectorAll(".baris-item");
    baris.forEach(function (b, i) {
      b.querySelectorAll("[name], [id], [for]").forEach(function (n) {
        ["name", "id", "for"].forEach(function (a) {
          if (n.hasAttribute(a)) {
            n.setAttribute(a, n.getAttribute(a).replace(/item-(?:\d+|__prefix__)-/, "item-" + i + "-"));
          }
        });
      });
    });
    jumlahForm.value = baris.length;
  }

  document.getElementById("tambah-baris").addEventListener("click", function () {
    const baris = tpl.content.firstElementChild.cloneNode(true);
    baris.classList.add("baru");
    daftar.appendChild(baris);
    nomori();
    baris.querySelector("select").focus();
  });

  daftar.addEventListener("click", function (e) {
    const tombol = e.target.closest(".hapus-baris");
    if (!tombol) return;
    const baris = tombol.closest(".baris-item");
    const cek = baris.querySelector('input[name$="-DELETE"]');
    const id = baris.querySelector('input[name$="-id"]');
    const lama = id && id.value;

    if (baris.classList.contains("dihapus")) {
      // Pulihkan baris yang tadi ditandai hapus.
      baris.classList.remove("dihapus");
      if (cek) cek.checked = false;
      tombol.textContent = "×";
      tombol.setAttribute("aria-label", "Hapus baris");
    } else {
      if (terlihat().length === 1) return;   // nota harus punya minimal satu baris
      if (lama) {
        if (!cek) {
          console.error("Kotak DELETE tidak ditemukan. Pastikan can_delete=True di forms.py.");
          return;
        }
        cek.checked = true;                  // Django menghapusnya saat disimpan
        baris.classList.add("dihapus");
        tombol.textContent = "↺";
        tombol.setAttribute("aria-label", "Pulihkan baris");
      } else {
        baris.remove();                      // baris baru yang belum tersimpan
        nomori();
      }
    }
    hitung();
  });

  // Pilih barang: harga otomatis terisi (kecuali sudah diubah manual) dan warna kelompok berganti.
  daftar.addEventListener("change", function (e) {
    if (!e.target.matches('select[name$="-barang"]')) return;
    const baris = e.target.closest(".baris-item");
    const input = baris.querySelector('[name$="-harga_per_kg"]');
    const info = infoBarang[e.target.value];
    if (info && !input.dataset.manual) input.value = info.harga;
    tandaiKelompok(baris);
    hitung();
  });

  daftar.addEventListener("input", function (e) {
    if (e.target.matches('[name$="-harga_per_kg"]')) e.target.dataset.manual = "1";
    hitung();
  });

  daftar.querySelectorAll(".baris-item").forEach(tandaiKelompok);
  hitung();
})();