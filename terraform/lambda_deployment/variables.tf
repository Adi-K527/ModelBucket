variable "access_key" {
  description  = "AWS access key"
  type         = string
}

variable "secret_access_key" {
  description  = "AWS secret access key"
  type         = string
}

variable "file_name" {
  description  = "Name of model"
  type         = string
}

variable "account_id" {
  description  = "aws account id"
  type         = string
}

variable "mb_ecr_name" {
  description  = "ECR Repo for ModelBucket"
  type         = string
}

variable "image_tag" {
  description  = "Image tag of image in the ecr repo"
  type         = string
}

variable "bucket_name" {
  description  = "Image tag of image in the ecr repo"
  type         = string
}

# 
