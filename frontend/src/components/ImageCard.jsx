export default function ImageCard({ img, selMode, selected, onClick, onShare, onAlbum, onDelete, masonry, forceSquare }) {
  return (
    <div className={`img-card ${masonry ? 'masonry' : ''}`} onClick={onClick}>
      {selMode && (
        <div className={`checkbox ${selected ? 'checked' : 'unchecked'}`}>
          {selected && <CheckIcon />}
        </div>
      )}
      <div className="img-card-thumb" style={{ aspectRatio: forceSquare ? '1/1' : img.ratio }}>
        <img src={img.url} alt={img.name} loading="lazy" />
        <div className="img-card-overlay">
          <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={onShare}>공유</button>
          <button className="btn btn-surface btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={onAlbum}>앨범</button>
          <button className="btn btn-danger btn-sm" onClick={onDelete}>삭제</button>
        </div>
      </div>
      {img.tags.length > 0 && (
        <div className="img-card-tags">
          {img.tags.map(tag => <span key={tag} className="tag-badge">{tag}</span>)}
        </div>
      )}
    </div>
  );
}

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="2,6 5,9 10,3" />
  </svg>
);
