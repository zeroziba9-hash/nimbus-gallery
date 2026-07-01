import { getGoogleLoginUrl } from '../api/cognito';

export default function LoginPage({ onGuest }) {
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
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 600, marginBottom: 4 }}>시작하기</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 22 }}>Google 계정으로 로그인하거나 게스트로 사용하세요</p>
          <button
            className="btn btn-surface"
            style={{ width: '100%', justifyContent: 'center', padding: 13, borderRadius: 12, marginBottom: 10, fontSize: 14 }}
            onClick={() => window.location.href = getGoogleLoginUrl()}
          >
            <GoogleIcon />
            Google로 로그인
          </button>
          <div className="login-divider">
            <div className="login-divider-line" />
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>또는</span>
            <div className="login-divider-line" />
          </div>
          <button
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'center', padding: 12, borderRadius: 12, fontSize: 14, marginTop: 10 }}
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
