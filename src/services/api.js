const BASE = 'http://localhost:5000/api';

export async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem('token');
  const headers = opts.headers || {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  const res = await fetch(`${BASE}${path}`, {...opts, headers});
  if (!res.ok) {
    const body = await res.json().catch(()=>({message:'error'}));
    throw new Error(body.message || 'Request failed');
  }
  return res.json();
}
