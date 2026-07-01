export default function Header({ page, isLoggedIn, username, onGallery, onAlbums, onLogin, onLogout }) {
  const initial = username ? username[0].toUpperCase() : 'G';

  return (
    <header className="header">
      <div className="header-logo" onClick={onGallery}>
        <div className="header-logo-icon">☁</div>
        <span className="header-logo-text">Nimbus</span>
      </div>
      <nav className="header-nav">
        <button className={`header-nav-btn ${page === 'main' ? 'active' : ''}`} onClick={onGallery}>갤러리</button>
        <button className={`header-nav-btn ${page === 'albums' || page === 'album' ? 'active' : ''}`} onClick={onAlbums}>앨범</button>
      </nav>
      <div className="header-spacer" />
      {isLoggedIn ? (
        <div className="header-user">
          <div className="header-avatar">{initial}</div>
          <span className="header-email">{username}</span>
          <button className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 12px' }} onClick={onLogout}>로그아웃</button>
        </div>
      ) : (
        <button className="btn btn-primary" onClick={onLogin}>로그인</button>
      )}
    </header>
  );
}
