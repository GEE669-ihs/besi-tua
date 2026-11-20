import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Filter, ArrowRight, PlusCircle } from 'lucide-react';
import { api } from '../api/client';

export default function DaftarPenjualan() {
  const [penjualanList, setPenjualanList] = useState([]);
  const [pabrikList, setPabrikList] = useState([]);
  const [selectedPabrik, setSelectedPabrik] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const muatData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pRes, pbRes] = await Promise.all([
        api.penjualan.list({
          pabrik: selectedPabrik || undefined,
          dibatalkan: selectedStatus !== '' ? selectedStatus : undefined,
        }),
        api.pabrik.list(),
      ]);
      setPenjualanList(pRes);
      setPabrikList(pbRes);
    } catch (err) {
      setError(err.message || 'Gagal memuat riwayat pengiriman pabrik.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    muatData();
  }, [selectedPabrik, selectedStatus]);

  const formatRupiah = (val) => 'Rp ' + Number(val || 0).toLocaleString('id-ID');
  const formatKg = (val) => Number(val || 0).toLocaleString('id-ID', { minimumFractionDigits: 1 }) + ' kg';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <h1 className="judul-halaman">Penjualan ke Pabrik</h1>
          <p className="sub">Catatan pengiriman truk dan penjualan partai besar ke pabrik peleburan</p>
        </div>
        <Link to="/penjualan/baru" className="tombol">
          <PlusCircle size={18} /> + Catat Kirim Truk Baru
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="baris-item" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', padding: '14px 18px', marginBottom: 20 }}>
        <div className="isian" style={{ marginBottom: 0 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Filter size={14} /> Filter Pabrik Tujuan
          </label>
          <select value={selectedPabrik} onChange={(e) => setSelectedPabrik(e.target.value)}>
            <option value="">Semua Pabrik</option>
            {pabrikList.map((p) => (
              <option key={p.id} value={p.id}>{p.nama}</option>
            ))}
          </select>
        </div>

        <div className="isian" style={{ marginBottom: 0 }}>
          <label>Status Pengiriman</label>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="">Semua Status</option>
            <option value="false">Hanya Sah (Aktif)</option>
            <option value="true">Hanya Dibatalkan</option>
          </select>
        </div>
      </div>

      {error && <div className="pesan-error">{error}</div>}

      {loading ? (
        <div className="kosong">Memuat data pengiriman...</div>
      ) : (
        <div className="gulir">
          <table className="tabel">
            <thead>
              <tr>
                <th>No. Surat Jalan / ID</th>
                <th>Tanggal</th>
                <th>Pabrik Tujuan</th>
                <th>Truk / Sopir</th>
                <th className="kanan">Total Berat</th>
                <th className="kanan">Total Nilai Penjualan</th>
                <th>Status</th>
                <th className="kanan">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {penjualanList.length > 0 ? (
                penjualanList.map((p) => (
                  <tr key={p.id} style={{ opacity: p.dibatalkan ? 0.65 : 1 }}>
                    <td style={{ fontWeight: 600, color: 'var(--zamrud)' }}>
                      {p.nomor_surat_jalan ? p.nomor_surat_jalan : `#${p.id}`}
                    </td>
                    <td>{p.tanggal}</td>
                    <td style={{ fontWeight: 500 }}>{p.pabrik_nama}</td>
                    <td>
                      <div>{p.plat_truk || '-'}</div>
                      <small style={{ color: 'var(--abu)' }}>{p.sopir || ''}</small>
                    </td>
                    <td className="kanan" style={{ fontWeight: 600 }}>{formatKg(p.total_berat)}</td>
                    <td className="kanan" style={{ fontWeight: 600, color: 'var(--zamrud)' }}>
                      {formatRupiah(p.total)}
                    </td>
                    <td>
                      {p.dibatalkan ? (
                        <span className="lencana batal">Dibatalkan</span>
                      ) : (
                        <span className="lencana sah">Sah</span>
                      )}
                    </td>
                    <td className="kanan">
                      <Link
                        to={`/penjualan/${p.id}`}
                        className="tombol sekunder"
                        style={{ minHeight: 36, padding: '6px 12px', fontSize: '0.88rem' }}
                      >
                        Detail Surat Jalan <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="kosong">Belum ada catatan pengiriman penjualan ke pabrik</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
