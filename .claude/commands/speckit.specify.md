---
description: Cria ou atualiza a especificação de uma funcionalidade a partir de uma descrição em linguagem natural.
---


## Entrada do Utilizador

```text
$ARGUMENTS
```

Deves **OBRIGATORIAMENTE** considerar o texto introduzido pelo utilizador antes de prosseguir (caso não esteja vazio).

## Esboço Geral

O texto que o utilizador escreve depois de `/speckit.specify` na mensagem que desencadeia este comando **é** a descrição da funcionalidade.  
Assume que tens sempre esse texto disponível nesta conversa, mesmo que `$ARGUMENTS` apareça literalmente abaixo.  
Não peças ao utilizador para repetir, a menos que tenha enviado o comando vazio.

Com base nessa descrição da funcionalidade, faz o seguinte:

1. **Gera um nome curto e conciso** (2-4 palavras) para a branch:
   - Analisa a descrição e extrai as palavras-chave mais relevantes.
   - Cria um nome curto que capture a essência da funcionalidade.
   - Usa formato *ação-substantivo* quando possível (ex.: `adicionar-autenticacao-usuario`).
   - Mantém termos técnicos e acrónimos (OAuth2, API, JWT, etc.).
   - Mantém conciso mas suficientemente descritivo para entender a feature de relance.
   - Exemplos:
     - “Quero adicionar autenticação de utilizador” → `user-auth`
     - “Implementar integração OAuth2 na API” → `oauth2-api-integration`
     - “Criar dashboard de analytics” → `analytics-dashboard`
     - “Corrigir bug de timeout no pagamento” → `fix-payment-timeout`

2. **Verifica se já existem branches antes de criar uma nova**:
   
   a. Primeiro, obtém todas as branches remotas para garantir informação atualizada:
      ```bash
      git fetch --all --prune
      ```

   b. Procura o número mais alto de feature com o mesmo short-name:
      - Branches remotas: `git ls-remote --heads origin | grep -E 'refs/heads/[0-9]+-<short-name>$'`
      - Branches locais: `git branch | grep -E '^[* ]*[0-9]+-<short-name>$'`
      - Diretórios de specs: procura `specs/[0-9]+-<short-name>`

   c. Determina o próximo número disponível:
      - Extrai todos os números das três origens.
      - Encontra o número mais alto N.
      - Usa N+1 para a nova branch.

   d. Executa o script `.specify/scripts/bash/create-new-feature.sh --json "$ARGUMENTS"` com o número e nome curto calculados:
      - Passa `--number N+1` e `--short-name "your-short-name"` juntamente com a descrição.
      - Exemplo Bash:
        ```bash
        .specify/scripts/bash/create-new-feature.sh --json "$ARGUMENTS" --json --number 5 --short-name "user-auth" "Add user authentication"
        ```
      - Exemplo PowerShell:
        ```bash
        .specify/scripts/bash/create-new-feature.sh --json "$ARGUMENTS" -Json -Number 5 -ShortName "user-auth" "Add user authentication"
        ```

   **IMPORTANTE**:
   - Verifica as três origens (remota, local e specs).
   - Só corresponde branches/diretórios com o nome exato.
   - Se não houver nenhum existente, começa em número 1.
   - Este script só deve ser executado **uma vez por funcionalidade**.
   - O output JSON é devolvido no terminal; consulta-o para saber os caminhos criados (`BRANCH_NAME` e `SPEC_FILE`).
   - Para aspas simples em argumentos tipo “I'm Groot”, usa `'''` (ou aspas duplas).

3. Carrega `.specify/templates/spec-template.md` para conhecer as secções obrigatórias.

4. Segue este fluxo de execução:

    1. Lê a descrição do utilizador.  
       Se estiver vazia → ERRO “Nenhuma descrição de funcionalidade fornecida”.
    2. Extrai conceitos-chave: atores, ações, dados, restrições.
    3. Para aspetos pouco claros:
       - Faz suposições razoáveis com base no contexto e padrões da indústria.
       - Só marca com `[NEEDS CLARIFICATION: questão específica]` se:
         - A decisão afetar significativamente o âmbito ou a experiência do utilizador.
         - Existirem várias interpretações válidas com implicações diferentes.
         - Não houver um padrão razoável.
       - **LIMITE:** máximo 3 marcadores `[NEEDS CLARIFICATION]`.
       - Prioriza por impacto: âmbito > segurança/privacidade > experiência do utilizador > detalhe técnico.
    4. Preenche a secção **Cenários de Utilizador e Testes**.  
       Se não houver fluxo claro → ERRO “Não é possível determinar cenários de utilizador”.
    5. Gera **Requisitos Funcionais** testáveis.
    6. Define **Critérios de Sucesso** mensuráveis, independentes da tecnologia, qualitativos e quantitativos.
    7. Identifica **Entidades-chave** se existirem dados envolvidos.
    8. Resultado: SUCESSO (spec pronta para planeamento).

5. Escreve a especificação no ficheiro `SPEC_FILE`, usando a estrutura do template e substituindo placeholders por detalhes concretos derivados da descrição.

6. **Validação da Qualidade da Especificação**:

   a. **Cria Checklist de Qualidade** em `FEATURE_DIR/checklists/requirements.md` com esta estrutura:

      ```markdown
      # Checklist de Qualidade da Especificação: [NOME DA FEATURE]
      
      **Objetivo**: validar completude e qualidade antes do planeamento  
      **Criado em**: [DATA]  
      **Funcionalidade**: [link para spec.md]
      
      ## Qualidade de Conteúdo
      - [ ] Sem detalhes de implementação (linguagens, frameworks, APIs)
      - [ ] Foco no valor e necessidade do utilizador/negócio
      - [ ] Legível por stakeholders não técnicos
      - [ ] Todas as secções obrigatórias preenchidas

      ## Completude dos Requisitos
      - [ ] Nenhum marcador [NEEDS CLARIFICATION] restante
      - [ ] Requisitos testáveis e inequívocos
      - [ ] Critérios de sucesso mensuráveis
      - [ ] Critérios independentes da tecnologia
      - [ ] Todos os cenários de aceitação definidos
      - [ ] Casos-limite identificados
      - [ ] Âmbito claramente delimitado
      - [ ] Dependências e suposições identificadas

      ## Prontidão da Funcionalidade
      - [ ] Todos os requisitos têm critérios de aceitação
      - [ ] Cenários de utilizador cobrem os fluxos principais
      - [ ] A funcionalidade cumpre os resultados definidos nos Critérios de Sucesso
      - [ ] Sem fugas de detalhes técnicos

      ## Notas
      - Itens incompletos exigem atualização antes de `/speckit.clarify` ou `/speckit.plan`
      ```

   b. **Executa a verificação** comparando cada item e regista falhas.
   c. **Se todos passarem**, avança; se falharem, corrige e revalida (máx. 3 iterações).
   d. **Se restarem marcadores [NEEDS CLARIFICATION]**, extrai-os, apresenta perguntas formatadas em tabela e espera pelas respostas do utilizador.

7. Reporta conclusão com nome da branch, caminho do ficheiro spec, resultados da checklist e prontidão para `/speckit.clarify` ou `/speckit.plan`.

**NOTA:** O script cria e faz checkout da nova branch e inicializa o ficheiro antes de escrever.

## Diretrizes Gerais

### Diretrizes Rápidas

- Concentra-te no **QUE** o utilizador precisa e **PORQUÊ**.  
- Evita o **COMO** (detalhes técnicos).  
- Escreve para o negócio, não para programadores.  
- Não insiras checklists dentro da spec — são geradas à parte.

### Requisitos de Secção

- **Obrigatórias**: devem estar sempre completas.  
- **Opcionais**: inclui só se relevantes.  
- Se uma secção não se aplica, remove-a (não deixes “N/A”).

### Para Geração por IA

1. Faz suposições informadas com base no contexto e padrões comuns.  
2. Documenta suposições na secção “Assumptions”.  
3. Máx. 3 marcadores `[NEEDS CLARIFICATION]`, apenas para decisões críticas.  
4. Prioriza clarificações: âmbito > segurança > UX > detalhe técnico.  
5. Pensa como tester — qualquer requisito vago deve falhar no critério “testável e inequívoco”.  
6. Áreas comuns que exigem clarificação (só se não houver padrão razoável):  
   - Limites da funcionalidade (casos incluídos/excluídos).  
   - Tipos de utilizador e permissões com interpretações ambíguas.  
   - Requisitos legais ou de conformidade.  

**Exemplos de padrões razoáveis** (não perguntes sobre estes):  
- Retenção de dados: práticas padrão do setor.  
- Desempenho: expectativas típicas web/mobile.  
- Erros: mensagens amigáveis e seguras.  
- Autenticação: sessão ou OAuth2.  
- Integração: APIs RESTful, salvo indicação contrária.

### Diretrizes para Critérios de Sucesso

Critérios de sucesso devem ser:

1. **Mensuráveis** — incluem métricas concretas.  
2. **Independentes da tecnologia** — sem mencionar ferramentas.  
3. **Focados no utilizador/negócio**.  
4. **Verificáveis** — testáveis sem conhecer implementação.

**Bons exemplos:**
- “Os utilizadores concluem o checkout em menos de 3 minutos.”  
- “O sistema suporta 10 000 utilizadores simultâneos.”  
- “95 % das pesquisas devolvem resultados em menos de 1 segundo.”  
- “A taxa de conclusão de tarefas melhora 40 %.”

**Maus exemplos:**
- “Tempo de resposta da API < 200 ms” → demasiado técnico.  
- “Base de dados suporta 1000 TPS.” → detalhe de implementação.  
- “Componentes React rendem eficientemente.” → específico de framework.  
- “Taxa de acerto do Redis acima de 80 %.” → métrica técnica.
