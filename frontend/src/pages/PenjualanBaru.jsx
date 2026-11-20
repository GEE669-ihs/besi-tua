import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, Truck } from 'lucide-react';
import { api } from '../api/client';

export default function PenjualanBaru() {
  const navigate = useNavigate();
  const [pabrikList, setPabrikList] = useState([]);
  const [barangList, setBarangList] = useState([]);
  const [loadingMaster, setLoadingMaster] = useState(true);

  const [pabrikId, setPabrikId] = useState('');
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().split('T')[0]);
  const [platTruk, setPlatTruk] = useState('');
  const [sopir, setSopir] = useState('');
  const [nomorSuratJalan, setNomorSuratJalan] = useState('');
  const [keterangan, setKeterangan] = useState('');

  const [items, setItems] = useState([
    { barang: '', berat_kg: '', harga_per_kg: '' }
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        const [pbRes, bRes] = await Promise.all([
          api.pabrik.list(),
          api.barang.list(),
        ]);
        setPabrikList(pbRes);
        setBarangList(bRes);
        if (pbRes.length > 0) setPabrikId(pbRes[0].id);
      } catch (err) {
        setError('Gagal memuat master data: ' + err.message);
      } finally {
        setLoadingMaster(false);
      }
    }
    init();
  }, []);

  const handleBarangChange = (index, bId) => {
    const next = [...items];
    next[index].barang = bId;
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

    if (!pabrikId) {
      setError('Silakan pilih Pabrik Tujuan terlebih dahulu.');
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
      const res = await api.penjualan.create({
        pabrik: parseInt(pabrikId),
        tanggal,
        plat_truk: platTruk.trim(),
        sopir: sopir.trim(),
        nomor_surat_jalan: nomorSuratJalan.trim(),
        keterangan: keterangan.trim(),
        items: validItems,
      });
      navigate(`/penjualan/${res.id}`);
    } catch (err) {
      setError(err.message || 'Gagal menyimpan catatan penjualan truk.');
    } finally {
      setSaving(false);
    }
  };

  const formatRupiah = (val) => 'Rp ' + Math.round(val).toLocaleString('id-ID');

  if (loadingMaster) {
    return <div className="kosong">Menyiapkan formulir pengiriman pabrik...</div>;
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
          <h1 className="judul-halaman" style={{ marginBottom: 0 }}>Catat Pengiriman Truk ke Pabrik</h1>
          <p className="sub">Surat jalan & nota timbangan penjualan partai besar ke pabrik peleburan</p>
        </div>
      </div>

      {error && <div className="pesan-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Info Pengiriman Truk */}
        <div className="baris-item" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', padding: 20, marginBottom: 20 }}>
          <div className="isian" style={{ marginBottom: 0 }}>
            <label>Pabrik Tujuan</label>
            <select
              value={pabrikId}
              onChange={(e) => setPabrikId(e.target.value)}
              required
            >
              <option value="">-- Pilih Pabrik --</option>
              {pabrikList.map((p) => (
                <option key={p.id} value={p.id}>{p.nama}</option>
              ))}
            </select>
          </div>

          <div className="isian" style={{ marginBottom: 0 }}>
            <label>Tanggal Kirim / Timbang</label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              required
            />
          </div>

          <div className="isian" style={{ marginBottom: 0 }}>
            <label>No. Polisi Truk</label>
            <input
              type="text"
              placeholder="Contoh: DK 8888 BS"
              value={platTruk}
              onChange={(e) => setPlatTruk(e.target.value)}
            />
          </div>

          <div className="isian" style={{ marginBottom: 0 }}>
            <label>Nama Sopir</label>
            <input
              type="text"
              placeholder="Contoh: Pak Wayan"
              value={sopir}
              onChange={(e) => setSopir(e.target.value)}
            />
          </div>

          <div className="isian" style={{ marginBottom: 0 }}>
            <label>No. Surat Jalan / DO</label>
            <input
              type="text"
              placeholder="Contoh: SJ-2026/01/001"
              value={nomorSuratJalan}
              onChange={(e) => setNomorSuratJalan(e.target.value)}
            />
          </div>
        </div>

        {/* Daftar Barang Muatan Truk */}
        <h2 style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Truck size={20} /> Muatan Timbangan Truk
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {items.map((item, idx) => {
            const subtotal = hitungSubtotal(item);
            return (
              <div key={idx} className="baris-item">
                <div className="isian kolom-barang" style={{ marginBottom: 0 }}>
                  <label>Jenis Logam / Muatan #{idx + 1}</label>
                  <select
                    value={item.barang}
                    onChange={(e) => handleBarangChange(idx, e.target.value)}
                    required
                  >
                    <option value="">-- Pilih Barang --</option>
                    {barangList.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nama} ({b.kelompok})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="isian" style={{ marginBottom: 0 }}>
                  <label>Berat Timbangan (kg)</label>
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
                  <label>Harga Jual / kg (Rp)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="Harga jual pabrik"
                    inputMode="numeric"
                    value={item.harga_per_kg}
                    onChange={(e) => handleItemChange(idx, 'harga_per_kg', e.target.value)}
                    required
                  />
                </div>

                <div className="isian" style={{ marginBottom: 0 }}>
                  <label>Subtotal Penjualan</label>
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
          <Plus size={18} /> + Tambah Muatan Barang
        </button>

        {/* Ringkasan & Total Uang Masuk */}
        <div className="total-kotak">
          <div>
            <div style={{ fontSize: '0.95rem', opacity: 0.85 }}>
              Total Tonase Muatan Truk: <strong>{totalBerat.toLocaleString('id-ID', { minimumFractionDigits: 1 })} kg</strong> ({(totalBerat / 1000).toFixed(2)} ton)
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: 4 }}>Total Nilai Penjualan Pabrik:</div>
          </div>
          <div className="nilai">{formatRupiah(grandTotal)}</div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
          <button
            type="submit"
            disabled={saving}
            className="tombol besar"
            style={{ minWidth: 220 }}
          >
            <Save size={20} /> {saving ? 'Menyimpan...' : 'Simpan Surat Jalan & Penjualan'}
          </button>
        </div>
      </form>
    </div>
  );
}
