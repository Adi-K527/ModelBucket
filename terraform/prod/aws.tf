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

resource "aws_s3_object" "preprocessors_folder" {
    bucket = aws_s3_bucket.mb_bucket.id
    key = "preprocessors/"
}

resource "aws_s3_object" "eval_data_folder" {
    bucket = aws_s3_bucket.mb_bucket.id
    key = "eval-data/"
}

resource "aws_s3_object" "train_data_folder" {
    bucket = aws_s3_bucket.mb_bucket.id
    key = "train-data/"
}

resource "aws_s3_object" "source_data_folder" {
    bucket = aws_s3_bucket.mb_bucket.id
    key = "source-data/"
}

resource "aws_ecr_repository" "mb_ecr_repo" {
  name = "model_bucket_ecr"
}