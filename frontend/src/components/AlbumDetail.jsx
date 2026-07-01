import ImageCard from './ImageCard';

export default function AlbumDetail({ album, images, onBack, onDelete, onOpenLightbox, onShare, onAlbum, onDeleteImage }) {
  return (
    <main className="page">
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 18, paddingLeft: 6 }} onClick={onBack}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,2 4,7 9,12"/></svg>
        앨범 목록
      </button>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 700, letterSpacing: '-.5px', marginBottom: 4 }}>{album.name}</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>{images.length}개 이미지</p>
        </div>
        <button className="btn btn-danger btn-sm" onClick={onDelete}>앨범 삭제</button>
      </div>

      {images.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🖼</div>
          <p className="empty-state-title">이미지가 없어요</p>
          <p className="empty-state-sub">갤러리에서 이미지를 추가해보세요</p>
        </div>
      ) : (
        <div className="gallery-masonry">
          {images.map((img, idx) => (
            <ImageCard key={img.id} img={img} selMode={false} selected={false} masonry
              onClick={() => onOpenLightbox(idx)}
              onShare={e => { e.stopPropagation(); onShare(img); }}
              onAlbum={e => { e.stopPropagation(); onAlbum(img); }}
              onDelete={e => { e.stopPropagation(); onDeleteImage(img); }}
            />
          ))}
        </div>
      )}
    </main>
  );
}
