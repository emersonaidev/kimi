---
description: Gera uma checklist personalizada para a funcionalidade atual com base nos requisitos do utilizador.
---

## Propósito da Checklist: "Testes Unitários para Inglês"

**CONCEITO CRÍTICO**: As checklists são **TESTES UNITÁRIOS PARA A ESCRITA DE REQUISITOS** — validam a qualidade, clareza e completude dos requisitos num determinado domínio.

**NÃO são para verificação/teste de implementação**:

- ❌ NÃO “Verificar se o botão clica corretamente”
- ❌ NÃO “Testar se o tratamento de erro funciona”
- ❌ NÃO “Confirmar que a API devolve 200”
- ❌ NÃO verificar se o código/implementação corresponde à spec

**SERVEM para validar a qualidade dos requisitos**:

- ✅ “Os requisitos de hierarquia visual estão definidos para todos os tipos de cartões?” (completude)
- ✅ “O termo ‘exibição proeminente’ está quantificado com tamanho/posição específicos?” (clareza)
- ✅ “Os requisitos de estado hover são consistentes em todos os elementos interativos?” (consistência)
- ✅ “Os requisitos de acessibilidade estão definidos para navegação por teclado?” (cobertura)
- ✅ “A spec define o comportamento quando a imagem do logótipo falha ao carregar?” (casos limite)

**Metáfora**: se a tua spec é código escrito em inglês, a checklist é o seu conjunto de testes unitários. Testas se os requisitos estão bem escritos, completos, inequívocos e prontos para implementação — **não** se a implementação funciona.

## Entrada do Utilizador

```text
$ARGUMENTS
```

Deves **OBRIGATORIAMENTE** considerar o texto introduzido pelo utilizador antes de prosseguir (caso não esteja vazio).

## Passos de Execução

1. **Configuração**: executa `.specify/scripts/bash/check-prerequisites.sh --json` na raiz do repositório e faz parsing do JSON para obter `FEATURE_DIR` e a lista `AVAILABLE_DOCS`.
   - Todos os caminhos devem ser absolutos.
   - Para aspas simples em argumentos como “I'm Groot”, usa `'\''` (ou aspas duplas se possível: `"I'm Groot"`).

2. **Esclarecer intenção (dinâmico)**: gera até TRÊS perguntas de clarificação contextuais iniciais (sem catálogo pré-definido). Devem:
   - Ser derivadas da formulação do utilizador + sinais extraídos de spec/plan/tasks
   - Perguntar apenas o que muda substancialmente o conteúdo da checklist
   - Ser ignoradas individualmente se já estiverem claras em `$ARGUMENTS`
   - Privilegiar precisão em vez de abrangência

   Algoritmo de geração:
   1. Extrair sinais: palavras-chave de domínio (auth, latency, UX, API), indicadores de risco (“critical”, “must”, “compliance”), pistas de stakeholders (“QA”, “review”, “security team”) e entregáveis explícitos (“a11y”, “rollback”, “contracts”).
   2. Agrupar sinais em áreas de foco (máx. 4), ordenadas por relevância.
   3. Identificar provável audiência e momento (autor, reviewer, QA, release) se não explícito.
   4. Detetar dimensões em falta: amplitude do âmbito, profundidade/rigor, ênfase em risco, exclusões, critérios mensuráveis.
   5. Formular perguntas inspiradas nestes arquétipos:
      - Refinar âmbito (ex.: “Deve incluir integrações com X e Y ou limitar-se ao módulo local?”)
      - Priorização de risco (ex.: “Quais destas áreas devem ter verificação obrigatória?”)
      - Nível de detalhe (ex.: “Será uma lista leve pré-commit ou um gate formal de release?”)
      - Público-alvo (ex.: “Será usada apenas pelo autor ou também em code review?”)
      - Exclusões (ex.: “Devemos excluir performance desta ronda?”)
      - Cenários omitidos (ex.: “Nenhum fluxo de recuperação detetado — rollback está em âmbito?”)

   Regras de formatação:
   - Se apresentares opções, usa tabela com colunas: Opção | Candidato | Porquê Importa
   - Máx. A–E opções; omite tabela se resposta livre for mais clara
   - Nunca peças ao utilizador para repetir o que já disse
   - Evita categorias especulativas (sem “adivinhações”)
   - Se incerto, pergunta explicitamente: “Confirmar se X pertence ao âmbito?”

   Defaults quando não houver interação:
   - Profundidade: Standard
   - Público: Reviewer (PR) se relacionado com código; Autor caso contrário
   - Foco: 2 áreas de maior relevância

   Produz as perguntas (Q1/Q2/Q3). Após respostas: se ≥2 classes de cenários (Alternativo / Exceção / Recuperação / Não Funcional) permanecerem pouco claras, podes fazer até DUAS perguntas adicionais (Q4/Q5), justificando cada uma numa linha. Não exceder 5 perguntas no total.

3. **Compreender o pedido do utilizador**: combina `$ARGUMENTS` + respostas de clarificação.
   - Deriva o tema da checklist (ex.: segurança, revisão, deploy, ux)
   - Consolida itens obrigatórios mencionados
   - Mapeia seleções para categorias
   - Deduz contexto em falta de spec/plan/tasks (sem inventar)

4. **Carregar contexto da funcionalidade**: lê de `FEATURE_DIR`:
   - `spec.md`: requisitos e âmbito
   - `plan.md` (se existir): detalhes técnicos e dependências
   - `tasks.md` (se existir): tarefas de implementação

   Estratégia de carregamento:
   - Ler apenas secções necessárias para as áreas de foco
   - Preferir sumários curtos a texto integral
   - Fazer “progressive disclosure”: trazer mais detalhes só se houver lacunas
   - Para ficheiros grandes, gerar itens sumários em vez de copiar texto cru

5. **Gerar checklist** – cria “Testes Unitários para Requisitos”:
   - Cria diretório `FEATURE_DIR/checklists/` se não existir
   - Gera nome de ficheiro descritivo: `[domínio].md` (ex.: `ux.md`, `api.md`)
   - Numera itens desde CHK001
   - Cada execução cria um novo ficheiro (não substitui anteriores)

   **PRINCÍPIO CENTRAL – Testa os Requisitos, não a Implementação**:  
   Cada item deve avaliar os **REQUISITOS** quanto a:
   - **Completude**: estão todos os requisitos necessários?  
   - **Clareza**: são inequívocos e específicos?  
   - **Consistência**: não se contradizem?  
   - **Mensurabilidade**: podem ser verificados objetivamente?  
   - **Cobertura**: abrangem todos os cenários/casos-limite?  

   **Estrutura de Categorias**:
   - Completude dos Requisitos
   - Clareza dos Requisitos
   - Consistência
   - Qualidade dos Critérios de Aceitação
   - Cobertura de Cenários
   - Casos Limite
   - Requisitos Não Funcionais (Performance, Segurança, Acessibilidade…)
   - Dependências e Suposições
   - Ambiguidades e Conflitos

   **COMO ESCREVER ITENS DE CHECKLIST – “Unit Tests for English”**:

   ❌ **ERRADO** (testa implementação):  
   - “Verificar se página mostra 3 cartões de episódios”  
   ✅ **CORRETO** (testa qualidade dos requisitos):  
   - “Está especificado o número e disposição dos episódios em destaque?” [Completeness]
   - “O termo ‘proeminente’ está definido com propriedades visuais mensuráveis?” [Clarity]
   - “Os estados de interação estão definidos para todos os elementos?” [Consistency]
   - “O comportamento de fallback está descrito para falhas de imagem?” [Edge Case]

6. **Referência de Estrutura**: usa o template em `.specify/templates/checklist-template.md`.  
   Se não existir, estrutura manualmente com título H1, metadados e categorias `##`, linhas `- [ ] CHK### <item>` com IDs globais a partir de CHK001.

7. **Relatório**: mostra caminho do ficheiro criado, número de itens e resumo das áreas de foco, profundidade e itens obrigatórios incorporados.

**Importante**: cada execução de `/speckit.checklist` cria um ficheiro novo. Usa nomes curtos e limpos (ex.: `ux.md`, `security.md`) e remove checklists antigas quando já não forem necessárias.

## Exemplos de Tipos de Checklist e Itens

**Qualidade de Requisitos UX:** `ux.md`  
Exemplos (testam requisitos, não implementação):
- “Os requisitos de hierarquia visual estão definidos com critérios mensuráveis? [Clarity]”  
- “O número e posição dos elementos de UI estão explicitamente especificados? [Completeness]”  
- “Os requisitos de acessibilidade estão definidos para todos os elementos interativos? [Coverage]”  
- “O comportamento de fallback está definido para imagens em falha? [Edge Case, Gap]”  

**Qualidade de Requisitos API:** `api.md`
- “Os formatos de erro estão especificados para todos os cenários de falha? [Completeness]”  
- “Os requisitos de autenticação são consistentes entre endpoints? [Consistency]”  
- “As políticas de retry/timeout estão definidas? [Coverage, Gap]”  

**Qualidade de Requisitos de Performance:** `performance.md`
- “Os requisitos de desempenho estão quantificados com métricas específicas? [Clarity]”  
- “Os objetivos de performance estão definidos para jornadas críticas? [Coverage]”  
- “Os requisitos de degradação sob carga estão especificados? [Edge Case, Gap]”  

**Qualidade de Requisitos de Segurança:** `security.md`
- “Os requisitos de proteção de dados estão definidos para informação sensível? [Completeness]”  
- “O modelo de ameaças está documentado e os requisitos alinhados com ele? [Traceability]”  
- “Os requisitos de resposta a falhas de segurança estão definidos? [Gap, Exception Flow]”

## Anti-Exemplos – O que NÃO Fazer

**❌ ERRADO – testam implementação:**

```markdown
- [ ] CHK001 - Verificar se página mostra 3 cartões de episódios [Spec §FR-001]
```

**✅ CORRETO – testam qualidade dos requisitos:**

```markdown
- [ ] CHK001 - Está especificado o número e layout dos episódios em destaque? [Completeness, Spec §FR-001]
- [ ] CHK002 - Os requisitos de estado hover são consistentes em todos os elementos? [Consistency, Spec §FR-003]
- [ ] CHK003 - Os requisitos de navegação estão claros para todos os elementos clicáveis da marca? [Clarity, Spec §FR-010]
- [ ] CHK004 - Os critérios de seleção de episódios relacionados estão documentados? [Gap, Spec §FR-005]
- [ ] CHK005 - Estão definidos os estados de carregamento para dados assíncronos? [Gap]
- [ ] CHK006 - Os requisitos de “hierarquia visual” podem ser medidos objetivamente? [Measurability, Spec §FR-001]
```

**Diferenças-Chave:**
- Errado: testa se o sistema funciona.  
- Correto: testa se os requisitos estão bem escritos.  
- Errado: verificação de comportamento.  
- Correto: validação da qualidade dos requisitos.
