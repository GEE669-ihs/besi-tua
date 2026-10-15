(function () {
  const daftar = document.getElementById("daftar-baris");
  const tpl = document.getElementById("baris-kosong");
  const jumlahForm = document.getElementById("id_item-TOTAL_FORMS");
  const totalEl = document.getElementById("total-nota");
  const hargaBarang = JSON.parse(document.getElementById("harga-barang").textContent);
  const fmt = new Intl.NumberFormat("id-ID");
  totalEl.dataset.nilai = 0;

  function angka(el) {
    const v = parseFloat(el.value);
    return isNaN(v) ? 0 : v;
  }

  function hitung() {
    let total = 0;
    daftar.querySelectorAll(".baris-item").forEach(function (b) {
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
    if (!tombol || daftar.querySelectorAll(".baris-item").length === 1) return;
    tombol.closest(".baris-item").remove();
    nomori();
    hitung();
  });

  // Pilih barang: harga otomatis terisi, kecuali harga sudah diubah manual.
  daftar.addEventListener("change", function (e) {
    if (!e.target.matches('select[name$="-barang"]')) return;
    const input = e.target.closest(".baris-item").querySelector('[name$="-harga_per_kg"]');
    const harga = hargaBarang[e.target.value];
    if (harga !== undefined && !input.dataset.manual) input.value = harga;
    hitung();
  });

  daftar.addEventListener("input", function (e) {
    if (e.target.matches('[name$="-harga_per_kg"]')) e.target.dataset.manual = "1";
    hitung();
  });

  hitung();
})();