import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, AlertTriangle, X, Truck } from 'lucide-react';
import { api } from '../api/client';

export default function DetailPenjualan() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [penjualan, setPenjualan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showBatalModal, setShowBatalModal] = useState(false);
  const [alasanBatal, setAlasanBatal] = useState('');
  const [batalLoading, setBatalLoading] = useState(false);

  const muatData = async () => {
    setLoading(true);
    try {
      const res = await api.penjualan.get(id);
      setPenjualan(res);
    } catch (err) {
      setError(err.message || 'Gagal memuat detail penjualan pabrik.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    muatData();
  }, [id]);

  const handleBatalkan = async (e) => {
    e.preventDefault();
    if (!alasanBatal.trim()) return;

    setBatalLoading(true);
    try {
      await api.penjualan.batalkan(id, alasanBatal.trim());
      setShowBatalModal(false);
      muatData();
    } catch (err) {
      alert('Gagal membatalkan pengiriman: ' + err.message);
    } finally {
      setBatalLoading(false);
    }
  };

  const formatRupiah = (val) => 'Rp ' + Number(val || 0).toLocaleString('id-ID');
  const formatKg = (val) => Number(val || 0).toLocaleString('id-ID', { minimumFractionDigits: 1 }) + ' kg';

  if (loading) return <div className="kosong">Memuat surat jalan...</div>;
  if (error || !penjualan) return <div className="pesan-error">{error || 'Data tidak ditemukan.'}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => navigate('/penjualan')}
          className="tombol sekunder"
          style={{ minHeight: 40, padding: '8px 14px' }}
        >
          <ArrowLeft size={16} /> Kembali ke Daftar Penjualan
        </button>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => window.print()}
            className="tombol sekunder"
            style={{ minHeight: 40, padding: '8px 14px' }}
          >
            <Printer size={16} /> Cetak Surat Jalan
          </button>

          {!penjualan.dibatalkan && (
            <button
              type="button"
              onClick={() => setShowBatalModal(true)}
              className="tombol bahaya"
              style={{ minHeight: 40, padding: '8px 14px' }}
            >
              <AlertTriangle size={16} /> Batalkan Penjualan
            </button>
          )}
        </div>
      </div>

      {/* Banner Jika Dibatalkan */}
      {penjualan.dibatalkan && (
        <div className="pesan-error" style={{ marginBottom: 24 }}>
          <strong>PERHATIAN: Surat jalan / penjualan ini telah dibatalkan.</strong>
          <div style={{ marginTop: 6, fontSize: '0.9rem' }}>
            Alasan: {penjualan.alasan_batal || '-'}
            <br />
            Dibatalkan oleh: {penjualan.dibatalkan_oleh_username || 'Sistem'} pada{' '}
            {penjualan.dibatalkan_pada ? new Date(penjualan.dibatalkan_pada).toLocaleString('id-ID') : '-'}
          </div>
        </div>
      )}

      {/* Tampilan Surat Jalan / Nota Penjualan */}
      <div className="kartu-ringkas" style={{ borderTop: penjualan.dibatalkan ? '3px solid var(--galat)' : '3px solid var(--zamrud)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--garis)', paddingBottom: 16, marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: '1.25rem', fontFamily: 'Source Serif 4, Georgia, serif', fontWeight: 600, color: 'var(--zamrud)' }}>
              UD. Bali Sejahtera
            </div>
            <div className="sub" style={{ fontSize: '0.85rem' }}>Surat Jalan & Nota Penjualan Pengiriman Truk</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
              {penjualan.nomor_surat_jalan ? `Surat Jalan: ${penjualan.nomor_surat_jalan}` : `No. Ref #${penjualan.id}`}
            </div>
            <div className="sub" style={{ fontSize: '0.85rem' }}>Tanggal Pengiriman: {penjualan.tanggal}</div>
            <div style={{ marginTop: 4 }}>
              {penjualan.dibatalkan ? (
                <span className="lencana batal">Dibatalkan</span>
              ) : (
                <span className="lencana sah">Terkirim / Sah</span>
              )}
            </div>
          </div>
        </div>

        {/* Info Pengangkutan */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20, background: 'var(--mutiara)', padding: 16, border: '1px solid var(--garis)', borderRadius: 8 }}>
          <div>
            <span className="sub" style={{ fontSize: '0.85rem' }}>Pabrik Tujuan:</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--zamrud)' }}>
              {penjualan.pabrik_nama}
            </div>
          </div>
          <div>
            <span className="sub" style={{ fontSize: '0.85rem' }}>Nomor Polisi Truk:</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>{penjualan.plat_truk || '-'}</div>
          </div>
          <div>
            <span className="sub" style={{ fontSize: '0.85rem' }}>Nama Sopir:</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>{penjualan.sopir || '-'}</div>
          </div>
        </div>

        <div className="gulir" style={{ border: 0 }}>
          <table className="tabel">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Barang Muatan</th>
                <th>Kelompok</th>
                <th className="kanan">Berat Timbangan (kg)</th>
                <th className="kanan">Harga Jual / kg</th>
                <th className="kanan">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {penjualan.items?.map((it, idx) => (
                <tr key={it.id || idx}>
                  <td>{idx + 1}</td>
                  <td style={{ fontWeight: 500 }}>{it.barang_nama}</td>
                  <td style={{ color: 'var(--abu)', textTransform: 'capitalize' }}>{it.barang_kelompok}</td>
                  <td className="kanan">{formatKg(it.berat_kg)}</td>
                  <td className="kanan">{formatRupiah(it.harga_per_kg)}</td>
                  <td className="kanan" style={{ fontWeight: 600 }}>{formatRupiah(it.jumlah)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600 }}>Total Tonase Truk:</td>
                <td className="kanan" style={{ fontWeight: 600 }}>{formatKg(penjualan.total_berat)}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>Total Penjualan:</td>
                <td className="kanan" style={{ fontSize: '1.25rem', color: 'var(--zamrud)' }}>
                  {formatRupiah(penjualan.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal Batalkan Penjualan */}
      {showBatalModal && (
        <div className="modal-latar">
          <div className="modal-kotak">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: 'var(--galat)' }}>Batalkan Pengiriman #{penjualan.id}</h3>
              <button
                type="button"
                onClick={() => setShowBatalModal(false)}
                style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--abu)' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.92rem', color: 'var(--abu)', marginBottom: 16 }}>
              Membatalkan penjualan ini akan mengembalikan stok barang ke gudang dan membatalkan catatan piutang/pembayaran pabrik.
            </p>

            <form onSubmit={handleBatalkan}>
              <div className="isian">
                <label>Alasan Pembatalan (Wajib)</label>
                <textarea
                  rows={3}
                  value={alasanBatal}
                  onChange={(e) => setAlasanBatal(e.target.value)}
                  placeholder="Contoh: Pengiriman dibatalkan / muatan dialihkan"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => setShowBatalModal(false)}
                  className="tombol sekunder"
                  style={{ minHeight: 40 }}
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={batalLoading || !alasanBatal.trim()}
                  className="tombol bahaya"
                  style={{ minHeight: 40 }}
                >
                  {batalLoading ? 'Memproses...' : 'Ya, Batalkan Penjualan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
