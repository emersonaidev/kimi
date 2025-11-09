---
description: Cria ou atualiza a constituição do projeto a partir de princípios fornecidos ou recolhidos de forma interativa, garantindo que todos os templates dependentes ficam sincronizados.
---

## Entrada do Utilizador

```text
$ARGUMENTS
```

Deves **OBRIGATORIAMENTE** considerar o texto introduzido pelo utilizador antes de prosseguir (caso não esteja vazio).

## Esboço Geral

Estás a atualizar a constituição do projeto em `.specify/memory/constitution.md`.  
Este ficheiro é um **TEMPLATE** com tokens de substituição entre colchetes (ex.: `[PROJECT_NAME]`, `[PRINCIPLE_1_NAME]`).  
O teu objetivo é:  
(a) recolher/derivar valores concretos,  
(b) preencher o template corretamente, e  
(c) propagar as alterações a todos os artefactos dependentes.

### Passos de Execução

1. **Carregar o template existente** em `.specify/memory/constitution.md`.
   - Identifica todos os placeholders `[IDENTIFICADOR_EM_MAIÚSCULAS]`.
   - **IMPORTANTE**: o utilizador pode querer mais ou menos princípios do que os existentes no modelo.  
     Se indicar um número, respeita — adapta o documento em conformidade.

2. **Recolher ou derivar valores** para os placeholders:
   - Se o utilizador fornecer o valor, usa-o.
   - Caso contrário, infere a partir do contexto do repositório (README, docs, versões anteriores).
   - Datas de governação:
     - `RATIFICATION_DATE`: data original de adoção (se desconhecida, marca TODO).
     - `LAST_AMENDED_DATE`: data atual, se houver alterações; caso contrário, mantém a anterior.
   - `CONSTITUTION_VERSION`: incrementa conforme regras de versionamento semântico:
     - **MAJOR** — alterações incompatíveis (remoções/redefinições de princípios).  
     - **MINOR** — adição de novo princípio/secção ou expansão relevante.  
     - **PATCH** — pequenas correções ou clarificações.  
   - Se o tipo de versão for ambíguo, propõe a lógica antes de aplicar.

3. **Redigir a constituição atualizada**:
   - Substitui todos os placeholders por texto concreto (nenhum colchete deve permanecer, exceto os intencionais).  
   - Mantém a hierarquia de headings; remove comentários substituídos.  
   - Cada princípio deve conter:
     - Nome conciso.  
     - Parágrafo ou lista de regras não negociáveis.  
     - Racional explícito (se necessário).  
   - A secção de **Governança** deve listar:  
     - Procedimento de emenda.  
     - Política de versionamento.  
     - Expectativas de revisão e conformidade.

4. **Checklist de Propagação de Consistência** (transforma checklist anterior em validações ativas):
   - Lê `.specify/templates/plan-template.md` → confirma que a secção **Constitution Check** reflete os novos princípios.  
   - Lê `.specify/templates/spec-template.md` → verifica se a estrutura obrigatória está alinhada.  
   - Lê `.specify/templates/tasks-template.md` → valida se categorias de tarefas refletem novas diretrizes (ex.: observabilidade, testes).  
   - Lê cada ficheiro de comando em `.specify/templates/commands/*.md` (incluindo este) → remove referências desatualizadas (ex.: nomes de agentes).  
   - Lê `README.md`, `docs/quickstart.md` e outros guias → atualiza referências se princípios mudarem.

5. **Produzir um Relatório de Impacto de Sincronização**  
   (adicionado como comentário HTML no topo da constituição após atualização):

   ```html
   <!--
   Version change: old → new
   Princípios modificados: [antigo → novo]
   Secções adicionadas/removidas
   Templates atualizados (✅ atualizado / ⚠ pendente)
   Follow-up TODOs (placeholders por preencher)
   -->
   ```

6. **Validação antes da saída final**:
   - Nenhum token por substituir sem justificação.  
   - Linha de versão corresponde ao relatório.  
   - Datas no formato ISO `YYYY-MM-DD`.  
   - Princípios declarativos e verificáveis (evitar “should”, preferir **MUST/SHOULD** com racional).

7. **Gravar a constituição atualizada** em `.specify/memory/constitution.md` (overwrite).

8. **Resumo final para o utilizador**:
   - Nova versão e justificação da alteração.  
   - Ficheiros com follow-up manual.  
   - Commit sugerido:  
     ```text
     docs: amend constitution to vX.Y.Z (added principles + governance update)
     ```

### Requisitos de Formato e Estilo

- Mantém as headings originais (sem alterar níveis).  
- Mantém legibilidade (linhas curtas, <100 caracteres quando possível).  
- Uma linha em branco entre secções.  
- Sem espaços desnecessários no fim das linhas.

### Casos Parciais

Se o utilizador fornecer apenas alterações parciais (ex.: atualização de um princípio), ainda assim executa:
- Validação completa.  
- Decisão automática do tipo de versão.  

Se faltar informação crítica (ex.: `RATIFICATION_DATE` desconhecida), adiciona `TODO(<CAMPO>): explicação` e lista-a no Relatório de Impacto.

**Nunca criar novo template.**  
Opera sempre sobre o ficheiro existente `.specify/memory/constitution.md`.
