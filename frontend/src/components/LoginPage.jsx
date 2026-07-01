import { useState } from 'react';
import { login, register } from '../api/gallery';

export default function LoginPage({ onLogin, onGuest }) {
  const [tab,      setTab]      = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      tab === 'login' ? await login(username, password) : await register(username, password);
      onLogin(username);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-glow" />
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">☁</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, letterSpacing: '-.5px', marginBottom: 6 }}>Nimbus Gallery</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Cloud-native image hosting</p>
        </div>

        <div className="login-box">
          {/* Tab */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--sur)', borderRadius: 10, padding: 4 }}>
            {[['login', '로그인'], ['register', '회원가입']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setTab(key); setError(''); }}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 7, border: 'none', cursor: 'pointer',
                  background: tab === key ? 'var(--sur2)' : 'transparent',
                  color:      tab === key ? 'var(--txt)' : 'var(--muted)',
                  fontWeight: tab === key ? 600 : 400,
                  fontSize: 13, transition: 'all .15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              className="search-input"
              style={{ padding: '11px 14px', borderRadius: 10, fontSize: 14, background: 'var(--sur2)', border: '1px solid var(--bdr)' }}
              type="text"
              placeholder="아이디"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
            <input
              className="search-input"
              style={{ padding: '11px 14px', borderRadius: 10, fontSize: 14, background: 'var(--sur2)', border: '1px solid var(--bdr)' }}
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
            />
            {error && (
              <p style={{ color: 'var(--danger)', fontSize: 12, margin: 0 }}>{error}</p>
            )}
            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: 13, borderRadius: 12, fontSize: 14, marginTop: 4 }}
              type="submit"
              disabled={loading}
            >
              {loading ? '처리 중...' : tab === 'login' ? '로그인' : '회원가입'}
            </button>
          </form>

          <div className="login-divider">
            <div className="login-divider-line" />
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>또는</span>
            <div className="login-divider-line" />
          </div>

          <button
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'center', padding: 12, borderRadius: 12, fontSize: 14 }}
            onClick={onGuest}
          >
            게스트로 계속하기 →
          </button>
          <p className="login-hint">로그인 없이도 업로드·공유 가능합니다.<br />로그인 시 앨범 관리를 사용할 수 있어요.</p>
        </div>
      </div>
    </div>
  );
}
