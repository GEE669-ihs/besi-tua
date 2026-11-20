import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, PlusCircle, Package, MapPin, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/masuk');
  };

  const isFormNota = location.pathname === '/nota/baru' || location.pathname.includes('/ubah');

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
          <h3>Harian</h3>
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'aktif' : '')}>
            <LayoutDashboard size={18} /> Ringkasan
          </NavLink>
          <NavLink to="/nota" end className={({ isActive }) => (isActive ? 'aktif' : '')}>
            <ReceiptText size={18} /> Nota pembelian
          </NavLink>
          <NavLink to="/nota/baru" className={({ isActive }) => (isActive ? 'aktif' : '')}>
            <PlusCircle size={18} /> Nota baru
          </NavLink>

          <h3>Master Data</h3>
          <NavLink to="/barang" className={({ isActive }) => (isActive ? 'aktif' : '')}>
            <Package size={18} /> Barang & Harga
          </NavLink>
          <NavLink to="/ranting" className={({ isActive }) => (isActive ? 'aktif' : '')}>
            <MapPin size={18} /> Ranting (Lapak)
          </NavLink>

          <h3>Segera</h3>
          <span className="segera">Penjualan ke pabrik</span>
          <span className="segera">Stok</span>
          <span className="segera">Laporan & Cetak</span>
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
      {!isFormNota && (
        <NavLink to="/nota/baru" className="tombol-mengambang">
          <PlusCircle size={20} />
          Nota baru
        </NavLink>
      )}

      {/* Navigasi Bawah Mobile */}
      <nav className="nav-bawah">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'aktif' : '')}>
          <LayoutDashboard size={20} />
          <span>Ringkasan</span>
        </NavLink>
        <NavLink to="/nota" end className={({ isActive }) => (isActive ? 'aktif' : '')}>
          <ReceiptText size={20} />
          <span>Nota</span>
        </NavLink>
        <NavLink to="/barang" className={({ isActive }) => (isActive ? 'aktif' : '')}>
          <Package size={20} />
          <span>Barang</span>
        </NavLink>
        <NavLink to="/ranting" className={({ isActive }) => (isActive ? 'aktif' : '')}>
          <MapPin size={20} />
          <span>Ranting</span>
        </NavLink>
      </nav>
    </div>
  );
}
