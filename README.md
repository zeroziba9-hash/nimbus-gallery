# Nimbus Gallery

Cloud-native image hosting platform built on AWS — benchmarking imgbb.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-CloudFront-orange)](https://d1p3tk37npy3ej.cloudfront.net)
[![API Docs](https://img.shields.io/badge/API-FastAPI%20Docs-green)](http://3.34.44.85:8000/docs)

## Live URLs

| Service | URL |
|---|---|
| Frontend | https://d1p3tk37npy3ej.cloudfront.net |
| API Server | http://3.34.44.85:8000 |
| API Docs | http://3.34.44.85:8000/docs |
| Image CDN | https://d1pogf5m0mafe7.cloudfront.net |

## Architecture

![Architecture](docs/architecture.svg)

```
Client
  │
  ├─ HTTPS ──► CloudFront ──► S3 (frontend static)
  │
  └─ HTTP ───► ALB (port 80)
                  │
                  └─► EC2 / FastAPI (Docker, port 8000)
                          │
                          ├─► RDS MySQL       (user / album data)
                          ├─► S3              (presigned upload)
                          └─► Cognito         (Google OAuth)

S3 Upload Event
  └─► SQS
        └─► Lambda
              ├─► PIL          → thumbnail (300×300) → S3
              └─► Rekognition  → labels (top 10, ≥75%) → DynamoDB
```

## AWS Services

| Service | Role |
|---|---|
| S3 | 이미지 원본 저장 + 프론트엔드 정적 호스팅 |
| CloudFront | CDN — 이미지 및 프론트엔드 HTTPS 서빙 |
| Lambda | 썸네일 생성 + AI 태깅 워커 |
| Rekognition | 이미지 자동 분류 (최대 10개 레이블, 신뢰도 75% 이상) |
| SQS | S3 업로드 이벤트 → Lambda 비동기 처리 큐 |
| DynamoDB | 이미지 메타데이터 (태그, CDN URL, 썸네일 URL) |
| RDS MySQL | 유저 / 앨범 관계형 데이터 |
| EC2 | FastAPI 백엔드 (Docker, t3.micro) |
| ECR | 컨테이너 이미지 레지스트리 |
| ALB | EC2 앞단 로드밸런서 (HTTP 80 → 8000) |
| Cognito | 유저 풀 + Google OAuth 2.0 |

## Tech Stack

| Layer | Stack |
|---|---|
| Backend | Python 3.11, FastAPI, SQLAlchemy, PyMySQL |
| Frontend | React 18, Vite |
| Auth | JWT (HS256) + Cognito RS256 dual verification |
| IaC | Terraform (VPC, ALB, EC2, RDS, IAM, Security Groups) |
| CI/CD | GitHub Actions → ECR → EC2 SSH deploy |

## Features

- **Guest upload** — 로그인 없이 이미지 업로드 가능
- **Direct S3 upload** — Presigned URL로 서버 경유 없이 S3 직접 업로드
- **Share modal** — Direct link / Markdown / HTML / BBCode 복사 (imgbb 스타일)
- **AI auto-tagging** — Rekognition이 업로드 즉시 이미지 분류
- **Auto thumbnail** — Lambda가 300×300 썸네일 자동 생성
- **Google login** — Cognito Hosted UI + Google OAuth 2.0

## Image Upload Flow

```
1. Client → POST /api/upload/presigned   (FastAPI, 인증 불필요)
2. FastAPI → S3 Presigned URL 반환
3. Client → S3 직접 PUT 업로드
4. S3 Event → SQS 메시지 발행
5. Lambda → 썸네일(300×300) 생성 → S3 저장
6. Lambda → Rekognition 레이블 분석
7. Lambda → DynamoDB 메타데이터 저장
8. CloudFront URL로 이미지 서빙
```

## Infrastructure (Terraform)

```
VPC 10.0.0.0/16
├── Public Subnet (ALB)
│     ap-northeast-2a  10.0.1.0/24
│     ap-northeast-2c  10.0.2.0/24
└── Private Subnet (EC2 + RDS)
      ap-northeast-2a  10.0.11.0/24
      ap-northeast-2c  10.0.12.0/24

Security Group chain: ALB → EC2 (8000) → RDS (3306)
EC2 IAM: S3FullAccess, DynamoDBFullAccess, ECRReadOnly
```

```bash
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
# terraform.tfvars에 db_password, ec2_key_name 입력

terraform init
terraform plan
terraform apply
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | - | 회원가입 |
| POST | `/api/auth/login` | - | 로그인 (JWT 반환) |
| GET | `/api/auth/me` | JWT | 내 정보 조회 |
| POST | `/api/upload/presigned` | - | S3 Presigned URL 발급 |
| GET | `/api/images` | - | 이미지 목록 조회 |
| DELETE | `/api/images/{key}` | JWT | 이미지 삭제 |

## Local Development

```bash
# Backend
cd backend
pip install -r requirements.txt
DATABASE_URL=mysql+pymysql://... uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## Branch Strategy

```
main      — 배포 브랜치 (PR only)
develop   — 통합 브랜치 (PR only)
feat/*    — 기능 단위 브랜치 (여러 커밋 가능)
```

## CI/CD

`backend/**` push → main 시 자동 실행

```
GitHub Actions
  1. Docker build
  2. ECR push
  3. EC2 SSH → docker pull → docker run
```

## Environment Variables

```env
# backend
DATABASE_URL=mysql+pymysql://admin:password@rds-endpoint:3306/nimbusdb
SECRET_KEY=your-secret-key
AWS_REGION=ap-northeast-2
S3_BUCKET_NAME=nimbus-gallery
CLOUDFRONT_DOMAIN=xxxx.cloudfront.net
```
