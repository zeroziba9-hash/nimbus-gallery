# ☁️ Nimbus Gallery

> Cloud-native image hosting platform built on AWS S3, CloudFront CDN, and Rekognition AI

[![Live Demo](https://img.shields.io/badge/Live%20Demo-CloudFront-orange)](https://d1p3tk37npy3ej.cloudfront.net)
[![API](https://img.shields.io/badge/API-FastAPI-green)](http://3.34.44.85:8000/docs)

## Live URLs

| Service | URL |
|---|---|
| **Frontend** | https://d1p3tk37npy3ej.cloudfront.net |
| **API Server** | http://3.34.44.85:8000 |
| **API Docs** | http://3.34.44.85:8000/docs |
| **Image CDN** | https://d1pogf5m0mafe7.cloudfront.net |

![Architecture](docs/architecture.png)

## Overview

Nimbus Gallery is a fully serverless image hosting platform that lets users upload, manage, and share images through a global CDN. Uploaded images are automatically processed — thumbnails are generated, and AI-powered tagging classifies content in real time.

## Features

- **Direct S3 Upload** — Presigned URL 방식으로 서버 부하 없이 S3에 직접 업로드
- **Global CDN** — CloudFront를 통한 전 세계 빠른 이미지 로딩 + HTTPS URL 자동 발급
- **Auto Thumbnail** — S3 업로드 트리거 → Lambda로 썸네일 자동 생성
- **AI Auto Tagging** — AWS Rekognition이 이미지 내용을 자동 분류 (인물/동물/풍경 등)
- **Shareable Links** — 만료 시간이 있는 공유 링크 생성
- **Album Management** — 앨범/폴더 단위 이미지 관리

## Architecture

![Architecture](docs/architecture.svg)

## Tech Stack

| Category | Stack |
|---|---|
| Backend | Python 3.11, FastAPI |
| Frontend | React, JavaScript |
| Storage | AWS S3 |
| CDN | AWS CloudFront |
| Database | AWS RDS (MySQL), DynamoDB |
| AI | AWS Rekognition |
| Compute | AWS EC2, Lambda |
| Queue | AWS SQS |
| Auth | JWT |
| CI/CD | GitHub Actions, AWS ECR |

## AWS Services Used

```
S3              — 이미지 원본 저장
CloudFront      — CDN 및 HTTPS URL 발급
Lambda          — 썸네일 생성 / AI 태깅 워커
Rekognition     — 이미지 자동 분류 및 태깅
SQS             — 이벤트 기반 비동기 처리 큐
RDS (MySQL)     — 유저 / 앨범 데이터
DynamoDB        — 이미지 메타데이터 (태그, URL, 업로드 시각)
EC2             — API 서버 호스팅
ECR             — 컨테이너 이미지 저장소
CloudWatch      — 로그 및 모니터링
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- AWS CLI 설정 완료
- Docker

### Environment Variables

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-northeast-2
S3_BUCKET_NAME=nimbus-gallery
CLOUDFRONT_DOMAIN=d1234abcd.cloudfront.net
DATABASE_URL=mysql+pymysql://user:pass@host/db
```

### Run Locally

```bash
# Backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

### Docker

```bash
docker compose up -d --build
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload/presigned` | Presigned URL 발급 |
| `POST` | `/api/images` | 이미지 메타데이터 저장 |
| `GET` | `/api/images` | 이미지 목록 조회 |
| `GET` | `/api/images/{id}` | 이미지 상세 조회 |
| `DELETE` | `/api/images/{id}` | 이미지 삭제 |
| `POST` | `/api/images/{id}/share` | 공유 링크 생성 |
| `GET` | `/api/albums` | 앨범 목록 조회 |
| `POST` | `/api/albums` | 앨범 생성 |

## Image Processing Flow

```
1. 클라이언트가 /api/upload/presigned 호출
2. 서버가 S3 Presigned URL 반환
3. 클라이언트가 S3에 직접 업로드
4. S3 Event → SQS 메시지 발행
5. Lambda Worker #1: 썸네일(300x300) 생성 후 S3 저장
6. Lambda Worker #2: Rekognition으로 이미지 분석 및 태그 추출
7. DynamoDB에 메타데이터 저장 (CDN URL, 태그, 썸네일 URL)
8. CloudFront URL로 이미지 서빙
```

## License

MIT
