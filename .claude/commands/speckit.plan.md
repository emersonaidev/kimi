---
description: Executa o fluxo de planeamento de implementação usando o template de plano para gerar artefactos de design.
---

## Entrada do Utilizador

```text
$ARGUMENTS
```

Deves **OBRIGATORIAMENTE** considerar o texto introduzido pelo utilizador antes de prosseguir (caso não esteja vazio).

## Esboço Geral

1. **Configuração inicial**: executa `.specify/scripts/bash/setup-plan.sh --json` na raiz do repositório e faz o parsing do JSON para obter `FEATURE_SPEC`, `IMPL_PLAN`, `SPECS_DIR`, `BRANCH`.  
   Para aspas simples em argumentos como “I'm Groot”, usa a sintaxe de escape `'\''` (ou aspas duplas, se possível: `"I'm Groot"`).

2. **Carrega o contexto**: lê `FEATURE_SPEC` e `.specify/memory/constitution.md`. Carrega o template de `IMPL_PLAN` (já copiado).

3. **Executa o fluxo de planeamento**: segue a estrutura no template `IMPL_PLAN` para:
   - Preencher o **Contexto Técnico** (marca desconhecidos como “NEEDS CLARIFICATION”)
   - Preencher a secção **Constitution Check** com base no ficheiro `constitution`
   - Avaliar *gates* (gera ERRO se existirem violações não justificadas)
   - **Fase 0**: gerar `research.md` (resolver todos os NEEDS CLARIFICATION)
   - **Fase 1**: gerar `data-model.md`, `contracts/`, `quickstart.md`
   - **Fase 1**: atualizar o contexto do agente executando o script apropriado
   - Reavaliar o **Constitution Check** após o design

4. **Parar e reportar**: o comando termina após o planeamento da Fase 2. Reporta branch, caminho do `IMPL_PLAN` e artefactos gerados.

## Fases

### Fase 0: Esboço e Pesquisa

1. **Extrair incógnitas do Contexto Técnico** acima:
   - Para cada `NEEDS CLARIFICATION` → tarefa de pesquisa
   - Para cada dependência → tarefa de boas práticas
   - Para cada integração → tarefa de padrões

2. **Gerar e despachar agentes de pesquisa**:

   ```text
   Para cada incógnita em Contexto Técnico:
     Tarefa: "Pesquisar {unknown} para {feature context}"
   Para cada escolha tecnológica:
     Tarefa: "Encontrar melhores práticas para {tech} no domínio {domain}"
   ```

3. **Consolidar conclusões** em `research.md` usando o formato:
   - Decisão: [o que foi escolhido]
   - Justificação: [porque foi escolhido]
   - Alternativas consideradas: [outras opções avaliadas]

**Saída**: `research.md` com todos os NEEDS CLARIFICATION resolvidos.

### Fase 1: Design e Contratos

**Pré-requisito:** `research.md` concluído

1. **Extrair entidades da especificação da funcionalidade** → `data-model.md`:
   - Nome da entidade, campos e relações
   - Regras de validação derivadas dos requisitos
   - Transições de estado, se aplicável

2. **Gerar contratos de API** a partir dos requisitos funcionais:
   - Para cada ação do utilizador → endpoint correspondente
   - Usa padrões REST/GraphQL padrão
   - Gera o esquema OpenAPI/GraphQL em `/contracts/`

3. **Atualizar o contexto do agente**:
   - Executa `.specify/scripts/bash/update-agent-context.sh codex`
   - Estes scripts detetam qual o agente de IA em uso
   - Atualizam o ficheiro de contexto apropriado do agente
   - Adiciona apenas nova tecnologia do plano atual
   - Preserva adições manuais entre marcadores

**Saída**: `data-model.md`, `/contracts/*`, `quickstart.md`, ficheiro específico do agente

## Regras Principais

- Usa caminhos absolutos.  
- Gera ERRO em falhas de *gate* ou clarificações não resolvidas.
