export default function Lightbox({ images, idx, onClose, onPrev, onNext }) {
  const img = images[idx];
  if (!img) return null;

  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}>×</button>
      <div className="lightbox-counter">{idx + 1} / {images.length}</div>
      <button className="lightbox-nav prev" onClick={e => { e.stopPropagation(); onPrev(); }}>‹</button>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, maxWidth: '80vw', maxHeight: '90vh' }}
           onClick={e => e.stopPropagation()}>
        <img className="lightbox-img" src={img.url} alt={img.name} />
        <div className="lightbox-meta">
          <span style={{ fontSize: 13 }}>{img.name}</span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>👁 {img.views}회</span>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {img.tags.map(tag => <span key={tag} className="tag-badge">{tag}</span>)}
          </div>
        </div>
      </div>

      <button className="lightbox-nav next" onClick={e => { e.stopPropagation(); onNext(); }}>›</button>
    </div>
  );
}
