const COGNITO_DOMAIN = import.meta.env.VITE_COGNITO_DOMAIN;
const CLIENT_ID     = import.meta.env.VITE_COGNITO_CLIENT_ID;
const REDIRECT_URI  = import.meta.env.VITE_REDIRECT_URI || `${window.location.origin}/callback`;

export function getGoogleLoginUrl() {
  const params = new URLSearchParams({
    client_id:         CLIENT_ID,
    response_type:     'code',
    scope:             'email openid profile',
    redirect_uri:      REDIRECT_URI,
    identity_provider: 'Google',
  });
  return `${COGNITO_DOMAIN}/oauth2/authorize?${params}`;
}

export async function exchangeCodeForTokens(code) {
  const body = new URLSearchParams({
    grant_type:   'authorization_code',
    client_id:    CLIENT_ID,
    code,
    redirect_uri: REDIRECT_URI,
  });
  const res = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error('토큰 교환 실패');
  return res.json(); // { access_token, id_token, refresh_token, ... }
}
