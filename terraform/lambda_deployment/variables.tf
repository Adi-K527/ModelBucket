variable "access_key" {
  description  = "AWS access key"
  type         = string
}

variable "secret_access_key" {
  description  = "AWS secret access key"
  type         = string
}

variable "model_name" {
  description  = "Name of model"
  type         = string
}

variable "mb_ecr_repo" {
  description  = "ECR Repo for ModelBucket"
  type         = string
}