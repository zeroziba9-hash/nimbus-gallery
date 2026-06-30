variable "aws_region" {
  default = "ap-northeast-2"
}

variable "project" {
  default = "nimbus-gallery"
}

variable "db_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}

variable "ec2_key_name" {
  description = "EC2 Key Pair name"
  default     = "nimbus-key"
}
