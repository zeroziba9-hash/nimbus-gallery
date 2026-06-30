import os
import json
import urllib.request
from datetime import datetime, timedelta

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from database import get_db
import models

SECRET_KEY = os.environ.get("SECRET_KEY", "nimbus-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

COGNITO_REGION = "ap-northeast-2"
COGNITO_POOL_ID = "ap-northeast-2_AQqpdRhep"
COGNITO_CLIENT_ID = "3p0i09ir9i3dh7uuqnm5d17i5c"
COGNITO_ISSUER = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_POOL_ID}"
COGNITO_JWKS_URL = f"{COGNITO_ISSUER}/.well-known/jwks.json"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer()

_jwks_cache = None


def _get_jwks():
    global _jwks_cache
    if _jwks_cache is None:
        with urllib.request.urlopen(COGNITO_JWKS_URL) as r:
            _jwks_cache = json.loads(r.read())
    return _jwks_cache


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: int, email: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {"sub": str(user_id), "email": email, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def _verify_cognito_token(token: str) -> dict:
    jwks = _get_jwks()
    header = jwt.get_unverified_header(token)
    key = next((k for k in jwks["keys"] if k["kid"] == header["kid"]), None)
    if not key:
        raise JWTError("Unknown key")
    return jwt.decode(
        token,
        key,
        algorithms=["RS256"],
        audience=COGNITO_CLIENT_ID,
        issuer=COGNITO_ISSUER,
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    token = credentials.credentials

    # 1) 자체 JWT 검증
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user:
            return user
    except (JWTError, KeyError, ValueError):
        pass

    # 2) Cognito JWT 검증
    try:
        payload = _verify_cognito_token(token)
        email = payload.get("email")
        if not email:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="이메일 정보 없음")
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            user = models.User(email=email, password_hash="GOOGLE_SSO")
            db.add(user)
            db.commit()
            db.refresh(user)
        return user
    except JWTError:
        pass

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="유효하지 않은 토큰입니다")
