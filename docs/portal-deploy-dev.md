# Portal deploy dev (E8-US12)

Guia para publicar o BFF FastAPI no ECS e validar E2E com o Angular no CloudFront.

## Pré-requisitos

- Docker Desktop
- AWS CLI autenticado (conta `303238378103`, região `us-east-1`)
- Terraform >= 1.5
- Portal infra E8-US01 já aplicada (`enable_portal = true`)

## 1. Criar repositório ECR (primeira vez)

```powershell
cd terraform\environments\dev
terraform init
terraform apply -var-file=dev.tfvars
```

Isso cria `aws_ecr_repository.portal_api` via `terraform/modules/portal/ecr.tf`.

## 2. Build e deploy da imagem

Na raiz do repositório:

```powershell
.\scripts\w7-us12-deploy.ps1
```

O script:

1. Faz `docker build` em `portal-api/`
2. Faz push para ECR `retail-inventory-insights-portal-api-dev`
3. Aplica Terraform com `-var=portal_api_image=<uri>`

## 3. Validar

```powershell
.\scripts\w7-us12-validate.ps1
```

Testes locais: pytest + smoke import.

Smoke remoto (substitua pela URL do API GW):

```powershell
curl https://jvpw3k4mnf.execute-api.us-east-1.amazonaws.com/health
```

## 4. E2E manual

1. Abra `https://d3g8ihrhzv7hsx.cloudfront.net/`
2. Login Cognito
3. Home — sem chip "Dados de demonstração"
4. Insights D-1 `dt=2022-01-01` — 69 produtos, 14484 unidades
5. Baixar Excel — arquivo `.xlsx` válido
6. Enriquecido / Origem / Insumos — dados reais
7. Operações — disparar esteira (opcional)
8. Athena `partition_sanity` em `/enriquecido/athena`
9. `/ops/alarms` — estado do alarme SFN

## Desenvolvimento local (sem ECS)

```powershell
cd portal-api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
$env:DATAMESH_BUCKET = "retail-inventory-insights-dev-use1"
$env:SFN_STATE_MACHINE_ARN = "arn:aws:states:us-east-1:303238378103:stateMachine:retail-inventory-insights-processar-dia-dev"
uvicorn app.main:app --reload --port 8080
```

Ajuste `portal-web/proxy.conf.json` para `http://localhost:8080` se quiser testar o Angular contra o BFF local.

## Variáveis de ambiente (ECS)

| Variável | Descrição |
|----------|-----------|
| `DATAMESH_BUCKET` | Bucket datamesh |
| `SFN_STATE_MACHINE_ARN` | ARN processar_dia |
| `ATHENA_DATABASE` | Glue database |
| `ATHENA_WORKGROUP` | Workgroup Athena |
| `SFN_ALARM_NAME` | Alarme CloudWatch SFN |

## Rollback

Para voltar ao placeholder nginx:

```powershell
terraform apply -var-file=dev.tfvars -var='portal_api_image='
```
