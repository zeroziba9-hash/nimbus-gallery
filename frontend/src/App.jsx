import { useState, useMemo, useEffect, useCallback } from 'react';
import Header        from './components/Header';
import LoginPage     from './components/LoginPage';
import GalleryPage   from './components/GalleryPage';
import AlbumsPage    from './components/AlbumsPage';
import AlbumDetail   from './components/AlbumDetail';
import Lightbox      from './components/Lightbox';
import ShareModal    from './components/ShareModal';
import AlbumPicker   from './components/AlbumPicker';
import NewAlbumModal from './components/NewAlbumModal';
import ToastContainer from './components/ToastContainer';
import { useToast }  from './hooks/useToast';
import {
  getToken, setToken, getUsername,
  fetchImages, uploadToS3, deleteImage,
} from './api/gallery';
import { exchangeCodeForTokens } from './api/cognito';
import './App.css';

function normalizeImage(apiImg) {
  return {
    id:         apiImg.key,
    key:        apiImg.key,
    url:        apiImg.cdn_url,
    name:       apiImg.key.split('/').pop(),
    ratio:      '4/3',
    tags:       apiImg.tags   || [],
    albumId:    null,
    views:      apiImg.views  || 0,
    size:       apiImg.size,
    uploadedAt: apiImg.uploaded_at,
  };
}

export default function App() {
  // ── routing ───────────────────────────────────────────────────────────────
  const [page,     setPage]     = useState('main');
  const [curAlbum, setCurAlbum] = useState(null);

  // ── auth ──────────────────────────────────────────────────────────────────
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getToken());
  const [username,   setUsername]   = useState(() => getUsername());

  // ── data ──────────────────────────────────────────────────────────────────
  const [images,  setImages]  = useState([]);
  const [albums,  setAlbums]  = useState([]);
  const [loading, setLoading] = useState(false);

  // ── gallery filters ───────────────────────────────────────────────────────
  const [filter,   setFilter]   = useState('all');
  const [search,   setSearch]   = useState('');
  const [sortBy,   setSortBy]   = useState('newest');
  const [viewMode, setViewMode] = useState('masonry');

  // ── selection ─────────────────────────────────────────────────────────────
  const [selMode, setSelMode] = useState(false);
  const [selIds,  setSelIds]  = useState(new Set());

  // ── upload ────────────────────────────────────────────────────────────────
  const [uploadPct,  setUploadPct]  = useState(-1);
  const [isDragging, setIsDragging] = useState(false);

  // ── modals ────────────────────────────────────────────────────────────────
  const [lightbox,     setLightbox]     = useState({ open: false, images: [], idx: 0 });
  const [shareModal,   setShareModal]   = useState({ open: false, img: null });
  const [albumPicker,  setAlbumPicker]  = useState({ open: false, img: null });
  const [newAlbumOpen, setNewAlbumOpen] = useState(false);

  const { toasts, addToast } = useToast();

  // ── Google OAuth callback ─────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) return;
    window.history.replaceState({}, '', '/');
    exchangeCodeForTokens(code)
      .then(({ id_token }) => {
        setToken(id_token);
        const p = JSON.parse(atob(id_token.split('.')[1]));
        const uname = p.email || p['cognito:username'] || 'user';
        setIsLoggedIn(true);
        setUsername(uname);
        setPage('main');
        addToast('Google 로그인 완료!', 'success');
      })
      .catch(() => {
        addToast('Google 로그인 실패', 'error');
        setPage('login');
      });
  }, [addToast]);

  // ── load images from API ──────────────────────────────────────────────────
  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchImages();
      setImages(data.images.map(normalizeImage));
    } catch {
      addToast('이미지 불러오기 실패', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (isLoggedIn) loadImages();
  }, [isLoggedIn, loadImages]);

  // ── computed ──────────────────────────────────────────────────────────────
  const processedImages = useMemo(() => {
    let result = images;
    if (filter !== 'all') result = result.filter(i => i.tags.includes(filter));
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(i =>
        i.name.toLowerCase().includes(q) || i.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    result = [...result];
    switch (sortBy) {
      case 'newest': result.sort((a, b) => b.id.localeCompare(a.id));      break;
      case 'oldest': result.sort((a, b) => a.id.localeCompare(b.id));      break;
      case 'views':  result.sort((a, b) => b.views - a.views);             break;
      case 'name':   result.sort((a, b) => a.name.localeCompare(b.name));  break;
    }
    return result;
  }, [images, filter, search, sortBy]);

  const allTags = useMemo(
    () => [...new Set(images.flatMap(i => i.tags))].sort(),
    [images]
  );

  const albumImages = useMemo(
    () => curAlbum ? images.filter(i => i.albumId === curAlbum.id) : [],
    [images, curAlbum]
  );

  // ── keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (lightbox.open) {
        if (e.key === 'ArrowLeft')  openLightbox(lightbox.idx - 1, lightbox.images);
        if (e.key === 'ArrowRight') openLightbox(lightbox.idx + 1, lightbox.images);
        if (e.key === 'Escape')     setLightbox(s => ({ ...s, open: false }));
        return;
      }
      if (e.key === 'Escape') {
        setShareModal(s => ({ ...s, open: false }));
        setAlbumPicker(s => ({ ...s, open: false }));
        setNewAlbumOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  // ── handlers ──────────────────────────────────────────────────────────────
  const openLightbox = useCallback((idx, imgList) => {
    const len = imgList.length;
    if (!len) return;
    setLightbox({ open: true, images: imgList, idx: ((idx % len) + len) % len });
  }, []);

  const handleLogin = useCallback((uname) => {
    setIsLoggedIn(true);
    setUsername(uname);
    setPage('main');
    addToast('로그인 완료!', 'success');
  }, [addToast]);

  const handleLogout = useCallback(() => {
    setToken(null);
    setIsLoggedIn(false);
    setUsername('');
    setImages([]);
    setAlbums([]);
    setPage('login');
  }, []);

  const handleGuest = useCallback(() => {
    setIsLoggedIn(false);
    setPage('main');
  }, []);

  const handleUpload = useCallback(async (file) => {
    if (!file) return;
    setUploadPct(0);
    try {
      const { key, url } = await uploadToS3(file, setUploadPct);
      setImages(prev => [{
        id: key, key, url,
        name:     file.name,
        ratio:    '4/3',
        tags:     [],
        albumId:  null,
        views:    0,
      }, ...prev]);
      setUploadPct(-1);
      addToast(`"${file.name}" 업로드 완료!`, 'upload');
    } catch (err) {
      setUploadPct(-1);
      addToast(err.message || '업로드 실패했어요', 'error');
    }
  }, [addToast]);

  const handleDelete = useCallback(async (img) => {
    try {
      await deleteImage(img.key);
      setImages(prev => prev.filter(i => i.id !== img.id));
      addToast(`"${img.name}" 삭제됨`, 'success');
    } catch {
      addToast('삭제 실패했어요', 'error');
    }
  }, [addToast]);

  const handleBulkDelete = useCallback(async () => {
    const toDelete = images.filter(i => selIds.has(i.id));
    const count    = toDelete.length;
    try {
      await Promise.all(toDelete.map(img => deleteImage(img.key)));
      setImages(prev => prev.filter(i => !selIds.has(i.id)));
      setSelIds(new Set());
      setSelMode(false);
      addToast(`${count}개 삭제됨`, 'success');
    } catch {
      addToast('일부 삭제 실패', 'error');
    }
  }, [images, selIds, addToast]);

  const handleAssignAlbum = useCallback((img, albumId) => {
    setImages(prev => prev.map(i => i.id === img.id ? { ...i, albumId } : i));
    setAlbumPicker({ open: false, img: null });
    const albumName = albums.find(a => a.id === albumId)?.name;
    addToast(albumName ? `"${img.name}" → "${albumName}"` : '앨범에서 제거됨', 'album');
  }, [albums, addToast]);

  const handleCreateAlbum = useCallback((name) => {
    setAlbums(prev => [...prev, {
      id: Date.now(), name, cover: '', createdAt: new Date().toISOString().slice(0, 10),
    }]);
    setNewAlbumOpen(false);
    addToast(`"${name}" 앨범 생성!`, 'album');
  }, [addToast]);

  const handleDeleteAlbum = useCallback((album) => {
    setAlbums(prev => prev.filter(a => a.id !== album.id));
    setImages(prev => prev.map(i => i.albumId === album.id ? { ...i, albumId: null } : i));
    setPage('albums');
    setCurAlbum(null);
    addToast(`"${album.name}" 앨범 삭제됨`, 'success');
  }, [addToast]);

  const toggleSelect = useCallback((id) => {
    setSelIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="app">
      <ToastContainer toasts={toasts} />

      {page !== 'login' && (
        <Header
          page={page}
          isLoggedIn={isLoggedIn}
          username={username}
          onGallery={() => { setPage('main'); setSelMode(false); setSelIds(new Set()); }}
          onAlbums={() => setPage('albums')}
          onLogin={() => setPage('login')}
          onLogout={handleLogout}
        />
      )}

      {page === 'login' && (
        <LoginPage onGuest={handleGuest} />
      )}

      {page === 'main' && (
        <GalleryPage
          images={processedImages}
          allTags={allTags}
          totalCount={images.length}
          albums={albums}
          loading={loading}
          filter={filter}       onFilter={setFilter}
          search={search}       onSearch={setSearch}
          sortBy={sortBy}       onSort={setSortBy}
          viewMode={viewMode}   onViewMode={setViewMode}
          selMode={selMode}     onToggleSelMode={() => { setSelMode(v => !v); setSelIds(new Set()); }}
          selIds={selIds}       onToggleSelect={toggleSelect}
          onBulkDelete={handleBulkDelete}
          uploadPct={uploadPct}
          isDragging={isDragging}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUpload(e.dataTransfer.files?.[0]); }}
          onFileChange={(e) => handleUpload(e.target.files?.[0])}
          onOpenLightbox={(idx) => openLightbox(idx, processedImages)}
          onShare={(img) => setShareModal({ open: true, img })}
          onAlbum={(img) => setAlbumPicker({ open: true, img })}
          onDelete={handleDelete}
        />
      )}

      {page === 'albums' && (
        <AlbumsPage
          albums={albums}
          images={images}
          onOpenAlbum={(alb) => { setCurAlbum(alb); setPage('album'); }}
          onNewAlbum={() => setNewAlbumOpen(true)}
        />
      )}

      {page === 'album' && curAlbum && (
        <AlbumDetail
          album={curAlbum}
          images={albumImages}
          onBack={() => setPage('albums')}
          onDelete={() => handleDeleteAlbum(curAlbum)}
          onOpenLightbox={(idx) => openLightbox(idx, albumImages)}
          onShare={(img) => setShareModal({ open: true, img })}
          onAlbum={(img) => setAlbumPicker({ open: true, img })}
          onDeleteImage={handleDelete}
        />
      )}

      {lightbox.open && (
        <Lightbox
          images={lightbox.images}
          idx={lightbox.idx}
          onClose={() => setLightbox(s => ({ ...s, open: false }))}
          onPrev={() => openLightbox(lightbox.idx - 1, lightbox.images)}
          onNext={() => openLightbox(lightbox.idx + 1, lightbox.images)}
        />
      )}

      {shareModal.open && (
        <ShareModal
          img={shareModal.img}
          cdnBase="https://d1pogf5m0mafe7.cloudfront.net"
          onClose={() => setShareModal({ open: false, img: null })}
          onCopy={() => addToast('링크 복사됨!', 'copy')}
        />
      )}

      {albumPicker.open && (
        <AlbumPicker
          img={albumPicker.img}
          albums={albums}
          images={images}
          onAssign={(albumId) => handleAssignAlbum(albumPicker.img, albumId)}
          onRemove={() => handleAssignAlbum(albumPicker.img, null)}
          onClose={() => setAlbumPicker({ open: false, img: null })}
        />
      )}

      {newAlbumOpen && (
        <NewAlbumModal
          onCreate={handleCreateAlbum}
          onClose={() => setNewAlbumOpen(false)}
        />
      )}
    </div>
  );
}
