# Deployment Architecture · U1 Dev

```mermaid
flowchart TB
    subgraph Operator["Operador local"]
        TF["terraform apply"]
        CLI["aws s3 cp CSV"]
    end

    subgraph AWS_us_east_1["AWS us-east-1 · dev"]
        S3["S3 retail-inventory-insights-dev"]
        IAM_G["IAM retail-inventory-glue-dev"]
        IAM_L["IAM retail-inventory-lambda-reports-dev"]
        IAM_S["IAM retail-inventory-sfn-dev"]
    end

    TF --> S3
    TF --> IAM_G
    TF --> IAM_L
    TF --> IAM_S
    CLI --> S3

    subgraph Prefixes["Prefixos S3"]
        P1["insumo/"]
        P2["origem/dt=/"]
        P3["enriquecido/dt=/"]
        P4["relatorios/D1|D2|D3/"]
    end

    S3 --> Prefixes
```

## Deploy Sequence

1. Configure AWS credentials (profile ou env) com permissão IAM+S3
2. `cd terraform/environments/dev`
3. `terraform init`
4. `terraform plan -var-file=dev.tfvars`
5. `terraform apply -var-file=dev.tfvars`
6. Upload CSV: `aws s3 cp ../../../retail_store_inventory.csv s3://retail-inventory-insights-dev/insumo/ --region us-east-1`
7. Validar: `aws s3 ls s3://retail-inventory-insights-dev/ --recursive`

## Rollback

```bash
terraform destroy -var-file=dev.tfvars
```

**Atenção:** destroy remove bucket se vazio ou force; dados em S3 serão perdidos.

## Future attachment (W2+)

| Onda | Recurso | Role |
|------|---------|------|
| W2 | Glue Job origem | glue-dev |
| W3 | Glue Job enriquecido | glue-dev |
| W4 | Step Functions | sfn-dev |
| W5 | Lambda D-1 | lambda-reports-dev |
