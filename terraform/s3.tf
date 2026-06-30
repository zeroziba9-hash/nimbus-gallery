resource "aws_s3_bucket_cors_configuration" "gallery" {
  bucket = "nimbus-gallery"

  cors_rule {
    allowed_origins = ["https://d1p3tk37npy3ej.cloudfront.net"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_headers = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_cors_configuration" "frontend" {
  bucket = "nimbus-gallery-frontend"

  cors_rule {
    allowed_origins = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_headers = ["*"]
    max_age_seconds = 3000
  }
}
