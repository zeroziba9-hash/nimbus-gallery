const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const CDN_BASE = import.meta.env.VITE_CDN_URL  || 'https://d1pogf5m0mafe7.cloudfront.net';

// ── Token helpers ──────────────────────────────────────────────────────────────
export const getToken    = ()  => localStorage.getItem('nimbus_token');
export const setToken    = (t) => t ? localStorage.setItem('nimbus_token', t) : localStorage.removeItem('nimbus_token');
export const getUsername = ()  => {
  const token = getToken();
  if (!token) return '';
  try { return JSON.parse(atob(token.split('.')[1])).sub; } catch { return ''; }
};

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── Auth ───────────────────────────────────────────────────────────────────────
export async function login(username, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.detail || '로그인 실패'); }
  const data = await res.json();
  setToken(data.access_token);
  return data;
}

export async function register(username, password) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.detail || '회원가입 실패'); }
  const data = await res.json();
  setToken(data.access_token);
  return data;
}

// ── Images ─────────────────────────────────────────────────────────────────────
export async function fetchImages() {
  const res = await fetch(`${API_BASE}/api/images`, { headers: authHeaders() });
  if (!res.ok) throw new Error('이미지 목록을 불러오지 못했어요');
  return res.json(); // { images: [{key, cdn_url, size, uploaded_at}], count }
}

export async function uploadToS3(file, onProgress) {
  const presignRes = await fetch(`${API_BASE}/api/upload/presigned`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ filename: file.name, content_type: file.type }),
  });
  if (!presignRes.ok) throw new Error('업로드 URL 요청 실패');
  const { upload_url, image_key, cdn_url } = await presignRes.json();

  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', upload_url);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.upload.onprogress = (e) =>
      e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload  = () => xhr.status < 300 ? resolve() : reject(new Error('S3 업로드 실패'));
    xhr.onerror = () => reject(new Error('네트워크 오류'));
    xhr.send(file);
  });

  return { key: image_key, url: cdn_url };
}

export async function deleteImage(key) {
  const res = await fetch(`${API_BASE}/api/images/${encodeURIComponent(key)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('삭제 실패');
}
