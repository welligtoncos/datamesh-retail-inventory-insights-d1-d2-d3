# Build Instructions · U1 Infra

## Prerequisites

- Terraform >= 1.5.0
- AWS CLI v2 configured for sa-east-1
- IAM permissions: `s3:*` (bucket management), `iam:*` (roles/policies) on target account

## Build Steps

### 1. Initialize Terraform

```powershell
cd terraform/environments/dev
terraform init
```

### 2. Validate configuration

```powershell
terraform validate
terraform fmt -check -recursive ../../..
```

### 3. Plan (dry run)

```powershell
terraform plan -var-file=dev.tfvars
```

Expected: ~1 S3 bucket, ~6 S3 objects (.keep), 3 IAM roles, policies, bucket policy.

### 4. Apply

```powershell
terraform apply -var-file=dev.tfvars
```

### 5. Verify outputs

```powershell
terraform output
```

## Build Artifacts

- AWS resources in account (not local binaries)
- Local: `terraform/environments/dev/terraform.tfstate` (gitignored)

## Troubleshooting

### Bucket name already exists
- S3 names are global; change `bucket_name` in `dev.tfvars` or use another account.

### AccessDenied on apply
- Ensure IAM user/role has permissions to create S3 buckets and IAM roles.

### Terraform provider download fails
- Check network/proxy; run `terraform init -upgrade`.
