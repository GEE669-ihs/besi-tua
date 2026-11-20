import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Receipt, Scale, DollarSign, ArrowRight } from 'lucide-react';
import { api } from '../api/client';

export default function Ringkasan() {
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().split('T')[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const muatData = async (tgl) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.ringkasan.get(tgl);
      setData(res);
    } catch (err) {
      setError(err.message || 'Gagal memuat ringkasan harian');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    muatData(tanggal);
  }, [tanggal]);

  const formatRupiah = (val) => {
    return 'Rp ' + Number(val || 0).toLocaleString('id-ID');
  };

  const formatKg = (val) => {
    return Number(val || 0).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' kg';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="judul-halaman">Ringkasan Harian</h1>
          <p className="sub">Laporan pembelian dan perputaran barang masuk</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={18} color="var(--abu)" />
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            style={{ width: 'auto', fontWeight: 500 }}
          />
        </div>
      </div>

      {error && <div className="pesan-error">{error}</div>}

      {loading ? (
        <div className="kosong">Memuat data...</div>
      ) : data ? (
        <>
          {/* 3 Metrik Utama */}
          <div className="grid-rekap">
            <div className="kartu-ringkas">
              <span className="sub" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <DollarSign size={16} /> Total Pembelian
              </span>
              <div className="angka-besar">{formatRupiah(data.total)}</div>
              <small className="sub">Akumulasi uang keluar hari ini</small>
            </div>

            <div className="kartu-ringkas">
              <span className="sub" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Scale size={16} /> Total Berat Masuk
              </span>
              <div className="angka-besar">{formatKg(data.berat)}</div>
              <small className="sub">Tonase timbangan sah</small>
            </div>

            <div className="kartu-ringkas">
              <span className="sub" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Receipt size={16} /> Nota Transaksi
              </span>
              <div className="angka-besar">{data.jumlah_nota}</div>
              <small className="sub">Nota pembelian aktif</small>
            </div>
          </div>

          {/* Rekapitulasi per Kelompok Logam */}
          <h2>Rekap Kelompok Logam</h2>
          <div className="gulir">
            <table className="tabel">
              <thead>
                <tr>
                  <th>Kelompok</th>
                  <th className="kanan">Total Berat</th>
                  <th className="kanan">Total Nilai</th>
                </tr>
              </thead>
              <tbody>
                {data.per_kelompok?.length > 0 ? (
                  data.per_kelompok.map((k) => (
                    <tr key={k.kode}>
                      <td style={{ fontWeight: 600 }}>{k.nama}</td>
                      <td className="kanan">{formatKg(k.berat)}</td>
                      <td className="kanan" style={{ fontWeight: 600 }}>{formatRupiah(k.nilai)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="kosong">Belum ada transaksi di tanggal ini</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Rekapitulasi per Barang */}
          {data.per_barang?.length > 0 && (
            <>
              <h2>Rincian per Jenis Barang</h2>
              <div className="gulir">
                <table className="tabel">
                  <thead>
                    <tr>
                      <th>Nama Barang</th>
                      <th>Kelompok</th>
                      <th className="kanan">Berat (kg)</th>
                      <th className="kanan">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.per_barang.map((b, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 500 }}>{b.barang__nama}</td>
                        <td style={{ color: 'var(--abu)', textTransform: 'capitalize' }}>{b.barang__kelompok}</td>
                        <td className="kanan">{formatKg(b.berat)}</td>
                        <td className="kanan">{formatRupiah(b.nilai)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Daftar Nota Hari Ini */}
          <h2>Nota Transaksi Hari Ini</h2>
          <div className="gulir">
            <table className="tabel">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ranting (Lapak)</th>
                  <th className="kanan">Jumlah Item</th>
                  <th className="kanan">Total</th>
                  <th className="kanan">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.nota_terbaru?.length > 0 ? (
                  data.nota_terbaru.map((n) => (
                    <tr key={n.id}>
                      <td style={{ color: 'var(--abu)' }}>#{n.id}</td>
                      <td style={{ fontWeight: 500 }}>{n.lapak_nama}</td>
                      <td className="kanan">{n.items?.length || 0} barang</td>
                      <td className="kanan" style={{ fontWeight: 600 }}>{formatRupiah(n.total)}</td>
                      <td className="kanan">
                        <Link to={`/nota/${n.id}`} className="tombol sekunder" style={{ minHeight: 36, padding: '6px 12px', fontSize: '0.88rem' }}>
                          Lihat Nota <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="kosong">Tidak ada nota aktif pada tanggal ini</td>
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
