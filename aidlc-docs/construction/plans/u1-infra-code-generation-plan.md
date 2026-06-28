# Code Generation Plan · U1 Infra

**Stories:** E1-US01, E1-US02, E1-US03, E1-US04  
**Approved:** 2026-06-28 (Approve & Continue)

## Unit Context

- Brownfield: notebook unchanged
- New IaC at workspace root `terraform/`
- No Glue, Lambda, Step Functions resources

## Steps

- [x] Step 1: Create `terraform/modules/s3` (bucket, BPA, SSE, TLS policy, prefix markers)
- [x] Step 2: Create `terraform/modules/iam` (glue, lambda, sfn roles + scoped policies)
- [x] Step 3: Create `terraform/environments/dev` (root module, versions, tfvars)
- [x] Step 4: Create `terraform/README.md` (deploy, upload CSV, local→S3 map E1-US04)
- [x] Step 5: Update `.gitignore` for Terraform state
- [x] Step 6: Create `aidlc-docs/construction/u1-infra/code/code-summary.md`
- [x] Step 7: Create build-and-test instructions

## Story Traceability

| Step | Story |
|------|-------|
| 1 | E1-US01 |
| 2 | E1-US03 |
| 3 | E1-US01, E1-US03 |
| 4 | E1-US02, E1-US04 |
