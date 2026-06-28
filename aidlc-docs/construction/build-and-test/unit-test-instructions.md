# Unit Test Instructions · U1 Infra

U1 is infrastructure-only; no unit test framework. Validation is **manual checklist** post-apply.

## W1 Validation Checklist

### E1-US01 · Buckets e prefixos

- [ ] `terraform apply` succeeded
- [ ] `aws s3 ls s3://retail-inventory-insights-dev/` shows prefix markers
- [ ] Block Public Access enabled (Console → bucket → Permissions)
- [ ] Default encryption SSE-S3 enabled
- [ ] Tags: Project, Environment, ManagedBy present

### E1-US02 · Insumo no S3

- [ ] CSV uploaded to `insumo/retail_store_inventory.csv`
- [ ] File readable: `aws s3 cp s3://retail-inventory-insights-dev/insumo/retail_store_inventory.csv - | head -1`
- [ ] 15 columns in header match notebook SCHEMA

### E1-US03 · IAM least privilege

- [ ] Roles exist: glue-dev, lambda-reports-dev, sfn-dev
- [ ] Glue role: no write on `relatorios/`
- [ ] Lambda role: no write on `origem/` or `enriquecido/`
- [ ] No policy with `"Action": "s3:*"` or `"Resource": "*"` for S3 data

### E1-US04 · Mapa analista

- [ ] `terraform/README.md` table reviewed
- [ ] `terraform output example_paths` matches documented paths

## Automated validation (optional)

```powershell
cd terraform/environments/dev
terraform validate
terraform plan -var-file=dev.tfvars -detailed-exitcode
# exit 0 = no changes; 2 = changes pending
```
