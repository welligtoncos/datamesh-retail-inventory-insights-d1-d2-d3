# AI-DLC no Cursor — configuração deste projeto

Este projeto usa o **AI-DLC** (AI-Driven Development Life Cycle): uma metodologia em que o agente planeja antes de codar, faz perguntas quando necessário e pede aprovação por etapa.

O Cursor **não** lê regras em pastas arbitrárias. Ele só carrega **Project Rules** de `.cursor/rules/`. Por isso a pasta `aidlc-rules/` (fonte) precisa ser “ativada” com os comandos abaixo.

## O que fica ativo depois da configuração

| Caminho | Função |
|---------|--------|
| `.cursor/rules/ai-dlc-workflow.mdc` | Regra principal — injetada em **todo** chat do projeto |
| `.aidlc-rule-details/` | Regras detalhadas por fase (inception, construction, etc.) |
| `aidlc-rules/` | **Fonte** versionada — não é lida pelo Cursor diretamente |

Em **Settings → Rules**, deve aparecer `ai-dlc-workflow` com `alwaysApply: true`.

## Resumo das três ações

1. **Criar a pasta que o Cursor lê** — `.cursor/rules/` é o único local de Project Rules automáticas.
2. **Montar o arquivo de regra principal** — frontmatter (`.mdc`) + corpo de `core-workflow.md` num único arquivo.
3. **Copiar as regras detalhadas** — de `aidlc-rules/aws-aidlc-rule-details/` para `.aidlc-rule-details/` (caminho que o workflow consulta no Cursor).

## Configuração no Windows (PowerShell)

Execute na **raiz do projeto** (`project-datamesh-1`):

```powershell
New-Item -ItemType Directory -Force -Path ".cursor\rules"

$frontmatter = @"
---
description: "AI-DLC (AI-Driven Development Life Cycle) adaptive workflow for software development"
alwaysApply: true
---

"@
$frontmatter | Out-File -FilePath ".cursor\rules\ai-dlc-workflow.mdc" -Encoding utf8

Get-Content "aidlc-rules\aws-aidlc-rules\core-workflow.md" | Add-Content ".cursor\rules\ai-dlc-workflow.mdc"

New-Item -ItemType Directory -Force -Path ".aidlc-rule-details"
Copy-Item "aidlc-rules\aws-aidlc-rule-details\*" ".aidlc-rule-details\" -Recurse
```

### O que cada comando faz

| Comando | Efeito |
|---------|--------|
| `New-Item ... ".cursor\rules"` | Cria o diretório onde o Cursor carrega Project Rules |
| `Out-File ... ai-dlc-workflow.mdc` | Escreve o cabeçalho YAML: `description` + `alwaysApply: true` |
| `Get-Content ... \| Add-Content` | Anexa o workflow completo (`core-workflow.md`) abaixo do frontmatter |
| `New-Item ... ".aidlc-rule-details"` | Pasta oculta onde o agente busca regras por fase |
| `Copy-Item ... -Recurse` | Copia inception, construction, common, extensions, etc. |

## Equivalente em bash (Linux / macOS / Git Bash)

```bash
mkdir -p .cursor/rules

cat > .cursor/rules/ai-dlc-workflow.mdc << 'EOF'
---
description: "AI-DLC (AI-Driven Development Life Cycle) adaptive workflow for software development"
alwaysApply: true
---

EOF

cat aidlc-rules/aws-aidlc-rules/core-workflow.md >> .cursor/rules/ai-dlc-workflow.mdc

mkdir -p .aidlc-rule-details
cp -r aidlc-rules/aws-aidlc-rule-details/* .aidlc-rule-details/
```

## Estrutura de pastas

```
project-datamesh-1/
├── .cursor/
│   └── rules/
│       └── ai-dlc-workflow.mdc      ← regra ativa (gerada)
├── .aidlc-rule-details/             ← detalhes ativos (cópia)
│   ├── common/
│   ├── inception/
│   ├── construction/
│   ├── operations/
│   └── extensions/
└── aidlc-rules/                     ← fonte (versionar no git)
    ├── VERSION
    ├── aws-aidlc-rules/
    │   └── core-workflow.md
    └── aws-aidlc-rule-details/
        └── ...
```

## Atualizar regras após mudar a fonte

Se `aidlc-rules/` for atualizado (nova versão do AI-DLC), rode de novo os comandos de cópia:

```powershell
# Recriar regra principal
$frontmatter = @"
---
description: "AI-DLC (AI-Driven Development Life Cycle) adaptive workflow for software development"
alwaysApply: true
---

"@
$frontmatter | Out-File -FilePath ".cursor\rules\ai-dlc-workflow.mdc" -Encoding utf8
Get-Content "aidlc-rules\aws-aidlc-rules\core-workflow.md" | Add-Content ".cursor\rules\ai-dlc-workflow.mdc"

# Recopiar detalhes
Remove-Item ".aidlc-rule-details\*" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item "aidlc-rules\aws-aidlc-rule-details\*" ".aidlc-rule-details\" -Recurse
```

## Verificar se está funcionando

1. Abra **Cursor → Settings → Rules** e confirme `ai-dlc-workflow` listada.
2. Inicie um chat novo no projeto e peça algo de desenvolvimento — o agente deve seguir o fluxo adaptativo (planejar, perguntar, pedir aprovação) em vez de codar direto.
3. Confirme que existem `.cursor/rules/ai-dlc-workflow.mdc` e `.aidlc-rule-details/common/process-overview.md`.

## Versão das regras

Versão da fonte em `aidlc-rules/VERSION` (atual: **1.0.0**).

## Observações

- **`aidlc-rules/` sozinha não basta** — o Cursor ignora essa pasta até os arquivos estarem em `.cursor/rules/` e `.aidlc-rule-details/`.
- **`alwaysApply: true`** faz a regra valer em toda conversa do projeto; remova ou mude para `false` se quiser ativar só sob demanda.
- O workflow procura detalhes nesta ordem: `.aidlc/aidlc-rules/...`, **`.aidlc-rule-details/`** (setup Cursor), `.kiro/...`, `.amazonq/...` — este projeto usa `.aidlc-rule-details/`.
