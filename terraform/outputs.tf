output "alb_dns" {
  description = "ALB DNS (API endpoint)"
  value       = aws_lb.main.dns_name
}

output "ec2_private_ip" {
  description = "EC2 private IP"
  value       = aws_instance.api.private_ip
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = aws_db_instance.mysql.endpoint
}

output "vpc_id" {
  value = aws_vpc.main.id
}
