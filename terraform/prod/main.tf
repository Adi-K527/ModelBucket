terraform {
  required_version = ">= 1.0.0, < 2.0.0"

  required_providers {
    aws = {
        source  = "hashicorp/aws"
        version = "~>4.0"
    }
    google = {
      source = "hashicorp/google"
      version = "~>4.0"
    }
  }
  backend "s3" {
    bucket  = "modelbucket-state-bucket"
    key     = "global/s3/main/terraform.tfstate"
    region  = "us-east-1"
    encrypt = true
  }
}

provider "aws" {
  region     = "us-east-1"
  access_key = var.access_key
  secret_key = var.secret_access_key
}

provider "google" {
  project     = "modelbucket"
  region      = "us-central1"
}