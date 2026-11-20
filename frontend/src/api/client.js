// Helper untuk komunikasi dengan Django API

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export async function fetchCsrfToken() {
  const res = await fetch('/api/auth/csrf/', { credentials: 'include' });
  const data = await res.json();
  return data.csrfToken;
}

export async function apiFetch(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const method = (options.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    let csrfToken = getCookie('csrftoken');
    if (!csrfToken) {
      csrfToken = await fetchCsrfToken();
    }
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { detail: response.statusText };
    }
    const err = new Error(errorData.detail || 'Terjadi kesalahan sistem');
    err.data = errorData;
    err.status = response.status;
    throw err;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  auth: {
    me: () => apiFetch('/api/auth/me/'),
    login: (username, password) =>
      apiFetch('/api/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    logout: () => apiFetch('/api/auth/logout/', { method: 'POST' }),
  },
  ranting: {
    list: () => apiFetch('/api/ranting/'),
    create: (data) => apiFetch('/api/ranting/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiFetch(`/api/ranting/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiFetch(`/api/ranting/${id}/`, { method: 'DELETE' }),
  },
  barang: {
    list: () => apiFetch('/api/barang/'),
    create: (data) => apiFetch('/api/barang/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiFetch(`/api/barang/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiFetch(`/api/barang/${id}/`, { method: 'DELETE' }),
  },
  nota: {
    list: (params = {}) => {
      const q = new URLSearchParams();
      if (params.ranting) q.set('ranting', params.ranting);
      if (params.tanggal) q.set('tanggal', params.tanggal);
      if (params.dibatalkan !== undefined) q.set('dibatalkan', params.dibatalkan);
      return apiFetch(`/api/nota/${q.toString() ? '?' + q.toString() : ''}`);
    },
    get: (id) => apiFetch(`/api/nota/${id}/`),
    create: (data) => apiFetch('/api/nota/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiFetch(`/api/nota/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    batalkan: (id, alasan) =>
      apiFetch(`/api/nota/${id}/batalkan/`, {
        method: 'POST',
        body: JSON.stringify({ alasan }),
      }),
  },
  ringkasan: {
    get: (tanggal) =>
      apiFetch(`/api/ringkasan/${tanggal ? '?tanggal=' + tanggal : ''}`),
  },
  pabrik: {
    list: () => apiFetch('/api/pabrik/'),
    create: (data) => apiFetch('/api/pabrik/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiFetch(`/api/pabrik/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiFetch(`/api/pabrik/${id}/`, { method: 'DELETE' }),
  },
  penjualan: {
    list: (params = {}) => {
      const q = new URLSearchParams();
      if (params.pabrik) q.set('pabrik', params.pabrik);
      if (params.tanggal) q.set('tanggal', params.tanggal);
      if (params.dibatalkan !== undefined) q.set('dibatalkan', params.dibatalkan);
      return apiFetch(`/api/penjualan/${q.toString() ? '?' + q.toString() : ''}`);
    },
    get: (id) => apiFetch(`/api/penjualan/${id}/`),
    create: (data) => apiFetch('/api/penjualan/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiFetch(`/api/penjualan/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    batalkan: (id, alasan) =>
      apiFetch(`/api/penjualan/${id}/batalkan/`, {
        method: 'POST',
        body: JSON.stringify({ alasan }),
      }),
  },
  stok: {
    get: () => apiFetch('/api/stok/'),
  },
};
