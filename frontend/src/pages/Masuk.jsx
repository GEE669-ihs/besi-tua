import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Masuk() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Nama pengguna atau kata sandi keliru.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--mutiara)', padding: 20 }}>
      <div className="modal-kotak" style={{ maxWidth: 400, borderTop: '4px solid var(--zamrud)', padding: 36 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="lambang" style={{ margin: '0 auto 12px', background: 'var(--zamrud)', color: 'var(--champagne)' }}>
            BS
          </div>
          <h2 style={{ margin: '0 0 4px', fontSize: '1.5rem', color: 'var(--zamrud)' }}>UD. Bali Sejahtera</h2>
          <span className="sub" style={{ fontSize: '0.9rem' }}>Sistem Pembukuan Gudang</span>
        </div>

        {error && <div className="pesan-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="isian">
            <label>Nama Pengguna</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoFocus
              required
            />
          </div>

          <div className="isian" style={{ marginTop: 12 }}>
            <label>Kata Sandi</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="tombol besar"
            style={{ width: '100%', marginTop: 24 }}
          >
            <LogIn size={18} /> {loading ? 'Memeriksa...' : 'Masuk ke Sistem'}
          </button>
        </form>
      </div>
    </div>
  );
}
