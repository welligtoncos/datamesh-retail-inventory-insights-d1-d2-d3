variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "bucket_name" {
  type = string
}

variable "glue_role_arn" {
  type = string
}

variable "script_path" {
  description = "Local path to carregar_origem_dia Glue script"
  type        = string
}

variable "enriquecer_script_path" {
  description = "Local path to enriquecer_dia Glue script"
  type        = string
}

variable "glue_version" {
  description = "Glue Python Shell version"
  type        = string
  default     = "3.9"
}

variable "max_capacity" {
  description = "DPU for Python Shell (1.0 = 1 DPU)"
  type        = number
  default     = 1.0
}
