# Integration Test Instructions · U1 Infra

Integration tests for U1 verify Terraform modules compose correctly and AWS API accepts the configuration.

## Scope

- S3 module + IAM module wired in dev environment
- No cross-service runtime (Glue/Lambda) until W2+

## Steps

### 1. Plan integration (no AWS changes)

```powershell
cd terraform/environments/dev
terraform init
terraform plan -var-file=dev.tfvars -out=tfplan
```

Review plan: IAM role trust policies reference correct services; S3 bucket policy denies HTTP.

### 2. Apply integration

```powershell
terraform apply tfplan
```

### 3. Cross-check IAM ↔ S3

Verify Glue role policy resources reference `module.s3.bucket_arn`:

```powershell
aws iam get-role-policy --role-name retail-inventory-glue-dev --policy-name retail-inventory-insights-glue-s3-dev
```

Confirm resources point to `retail-inventory-insights-dev` bucket ARNs only.

### 4. Upload + read test (E1-US02)

```powershell
aws s3 cp ../../../retail_store_inventory.csv s3://retail-inventory-insights-dev/insumo/retail_store_inventory.csv --region us-east-1
aws s3 ls s3://retail-inventory-insights-dev/insumo/ --region us-east-1
```

## Future integration (W2+)

- Glue job assumes `retail-inventory-glue-dev` and writes to `origem/dt=`
- Parity test E2-US03 vs local parquet

## N/A

- Performance tests
- End-to-end pipeline (requires W2–W5)
