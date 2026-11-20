import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Factory, Phone, MapPin } from 'lucide-react';
import { api } from '../api/client';

export default function DaftarPabrik() {
  const [pabrikList, setPabrikList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [nama, setNama] = useState('');
  const [telepon, setTelepon] = useState('');
  const [alamat, setAlamat] = useState('');
  const [catatan, setCatatan] = useState('');
  const [saving, setSaving] = useState(false);

  const muatData = async () => {
    setLoading(true);
    try {
      const res = await api.pabrik.list();
      setPabrikList(res);
    } catch (err) {
      setError(err.message || 'Gagal memuat data pabrik tujuan.');
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
    setTelepon('');
    setAlamat('');
    setCatatan('');
    setModalOpen(true);
  };

  const bukaModalUbah = (p) => {
    setEditId(p.id);
    setNama(p.nama);
    setTelepon(p.telepon || '');
    setAlamat(p.alamat || '');
    setCatatan(p.catatan || '');
    setModalOpen(true);
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        nama: nama.trim(),
        telepon: telepon.trim(),
        alamat: alamat.trim(),
        catatan: catatan.trim(),
      };

      if (editId) {
        await api.pabrik.update(editId, payload);
      } else {
        await api.pabrik.create(payload);
      }

      setModalOpen(false);
      muatData();
    } catch (err) {
      alert('Gagal menyimpan pabrik: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleHapus = async (p) => {
    if (!confirm(`Hapus pabrik "${p.nama}"?`)) return;
    try {
      await api.pabrik.delete(p.id);
      muatData();
    } catch (err) {
      alert('Tidak dapat menghapus pabrik yang sudah memiliki riwayat surat jalan / penjualan.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <h1 className="judul-halaman">Pabrik & Peleburan Tujuan</h1>
          <p className="sub">Kemitraan pabrik peleburan dan pembeli partai besar hasil sortir gudang</p>
        </div>
        <button type="button" onClick={bukaModalTambah} className="tombol">
          <Plus size={18} /> + Tambah Pabrik Baru
        </button>
      </div>

      {error && <div className="pesan-error">{error}</div>}

      {loading ? (
        <div className="kosong">Memuat data pabrik...</div>
      ) : (
        <div className="gulir">
          <table className="tabel">
            <thead>
              <tr>
                <th>Nama Pabrik / Perusahaan</th>
                <th>Kontak / Telepon</th>
                <th>Alamat Lokasi</th>
                <th>Keterangan</th>
                <th className="kanan">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pabrikList.length > 0 ? (
                pabrikList.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Factory size={16} color="var(--zamrud)" />
                        {p.nama}
                      </div>
                    </td>
                    <td>{p.telepon || '-'}</td>
                    <td style={{ maxWidth: 300, whiteSpace: 'normal', fontSize: '0.9rem' }}>
                      {p.alamat || '-'}
                    </td>
                    <td style={{ color: 'var(--abu)', fontSize: '0.9rem' }}>{p.catatan || '-'}</td>
                    <td className="kanan">
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => bukaModalUbah(p)}
                          className="tombol sekunder"
                          style={{ minHeight: 36, padding: '6px 10px', fontSize: '0.85rem' }}
                        >
                          <Edit2 size={14} /> Ubah
                        </button>
                        <button
                          type="button"
                          onClick={() => handleHapus(p)}
                          className="tombol sekunder"
                          style={{ minHeight: 36, padding: '6px 10px', color: 'var(--galat)' }}
                          title="Hapus pabrik"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="kosong">Belum ada data pabrik terdaftar</td>
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
                {editId ? 'Ubah Data Pabrik' : 'Tambah Pabrik Tujuan Baru'}
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
                <label>Nama Pabrik / Perusahaan</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Misal: UD. Kurnia (Surabaya)"
                  required
                />
              </div>

              <div className="isian">
                <label>Nomor Telepon / WhatsApp</label>
                <input
                  type="text"
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value)}
                  placeholder="Misal: 0813-3189-7289"
                />
              </div>

              <div className="isian">
                <label>Alamat / Lokasi Pabrik</label>
                <textarea
                  rows={2}
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Kota / Alamat lengkap pabrik"
                />
              </div>

              <div className="isian">
                <label>Catatan Tambahan</label>
                <textarea
                  rows={2}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Informasi jadwal timbangan, kontak mandor, dll."
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
                  <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Pabrik'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
