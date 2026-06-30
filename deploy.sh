#!/bin/bash
set -e

EC2_IP="3.34.44.85"
KEY="nimbus-key.pem"
REMOTE="ubuntu@$EC2_IP"

echo "=== nimbus-gallery 배포 시작 ==="

# 코드 전송
ssh -i $KEY -o StrictHostKeyChecking=no $REMOTE "mkdir -p ~/nimbus-gallery/backend"
scp -i $KEY -o StrictHostKeyChecking=no backend/main.py backend/requirements.txt $REMOTE:~/nimbus-gallery/backend/

# 의존성 설치 및 서버 실행
ssh -i $KEY $REMOTE << 'ENDSSH'
cd ~/nimbus-gallery/backend
pip3 install -r requirements.txt -q
pkill -f uvicorn || true
nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 > ~/uvicorn.log 2>&1 &
echo "FastAPI 서버 시작 완료"
ENDSSH

echo "=== 배포 완료 ==="
echo "API: http://$EC2_IP:8000"
echo "Docs: http://$EC2_IP:8000/docs"
