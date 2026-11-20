import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ReceiptText, Filter, ArrowRight, PlusCircle } from 'lucide-react';
import { api } from '../api/client';

export default function DaftarNota() {
  const [notaList, setNotaList] = useState([]);
  const [rantingList, setRantingList] = useState([]);
  const [selectedRanting, setSelectedRanting] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const muatData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [nRes, rRes] = await Promise.all([
        api.nota.list({
          ranting: selectedRanting || undefined,
          dibatalkan: selectedStatus !== '' ? selectedStatus : undefined,
        }),
        api.ranting.list(),
      ]);
      setNotaList(nRes);
      setRantingList(rRes);
    } catch (err) {
      setError(err.message || 'Gagal memuat daftar nota');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    muatData();
  }, [selectedRanting, selectedStatus]);

  const formatRupiah = (val) => 'Rp ' + Number(val || 0).toLocaleString('id-ID');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <h1 className="judul-halaman">Nota Pembelian</h1>
          <p className="sub">Arsip dan riwayat seluruh transaksi pembelian ranting</p>
        </div>
        <Link to="/nota/baru" className="tombol">
          <PlusCircle size={18} /> + Nota Baru
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="baris-item" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', padding: '14px 18px', marginBottom: 20 }}>
        <div className="isian" style={{ marginBottom: 0 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Filter size={14} /> Filter Ranting
          </label>
          <select value={selectedRanting} onChange={(e) => setSelectedRanting(e.target.value)}>
            <option value="">Semua Ranting</option>
            {rantingList.map((r) => (
              <option key={r.id} value={r.id}>{r.nama}</option>
            ))}
          </select>
        </div>

        <div className="isian" style={{ marginBottom: 0 }}>
          <label>Status Nota</label>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="">Semua Status</option>
            <option value="false">Hanya Sah (Aktif)</option>
            <option value="true">Hanya Dibatalkan</option>
          </select>
        </div>
      </div>

      {error && <div className="pesan-error">{error}</div>}

      {loading ? (
        <div className="kosong">Memuat daftar nota...</div>
      ) : (
        <div className="gulir">
          <table className="tabel">
            <thead>
              <tr>
                <th>No. Nota</th>
                <th>Tanggal</th>
                <th>Ranting (Lapak)</th>
                <th className="kanan">Item</th>
                <th className="kanan">Total Pembelian</th>
                <th>Status</th>
                <th className="kanan">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {notaList.length > 0 ? (
                notaList.map((n) => (
                  <tr key={n.id} style={{ opacity: n.dibatalkan ? 0.65 : 1 }}>
                    <td style={{ fontWeight: 600, color: 'var(--zamrud)' }}>#{n.id}</td>
                    <td>{n.tanggal}</td>
                    <td style={{ fontWeight: 500 }}>{n.lapak_nama}</td>
                    <td className="kanan">{n.items?.length || 0}</td>
                    <td className="kanan" style={{ fontWeight: 600 }}>{formatRupiah(n.total)}</td>
                    <td>
                      {n.dibatalkan ? (
                        <span className="lencana batal">Dibatalkan</span>
                      ) : (
                        <span className="lencana sah">Sah</span>
                      )}
                    </td>
                    <td className="kanan">
                      <Link
                        to={`/nota/${n.id}`}
                        className="tombol sekunder"
                        style={{ minHeight: 36, padding: '6px 12px', fontSize: '0.88rem' }}
                      >
                        Detail <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="kosong">Belum ada nota yang sesuai dengan filter</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
