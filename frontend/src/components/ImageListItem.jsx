export default function ImageListItem({ img, selMode, selected, onClick, onShare, onAlbum, onDelete }) {
  return (
    <div className="list-item" onClick={onClick}>
      <div className="list-item-thumb">
        <img src={img.url} alt={img.name} loading="lazy" />
      </div>
      <div className="list-item-info">
        <span className="list-item-name">{img.name}</span>
        <div className="img-card-tags" style={{ padding: 0 }}>
          {img.tags.map(tag => <span key={tag} className="tag-badge">{tag}</span>)}
        </div>
        <span className="list-item-views">👁 {img.views}회</span>
      </div>
      <div className="list-item-actions">
        <button className="btn btn-surface btn-sm" onClick={onShare}>공유</button>
        <button className="btn btn-surface btn-sm" onClick={onAlbum}>앨범</button>
        <button className="btn btn-danger btn-sm" onClick={onDelete}>삭제</button>
      </div>
    </div>
  );
}
