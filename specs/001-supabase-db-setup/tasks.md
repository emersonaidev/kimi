# Tarefas: Database Setup - Supabase Cloud

**Entrada**: Documentos de design em `/specs/001-supabase-db-setup/`
**Pré-requisitos**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Testes**: Esta funcionalidade NÃO requer testes automatizados. A validação é feita via queries SQL diretas e MCP Supabase tools.

**Organização**: As tarefas são agrupadas por user story para permitir implementação e validação independentes de cada componente do schema.

## Formato: `[ID] [P?] [Story] Descrição`

- **[P]**: Pode ser executada em paralelo (migrações SQL diferentes, sem dependências)
- **[Story]**: Indica a que user story pertence (ex.: US1, US2, US3, US4, US5)
- Inclui sempre os caminhos de ficheiros exatos nas descrições

## Convenções de Caminho

- **Migrações SQL**: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
- **Types TypeScript**: `shared/types/database.types.ts` (auto-generated)

---

## Fase 1: Setup (Infraestrutura Supabase)

**Objetivo**: Preparar ambiente Supabase Cloud e estrutura de migrações

- [ ] T001 Verificar acesso ao projeto KIMI-DEV via MCP Supabase `list_projects`
- [ ] T002 Criar diretório de migrações `supabase/migrations/` se não existir
- [ ] T003 Criar arquivo de configuração `supabase/config.toml` se não existir

---

## Fase 2: Fundacional (Extensions e Infraestrutura Core)

**Objetivo**: Ativar extensions PostgreSQL necessárias para TODAS as user stories

**⚠️ CRÍTICO**: Nenhuma tabela pode ser criada antes da conclusão desta fase

- [ ] T004 Criar migração `supabase/migrations/20251109000001_enable_extensions.sql` para ativar uuid-ossp e PostGIS extensions
- [ ] T005 Aplicar migração T004 via MCP `apply_migration` e validar que extensions estão ativas

**Checkpoint**: Extensions prontas — pode iniciar criação de tabelas em paralelo

---

## Fase 3: User Story 1 - Database Schema Creation (Prioridade: P1) 🎯 MVP

**Objetivo**: Criar todas as 11 tabelas relacionais com constraints e tipos de dados corretos

**Teste Independente**: Executar queries SQL para verificar existência de todas as tabelas com colunas, tipos e constraints corretos via MCP `execute_sql`

### Implementação da User Story 1

- [ ] T006 [P] [US1] Criar migração `supabase/migrations/20251109000002_create_core_tables.sql` com tabelas `caregivers` e `loved_ones`
- [ ] T007 [P] [US1] Criar migração `supabase/migrations/20251109000003_create_data_tables.sql` com tabelas `gps_locations` e `health_metrics`
- [ ] T008 [P] [US1] Criar migração `supabase/migrations/20251109000004_create_feature_tables.sql` com tabelas `safe_zones`, `activities` e `alerts`
- [ ] T009 [P] [US1] Criar migração `supabase/migrations/20251109000005_create_support_tables.sql` com tabelas `chat_messages`, `emergency_contacts`, `caregiver_preferences` e `location_shares`
- [ ] T010 [US1] Aplicar migrações T006-T009 via MCP `apply_migration` em ordem sequencial
- [ ] T011 [US1] Validar que todas as 11 tabelas foram criadas via MCP `list_tables`
- [ ] T012 [US1] Validar tipos de dados (UUID, TIMESTAMPTZ, DOUBLE PRECISION, CHECK constraints) via MCP `execute_sql` com query de introspection
- [ ] T013 [US1] Validar foreign keys com `ON DELETE CASCADE` apropriado via query `pg_constraint`

**Checkpoint**: Todas as 11 tabelas devem estar criadas com schema correto e consultáveis

---

## Fase 4: User Story 2 - Performance Indexes Implementation (Prioridade: P1)

**Objetivo**: Criar todos os 40+ indexes para garantir queries <100ms

**Teste Independente**: Executar EXPLAIN ANALYZE em queries críticas e confirmar uso de indexes (não table scans)

### Implementação da User Story 2

- [ ] T014 [US2] Criar migração `supabase/migrations/20251109000006_create_indexes.sql` com TODOS os indexes especificados em data-model.md
- [ ] T015 [US2] Incluir indexes standard em foreign keys (13 indexes)
- [ ] T016 [US2] Incluir indexes em timestamps com DESC (5 indexes)
- [ ] T017 [US2] Incluir composite indexes (loved_one_id, timestamp DESC) (4 indexes)
- [ ] T018 [US2] Incluir GiST geospatial indexes em gps_locations e safe_zones (2 indexes)
- [ ] T019 [US2] Incluir partial indexes (is_read=false, is_active=true, expires_at IS NOT NULL) (3 indexes)
- [ ] T020 [US2] Incluir indexes em email, device_id, share_token (5 indexes)
- [ ] T021 [US2] Incluir indexes em activity type e alert severity (3 indexes)
- [ ] T022 [US2] Aplicar migração T014 via MCP `apply_migration`
- [ ] T023 [US2] Validar que todos os indexes foram criados via query `pg_indexes WHERE schemaname = 'public'`
- [ ] T024 [US2] Executar EXPLAIN ANALYZE para query de latest GPS location e confirmar index usage
- [ ] T025 [US2] Executar EXPLAIN ANALYZE para safe zone geospatial query e confirmar GiST index usage

**Checkpoint**: Queries críticas devem usar indexes e executar em <100ms

---

## Fase 5: User Story 3 - Row Level Security Policies (Prioridade: P1)

**Objetivo**: Ativar RLS em todas as tabelas e criar policies para isolamento completo de dados entre caregivers

**Teste Independente**: Criar múltiplos test users e validar que cada um só acessa seus próprios dados via diferentes contextos de auth

### Implementação da User Story 3

- [ ] T026 [US3] Criar migração `supabase/migrations/20251109000007_enable_rls.sql` com `ALTER TABLE x ENABLE ROW LEVEL SECURITY` para todas as 11 tabelas
- [ ] T027 [US3] Aplicar migração T026 via MCP `apply_migration`
- [ ] T028 [US3] Validar que RLS está ativo via query `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'`
- [ ] T029 [US3] Criar migração `supabase/migrations/20251109000008_create_rls_policies.sql` com TODAS as policies especificadas em data-model.md
- [ ] T030 [US3] Incluir policies para tabela `caregivers` (SELECT, UPDATE usando auth.uid())
- [ ] T031 [US3] Incluir policies para tabela `loved_ones` (SELECT, ALL usando caregiver_id)
- [ ] T032 [US3] Incluir policies para tabelas `gps_locations`, `health_metrics`, `activities` (SELECT usando join com caregivers)
- [ ] T033 [US3] Incluir policies para tabela `safe_zones` (ALL usando caregiver_id)
- [ ] T034 [US3] Incluir policies para tabela `alerts` (SELECT, UPDATE usando caregiver_id)
- [ ] T035 [US3] Incluir policies para tabela `chat_messages` (SELECT, INSERT com WITH CHECK)
- [ ] T036 [US3] Incluir policies para tabelas `emergency_contacts`, `caregiver_preferences`, `location_shares` (ALL usando caregiver_id)
- [ ] T037 [US3] Aplicar migração T029 via MCP `apply_migration`
- [ ] T038 [US3] Validar policies criadas via query `SELECT * FROM pg_policies WHERE schemaname = 'public'`
- [ ] T039 [US3] Criar segundo auth user via Supabase Dashboard e validar isolamento de dados entre caregivers

**Checkpoint**: RLS deve bloquear 100% dos acessos cross-caregiver, cada utilizador vê apenas seus dados

---

## Fase 6: User Story 4 - Automated Triggers & Functions (Prioridade: P2)

**Objetivo**: Criar triggers e functions automáticas para integridade de dados e lógica de negócio crítica

**Teste Independente**: Executar operações CRUD e verificar efeitos colaterais (auto-created profiles, updated timestamps, alerts gerados)

### Implementação da User Story 4

- [ ] T040 [US4] Criar migração `supabase/migrations/20251109000009_create_functions.sql` com TODAS as functions especificadas em data-model.md
- [ ] T041 [US4] Incluir function `update_updated_at_column()` que atualiza updated_at para NOW()
- [ ] T042 [US4] Incluir function `handle_new_user()` SECURITY DEFINER que cria caregiver quando auth.user é criado
- [ ] T043 [US4] Incluir function `handle_new_caregiver()` SECURITY DEFINER que cria preferences quando caregiver é criado
- [ ] T044 [US4] Incluir function `check_safe_zone_breach()` SECURITY DEFINER que deteta saída de safe zones e cria alertas usando ST_Distance e PostGIS
- [ ] T045 [US4] Aplicar migração T040 via MCP `apply_migration`
- [ ] T046 [US4] Validar functions criadas via query `SELECT proname FROM pg_proc WHERE pronamespace = 'public'::regnamespace`
- [ ] T047 [US4] Criar migração `supabase/migrations/20251109000010_create_triggers.sql` com TODOS os triggers especificados
- [ ] T048 [US4] Incluir trigger `on_auth_user_created` AFTER INSERT em auth.users executando handle_new_user()
- [ ] T049 [US4] Incluir trigger `on_caregiver_created` AFTER INSERT em caregivers executando handle_new_caregiver()
- [ ] T050 [US4] Incluir triggers `update_caregivers_updated_at`, `update_loved_ones_updated_at`, `update_safe_zones_updated_at`, `update_emergency_contacts_updated_at`, `update_caregiver_preferences_updated_at` BEFORE UPDATE executando update_updated_at_column()
- [ ] T051 [US4] Incluir trigger `on_gps_location_inserted` AFTER INSERT em gps_locations executando check_safe_zone_breach()
- [ ] T052 [US4] Aplicar migração T047 via MCP `apply_migration`
- [ ] T053 [US4] Validar triggers criados via query `SELECT tgname, tgrelid::regclass FROM pg_trigger WHERE tgrelid::regclass::text LIKE '%'`
- [ ] T054 [US4] Testar trigger de auto-create: criar auth user via Dashboard e confirmar que caregiver e preferences são criados automaticamente
- [ ] T055 [US4] Testar trigger de updated_at: executar UPDATE em caregiver e confirmar que updated_at mudou
- [ ] T056 [US4] Testar trigger de safe zone breach: inserir GPS location fora de safe zone e confirmar que alert é criado

**Checkpoint**: Triggers devem executar automaticamente em <100ms e manter integridade de dados

---

## Fase 7: User Story 5 - Seed Data Population (Prioridade: P2)

**Objetivo**: Inserir dados iniciais realistas para desenvolvimento e testes (1 caregiver, 1 loved one, 3 safe zones, ~60 registos históricos)

**Teste Independente**: Executar queries de contagem em cada tabela e verificar valores específicos (emails, device_id, nomes)

### Implementação da User Story 5

- [ ] T057 [US5] Criar migração `supabase/migrations/20251109000011_seed_data.sql` com TODOS os seed data especificados em DATABASE_SPECIFICATION.md
- [ ] T058 [US5] Incluir INSERT para caregiver Emerson Ferreira (email: emersonaidev@gmail.com) usando ON CONFLICT DO NOTHING
- [ ] T059 [US5] Incluir INSERT para loved one Ester Ferreira (device_id: KIMI-8472, age: 18, condition: 'Autism Spectrum')
- [ ] T060 [US5] Incluir INSERT para 3 safe zones (Home, School, Park) com coordenadas de Lisboa (38.72xx, -9.14xx)
- [ ] T061 [US5] Incluir INSERT para 3 emergency contacts (Mother, Therapist, Emergency Services com priority)
- [ ] T062 [US5] Incluir INSERT para ~20 GPS locations das últimas 24 horas usando generate_series e random variations
- [ ] T063 [US5] Incluir INSERT para 24 health metrics (um por hora) usando generate_series com stress spike às 16h
- [ ] T064 [US5] Incluir INSERT para ~8 activities dos últimos 7 dias com types variados (arrived_at, high_stress, zone_exit, sleeping)
- [ ] T065 [US5] Incluir INSERT para 1 chat message de boas-vindas do AI
- [ ] T066 [US5] Aplicar migração T057 via MCP `apply_migration`
- [ ] T067 [US5] Validar seed data: executar query `SELECT COUNT(*) FROM caregivers WHERE email = 'emersonaidev@gmail.com'` (deve retornar 1)
- [ ] T068 [US5] Validar seed data: executar query `SELECT COUNT(*) FROM loved_ones WHERE device_id = 'KIMI-8472'` (deve retornar 1)
- [ ] T069 [US5] Validar seed data: executar query `SELECT COUNT(*) FROM safe_zones WHERE name IN ('Home', 'School', 'Park')` (deve retornar 3)
- [ ] T070 [US5] Validar seed data: executar query `SELECT COUNT(*) FROM gps_locations` (deve retornar ~16-24)
- [ ] T071 [US5] Validar seed data: executar query `SELECT COUNT(*) FROM health_metrics` (deve retornar 24)
- [ ] T072 [US5] Validar seed data: executar query `SELECT COUNT(*) FROM activities` (deve retornar >=8)
- [ ] T073 [US5] Validar seed data: executar query `SELECT COUNT(*) FROM emergency_contacts` (deve retornar 3)
- [ ] T074 [US5] Validar seed data: executar query `SELECT COUNT(*) FROM chat_messages` (deve retornar 1)

**Checkpoint**: Todos os seed data devem estar inseridos sem erros e consultáveis

---

## Fase 8: Polimento e Validação Final

**Objetivo**: Gerar types TypeScript, validar performance final e preparar para produção

- [ ] T075 [P] Executar `supabase gen types typescript --project-id [KIMI-DEV-ID]` e salvar em `shared/types/database.types.ts`
- [ ] T076 Executar query de performance para latest GPS location com EXPLAIN ANALYZE e confirmar <50ms
- [ ] T077 Executar query de performance para safe zone geospatial com EXPLAIN ANALYZE e confirmar <100ms
- [ ] T078 Executar query de performance para activity timeline com EXPLAIN ANALYZE e confirmar <100ms
- [ ] T079 Executar `ANALYZE [table_name]` para TODAS as 11 tabelas para atualizar query planner statistics
- [ ] T080 [P] Executar todas as queries de teste de `quickstart.md` e confirmar resultados esperados
- [ ] T081 [P] Executar advisory check via MCP `get_advisors` para security e performance e confirmar zero issues críticos
- [ ] T082 Documentar connection strings e credentials do KIMI-DEV em arquivo seguro (não commitado)
- [ ] T083 [P] Validar que `quickstart.md` está atualizado e funcional
- [ ] T084 Criar backup manual do schema via Supabase Dashboard antes de considerar produção

---

## Dependências e Ordem de Execução

### Dependências entre Fases

- **Setup (Fase 1)**: Sem dependências — pode começar imediatamente
- **Fundacional (Fase 2)**: Depende do Setup — BLOQUEIA todas as user stories
- **User Story 1 (Fase 3)**: Depende de Fase 2 — tabelas primeiro
- **User Story 2 (Fase 4)**: Depende de Fase 3 — indexes requerem tabelas existentes
- **User Story 3 (Fase 5)**: Depende de Fase 3 — RLS requer tabelas existentes (independente de indexes)
- **User Story 4 (Fase 6)**: Depende de Fase 3 — triggers requerem tabelas existentes (independente de indexes/RLS)
- **User Story 5 (Fase 7)**: Depende de Fases 3, 4, 6 — seed data requer tabelas, triggers (auto-create) e pode beneficiar de indexes
- **Polimento (Fase 8)**: Depende de conclusão de todas as fases anteriores

### Dependências entre User Stories

```
Fase 2 (Extensions)
    ↓
Fase 3 (Tables) ────────┐
    ↓                   ↓
    ├─→ Fase 4 (Indexes)    ├─→ Fase 5 (RLS)
    ↓                       ↓
    └─→ Fase 6 (Triggers) ──┘
         ↓
    Fase 7 (Seed Data)
         ↓
    Fase 8 (Polimento)
```

- **US1 (Tables)**: Independente após Fase 2
- **US2 (Indexes)**: Depende de US1 (tabelas devem existir)
- **US3 (RLS)**: Depende de US1 (tabelas devem existir), independente de US2
- **US4 (Triggers)**: Depende de US1 (tabelas devem existir), independente de US2/US3
- **US5 (Seed Data)**: Depende de US1, US4 (triggers auto-create), beneficia de US2

### Dentro de Cada User Story

- **US1**: Migrações SQL sequenciais (core → data → feature → support)
- **US2**: Single migration com todos os indexes (pode incluir tudo em paralelo dentro do SQL)
- **US3**: RLS enable primeiro, depois policies (2 migrações sequenciais)
- **US4**: Functions primeiro, depois triggers (2 migrações sequenciais)
- **US5**: Single migration com todos os seed data (INSERTs podem ser paralelos dentro do SQL)

### Oportunidades de Paralelismo

- **Fase 1 (Setup)**: T001, T002, T003 podem rodar em paralelo
- **Fase 3 (US1)**: T006, T007, T008, T009 são migrações independentes mas devem ser aplicadas sequencialmente via MCP
- **Fase 5 (US3)**: RLS e Policies podem ser desenvolvidas em paralelo, mas aplicadas sequencialmente
- **Fase 6 (US4)**: Functions e Triggers podem ser desenvolvidas em paralelo, mas aplicadas sequencialmente
- **Fase 8 (Polimento)**: T075, T080, T081, T083 podem rodar em paralelo

**NOTA**: Apesar de migrações poderem ser desenvolvidas em paralelo, a aplicação via MCP `apply_migration` deve ser SEMPRE sequencial para respeitar ordem de dependências.

---

## Exemplo de Paralelismo: Desenvolvimento vs Aplicação

### Desenvolvimento (Paralelo)

```bash
# Developer A: Trabalha em tables
Task T006: Escrever SQL para caregivers e loved_ones

# Developer B: Trabalha em indexes (mesmo antes de tables serem aplicadas)
Task T014: Escrever SQL para todos os indexes

# Developer C: Trabalha em RLS policies
Task T026, T029: Escrever SQL para RLS enable e policies
```

### Aplicação (Sequencial via MCP)

```bash
# Aplicar SEMPRE nesta ordem via MCP apply_migration:
1. Extensions (T004-T005)
2. Tables (T010: aplica T006, T007, T008, T009 em ordem)
3. Indexes (T022: aplica T014)
4. RLS (T027: aplica T026) → Policies (T037: aplica T029)
5. Functions (T045: aplica T040) → Triggers (T052: aplica T047)
6. Seed Data (T066: aplica T057)
```

---

## Estratégia de Implementação

### MVP Primeiro (Apenas US1 + US2 + US3)

1. Completar Fase 1: Setup
2. Completar Fase 2: Fundacional (Extensions) — **CRÍTICO**
3. Completar Fase 3: US1 (Tables)
4. Completar Fase 4: US2 (Indexes)
5. Completar Fase 5: US3 (RLS)
6. **PARAR e VALIDAR**: Schema básico com security pronto
7. Deploy mínimo sem triggers/seed para validação inicial

### Entregas Incrementais

1. **v0.1**: Setup + Extensions + Tables → Schema básico consultável
2. **v0.2**: + Indexes → Performance otimizada
3. **v0.3**: + RLS → Segurança GDPR compliant
4. **v0.4**: + Triggers → Lógica automática de negócio
5. **v1.0**: + Seed Data + Polimento → Pronto para desenvolvimento frontend

### Rollback Plan

Cada migração SQL deve ter rollback preparado:

```sql
-- Migration: 20251109000002_create_core_tables.sql
CREATE TABLE caregivers (...);
CREATE TABLE loved_ones (...);

-- Rollback (caso necessário):
DROP TABLE IF EXISTS loved_ones CASCADE;
DROP TABLE IF EXISTS caregivers CASCADE;
```

Supabase Dashboard permite rollback via UI se necessário.

---

## Notas

- ✅ Todas as tarefas têm caminhos de ficheiros explícitos
- ✅ Cada user story é independente após Fase 2
- ✅ RLS obrigatório antes de qualquer dado real
- ✅ Triggers garantem integridade automática
- ✅ Seed data idempotent (ON CONFLICT DO NOTHING)
- ✅ Performance validada com EXPLAIN ANALYZE
- ⚠️ NUNCA aplicar migrações em ordem errada (extensions → tables → indexes → RLS → functions → triggers → seed)
- ⚠️ SEMPRE validar RLS com múltiplos users antes de produção
- ⚠️ SEMPRE backup antes de migrations destrutivas
- ⚠️ Service role key apenas para wearable devices, NUNCA em frontend
