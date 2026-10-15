(function () {
  const kurangGerak = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fmt = new Intl.NumberFormat("id-ID");

  // Mengubah angka di elemen dengan halus dari nilai sekarang ke nilai baru.
  window.animasiAngka = function (el, ke, awalan) {
    awalan = awalan || "";
    cancelAnimationFrame(el._anim);
    const dari = Number(el.dataset.nilai || 0);
    const tulis = function (v) {
      el.dataset.nilai = v;
      el.textContent = awalan + fmt.format(Math.round(v));
    };
    if (kurangGerak || dari === ke) { tulis(ke); return; }
    const mulai = performance.now(), durasi = 600;
    const langkah = function (t) {
      const p = Math.min((t - mulai) / durasi, 1);
      tulis(dari + (ke - dari) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) el._anim = requestAnimationFrame(langkah);
    };
    el._anim = requestAnimationFrame(langkah);
  };

  // Elemen dengan data-hitung berhitung naik dari nol saat halaman dibuka.
  document.querySelectorAll("[data-hitung]").forEach(function (el) {
    const ke = Number(el.dataset.hitung);
    if (ke > 0) { el.dataset.nilai = 0; window.animasiAngka(el, ke, "Rp "); }
  });
})();