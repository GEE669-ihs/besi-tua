import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Ringkasan from './pages/Ringkasan';
import NotaBaru from './pages/NotaBaru';
import DaftarNota from './pages/DaftarNota';
import DetailNota from './pages/DetailNota';
import DaftarBarang from './pages/DaftarBarang';
import DaftarRanting from './pages/DaftarRanting';
import Masuk from './pages/Masuk';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Memeriksa sesi pengguna...</div>;
  }

  if (!user) {
    return <Navigate to="/masuk" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/masuk" element={<Masuk />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Ringkasan />} />
            <Route path="nota" element={<DaftarNota />} />
            <Route path="nota/baru" element={<NotaBaru />} />
            <Route path="nota/:id" element={<DetailNota />} />
            <Route path="barang" element={<DaftarBarang />} />
            <Route path="ranting" element={<DaftarRanting />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
