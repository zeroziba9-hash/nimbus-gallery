export default function AlbumPicker({ img, albums, images, onAssign, onRemove, onClose }) {
  return (
    <div className="overlay" style={{ zIndex: 250 }} onClick={onClose}>
      <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">앨범에 추가</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {albums.map(alb => {
          const count = images.filter(i => i.albumId === alb.id).length;
          const isCurrent = img?.albumId === alb.id;
          return (
            <button key={alb.id} onClick={() => onAssign(alb.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
                background: isCurrent ? 'oklch(62% 0.22 265 / 0.1)' : 'var(--sur2)',
                border: `1px solid ${isCurrent ? 'var(--acc)' : 'var(--bdr)'}`,
                borderRadius: 10, padding: '10px 12px', cursor: 'pointer', marginBottom: 6,
                fontFamily: 'var(--font-body)', color: 'var(--txt)',
              }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `var(--sur2) url(${alb.cover}) center/cover`, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 1 }}>{alb.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{count}장</div>
              </div>
              {isCurrent && <span style={{ fontSize: 11, color: 'var(--acc2)', fontWeight: 500 }}>현재</span>}
            </button>
          );
        })}
        <div style={{ height: 1, background: 'var(--bdr)', margin: '4px 0 10px' }} />
        <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={onRemove}>앨범에서 제거</button>
      </div>
    </div>
  );
}
