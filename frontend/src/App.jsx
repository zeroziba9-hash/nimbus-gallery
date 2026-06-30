import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const CDN = "https://d1pogf5m0mafe7.cloudfront.net";

const COGNITO_DOMAIN = "https://nimbus-gallery.auth.ap-northeast-2.amazoncognito.com";
const COGNITO_CLIENT_ID = "3p0i09ir9i3dh7uuqnm5d17i5c";
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || "http://localhost:5173/callback";

function getGoogleLoginUrl() {
  const params = new URLSearchParams({
    client_id: COGNITO_CLIENT_ID,
    response_type: "code",
    scope: "email openid profile",
    redirect_uri: REDIRECT_URI,
    identity_provider: "Google",
  });
  return `${COGNITO_DOMAIN}/oauth2/authorize?${params}`;
}

async function exchangeCodeForToken(code) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: COGNITO_CLIENT_ID,
    code,
    redirect_uri: REDIRECT_URI,
  });
  const res = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  return res.json();
}

function ShareModal({ image, onClose }) {
  const [copied, setCopied] = useState("");

  const directUrl = image.cdn_url;
  const thumbUrl = `${CDN}/${image.key.replace("images/", "thumbnails/")}`;
  const links = [
    { label: "Direct Link", value: directUrl },
    { label: "Markdown", value: `![image](${directUrl})` },
    { label: "HTML", value: `<img src="${directUrl}" alt="image"/>` },
    { label: "BBCode", value: `[img]${directUrl}[/img]` },
  ];

  function copy(value, label) {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>업로드 완료!</h2>
        <img src={thumbUrl} alt="uploaded" className="modal-preview"
          onError={(e) => { e.target.src = directUrl; }} />
        {image.tags && image.tags.length > 0 && (
          <div className="tags modal-tags">
            {image.tags.slice(0, 5).map((tag) => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        )}
        <div className="share-links">
          {links.map(({ label, value }) => (
            <div key={label} className="share-row">
              <span className="share-label">{label}</span>
              <input readOnly value={value} onClick={(e) => e.target.select()} />
              <button
                className={copied === label ? "copied" : ""}
                onClick={() => copy(value, label)}
              >
                {copied === label ? "✓" : "복사"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [authMode, setAuthMode] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [showAuth, setShowAuth] = useState(false);

  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [shareImage, setShareImage] = useState(null);
  const [uploadError, setUploadError] = useState("");

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    // Cognito OAuth 콜백 처리
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      window.history.replaceState({}, "", "/");
      exchangeCodeForToken(code).then((data) => {
        if (data.access_token) {
          localStorage.setItem("token", data.access_token);
          // id_token에서 이메일 추출
          try {
            const payload = JSON.parse(atob(data.id_token.split(".")[1]));
            localStorage.setItem("email", payload.email || "Google 사용자");
            setEmail(payload.email || "Google 사용자");
          } catch {}
          setToken(data.access_token);
        }
      });
    }
    fetchImages();
  }, []);

  async function fetchImages() {
    try {
      const res = await axios.get(`${API}/api/images`);
      setImages(res.data.images);
    } catch {}
  }

  async function handleAuth(e) {
    e.preventDefault();
    setAuthError("");
    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const { data } = await axios.post(`${API}${endpoint}`, {
        email: authEmail,
        password: authPassword,
      });
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("email", data.email);
      setToken(data.access_token);
      setEmail(data.email);
      setShowAuth(false);
    } catch (err) {
      setAuthError(err.response?.data?.detail || "오류가 발생했습니다");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setToken("");
    setEmail("");
  }

  async function uploadFile(file) {
    setUploading(true);
    setUploadError("");
    try {
      const { data } = await axios.post(`${API}/api/upload/presigned`, {
        filename: file.name,
        content_type: file.type,
      });
      await axios.put(data.upload_url, file, {
        headers: { "Content-Type": file.type },
      });
      setTimeout(async () => {
        await fetchImages();
        const res = await axios.get(`${API}/api/images`);
        const uploaded = res.data.images.find((img) => img.key === data.image_key);
        setShareImage(uploaded || { key: data.image_key, cdn_url: data.cdn_url, tags: [] });
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "업로드 실패";
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  }

  function onFileChange(e) {
    const file = e.target.files[0];
    if (file) uploadFile(file);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  async function deleteImage(key) {
    await axios.delete(`${API}/api/images/${key}`, { headers });
    fetchImages();
  }

  return (
    <div className="app">
      <header>
        <div className="header-top">
          <h1>☁️ Nimbus Gallery</h1>
          <div className="header-actions">
            {token ? (
              <>
                <span className="user-email">{email}</span>
                <button className="btn-outline" onClick={logout}>로그아웃</button>
              </>
            ) : (
              <button className="btn-outline" onClick={() => setShowAuth(true)}>로그인</button>
            )}
          </div>
        </div>
        <p>Cloud-native image hosting · AWS S3 + CloudFront + Lambda</p>
      </header>

      {/* 로그인 모달 */}
      {showAuth && (
        <div className="modal-backdrop" onClick={() => setShowAuth(false)}>
          <div className="modal auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAuth(false)}>✕</button>
            <div className="auth-tabs">
              <button className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>로그인</button>
              <button className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")}>회원가입</button>
            </div>
            <a href={getGoogleLoginUrl()} className="google-login-btn">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" />
              Google로 로그인
            </a>
            <div className="auth-divider"><span>또는</span></div>
            <form onSubmit={handleAuth}>
              <input type="email" placeholder="이메일" value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)} required />
              <input type="password" placeholder="비밀번호" value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)} required />
              {authError && <p className="auth-error">{authError}</p>}
              <button type="submit" className="auth-submit">
                {authMode === "login" ? "로그인" : "회원가입"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 공유 모달 */}
      {shareImage && <ShareModal image={shareImage} onClose={() => setShareImage(null)} />}

      <div
        className={`upload-zone ${dragOver ? "drag-over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById("fileInput").click()}
      >
        {uploading
          ? <p>⏳ 업로드 중...</p>
          : uploadError
            ? <><p style={{color:"#f87171"}}>❌ {uploadError}</p><p className="upload-sub">다시 시도하려면 클릭</p></>
            : <><p>🖼 이미지를 드래그하거나 클릭해서 업로드</p><p className="upload-sub">로그인 없이 바로 사용 가능</p></>
        }
        <input id="fileInput" type="file" accept="image/*" style={{ display: "none" }} onChange={onFileChange} />
      </div>

      <div className="stats">총 {images.length}개 이미지</div>

      <div className="gallery">
        {images.map((img) => {
          const thumbKey = img.key.replace("images/", "thumbnails/");
          return (
            <div key={img.key} className="card">
              <img
                src={`${CDN}/${thumbKey}`}
                alt={img.key}
                onError={(e) => { e.target.src = img.cdn_url; }}
                onClick={() => setShareImage(img)}
                style={{ cursor: "pointer" }}
              />
              {img.tags && img.tags.length > 0 && (
                <div className="tags">
                  {img.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}
              <div className="card-actions">
                <button onClick={() => setShareImage(img)}>공유</button>
                {token && (
                  <button className="delete" onClick={() => deleteImage(img.key)}>삭제</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
