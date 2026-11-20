import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { api } from '../api/client';

export default function DaftarRanting() {
  const [rantingList, setRantingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [nama, setNama] = useState('');
  const [catatan, setCatatan] = useState('');
  const [saving, setSaving] = useState(false);

  const muatData = async () => {
    setLoading(true);
    try {
      const res = await api.ranting.list();
      setRantingList(res);
    } catch (err) {
      setError(err.message || 'Gagal memuat data ranting.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    muatData();
  }, []);

  const bukaModalTambah = () => {
    setEditId(null);
    setNama('');
    setCatatan('');
    setModalOpen(true);
  };

  const bukaModalUbah = (r) => {
    setEditId(r.id);
    setNama(r.nama);
    setCatatan(r.catatan || '');
    setModalOpen(true);
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        nama: nama.trim(),
        catatan: catatan.trim(),
      };

      if (editId) {
        await api.ranting.update(editId, payload);
      } else {
        await api.ranting.create(payload);
      }

      setModalOpen(false);
      muatData();
    } catch (err) {
      alert('Gagal menyimpan ranting: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleHapus = async (r) => {
    if (!confirm(`Hapus ranting "${r.nama}"?`)) return;
    try {
      await api.ranting.delete(r.id);
      muatData();
    } catch (err) {
      alert('Tidak dapat menghapus ranting yang sudah memiliki riwayat nota transaksi.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <h1 className="judul-halaman">Data Ranting (Lapak)</h1>
          <p className="sub">Daftar pos pengepul yang menyetor barang ke gudang</p>
        </div>
        <button type="button" onClick={bukaModalTambah} className="tombol">
          <Plus size={18} /> + Tambah Ranting
        </button>
      </div>

      {error && <div className="pesan-error">{error}</div>}

      {loading ? (
        <div className="kosong">Memuat data ranting...</div>
      ) : (
        <div className="gulir">
          <table className="tabel">
            <thead>
              <tr>
                <th>Nama Ranting (Lapak)</th>
                <th>Catatan / Keterangan</th>
                <th className="kanan">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rantingList.length > 0 ? (
                rantingList.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.nama}</td>
                    <td style={{ color: 'var(--abu)' }}>{r.catatan || '-'}</td>
                    <td className="kanan">
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => bukaModalUbah(r)}
                          className="tombol sekunder"
                          style={{ minHeight: 36, padding: '6px 10px', fontSize: '0.85rem' }}
                        >
                          <Edit2 size={14} /> Ubah
                        </button>
                        <button
                          type="button"
                          onClick={() => handleHapus(r)}
                          className="tombol sekunder"
                          style={{ minHeight: 36, padding: '6px 10px', color: 'var(--galat)' }}
                          title="Hapus ranting"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="kosong">Belum ada data ranting</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Tambah / Ubah */}
      {modalOpen && (
        <div className="modal-latar">
          <div className="modal-kotak">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: 'var(--zamrud)' }}>
                {editId ? 'Ubah Data Ranting' : 'Tambah Ranting Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--abu)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSimpan}>
              <div className="isian">
                <label>Nama Ranting</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Misal: P. Nengah, Lapak Tabanan"
                  required
                />
              </div>

              <div className="isian">
                <label>Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={3}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Lokasi, kontak, atau catatan khusus"
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="tombol sekunder"
                  style={{ minHeight: 44 }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="tombol"
                  style={{ minHeight: 44 }}
                >
                  <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Ranting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
