import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { api } from '../api/client';

const KELOMPOK_CHOICES = [
  { value: 'besi', label: 'Besi' },
  { value: 'aluminium', label: 'Aluminium' },
  { value: 'tembaga', label: 'Tembaga' },
  { value: 'kuningan', label: 'Kuningan' },
  { value: 'lainnya', label: 'Lainnya' },
];

export default function DaftarBarang() {
  const [barangList, setBarangList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [nama, setNama] = useState('');
  const [kelompok, setKelompok] = useState('besi');
  const [hargaDefault, setHargaDefault] = useState('');
  const [saving, setSaving] = useState(false);

  const muatData = async () => {
    setLoading(true);
    try {
      const res = await api.barang.list();
      setBarangList(res);
    } catch (err) {
      setError(err.message || 'Gagal memuat data barang.');
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
    setKelompok('besi');
    setHargaDefault('');
    setModalOpen(true);
  };

  const bukaModalUbah = (b) => {
    setEditId(b.id);
    setNama(b.nama);
    setKelompok(b.kelompok);
    setHargaDefault(b.harga_default);
    setModalOpen(true);
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        nama: nama.trim(),
        kelompok,
        harga_default: parseFloat(hargaDefault) || 0,
      };

      if (editId) {
        await api.barang.update(editId, payload);
      } else {
        await api.barang.create(payload);
      }

      setModalOpen(false);
      muatData();
    } catch (err) {
      alert('Gagal menyimpan barang: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleHapus = async (b) => {
    if (!confirm(`Hapus barang "${b.nama}"?`)) return;
    try {
      await api.barang.delete(b.id);
      muatData();
    } catch (err) {
      alert('Tidak dapat menghapus barang yang sudah pernah digunakan pada nota transaksi.');
    }
  };

  const formatRupiah = (val) => 'Rp ' + Number(val || 0).toLocaleString('id-ID');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <h1 className="judul-halaman">Data Barang & Harga</h1>
          <p className="sub">Katalog jenis logam dan standar harga beli harian</p>
        </div>
        <button type="button" onClick={bukaModalTambah} className="tombol">
          <Plus size={18} /> + Tambah Barang
        </button>
      </div>

      {error && <div className="pesan-error">{error}</div>}

      {loading ? (
        <div className="kosong">Memuat katalog barang...</div>
      ) : (
        <div className="gulir">
          <table className="tabel">
            <thead>
              <tr>
                <th>Nama Barang</th>
                <th>Kelompok</th>
                <th className="kanan">Harga Standar / kg</th>
                <th className="kanan">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {barangList.length > 0 ? (
                barangList.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600 }}>{b.nama}</td>
                    <td>
                      <span style={{ textTransform: 'capitalize', color: 'var(--abu)' }}>
                        {b.kelompok_display || b.kelompok}
                      </span>
                    </td>
                    <td className="kanan" style={{ fontWeight: 600, color: 'var(--zamrud)' }}>
                      {formatRupiah(b.harga_default)}
                    </td>
                    <td className="kanan">
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => bukaModalUbah(b)}
                          className="tombol sekunder"
                          style={{ minHeight: 36, padding: '6px 10px', fontSize: '0.85rem' }}
                        >
                          <Edit2 size={14} /> Ubah
                        </button>
                        <button
                          type="button"
                          onClick={() => handleHapus(b)}
                          className="tombol sekunder"
                          style={{ minHeight: 36, padding: '6px 10px', color: 'var(--galat)' }}
                          title="Hapus barang"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="kosong">Belum ada data barang</td>
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
                {editId ? 'Ubah Data Barang' : 'Tambah Barang Baru'}
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
                <label>Nama Barang</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Misal: Besi Super I, Tembaga Besar"
                  required
                />
              </div>

              <div className="isian">
                <label>Kelompok Logam</label>
                <select value={kelompok} onChange={(e) => setKelompok(e.target.value)}>
                  {KELOMPOK_CHOICES.map((k) => (
                    <option key={k.value} value={k.value}>{k.label}</option>
                  ))}
                </select>
              </div>

              <div className="isian">
                <label>Harga Default / kg (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={hargaDefault}
                  onChange={(e) => setHargaDefault(e.target.value)}
                  placeholder="0"
                  required
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
                  <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Barang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
