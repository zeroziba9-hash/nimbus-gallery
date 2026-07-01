import { useState } from 'react';

export default function NewAlbumModal({ onCreate, onClose }) {
  const [name, setName] = useState('');

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">새 앨범 만들기</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <input
          className="input"
          type="text"
          placeholder="앨범 이름을 입력하세요"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && name.trim() && onCreate(name.trim())}
          style={{ marginBottom: 12 }}
          autoFocus
        />
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 12, fontSize: 14 }}
          onClick={() => name.trim() && onCreate(name.trim())} disabled={!name.trim()}>
          만들기
        </button>
      </div>
    </div>
  );
}
