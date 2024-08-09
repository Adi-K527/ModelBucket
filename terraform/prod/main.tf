terraform {
  required_version = ">= 1.0.0, < 2.0.0"

  required_providers {
    aws = {
        source  = "hashicorp/aws"
        version = "~>4.0"
    }
  }
  backend "s3" {
    bucket  = "modelbucket-state-bucket"
    key     = "global/s3/terraform.tfstate"
    region  = "us-east-1"
    encrypt = true
  }
}

provider "aws" {
  region     = "us-east-1"
  access_key = var.access_key
  secret_key = var.secret_access_key
}

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


