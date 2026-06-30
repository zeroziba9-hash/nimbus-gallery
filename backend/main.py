<<<<<<< HEAD
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
import boto3
import uuid

from database import engine, get_db
import models
import auth

models.Base.metadata.create_all(bind=engine)
=======
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
import boto3
import uuid
from sqlalchemy.orm import Session
from database import get_db, engine
from models import Base, User, Image as ImageModel
from auth import hash_password, verify_password, create_access_token, get_current_user

Base.metadata.create_all(bind=engine)
>>>>>>> origin/main

app = FastAPI(title="Nimbus Gallery API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

S3_BUCKET = "nimbus-gallery"
CLOUDFRONT_DOMAIN = "d1pogf5m0mafe7.cloudfront.net"
AWS_REGION = "ap-northeast-2"

s3 = boto3.client("s3", region_name=AWS_REGION)
dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
table = dynamodb.Table("nimbus-images")


# ── Auth schemas ──────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: str
    tier: str


# ── Image schemas ─────────────────────────────────────────────

class PresignedUrlRequest(BaseModel):
    filename: str
    content_type: str


class PresignedUrlResponse(BaseModel):
    upload_url: str
    image_key: str
    cdn_url: str


<<<<<<< HEAD
# ── Auth endpoints ────────────────────────────────────────────
=======
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

>>>>>>> origin/main

@app.get("/")
def root():
    return {"message": "Nimbus Gallery API", "status": "ok"}


<<<<<<< HEAD
@app.post("/api/auth/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == req.email).first():
        raise HTTPException(status_code=400, detail="이미 사용 중인 이메일입니다")
    user = models.User(
        email=req.email,
        password_hash=auth.hash_password(req.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = auth.create_access_token(user.id, user.email)
    return TokenResponse(access_token=token, email=user.email, tier=user.tier)


@app.post("/api/auth/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user or not auth.verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다")
    token = auth.create_access_token(user.id, user.email)
    return TokenResponse(access_token=token, email=user.email, tier=user.tier)


@app.get("/api/auth/me")
def me(current_user: models.User = Depends(auth.get_current_user)):
    return {"id": current_user.id, "email": current_user.email, "tier": current_user.tier}


# ── Image endpoints (JWT 보호) ─────────────────────────────────

=======
@app.post("/api/auth/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="이미 존재하는 이메일입니다")
    user = User(email=req.email, password_hash=hash_password(req.password))
    db.add(user)
    db.commit()
    return TokenResponse(access_token=create_access_token({"sub": user.email}))


@app.post("/api/auth/login", response_model=TokenResponse)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다")
    return TokenResponse(access_token=create_access_token({"sub": user.email}))


@app.get("/api/auth/me")
def me(current_user: User = Depends(get_current_user)):
    return {"email": current_user.email, "tier": current_user.tier}


>>>>>>> origin/main
@app.post("/api/upload/presigned", response_model=PresignedUrlResponse)
def get_presigned_url(req: PresignedUrlRequest):
    ext = req.filename.rsplit(".", 1)[-1].lower()
    image_key = f"images/{uuid.uuid4()}.{ext}"
    try:
        upload_url = s3.generate_presigned_url(
            "put_object",
            Params={"Bucket": S3_BUCKET, "Key": image_key, "ContentType": req.content_type},
            ExpiresIn=300,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Presigned URL 생성 실패")

    cdn_url = f"https://{CLOUDFRONT_DOMAIN}/{image_key}"
    return PresignedUrlResponse(upload_url=upload_url, image_key=image_key, cdn_url=cdn_url)


@app.get("/api/images")
def list_images():
    try:
        response = s3.list_objects_v2(Bucket=S3_BUCKET, Prefix="images/")
        images = []
        for obj in response.get("Contents", []):
            key = obj["Key"]
            db_item = table.get_item(Key={"image_key": key}).get("Item", {})
            images.append({
                "key": key,
                "cdn_url": f"https://{CLOUDFRONT_DOMAIN}/{key}",
                "size": obj["Size"],
                "uploaded_at": obj["LastModified"].isoformat(),
                "tags": db_item.get("tags", []),
            })
        return {"images": images, "count": len(images)}
    except Exception as e:
        raise HTTPException(status_code=500, detail="이미지 목록 조회 실패")


@app.delete("/api/images/{image_key:path}")
def delete_image(
    image_key: str,
    current_user: models.User = Depends(auth.get_current_user),
):
    try:
        s3.delete_object(Bucket=S3_BUCKET, Key=image_key)
        return {"message": "삭제 완료", "key": image_key}
    except Exception as e:
        raise HTTPException(status_code=500, detail="삭제 실패")
