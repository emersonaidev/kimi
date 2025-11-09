---
description: "Template de lista de tarefas para implementação de funcionalidades"
---

# Tarefas: [FEATURE NAME]

**Entrada**: Documentos de design em `/specs/[###-feature-name]/`  
**Pré-requisitos**: plan.md (obrigatório), spec.md (obrigatório para user stories), research.md, data-model.md, contracts/

**Testes**: Os exemplos abaixo incluem tarefas de teste. Os testes são OPCIONAIS — só devem ser incluídos se forem explicitamente pedidos na especificação da funcionalidade.

**Organização**: As tarefas são agrupadas por user story para permitir implementação e teste independentes de cada uma.

## Formato: `[ID] [P?] [Story] Descrição`

- **[P]**: Pode ser executada em paralelo (ficheiros diferentes, sem dependências)
- **[Story]**: Indica a que user story pertence (ex.: US1, US2, US3)
- Inclui sempre os caminhos de ficheiros exatos nas descrições

## Convenções de Caminho

- **Projeto único**: `src/`, `tests/` na raiz do repositório
- **App Web**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` ou `android/src/`
- Os caminhos abaixo assumem um projeto único — ajusta conforme a estrutura definida em plan.md

<!-- 
  ============================================================================
  IMPORTANTE: As tarefas abaixo são APENAS EXEMPLOS.
  
  O comando /speckit.tasks DEVE substituí-las por tarefas reais com base em:
  - User stories de spec.md (e suas prioridades P1, P2, P3...)
  - Requisitos técnicos de plan.md
  - Entidades de data-model.md
  - Endpoints de contracts/
  
  As tarefas DEVEM ser organizadas por user story, garantindo que cada história pode ser:
  - Implementada de forma independente
  - Testada de forma independente
  - Entregue como incremento MVP
  
  NÃO manter estas tarefas de exemplo no ficheiro final.
  ============================================================================
-->

## Fase 1: Setup (Infraestrutura Partilhada)

**Objetivo**: Inicialização do projeto e estrutura base

- [ ] T001 Criar estrutura do projeto conforme o plano de implementação
- [ ] T002 Inicializar projeto [linguagem] com dependências [framework]
- [ ] T003 [P] Configurar ferramentas de linting e formatação

---

## Fase 2: Fundacional (Pré-requisitos Bloqueantes)

**Objetivo**: Infraestrutura central que DEVE estar pronta antes de QUALQUER user story

**⚠️ CRÍTICO**: Nenhuma história pode começar antes da conclusão desta fase

Exemplos de tarefas fundacionais (ajustar conforme o projeto):

- [ ] T004 Configurar schema de base de dados e framework de migrações
- [ ] T005 [P] Implementar framework de autenticação/autorização
- [ ] T006 [P] Configurar API routing e estrutura de middleware
- [ ] T007 Criar modelos/entidades base usados por todas as histórias
- [ ] T008 Configurar logging e tratamento de erros
- [ ] T009 Configurar gestão de variáveis de ambiente

**Checkpoint**: Fundações prontas — pode iniciar a implementação das user stories em paralelo

---

## Fase 3: User Story 1 - [Título] (Prioridade: P1) 🎯 MVP

**Objetivo**: [Breve descrição do que entrega esta história]

**Teste Independente**: [Como validar que esta história funciona isoladamente]

### Testes da User Story 1 (OPCIONAL — apenas se testes pedidos) ⚠️

> **NOTA:** Escreve estes testes PRIMEIRO e garante que FALHAM antes da implementação

- [ ] T010 [P] [US1] Teste de contrato para [endpoint] em `tests/contract/test_[name].py`
- [ ] T011 [P] [US1] Teste de integração para [jornada do utilizador] em `tests/integration/test_[name].py`

### Implementação da User Story 1

- [ ] T012 [P] [US1] Criar modelo [Entity1] em `src/models/[entity1].py`
- [ ] T013 [P] [US1] Criar modelo [Entity2] em `src/models/[entity2].py`
- [ ] T014 [US1] Implementar [Service] em `src/services/[service].py` (depende de T012, T013)
- [ ] T015 [US1] Implementar [endpoint/feature] em `src/[location]/[file].py`
- [ ] T016 [US1] Adicionar validação e tratamento de erros
- [ ] T017 [US1] Adicionar logging para operações da user story 1

**Checkpoint**: Nesta fase, a User Story 1 deve estar funcional e testável de forma independente

---

## Fase 4: User Story 2 - [Título] (Prioridade: P2)

**Objetivo**: [Breve descrição do que entrega esta história]

**Teste Independente**: [Como validar que esta história funciona isoladamente]

### Testes da User Story 2 (OPCIONAL — apenas se testes pedidos) ⚠️

- [ ] T018 [P] [US2] Teste de contrato para [endpoint] em `tests/contract/test_[name].py`
- [ ] T019 [P] [US2] Teste de integração para [jornada do utilizador] em `tests/integration/test_[name].py`

### Implementação da User Story 2

- [ ] T020 [P] [US2] Criar modelo [Entity] em `src/models/[entity].py`
- [ ] T021 [US2] Implementar [Service] em `src/services/[service].py`
- [ ] T022 [US2] Implementar [endpoint/feature] em `src/[location]/[file].py`
- [ ] T023 [US2] Integrar com componentes da User Story 1 (se aplicável)

**Checkpoint**: As User Stories 1 e 2 devem funcionar de forma independente

---

## Fase 5: User Story 3 - [Título] (Prioridade: P3)

**Objetivo**: [Breve descrição do que entrega esta história]

**Teste Independente**: [Como validar que esta história funciona isoladamente]

### Testes da User Story 3 (OPCIONAL — apenas se testes pedidos) ⚠️

- [ ] T024 [P] [US3] Teste de contrato para [endpoint] em `tests/contract/test_[name].py`
- [ ] T025 [P] [US3] Teste de integração para [jornada do utilizador] em `tests/integration/test_[name].py`

### Implementação da User Story 3

- [ ] T026 [P] [US3] Criar modelo [Entity] em `src/models/[entity].py`
- [ ] T027 [US3] Implementar [Service] em `src/services/[service].py`
- [ ] T028 [US3] Implementar [endpoint/feature] em `src/[location]/[file].py`

**Checkpoint**: Todas as user stories devem estar funcionais e testáveis de forma independente

---

[Adiciona mais fases de user stories conforme necessário]

---

## Fase N: Polimento e Questões Transversais

**Objetivo**: Melhorias que afetam múltiplas histórias

- [ ] TXXX [P] Atualizar documentação em `docs/`
- [ ] TXXX Limpeza e refatoração de código
- [ ] TXXX Otimização de performance
- [ ] TXXX [P] Adicionar testes unitários adicionais (se pedidos) em `tests/unit/`
- [ ] TXXX Endurecimento de segurança
- [ ] TXXX Validar `quickstart.md`

---

## Dependências e Ordem de Execução

### Dependências entre Fases

- **Setup (Fase 1)**: Sem dependências — pode começar imediatamente  
- **Fundacional (Fase 2)**: Depende do Setup — BLOQUEIA todas as user stories  
- **User Stories (Fase 3+)**: Todas dependem da conclusão da Fase 2  
  - As user stories podem prosseguir em paralelo (se houver equipa suficiente)  
  - Ou sequencialmente por prioridade (P1 → P2 → P3)  
- **Polimento (Fase Final)**: Depende da conclusão de todas as histórias desejadas

### Dependências entre User Stories

- **User Story 1 (P1)**: Pode começar após a Fase 2 — sem dependências
- **User Story 2 (P2)**: Pode começar após a Fase 2 — pode integrar com US1 mas deve ser independente
- **User Story 3 (P3)**: Pode começar após a Fase 2 — pode integrar com US1/US2 mas deve ser independente

### Dentro de Cada User Story

- Testes (se incluídos) DEVEM ser escritos e FALHAR antes da implementação  
- Modelos antes dos serviços  
- Serviços antes dos endpoints  
- Core antes da integração  
- História completa antes de passar à seguinte

### Oportunidades de Paralelismo

- Todas as tarefas de Setup marcadas [P] podem correr em paralelo  
- Todas as tarefas Fundacionais marcadas [P] podem correr em paralelo  
- Após a Fase 2, as user stories podem ser executadas em paralelo  
- Testes dentro de uma história marcados [P] podem correr em paralelo  
- Modelos marcados [P] podem correr em paralelo  
- Histórias diferentes podem ser atribuídas a membros diferentes

---

## Exemplo de Paralelismo: User Story 1

```bash
# Lançar todos os testes da User Story 1 em paralelo (se incluídos):
Task: "Teste de contrato para [endpoint] em tests/contract/test_[name].py"
Task: "Teste de integração para [jornada do utilizador] em tests/integration/test_[name].py"

# Lançar todos os modelos da User Story 1 em paralelo:
Task: "Criar modelo [Entity1] em src/models/[entity1].py"
Task: "Criar modelo [Entity2] em src/models/[entity2].py"
```

---

## Estratégia de Implementação

### MVP Primeiro (apenas User Story 1)

1. Completar Fase 1: Setup  
2. Completar Fase 2: Fundacional (**CRÍTICO — bloqueia todas as histórias**)  
3. Completar Fase 3: User Story 1  
4. **PARAR e VALIDAR**: Testar a User Story 1 de forma independente  
5. Fazer deploy/demo se estiver pronta

### Entregas Incrementais

1. Completar Setup + Fundacional → Fundações prontas  
2. Adicionar User Story 1 → Testar → Deploy/Demo (MVP!)  
3. Adicionar User Story 2 → Testar → Deploy/Demo  
4. Adicionar User Story 3 → Testar → Deploy/Demo  
5. Cada história adiciona valor sem quebrar as anteriores

### Estratégia de Equipa Paralela

Com vários developers:

1. Equipa completa Setup + Fundacional em conjunto  
2. Após a Fase 2:
   - Dev A: User Story 1  
   - Dev B: User Story 2  
   - Dev C: User Story 3  
3. Histórias completam-se e integram-se de forma independente

---

## Notas

- Tarefas [P] = ficheiros diferentes, sem dependências  
- Label [Story] mapeia tarefa à user story para rastreabilidade  
- Cada user story deve ser concluída e testada de forma independente  
- Escrever testes antes da implementação  
- Fazer commit após cada tarefa ou grupo lógico  
- Parar em cada checkpoint para validar  
- Evitar: tarefas vagas, conflitos de ficheiros, dependências cruzadas entre histórias
