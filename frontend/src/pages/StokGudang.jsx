import React, { useState, useEffect } from 'react';
import { Boxes, Scale, DollarSign, TrendingUp, Filter } from 'lucide-react';
import { api } from '../api/client';

export default function StokGudang() {
  const [data, setData] = useState(null);
  const [kelompokFilter, setKelompokFilter] = useState('semua');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const muatStok = async () => {
    setLoading(true);
    try {
      const res = await api.stok.get();
      setData(res);
    } catch (err) {
      setError(err.message || 'Gagal memuat status stok gudang.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    muatStok();
  }, []);

  const formatRupiah = (val) => 'Rp ' + Math.round(val || 0).toLocaleString('id-ID');
  const formatKg = (val) => Number(val || 0).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' kg';

  const filterItems = data?.stok_per_barang?.filter((item) => {
    if (kelompokFilter === 'semua') return true;
    return item.kelompok === kelompokFilter;
  }) || [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <h1 className="judul-halaman">Stok Gudang & Margin</h1>
          <p className="sub">Pemantauan tonase barang tersimpan, perputaran pabrik, dan estimasi keuntungan</p>
        </div>
      </div>

      {error && <div className="pesan-error">{error}</div>}

      {loading ? (
        <div className="kosong">Menghitung stok gudang...</div>
      ) : data ? (
        <>
          {/* 2 Metrik Utama Stok */}
          <div className="grid-rekap" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <div className="kartu-ringkas">
              <span className="sub" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Scale size={16} /> Total Stok Fisik di Gudang
              </span>
              <div className="angka-besar">{formatKg(data.total_tonase_stok)}</div>
              <small className="sub">
                Setara dengan <strong>{(data.total_tonase_stok / 1000).toFixed(2)} Ton</strong> siap kirim ke pabrik
              </small>
            </div>

            <div className="kartu-ringkas">
              <span className="sub" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <DollarSign size={16} /> Estimasi Nilai Aset Gudang
              </span>
              <div className="angka-besar">{formatRupiah(data.total_estimasi_nilai)}</div>
              <small className="sub">Berdasarkan rata-rata harga beli dari ranting</small>
            </div>
          </div>

          {/* Filter Kelompok */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '24px 0 16px', flexWrap: 'wrap' }}>
            <Filter size={16} color="var(--abu)" />
            <span style={{ fontSize: '0.9rem', color: 'var(--abu)', fontWeight: 500 }}>Filter Kelompok:</span>
            {['semua', 'besi', 'aluminium', 'tembaga', 'kuningan', 'lainnya'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKelompokFilter(k)}
                className={`tombol sekunder ${kelompokFilter === k ? 'aktif' : ''}`}
                style={{
                  minHeight: 34,
                  padding: '6px 14px',
                  fontSize: '0.85rem',
                  textTransform: 'capitalize',
                  background: kelompokFilter === k ? 'var(--zamrud)' : undefined,
                  color: kelompokFilter === k ? '#fff' : undefined,
                }}
              >
                {k}
              </button>
            ))}
          </div>

          {/* Tabel Stok Rinci */}
          <div className="gulir">
            <table className="tabel">
              <thead>
                <tr>
                  <th>Nama Barang</th>
                  <th>Kelompok</th>
                  <th className="kanan">Masuk (Beli)</th>
                  <th className="kanan">Keluar (Jual)</th>
                  <th className="kanan">Sisa Gudang</th>
                  <th className="kanan">Rata-rata Beli</th>
                  <th className="kanan">Rata-rata Jual</th>
                  <th className="kanan">Margin / kg</th>
                  <th className="kanan">Nilai Stok Sisa</th>
                </tr>
              </thead>
              <tbody>
                {filterItems.length > 0 ? (
                  filterItems.map((item) => {
                    const isPositive = item.margin_per_kg > 0;
                    return (
                      <tr key={item.barang_id}>
                        <td style={{ fontWeight: 600 }}>{item.nama}</td>
                        <td style={{ textTransform: 'capitalize', color: 'var(--abu)' }}>
                          {item.kelompok_display || item.kelompok}
                        </td>
                        <td className="kanan">{formatKg(item.kg_masuk)}</td>
                        <td className="kanan">{formatKg(item.kg_keluar)}</td>
                        <td className="kanan" style={{ fontWeight: 700, color: 'var(--zamrud)', fontSize: '1.02rem' }}>
                          {formatKg(item.sisa_kg)}
                        </td>
                        <td className="kanan">{formatRupiah(item.rata_beli)}</td>
                        <td className="kanan">
                          {item.kg_keluar > 0 ? formatRupiah(item.rata_jual) : <span style={{ color: 'var(--abu)' }}>-</span>}
                        </td>
                        <td className="kanan">
                          {item.kg_keluar > 0 ? (
                            <span
                              style={{
                                color: isPositive ? 'var(--hijau)' : 'var(--galat)',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 2,
                              }}
                            >
                              {isPositive ? '+' : ''}{formatRupiah(item.margin_per_kg)}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--abu)' }}>-</span>
                          )}
                        </td>
                        <td className="kanan" style={{ fontWeight: 600 }}>
                          {formatRupiah(item.nilai_stok)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="kosong">Tidak ada data untuk kelompok ini</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}
