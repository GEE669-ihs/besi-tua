import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { api } from '../api/client';

export default function NotaBaru() {
  const navigate = useNavigate();
  const [rantingList, setRantingList] = useState([]);
  const [barangList, setBarangList] = useState([]);
  const [loadingMaster, setLoadingMaster] = useState(true);

  const [lapakId, setLapakId] = useState('');
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([
    { barang: '', berat_kg: '', harga_per_kg: '' }
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        const [rRes, bRes] = await Promise.all([
          api.ranting.list(),
          api.barang.list(),
        ]);
        setRantingList(rRes);
        setBarangList(bRes);
        if (rRes.length > 0) setLapakId(rRes[0].id);
      } catch (err) {
        setError('Gagal memuat master data barang atau ranting: ' + err.message);
      } finally {
        setLoadingMaster(false);
      }
    }
    init();
  }, []);

  const handleBarangChange = (index, bId) => {
    const selected = barangList.find((b) => String(b.id) === String(bId));
    const next = [...items];
    next[index].barang = bId;
    if (selected && (!next[index].harga_per_kg || next[index].harga_per_kg === '0')) {
      next[index].harga_per_kg = selected.harga_default;
    }
    setItems(next);
  };

  const handleItemChange = (index, field, value) => {
    const next = [...items];
    next[index][field] = value;
    setItems(next);
  };

  const handleTambahBaris = () => {
    setItems([...items, { barang: '', berat_kg: '', harga_per_kg: '' }]);
  };

  const handleHapusBaris = (index) => {
    if (items.length === 1) {
      setItems([{ barang: '', berat_kg: '', harga_per_kg: '' }]);
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const hitungSubtotal = (item) => {
    const b = parseFloat(item.berat_kg) || 0;
    const h = parseFloat(item.harga_per_kg) || 0;
    return b * h;
  };

  const grandTotal = items.reduce((acc, item) => acc + hitungSubtotal(item), 0);
  const totalBerat = items.reduce((acc, item) => acc + (parseFloat(item.berat_kg) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!lapakId) {
      setError('Silakan pilih Ranting / Lapak terlebih dahulu.');
      return;
    }

    const validItems = items
      .filter((it) => it.barang && parseFloat(it.berat_kg) > 0)
      .map((it) => ({
        barang: parseInt(it.barang),
        berat_kg: it.berat_kg,
        harga_per_kg: it.harga_per_kg || 0,
      }));

    if (validItems.length === 0) {
      setError('Mohon isi minimal satu baris barang dengan berat yang valid.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.nota.create({
        lapak: parseInt(lapakId),
        tanggal,
        items: validItems,
      });
      navigate(`/nota/${res.id}`);
    } catch (err) {
      setError(err.message || 'Gagal menyimpan nota.');
    } finally {
      setSaving(false);
    }
  };

  const formatRupiah = (val) => {
    return 'Rp ' + Math.round(val).toLocaleString('id-ID');
  };

  if (loadingMaster) {
    return <div className="kosong">Menyiapkan form nota...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="tombol sekunder"
          style={{ minHeight: 40, padding: '8px 12px' }}
        >
          <ArrowLeft size={16} /> Kembali
        </button>
        <div>
          <h1 className="judul-halaman" style={{ marginBottom: 0 }}>Buat Nota Baru</h1>
          <p className="sub">Catat pembelian timbangan barang masuk dari ranting</p>
        </div>
      </div>

      {error && <div className="pesan-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Kepala Nota */}
        <div className="baris-item" style={{ gridTemplateColumns: '1fr 1fr', padding: 20, marginBottom: 20 }}>
          <div className="isian" style={{ marginBottom: 0 }}>
            <label>Ranting (Lapak Asal)</label>
            <select
              value={lapakId}
              onChange={(e) => setLapakId(e.target.value)}
              required
            >
              <option value="">-- Pilih Ranting --</option>
              {rantingList.map((r) => (
                <option key={r.id} value={r.id}>{r.nama}</option>
              ))}
            </select>
          </div>

          <div className="isian" style={{ marginBottom: 0 }}>
            <label>Tanggal Timbangan</label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Daftar Baris Barang */}
        <h2 style={{ marginTop: 24 }}>Daftar Barang & Timbangan</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {items.map((item, idx) => {
            const subtotal = hitungSubtotal(item);
            return (
              <div key={idx} className="baris-item">
                <div className="isian kolom-barang" style={{ marginBottom: 0 }}>
                  <label>Jenis Logam / Barang #{idx + 1}</label>
                  <select
                    value={item.barang}
                    onChange={(e) => handleBarangChange(idx, e.target.value)}
                    required
                  >
                    <option value="">-- Pilih Barang --</option>
                    {barangList.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nama} ({b.kelompok}) - Rp {Number(b.harga_default).toLocaleString('id-ID')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="isian" style={{ marginBottom: 0 }}>
                  <label>Berat (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.0"
                    inputMode="decimal"
                    value={item.berat_kg}
                    onChange={(e) => handleItemChange(idx, 'berat_kg', e.target.value)}
                    required
                  />
                </div>

                <div className="isian" style={{ marginBottom: 0 }}>
                  <label>Harga / kg (Rp)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="Harga/kg"
                    inputMode="numeric"
                    value={item.harga_per_kg}
                    onChange={(e) => handleItemChange(idx, 'harga_per_kg', e.target.value)}
                    required
                  />
                </div>

                <div className="isian" style={{ marginBottom: 0 }}>
                  <label>Subtotal</label>
                  <div
                    style={{
                      height: 48,
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: 600,
                      color: 'var(--zamrud)',
                      fontSize: '1.05rem',
                    }}
                  >
                    {formatRupiah(subtotal)}
                  </div>
                </div>

                <div className="kolom-hapus" style={{ display: 'flex', alignItems: 'center', height: 48 }}>
                  <button
                    type="button"
                    onClick={() => handleHapusBaris(idx)}
                    className="tombol sekunder"
                    title="Hapus baris ini"
                    style={{ minHeight: 44, width: 44, padding: 0 }}
                  >
                    <Trash2 size={16} color="var(--galat)" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleTambahBaris}
          className="tombol sekunder"
          style={{ marginTop: 8 }}
        >
          <Plus size={18} /> + Tambah Baris Barang
        </button>

        {/* Ringkasan & Total Kotak */}
        <div className="total-kotak">
          <div>
            <div style={{ fontSize: '0.95rem', opacity: 0.85 }}>Total Tonase: {totalBerat.toFixed(1)} kg</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: 4 }}>Total Pembayaran Nota:</div>
          </div>
          <div className="nilai">{formatRupiah(grandTotal)}</div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
          <button
            type="submit"
            disabled={saving}
            className="tombol besar"
            style={{ minWidth: 200 }}
          >
            <Save size={20} /> {saving ? 'Menyimpan...' : 'Simpan Nota'}
          </button>
        </div>
      </form>
    </div>
  );
}
