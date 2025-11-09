---
description: Gera um ficheiro tasks.md acionável e ordenado por dependências para a funcionalidade, com base nos artefactos de design disponíveis.
---

## Entrada do Utilizador

```text
$ARGUMENTS
```

Deves **OBRIGATORIAMENTE** considerar o texto introduzido pelo utilizador antes de prosseguir (caso não esteja vazio).

## Esboço Geral

1. **Configuração inicial**: executa `.specify/scripts/bash/check-prerequisites.sh --json` a partir da raiz do repositório e faz parsing para obter `FEATURE_DIR` e a lista `AVAILABLE_DOCS`. Todos os caminhos devem ser absolutos. Para aspas simples em argumentos como “I'm Groot”, usa `'\''` (ou aspas duplas se possível: `"I'm Groot"`).

2. **Carregar documentos de design**: lê a partir de `FEATURE_DIR`:
   - **Obrigatórios**: `plan.md` (stack tecnológica, bibliotecas, estrutura), `spec.md` (user stories com prioridades)
   - **Opcionais**: `data-model.md` (entidades), `contracts/` (endpoints de API), `research.md` (decisões), `quickstart.md` (cenários de teste)
   - Nota: nem todos os projetos terão todos os documentos. As tarefas devem ser geradas com base no que existir.

3. **Executar fluxo de geração de tarefas**:
   - Lê `plan.md` e extrai stack tecnológica, bibliotecas e estrutura do projeto.
   - Lê `spec.md` e extrai user stories e prioridades (P1, P2, P3...).
   - Se existir `data-model.md`: extrai entidades e mapeia-as para as user stories.
   - Se existir `contracts/`: mapeia endpoints para as user stories correspondentes.
   - Se existir `research.md`: extrai decisões para tarefas de configuração.
   - Gera tarefas organizadas por user story (ver Regras abaixo).
   - Cria gráfico de dependências mostrando a ordem de conclusão das stories.
   - Gera exemplos de execução paralela por story.
   - Valida completude: cada story deve ter tarefas suficientes e testáveis de forma independente.

4. **Gerar tasks.md**: usa `.specify/specify/templates/tasks-template.md` como estrutura e preenche com:
   - Nome correto da funcionalidade (a partir de `plan.md`).
   - **Fase 1:** tarefas de configuração (inicialização do projeto).
   - **Fase 2:** tarefas fundacionais (pré-requisitos de todas as stories).
   - **Fases 3+:** uma fase por user story (em ordem de prioridade a partir de `spec.md`).
   - Cada fase inclui: objetivo da story, critérios de teste independentes, testes (se aplicável) e tarefas de implementação.
   - **Fase Final:** polimento e preocupações transversais.
   - Todas as tarefas devem seguir o formato de checklist definido abaixo.
   - Cada tarefa deve ter caminho de ficheiro explícito.
   - Secção de dependências mostrando ordem de conclusão.
   - Exemplos de execução paralela por story.
   - Estratégia de implementação (MVP primeiro, entrega incremental).

5. **Relatório**: mostra caminho do `tasks.md` gerado e resumo:
   - Total de tarefas
   - Tarefas por user story
   - Oportunidades de paralelismo
   - Critérios de teste independentes por story
   - Escopo sugerido para MVP (normalmente apenas a User Story 1)
   - Validação de formato: todas as tarefas devem seguir o formato de checklist (checkbox, ID, labels e paths).

Contexto para geração de tarefas: `$ARGUMENTS`

O `tasks.md` deve ser **imediatamente executável** — cada tarefa deve ser suficientemente específica para que um LLM a possa completar sem contexto adicional.

## Regras de Geração de Tarefas

**CRÍTICO**: as tarefas DEVEM estar organizadas por user story para permitir implementação e testes independentes.

**Testes são OPCIONAIS**: só gerados se explicitamente pedidos na especificação da funcionalidade ou se o utilizador solicitar abordagem TDD.

### Formato de Checklist (OBRIGATÓRIO)

Cada tarefa deve seguir **exatamente** este formato:

```text
- [ ] [TaskID] [P?] [Story?] Descrição com caminho de ficheiro
```

**Componentes do formato**:

1. **Checkbox**: deve começar sempre com `- [ ]`
2. **Task ID**: número sequencial (T001, T002, T003…) em ordem de execução
3. **[P] marcador**: incluir apenas se a tarefa for paralelizável (ficheiros diferentes, sem dependências)
4. **[Story] etiqueta**: obrigatória apenas para fases de user story  
   - Formato: [US1], [US2], [US3]... (mapeia as stories de `spec.md`)
   - Fase Setup: sem etiqueta
   - Fase Fundacional: sem etiqueta  
   - Fases de User Story: devem ter etiqueta  
   - Fase Final (Polish): sem etiqueta
5. **Descrição**: ação clara com caminho de ficheiro exato

**Exemplos**:

- ✅ CORRETO: `- [ ] T001 Criar estrutura do projeto conforme plano de implementação`
- ✅ CORRETO: `- [ ] T005 [P] Implementar middleware de autenticação em src/middleware/auth.py`
- ✅ CORRETO: `- [ ] T012 [P] [US1] Criar modelo User em src/models/user.py`
- ✅ CORRETO: `- [ ] T014 [US1] Implementar UserService em src/services/user_service.py`
- ❌ ERRADO: `- [ ] Criar modelo User` (falta ID e etiqueta)
- ❌ ERRADO: `T001 [US1] Criar modelo` (falta checkbox)
- ❌ ERRADO: `- [ ] [US1] Criar modelo User` (falta ID)
- ❌ ERRADO: `- [ ] T001 [US1] Criar modelo` (falta caminho de ficheiro)

### Organização das Tarefas

1. **A partir das User Stories (`spec.md`)** — ORGANIZAÇÃO PRINCIPAL:
   - Cada user story (P1, P2, P3...) tem a sua própria fase.
   - Mapeia todos os componentes relacionados com essa story:
     - Modelos necessários
     - Serviços necessários
     - Endpoints/UI correspondentes
     - Se houver testes: testes específicos dessa story
   - Marca dependências entre stories (devem ser independentes sempre que possível).

2. **A partir dos Contratos**:
   - Mapeia cada endpoint → story correspondente.
   - Se houver testes: cria tarefa de teste do contrato `[P]` antes da implementação.

3. **A partir do Modelo de Dados**:
   - Mapeia cada entidade para a(s) story(s) que a utilizam.
   - Se servir várias stories: coloca na primeira story ou na Fase Setup.
   - Relações → tarefas de camada de serviço na story correspondente.

4. **A partir da Configuração/Infraestrutura**:
   - Infraestrutura partilhada → Fase Setup (Fase 1)
   - Pré-requisitos globais → Fase Fundacional (Fase 2)
   - Configurações específicas → na fase da story relevante

### Estrutura de Fases

- **Fase 1**: Setup (inicialização do projeto)
- **Fase 2**: Fundacional (pré-requisitos obrigatórios)
- **Fases 3+**: User Stories por ordem de prioridade (P1, P2, P3...)  
  - Dentro de cada story: Testes (se houver) → Modelos → Serviços → Endpoints → Integração  
  - Cada fase deve ser um incremento completo e testável de forma independente.
- **Fase Final**: Polimento e preocupações transversais
