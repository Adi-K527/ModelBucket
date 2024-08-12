output "s3_bucket" {
  value = aws_s3_bucket.mb_bucket.arn
}

output "backend_url" {
  value = google_cloud_run_service.cr_backend.status[0].url
}

output "frontend_url" {
  value = google_cloud_run_service.cr_frontend.status[0].url
}