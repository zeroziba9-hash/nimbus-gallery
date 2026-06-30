import boto3
import os
import io
from datetime import datetime, timezone
from PIL import Image

s3 = boto3.client("s3")
rekognition = boto3.client("rekognition", region_name="ap-northeast-2")
dynamodb = boto3.resource("dynamodb", region_name="ap-northeast-2")
table = dynamodb.Table("nimbus-images")

THUMBNAIL_SIZE = (300, 300)
THUMBNAIL_PREFIX = "thumbnails/"
CLOUDFRONT_DOMAIN = "d1pogf5m0mafe7.cloudfront.net"


def lambda_handler(event, context):
    for record in event["Records"]:
        # SQS 래핑 처리
        if "body" in record:
            import json
            s3_event = json.loads(record["body"])
            s3_record = s3_event["Records"][0]
        else:
            s3_record = record

        bucket = s3_record["s3"]["bucket"]["name"]
        key = s3_record["s3"]["object"]["key"]

        if not key.startswith("images/"):
            continue

        # 썸네일 생성
        response = s3.get_object(Bucket=bucket, Key=key)
        image_data = response["Body"].read()

        image = Image.open(io.BytesIO(image_data))
        image.thumbnail(THUMBNAIL_SIZE)

        if image.mode in ("RGBA", "P"):
            image = image.convert("RGB")

        buffer = io.BytesIO()
        image.save(buffer, format="JPEG", quality=85)
        buffer.seek(0)

        filename = os.path.basename(key)
        thumbnail_key = f"{THUMBNAIL_PREFIX}{filename}"

        s3.put_object(
            Bucket=bucket,
            Key=thumbnail_key,
            Body=buffer,
            ContentType="image/jpeg",
        )
        print(f"썸네일 생성 완료: {thumbnail_key}")

        # Rekognition AI 태깅
        rek_response = rekognition.detect_labels(
            Image={"S3Object": {"Bucket": bucket, "Name": key}},
            MaxLabels=10,
            MinConfidence=75,
        )
        tags = [label["Name"] for label in rek_response["Labels"]]
        print(f"AI 태그: {tags}")

        # DynamoDB 저장
        table.put_item(Item={
            "image_key": key,
            "thumbnail_key": thumbnail_key,
            "cdn_url": f"https://{CLOUDFRONT_DOMAIN}/{key}",
            "thumbnail_url": f"https://{CLOUDFRONT_DOMAIN}/{thumbnail_key}",
            "tags": tags,
            "uploaded_at": datetime.now(timezone.utc).isoformat(),
        })
        print(f"DynamoDB 저장 완료: {key}")

    return {"statusCode": 200, "body": "처리 완료"}
