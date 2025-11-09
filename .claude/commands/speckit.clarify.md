---
description: Identifica áreas subespecificadas na spec atual da funcionalidade, fazendo até 5 perguntas de clarificação altamente direcionadas e codificando as respostas diretamente no ficheiro.
---

## Entrada do Utilizador

```text
$ARGUMENTS
```

Deves **OBRIGATORIAMENTE** considerar o texto introduzido pelo utilizador antes de prosseguir (caso não esteja vazio).

## Esboço Geral

**Objetivo:** detetar e reduzir ambiguidades ou decisões em falta na especificação ativa da funcionalidade e registar as clarificações diretamente no ficheiro da spec.

**Nota:** este fluxo de clarificação deve ocorrer **antes** de executar `/speckit.plan`.  
Se o utilizador indicar explicitamente que está a saltar esta fase (ex.: spike exploratório), pode prosseguir, mas deve ser avisado que o risco de retrabalho posterior aumenta.

### Passos de Execução

1. Executa `.specify/scripts/bash/check-prerequisites.sh --json --paths-only` na raiz do repositório **uma vez** (`--json --paths-only` / `-Json -PathsOnly`).  
   Faz parsing dos campos mínimos do JSON:
   - `FEATURE_DIR`
   - `FEATURE_SPEC`
   - (Opcionalmente `IMPL_PLAN`, `TASKS` para fluxos encadeados futuros.)
   - Se o parsing falhar, aborta e instrui o utilizador a executar `/speckit.specify` novamente ou verificar o ambiente da branch.  
   - Para aspas simples como “I'm Groot”, usa `'\''` (ou aspas duplas: `"I'm Groot"`).

2. Carrega o ficheiro de spec atual. Realiza uma análise estruturada de ambiguidade e cobertura usando esta taxonomia.  
   Para cada categoria, marca o estado: **Claro / Parcial / Em Falta**.  
   Gera um mapa interno de cobertura usado para priorização (não o apresenta, exceto se não houver perguntas).

   **Âmbito Funcional e Comportamento:**
   - Objetivos centrais do utilizador e critérios de sucesso
   - Declarações explícitas fora do âmbito
   - Diferenciação de papéis / personas

   **Domínio e Modelo de Dados:**
   - Entidades, atributos, relações
   - Regras de identidade e unicidade
   - Ciclo de vida / transições de estado
   - Suposições de volume ou escala

   **Interação e Fluxo de UX:**
   - Jornadas críticas / sequências
   - Estados de erro/vazio/carregamento
   - Notas de acessibilidade ou localização

   **Atributos de Qualidade Não Funcionais:**
   - Performance (latência, throughput)
   - Escalabilidade (limites horizontais/verticais)
   - Fiabilidade e disponibilidade (uptime, recuperação)
   - Observabilidade (logs, métricas, tracing)
   - Segurança e privacidade (authN/Z, proteção de dados)
   - Conformidade / regulamentação

   **Integrações e Dependências Externas:**
   - Serviços/APIs externas e modos de falha
   - Formatos de import/export
   - Assunções de protocolo/versão

   **Casos Limite e Gestão de Erros:**
   - Cenários negativos
   - Rate limiting / throttling
   - Resolução de conflitos (edições concorrentes)

   **Restrições e Compromissos:**
   - Limitações técnicas (linguagem, storage, hosting)
   - Tradeoffs explícitos ou alternativas rejeitadas

   **Terminologia e Consistência:**
   - Termos canónicos de glossário
   - Sinónimos evitados / termos obsoletos

   **Sinais de Conclusão:**
   - Testabilidade dos critérios de aceitação
   - Indicadores mensuráveis de “Definition of Done”

   **Miscelânea / Placeholders:**
   - Marcadores TODO / decisões por tomar
   - Adjetivos ambíguos (“robusto”, “intuitivo”) sem quantificação

   Para cada categoria **Parcial** ou **Em Falta**, cria uma possível pergunta de clarificação, exceto se:
   - Não afetar materialmente a implementação ou validação
   - For informação mais adequada à fase de planeamento (nota apenas internamente)

3. Gera (internamente) uma lista priorizada de **máx. 5 perguntas de clarificação**.  
   Não as apresenta todas de uma vez.  
   - Limite: 10 perguntas totais na sessão.  
   - Cada pergunta deve ter resposta curta (2–5 opções exclusivas) ou curta livre (≤5 palavras).  
   - Devem impactar arquitetura, modelação, decomposição de tarefas, UX, testes ou conformidade.  
   - Garantir equilíbrio de categorias (priorizar impacto alto).  
   - Ignorar questões já resolvidas ou de preferência estilística.  
   - Focar em clarificações que reduzam retrabalho.  
   - Se mais de 5 áreas ficarem por resolver, selecionar as 5 de maior impacto.

4. **Ciclo de Perguntas Interativo:**
   - Apresenta **apenas uma pergunta de cada vez**.
   - Para perguntas de múltipla escolha:
     - Analisa opções e determina a mais adequada com base em:
       - Boas práticas do tipo de projeto
       - Padrões comuns em implementações similares
       - Redução de risco (segurança, performance, manutenção)
       - Alinhamento com objetivos ou restrições do projeto
     - Mostra a opção recomendada:
       ```markdown
       **Recomendado:** Opção [X] — <razão curta>
       ```
     - Depois, apresenta tabela Markdown com opções:

       | Opção | Descrição |
       |--------|-----------|
       | A | <Descrição A> |
       | B | <Descrição B> |
       | C | <Descrição C> |
       | Short | Outra resposta curta (≤5 palavras) |

     - Após a tabela, inclui:  
       “Podes responder com a letra (ex.: 'A'), aceitar a recomendação dizendo 'sim' ou 'recomendado', ou dar a tua própria resposta curta.”

   - Para perguntas de resposta curta (sem opções significativas):
     - Fornece resposta sugerida com base nas boas práticas:
       ```markdown
       **Sugerido:** <resposta> — <razão curta>
       ```
     - Depois:  
       “Formato: resposta curta (≤5 palavras). Podes aceitar dizendo 'sim' ou 'sugerido', ou dar a tua própria resposta.”

   - Após a resposta:
     - “sim / recomendado / sugerido” → usa resposta prévia.  
     - Caso contrário, valida se cabe no formato (≤5 palavras).  
     - Se ambígua, pede clarificação (sem contar como nova pergunta).  
     - Guarda a resposta em memória e passa à próxima.

   - Termina quando:
     - Todas as ambiguidades críticas resolvidas, **ou**
     - O utilizador diz “terminar / bom / chega”, **ou**
     - Atinge 5 perguntas.  
   - Nunca revela perguntas futuras antecipadamente.  
   - Se não existirem ambiguidades válidas → reporta “Sem ambiguidades críticas a clarificar.”

5. **Integração após cada resposta aceite:**
   - Mantém representação em memória da spec carregada e o conteúdo bruto.
   - Na primeira resposta, certifica que existe a secção `## Clarifications`; cria se faltar.  
   - Adiciona subsecção `### Sessão YYYY-MM-DD` se ainda não existir.
   - Acrescenta linha: `- Q: <pergunta> → A: <resposta>`.
   - Aplica a clarificação à secção apropriada:
     - Ambiguidade funcional → “Requisitos Funcionais”.
     - Interação/atores → “User Stories” ou “Atores”.
     - Dados/entidades → “Modelo de Dados”.
     - Requisitos não funcionais → secção “Qualidade / Atributos”.
     - Casos limite → “Erros / Edge Cases”.
     - Termos → normalizar terminologia.
   - Se a clarificação tornar inválida uma frase anterior, substitui-a (não duplica).
   - Grava o ficheiro após cada integração (overwrite atómico).  
   - Mantém formatação e hierarquia intactas.  
   - Cada clarificação deve ser mínima e testável.

6. **Validação (após cada gravação e no final):**
   - Uma bullet por resposta aceite.
   - ≤5 perguntas por sessão.
   - Sem placeholders vagos remanescentes.
   - Sem contradições antigas.
   - Estrutura Markdown válida (`## Clarifications`, `### Sessão YYYY-MM-DD` permitidos).
   - Terminologia consistente em toda a spec.

7. **Escrever atualização no FEATURE_SPEC.**

8. **Relatório final:**
   - Número de perguntas feitas e respondidas.
   - Caminho da spec atualizada.
   - Secções modificadas.
   - Tabela resumo de cobertura (categoria / estado: Resolvido / Adiado / Claro / Pendente).
   - Se restarem “Pendente” ou “Adiado”, recomendar se deve seguir para `/speckit.plan` ou repetir clarificação depois.

### Regras de Comportamento

- Se não houver ambiguidades relevantes: “Sem ambiguidades críticas detetadas que justifiquem clarificação formal.”  
- Se o ficheiro não existir: instruir a correr `/speckit.specify`.  
- Nunca exceder 5 perguntas totais (retries não contam).  
- Evita perguntas especulativas sobre stack técnico a menos que bloqueiem clareza funcional.  
- Respeita “stop / done / proceed”.  
- Se tudo estiver claro, apresenta resumo compacto e recomenda avançar.  
- Se atingir o limite e restarem tópicos críticos, lista-os como “Adiado” com razão.

Contexto de priorização: `$ARGUMENTS`
