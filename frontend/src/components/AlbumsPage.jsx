export default function AlbumsPage({ albums, images, onOpenAlbum, onNewAlbum }) {
  return (
    <main className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 700, letterSpacing: '-.5px', marginBottom: 4 }}>앨범</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>이미지를 앨범으로 정리하세요</p>
        </div>
        <button className="btn btn-primary" onClick={onNewAlbum}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/></svg>
          새 앨범
        </button>
      </div>

      {albums.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <p className="empty-state-title">앨범이 없어요</p>
          <p className="empty-state-sub">새 앨범 버튼으로 만들어보세요</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {albums.map(alb => {
            const count = images.filter(i => i.albumId === alb.id).length;
            return (
              <div key={alb.id} className="alb-card" onClick={() => onOpenAlbum(alb)}>
                <div className="alb-card-cover" style={{ backgroundImage: alb.cover ? `url(${alb.cover})` : 'none' }}>
                  <div className="alb-card-badge">{count}장</div>
                </div>
                <div className="alb-card-info">
                  <div className="alb-card-name">{alb.name}</div>
                  <div className="alb-card-date">{alb.createdAt}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
