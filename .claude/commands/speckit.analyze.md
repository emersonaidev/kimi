---
description: Executa uma análise de consistência e qualidade entre spec.md, plan.md e tasks.md após a geração das tarefas, sem modificar ficheiros.
---

## Entrada do Utilizador

```text
$ARGUMENTS
```

Deves **OBRIGATORIAMENTE** considerar o texto introduzido pelo utilizador antes de prosseguir (caso não esteja vazio).

## Objetivo

Identificar inconsistências, duplicações, ambiguidades e itens subespecificados entre os três artefactos principais (`spec.md`, `plan.md`, `tasks.md`) antes da implementação.  
Este comando deve ser executado **após** o `/speckit.tasks` gerar um `tasks.md` completo.

## Restrições Operacionais

**APENAS LEITURA** — nunca modifica ficheiros. Gera um relatório de análise estruturado e oferece um plano de correção opcional (apenas sugerido; nunca automático).

**Autoridade da Constituição:** o ficheiro `.specify/memory/constitution.md` é **não negociável** neste contexto.  
Conflitos com princípios definidos são sempre **CRÍTICOS** e requerem ajustes na spec, plano ou tarefas — nunca ignorados ou reinterpretados.  
Alterações à constituição devem ser feitas manualmente fora do `/speckit.analyze`.

## Passos de Execução

### 1. Inicializar Contexto de Análise

Executa `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` na raiz do repositório e faz parsing do JSON para obter `FEATURE_DIR` e `AVAILABLE_DOCS`.  
Determina caminhos absolutos:

- SPEC = FEATURE_DIR/spec.md  
- PLAN = FEATURE_DIR/plan.md  
- TASKS = FEATURE_DIR/tasks.md  

Se algum ficheiro obrigatório estiver em falta, aborta com mensagem de erro e instrui o utilizador a gerar o artefacto em falta.  
Para aspas simples em argumentos como “I'm Groot”, usa `'\''` (ou aspas duplas: `"I'm Groot"`).

### 2. Carregar Artefactos (Leitura Progressiva)

Carrega apenas o contexto mínimo necessário de cada artefacto:

**De spec.md:**
- Contexto / Visão Geral
- Requisitos Funcionais
- Requisitos Não Funcionais
- User Stories
- Casos Limite (se existirem)

**De plan.md:**
- Escolhas de arquitetura / stack
- Referências de modelo de dados
- Fases
- Restrições técnicas

**De tasks.md:**
- IDs das tarefas
- Descrições
- Agrupamento por fase
- Marcadores paralelos [P]
- Caminhos de ficheiros referenciados

**Da constituição:**
- Carrega `.specify/memory/constitution.md` para validação de princípios.

### 3. Criar Modelos Semânticos

Gera representações internas (não incluídas no output final):

- **Inventário de requisitos:** cada requisito funcional/não funcional com uma chave estável (slug derivado da frase principal).  
- **Inventário de ações / user stories:** ações discretas com critérios de aceitação.  
- **Mapeamento de cobertura de tarefas:** cada tarefa associada a um ou mais requisitos ou stories (por inferência ou referência).  
- **Conjunto de regras da constituição:** princípios com declarações MUST/SHOULD.

### 4. Passes de Deteção (Análise Otimizada)

Limita a 50 resultados detalhados; restantes são sumarizados.

#### A. Deteção de Duplicações
- Identifica requisitos quase idênticos.
- Assinala versões redundantes para consolidação.

#### B. Deteção de Ambiguidade
- Marca adjetivos vagos (“rápido”, “seguro”, “robusto”) sem critério mensurável.  
- Marca placeholders não resolvidos (TODO, ???, `<placeholder>`, etc.).

#### C. Subespecificação
- Requisitos com verbo mas sem objeto ou resultado mensurável.  
- User stories sem critérios de aceitação.  
- Tarefas que referenciam ficheiros/componentes não definidos em spec/plan.

#### D. Alinhamento com a Constituição
- Qualquer requisito ou plano que contradiga um princípio “MUST”.  
- Falta de secções mandatórias ou quality gates previstos.

#### E. Lacunas de Cobertura
- Requisitos sem tarefas associadas.  
- Tarefas sem requisito/story associado.  
- Requisitos não funcionais (ex.: performance, segurança) sem tarefas correspondentes.

#### F. Inconsistências
- Deriva terminológica (mesmo conceito com nomes diferentes).  
- Entidades de dados referidas em plan mas ausentes da spec (ou vice-versa).  
- Ordem de tarefas incorreta (ex.: integração antes do setup).  
- Requisitos contraditórios (ex.: uma parte exige Next.js, outra Vue).

### 5. Atribuição de Severidade

Heurística de priorização:

- **CRÍTICO** — violações da constituição, requisitos centrais sem cobertura.  
- **ALTO** — duplicações ou conflitos, atributos vagos de segurança/performance.  
- **MÉDIO** — deriva terminológica, ausência de tarefas não funcionais.  
- **BAIXO** — melhorias de estilo ou redundâncias menores.

### 6. Gerar Relatório de Análise

Output em Markdown (sem escrita de ficheiros):

## Relatório de Análise da Especificação

| ID | Categoria | Severidade | Localização | Resumo | Recomendação |
|----|------------|-------------|--------------|---------|---------------|
| A1 | Duplicação | ALTO | spec.md:L120-134 | Dois requisitos semelhantes ... | Consolidar e manter versão mais clara |

**Resumo de Cobertura:**

| Requisito | Tem Tarefa? | IDs de Tarefas | Notas |
|------------|-------------|----------------|-------|

**Problemas de Alinhamento com Constituição:** (se existirem)

**Tarefas Não Mapeadas:** (se existirem)

**Métricas:**  
- Total de Requisitos  
- Total de Tarefas  
- Percentagem de Cobertura (requisitos com ≥1 tarefa)  
- Contagem de Ambiguidades  
- Contagem de Duplicações  
- Contagem de Problemas Críticos

### 7. Próximas Ações

Inclui no final do relatório:

- Se existirem CRÍTICOS → resolver antes de `/speckit.implement`.  
- Se apenas BAIXOS/MÉDIOS → pode prosseguir, mas recomenda melhorias.  
- Sugere comandos específicos:  
  - `/speckit.specify` (refinar requisitos)  
  - `/speckit.plan` (ajustar arquitetura)  
  - Editar manualmente `tasks.md` para cobrir gaps.

### 8. Plano de Correção Opcional

Pergunta: “Queres que eu sugira correções concretas para os N principais problemas?”  
(Nunca aplica automaticamente.)

## Princípios de Operação

### Eficiência de Contexto
- Foco em achados de alto valor (não exaustivo).  
- Leitura progressiva e incremental.  
- Output compacto e determinístico (máx. 50 linhas de findings).

### Diretrizes de Análise
- **Nunca modificar ficheiros**.  
- **Nunca inventar secções ausentes** (reportar tal qual).  
- **Dar prioridade a violações da constituição.**  
- **Fornecer exemplos específicos, não regras genéricas.**  
- **Reportar zero problemas de forma limpa** (mostrar métricas e mensagem de sucesso).

## Contexto

$ARGUMENTS
