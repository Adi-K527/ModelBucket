resource "aws_s3_bucket" "mb_bucket" {
    bucket = "mb-bucket-5125"
}

resource "aws_s3_object" "models_folder" {
    bucket = aws_s3_bucket.mb_bucket.id
    key = "models/"
}

resource "aws_s3_object" "dependencies_folder" {
    bucket = aws_s3_bucket.mb_bucket.id
    key = "dependencies/"
}

resource "aws_ecr_repository" "mb_ecr_repo" {
  name = "model_bucket_ecr"
}