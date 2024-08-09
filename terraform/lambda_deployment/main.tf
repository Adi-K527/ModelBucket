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
    key     = "global/s3/lambda_deployments/lambda_deployments.tfstate"
    region  = "us-east-1"
    encrypt = true
  }
}

provider "aws" {
  region     = "us-east-1"
  access_key = var.access_key
  secret_key = var.secret_access_key
}


data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

data "aws_iam_policy_document" "lambda_policy" {
  statement {
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    resources = ["arn:aws:logs:*:*:*"]
  }
}

resource "aws_iam_role" "iam_for_lambda" {
  name               = "mb-lambda-deployment-iam-role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_iam_policy" "lambda_policy" {
  name   = "mb-lambda-deployment-policy"
  policy = data.aws_iam_policy_document.lambda_policy.json
}

resource "aws_iam_role_policy_attachment" "lambda_policy_attachment" {
  role       = aws_iam_role.iam_for_lambda.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}

resource "random_uuid" "lambda_id" {}

resource "aws_lambda_function" "modelbucket_deployment_function" {
  image_uri      = "${var.account_id}.dkr.ecr.us-east-1.amazonaws.com/${var.mb_ecr_name}:${var.image_tag}"
  function_name  = "${var.file_name}"
  package_type   = "Image"
  role           = aws_iam_role.iam_for_lambda.arn

  environment {
    variables = {
      MY_AWS_ACCESS_THING = "${var.access_key}"
      AWS_SECRET_ACCESS   = "${var.secret_access_key}"
      AWS_BUCKET          = "${var.bucket_name}"
      MODEL_NAME          = "${var.file_name}"
    }
  }
}

