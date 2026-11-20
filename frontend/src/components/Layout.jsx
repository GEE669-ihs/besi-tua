import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ReceiptText,
  PlusCircle,
  Package,
  MapPin,
  LogOut,
  Truck,
  Boxes,
  Factory,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/masuk');
  };

  const isForm =
    location.pathname === '/nota/baru' ||
    location.pathname === '/penjualan/baru' ||
    location.pathname.includes('/ubah');

  return (
    <div className="rangka">
      {/* Header Khusus Mobile & iPad Mini */}
      <header className="kepala-mobile">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="lambang-mini">BS</div>
          <div>
            <strong style={{ fontSize: '1.05rem', color: 'var(--zamrud)', display: 'block', lineHeight: 1.2 }}>
              UD. Bali Sejahtera
            </strong>
            <small style={{ color: 'var(--abu)', fontSize: '0.78rem' }}>Pembelian & Stok Gudang</small>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--abu)', fontWeight: 500 }}>{user?.username}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="tombol sekunder"
            style={{ minHeight: 34, padding: '4px 10px', fontSize: '0.82rem' }}
          >
            <LogOut size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Keluar
          </button>
        </div>
      </header>

      {/* Sidebar Desktop (Layar Lebar) */}
      <aside className="samping">
        <div className="lambang" aria-hidden="true">BS</div>
        <div className="merek">
          UD. Bali Sejahtera
          <small>Pembelian dan stok</small>
        </div>
        <nav className="menu">
          <h3>Operasional Harian</h3>
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'aktif' : '')}>
            <LayoutDashboard size={18} /> Ringkasan
          </NavLink>
          <NavLink to="/nota" end className={({ isActive }) => (isActive ? 'aktif' : '')}>
            <ReceiptText size={18} /> Nota pembelian
          </NavLink>
          <NavLink to="/nota/baru" className={({ isActive }) => (isActive ? 'aktif' : '')}>
            <PlusCircle size={18} /> Nota beli baru
          </NavLink>

          <h3>Pabrik & Pergudangan</h3>
          <NavLink to="/penjualan" end className={({ isActive }) => (isActive ? 'aktif' : '')}>
            <Truck size={18} /> Penjualan pabrik
          </NavLink>
          <NavLink to="/penjualan/baru" className={({ isActive }) => (isActive ? 'aktif' : '')}>
            <PlusCircle size={18} /> Kirim truk baru
          </NavLink>
          <NavLink to="/stok" className={({ isActive }) => (isActive ? 'aktif' : '')}>
            <Boxes size={18} /> Stok gudang & margin
          </NavLink>

          <h3>Master Data</h3>
          <NavLink to="/barang" className={({ isActive }) => (isActive ? 'aktif' : '')}>
            <Package size={18} /> Barang & Harga
          </NavLink>
          <NavLink to="/ranting" className={({ isActive }) => (isActive ? 'aktif' : '')}>
            <MapPin size={18} /> Ranting (Lapak)
          </NavLink>
          <NavLink to="/pabrik" className={({ isActive }) => (isActive ? 'aktif' : '')}>
            <Factory size={18} /> Pabrik Tujuan
          </NavLink>
        </nav>

        <div className="akun">
          <span>{user?.username || 'Operator'}</span>
          <button type="button" onClick={handleLogout} className="keluar">
            <LogOut size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Keluar
          </button>
        </div>
      </aside>

      {/* Konten Halaman */}
      <main className="isi">
        <Outlet />
      </main>

      {/* Floating Action Button untuk Buat Nota Cepat */}
      {!isForm && (
        <NavLink to="/nota/baru" className="tombol-mengambang">
          <PlusCircle size={18} />
          <span>+ Nota baru</span>
        </NavLink>
      )}

      {/* Navbar Kapsul Mengambang (Swipeable & Holdable untuk Mobile & iPad Mini) */}
      <nav className="nav-kapsul-wrapper" aria-label="Navigasi Menu">
        <div className="nav-kapsul">
          <NavLink to="/" end className={({ isActive }) => `item-kapsul ${isActive ? 'aktif' : ''}`}>
            <LayoutDashboard size={17} />
            <span>Ringkasan</span>
          </NavLink>
          <NavLink to="/nota" end className={({ isActive }) => `item-kapsul ${isActive ? 'aktif' : ''}`}>
            <ReceiptText size={17} />
            <span>Nota Beli</span>
          </NavLink>
          <NavLink to="/penjualan" end className={({ isActive }) => `item-kapsul ${isActive ? 'aktif' : ''}`}>
            <Truck size={17} />
            <span>Kirim Pabrik</span>
          </NavLink>
          <NavLink to="/stok" className={({ isActive }) => `item-kapsul ${isActive ? 'aktif' : ''}`}>
            <Boxes size={17} />
            <span>Stok Gudang</span>
          </NavLink>
          <NavLink to="/barang" className={({ isActive }) => `item-kapsul ${isActive ? 'aktif' : ''}`}>
            <Package size={17} />
            <span>Barang</span>
          </NavLink>
          <NavLink to="/ranting" className={({ isActive }) => `item-kapsul ${isActive ? 'aktif' : ''}`}>
            <MapPin size={17} />
            <span>Ranting</span>
          </NavLink>
          <NavLink to="/pabrik" className={({ isActive }) => `item-kapsul ${isActive ? 'aktif' : ''}`}>
            <Factory size={17} />
            <span>Pabrik</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
