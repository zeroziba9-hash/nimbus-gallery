import ImageCard     from './ImageCard';
import ImageListItem from './ImageListItem';

export default function GalleryPage({
  images, allTags, totalCount,
  filter, onFilter, search, onSearch, sortBy, onSort, viewMode, onViewMode,
  selMode, onToggleSelMode, selIds, onToggleSelect, onBulkDelete,
  uploadPct, isDragging, onDragOver, onDragLeave, onDrop, onFileChange,
  onOpenLightbox, onShare, onAlbum, onDelete,
}) {
  return (
    <main className="page" style={{ paddingTop: 0 }}>
      {/* Hero */}
      <div className="hero">
        <div className="hero-glow" />
        <h1 className="hero-title">
          Cloud-native<br />
          <span className="gradient-text">Image Hosting</span>
        </h1>
        <p className="hero-sub">AWS S3 · CloudFront CDN · Lambda · Rekognition AI</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-num">{totalCount}</div>
          <div className="stat-label">TOTAL IMAGES</div>
        </div>
        <div className="stat-card">
          <div className="stat-num gradient-text">CDN</div>
          <div className="stat-label">CLOUDFRONT</div>
        </div>
        <div className="stat-card">
          <div className="stat-num gradient-text">AI</div>
          <div className="stat-label">AUTO TAGGING</div>
        </div>
      </div>

      {/* Upload zone */}
      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''}`}
        onClick={() => document.getElementById('file-input')?.click()}
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
      >
        {uploadPct >= 0 ? (
          <div className="upload-progress">
            <div className="spinner" />
            <div className="progress-bar-wrap">
              <div className="progress-bar-header">
                <span>업로드 중...</span>
                <span>{uploadPct}%</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${uploadPct}%` }} />
              </div>
            </div>
          </div>
        ) : (
          <div className="upload-zone-content">
            <div className="upload-zone-icon">🖼</div>
            <div>
              <p className="upload-zone-title">이미지를 드래그하거나 클릭해서 업로드</p>
              <p className="upload-zone-sub">PNG · JPG · WEBP · GIF · 로그인 없이 바로 사용 가능</p>
            </div>
          </div>
        )}
        <input id="file-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />
      </div>

      {/* Search + Sort + View toolbar */}
      <div className="toolbar">
        <div className="search-wrap">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input className="search-input" type="text" placeholder="이름 또는 태그 검색..." value={search} onChange={e => onSearch(e.target.value)} />
        </div>
        <div className="sort-wrap">
          <select className="sort-select" value={sortBy} onChange={e => onSort(e.target.value)}>
            <option value="newest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="views">조회수순</option>
            <option value="name">이름순</option>
          </select>
          <svg className="sort-caret" width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="1,3 5.5,8 10,3"/></svg>
        </div>
        <div className="view-toggle">
          {[
            { id: 'masonry', icon: <MasonryIcon /> },
            { id: 'grid',    icon: <GridIcon /> },
            { id: 'list',    icon: <ListIcon /> },
          ].map(({ id, icon }) => (
            <button key={id} className={`view-toggle-btn ${viewMode === id ? 'active' : ''}`} onClick={() => onViewMode(id)}>{icon}</button>
          ))}
        </div>
      </div>

      {/* Tag chips + selection */}
      <div className="tag-bar">
        {allTags.map(tag => (
          <button key={tag} className={`tag-chip ${filter === tag ? 'active' : ''}`} onClick={() => onFilter(filter === tag ? 'all' : tag)}>{tag}</button>
        ))}
        <div style={{ flex: 1, minWidth: 16 }} />
        <button className={`btn btn-sm ${selMode ? 'btn-surface' : 'btn-ghost'}`} onClick={onToggleSelMode}>{selMode ? '선택 취소' : '선택'}</button>
        {selIds.size > 0 && (
          <button className="btn btn-sm btn-danger" onClick={onBulkDelete}>{selIds.size}개 삭제</button>
        )}
      </div>

      {/* Empty */}
      {images.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">☁</div>
          <p className="empty-state-title">이미지가 없어요</p>
          <p className="empty-state-sub">업로드하거나 검색어/필터를 변경해보세요</p>
        </div>
      )}

      {/* Masonry */}
      {viewMode === 'masonry' && images.length > 0 && (
        <div className="gallery-masonry">
          {images.map((img, idx) => (
            <ImageCard key={img.id} img={img} selMode={selMode} selected={selIds.has(img.id)}
              onClick={() => selMode ? onToggleSelect(img.id) : onOpenLightbox(idx)}
              onShare={e => { e.stopPropagation(); onShare(img); }}
              onAlbum={e => { e.stopPropagation(); onAlbum(img); }}
              onDelete={e => { e.stopPropagation(); onDelete(img); }}
              masonry
            />
          ))}
        </div>
      )}

      {/* Grid */}
      {viewMode === 'grid' && images.length > 0 && (
        <div className="gallery-grid">
          {images.map((img, idx) => (
            <ImageCard key={img.id} img={img} selMode={selMode} selected={selIds.has(img.id)}
              onClick={() => selMode ? onToggleSelect(img.id) : onOpenLightbox(idx)}
              onShare={e => { e.stopPropagation(); onShare(img); }}
              onAlbum={e => { e.stopPropagation(); onAlbum(img); }}
              onDelete={e => { e.stopPropagation(); onDelete(img); }}
              forceSquare
            />
          ))}
        </div>
      )}

      {/* List */}
      {viewMode === 'list' && images.length > 0 && (
        <div className="gallery-list">
          {images.map((img, idx) => (
            <ImageListItem key={img.id} img={img} selMode={selMode} selected={selIds.has(img.id)}
              onClick={() => selMode ? onToggleSelect(img.id) : onOpenLightbox(idx)}
              onShare={e => { e.stopPropagation(); onShare(img); }}
              onAlbum={e => { e.stopPropagation(); onAlbum(img); }}
              onDelete={e => { e.stopPropagation(); onDelete(img); }}
            />
          ))}
        </div>
      )}
    </main>
  );
}

const MasonryIcon = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="0" width="6" height="8" rx="1"/><rect x="8" y="0" width="6" height="5" rx="1"/><rect x="0" y="9" width="6" height="5" rx="1"/><rect x="8" y="6" width="6" height="8" rx="1"/></svg>;
const GridIcon    = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="0" width="6" height="6" rx="1"/><rect x="8" y="0" width="6" height="6" rx="1"/><rect x="0" y="8" width="6" height="6" rx="1"/><rect x="8" y="8" width="6" height="6" rx="1"/></svg>;
const ListIcon    = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="1" y1="3.5" x2="13" y2="3.5"/><line x1="1" y1="7" x2="13" y2="7"/><line x1="1" y1="10.5" x2="13" y2="10.5"/></svg>;
