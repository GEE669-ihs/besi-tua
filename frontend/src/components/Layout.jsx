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
      {/* Sidebar Desktop */}
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

      {/* Floating Action Button untuk Mobile */}
      {!isForm && (
        <NavLink to="/nota/baru" className="tombol-mengambang">
          <PlusCircle size={20} />
          Nota baru
        </NavLink>
      )}

      {/* Navigasi Bawah Mobile */}
      <nav className="nav-bawah" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'aktif' : '')}>
          <LayoutDashboard size={19} />
          <span>Ringkasan</span>
        </NavLink>
        <NavLink to="/nota" end className={({ isActive }) => (isActive ? 'aktif' : '')}>
          <ReceiptText size={19} />
          <span>Beli</span>
        </NavLink>
        <NavLink to="/penjualan" end className={({ isActive }) => (isActive ? 'aktif' : '')}>
          <Truck size={19} />
          <span>Kirim</span>
        </NavLink>
        <NavLink to="/stok" className={({ isActive }) => (isActive ? 'aktif' : '')}>
          <Boxes size={19} />
          <span>Stok</span>
        </NavLink>
        <NavLink to="/barang" className={({ isActive }) => (isActive ? 'aktif' : '')}>
          <Package size={19} />
          <span>Data</span>
        </NavLink>
      </nav>
    </div>
  );
}
