import { useState } from 'react';

const TABS = [
  { id: 'direct',   label: 'Direct' },
  { id: 'markdown', label: 'Markdown' },
  { id: 'html',     label: 'HTML' },
  { id: 'bbcode',   label: 'BBCode' },
];

function buildShareText(tab, img, cdnBase) {
  const url = `${cdnBase}/${img.name}`;
  switch (tab) {
    case 'markdown': return `![${img.name}](${url})`;
    case 'html':     return `<img src="${url}" alt="${img.name}" />`;
    case 'bbcode':   return `[img]${url}[/img]`;
    default:         return url;
  }
}

export default function ShareModal({ img, cdnBase, onClose, onCopy }) {
  const [activeTab, setActiveTab] = useState('direct');
  const [copied, setCopied] = useState(false);

  const shareText = buildShareText(activeTab, img, cdnBase);

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareText).catch(() => {});
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">이미지 공유</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div style={{ width: '100%', height: 130, borderRadius: 12, marginBottom: 16, background: `var(--sur2) url(${img.url}) center/cover no-repeat` }} />
        <div className="share-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`share-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => { setActiveTab(t.id); setCopied(false); }}>{t.label}</button>
          ))}
        </div>
        <div className="share-code-box">
          <code className="share-code">{shareText}</code>
          <button
            className="btn btn-sm"
            style={{ background: copied ? 'oklch(72% 0.14 200 / 0.2)' : 'var(--acc)', color: copied ? 'var(--acc2)' : '#fff', whiteSpace: 'nowrap' }}
            onClick={handleCopy}
          >
            {copied ? '✓ 복사됨' : '복사'}
          </button>
        </div>
      </div>
    </div>
  );
}
