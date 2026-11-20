import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, AlertTriangle, X } from 'lucide-react';
import { api } from '../api/client';

export default function DetailNota() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nota, setNota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showBatalModal, setShowBatalModal] = useState(false);
  const [alasanBatal, setAlasanBatal] = useState('');
  const [batalLoading, setBatalLoading] = useState(false);

  const muatNota = async () => {
    setLoading(true);
    try {
      const res = await api.nota.get(id);
      setNota(res);
    } catch (err) {
      setError(err.message || 'Gagal memuat detail nota.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    muatNota();
  }, [id]);

  const handleBatalkan = async (e) => {
    e.preventDefault();
    if (!alasanBatal.trim()) return;

    setBatalLoading(true);
    try {
      await api.nota.batalkan(id, alasanBatal.trim());
      setShowBatalModal(false);
      muatNota();
    } catch (err) {
      alert('Gagal membatalkan nota: ' + err.message);
    } finally {
      setBatalLoading(false);
    }
  };

  const formatRupiah = (val) => 'Rp ' + Number(val || 0).toLocaleString('id-ID');
  const formatKg = (val) => Number(val || 0).toLocaleString('id-ID', { minimumFractionDigits: 1 }) + ' kg';

  if (loading) return <div className="kosong">Memuat nota...</div>;
  if (error || !nota) return <div className="pesan-error">{error || 'Nota tidak ditemukan.'}</div>;

  const totalBerat = nota.items?.reduce((acc, it) => acc + (parseFloat(it.berat_kg) || 0), 0) || 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => navigate('/nota')}
          className="tombol sekunder"
          style={{ minHeight: 40, padding: '8px 14px' }}
        >
          <ArrowLeft size={16} /> Kembali ke Daftar Nota
        </button>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => window.print()}
            className="tombol sekunder"
            style={{ minHeight: 40, padding: '8px 14px' }}
          >
            <Printer size={16} /> Cetak Nota
          </button>

          {!nota.dibatalkan && (
            <button
              type="button"
              onClick={() => setShowBatalModal(true)}
              className="tombol bahaya"
              style={{ minHeight: 40, padding: '8px 14px' }}
            >
              <AlertTriangle size={16} /> Batalkan Nota
            </button>
          )}
        </div>
      </div>

      {/* Banner Jika Dibatalkan */}
      {nota.dibatalkan && (
        <div className="pesan-error" style={{ marginBottom: 24 }}>
          <strong>PERHATIAN: Nota ini telah dibatalkan.</strong>
          <div style={{ marginTop: 6, fontSize: '0.9rem' }}>
            Alasan: {nota.alasan_batal || '-'}
            <br />
            Dibatalkan oleh: {nota.dibatalkan_oleh_username || 'Sistem'} pada{' '}
            {nota.dibatalkan_pada ? new Date(nota.dibatalkan_pada).toLocaleString('id-ID') : '-'}
          </div>
        </div>
      )}

      {/* Tampilan Lembar Nota */}
      <div className="kartu-ringkas" style={{ borderTop: nota.dibatalkan ? '3px solid var(--galat)' : '3px solid var(--hijau)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--garis)', paddingBottom: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: '1.25rem', fontFamily: 'Source Serif 4, Georgia, serif', fontWeight: 600, color: 'var(--zamrud)' }}>
              UD. Bali Sejahtera
            </div>
            <div className="sub" style={{ fontSize: '0.85rem' }}>Nota Pembelian Timbangan Logam</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>Nota #{nota.id}</div>
            <div className="sub" style={{ fontSize: '0.85rem' }}>Tanggal: {nota.tanggal}</div>
            <div style={{ marginTop: 4 }}>
              {nota.dibatalkan ? (
                <span className="lencana batal">Dibatalkan</span>
              ) : (
                <span className="lencana sah">Sah / Aktif</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <span className="sub" style={{ fontSize: '0.9rem' }}>Ranting / Lapak Penyetor:</span>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--zamrud)' }}>
            {nota.lapak_nama}
          </div>
        </div>

        <div className="gulir" style={{ border: 0 }}>
          <table className="tabel">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Barang</th>
                <th>Kelompok</th>
                <th className="kanan">Berat (kg)</th>
                <th className="kanan">Harga / kg</th>
                <th className="kanan">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {nota.items?.map((it, idx) => (
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
                <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600 }}>Total Timbangan:</td>
                <td className="kanan" style={{ fontWeight: 600 }}>{formatKg(totalBerat)}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>Total Pembelian:</td>
                <td className="kanan" style={{ fontSize: '1.2rem', color: 'var(--zamrud)' }}>
                  {formatRupiah(nota.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal Batalkan Nota */}
      {showBatalModal && (
        <div className="modal-latar">
          <div className="modal-kotak">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: 'var(--galat)' }}>Batalkan Nota #{nota.id}</h3>
              <button
                type="button"
                onClick={() => setShowBatalModal(false)}
                style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--abu)' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.92rem', color: 'var(--abu)', marginBottom: 16 }}>
              Sesuai aturan operasional, nota tidak akan dihapus permanen melainkan ditandai dibatalkan dan tidak lagi masuk dalam rekapitulasi harian.
            </p>

            <form onSubmit={handleBatalkan}>
              <div className="isian">
                <label>Alasan Pembatalan (Wajib)</label>
                <textarea
                  rows={3}
                  value={alasanBatal}
                  onChange={(e) => setAlasanBatal(e.target.value)}
                  placeholder="Contoh: Salah timbang berat kuningan / nota tertukar"
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
                  {batalLoading ? 'Memproses...' : 'Ya, Batalkan Nota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
