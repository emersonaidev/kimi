# Plano de Implementação: Database Setup - Supabase Cloud

**Branch**: `001-supabase-db-setup` | **Data**: 2025-11-09 | **Spec**: [spec.md](./spec.md)
**Entrada**: Especificação da funcionalidade a partir de `/specs/001-supabase-db-setup/spec.md`

**Nota**: Este template é preenchido pelo comando `/speckit.plan`. Consulta `.specify/templates/commands/plan.md` para o fluxo de execução.

## Resumo

Implementar a base de dados KIMI completa no Supabase Cloud (ambiente KIMI-DEV) com 11 tabelas relacionais, Row Level Security (RLS) obrigatório para isolamento de dados entre caregivers, indexes de performance (incluindo GiST geoespaciais para safe zones), triggers automáticos para manter integridade de dados, e seed data realista para desenvolvimento e testes. A abordagem técnica utiliza migrações SQL versionadas aplicadas via MCP Supabase, garantindo conformidade GDPR através de RLS policies granulares e armazenamento de dados em PostgreSQL 15+ com extensão PostGIS para queries geoespaciais.

## Contexto Técnico

**Linguagem/Versão**: SQL (PostgreSQL 15+), TypeScript para Edge Functions (Deno runtime)
**Dependências Principais**: Supabase Cloud (managed PostgreSQL), PostGIS extension 3.x, uuid-ossp extension, MCP Supabase server
**Armazenamento**: Supabase Cloud PostgreSQL (managed service, não local), 11 tabelas relacionais, TIMESTAMPTZ para todos os timestamps
**Testes**: Queries SQL diretas para validar schema, EXPLAIN ANALYZE para performance, RLS testing com múltiplos auth users
**Plataforma-Alvo**: Supabase Cloud (ambiente KIMI-DEV), backend-as-a-service managed
**Tipo de Projeto**: Backend database infrastructure (serve apps React Native iOS e Next.js web futuro)
**Objetivos de Performance**:
- Queries de localização atual < 50ms
- Queries geoespaciais (safe zones) < 100ms
- Triggers de safe zone breach < 200ms
- Suporte para 100+ loved ones por caregiver sem degradação
**Restrições**:
- RLS obrigatório em 100% das tabelas (GDPR compliance)
- PostGIS obrigatório para geospatial queries
- ON DELETE CASCADE para relações parent-child
- Migrações versionadas e reversíveis
- Seed data idempotent
**Escala/Escopo**:
- 11 tabelas core
- 40+ indexes (standard + GiST geoespaciais + partial + composite)
- 4 triggers automáticos
- 8+ RLS policies por tabela
- Seed data: 1 caregiver, 1 loved one, 3 safe zones, ~60 registos históricos

## Verificação da Constituição

*GATE: Deve ser validado antes da Fase 0 (pesquisa). Revalidar após o design da Fase 1.*

- [x] **I. Privacy-First e GDPR**: ✅ RLS obrigatório em todas as 11 tabelas, isolamento completo de dados entre caregivers via `auth.uid()`, CASCADE deletes para garantir right-to-be-forgotten, audit trail via triggers
- [x] **II. Acessibilidade Universal**: ✅ N/A (esta funcionalidade é infraestrutura backend, não UI)
- [x] **III. Monorepo com Código Partilhado**: ✅ N/A (database schema, mas types TypeScript serão gerados via `supabase gen types` para uso no `/shared`)
- [x] **IV. Arquitetura Real-time**: ✅ Tabelas críticas (`gps_locations`, `health_metrics`, `activities`, `alerts`) preparadas para Realtime subscriptions, triggers garantem latência <200ms para alertas
- [x] **V. Mobile-First**: ✅ N/A (infraestrutura backend)
- [x] **VI. Standards de Código**: ✅ Todos os nomes de tabelas/colunas/functions em inglês, snake_case conforme standard PostgreSQL, comentários SQL em inglês, sem hardcoding (usa variáveis para emails e device_ids nos seeds)
- [x] **VII. Sistema de Design**: ✅ N/A (infraestrutura backend)
- [x] **VIII. Observabilidade**: ✅ Triggers logging mudanças críticas, RLS policies auditáveis, performance monitorizada via EXPLAIN ANALYZE, métricas de slow queries via Supabase dashboard

**Status**: ✅ APROVADO - Nenhuma violação identificada. Todos os princípios aplicáveis foram cumpridos.

## Estrutura do Projeto

### Documentação (desta funcionalidade)

```text
specs/[###-feature]/
├── plan.md              # Este ficheiro (saída do comando /speckit.plan)
├── research.md          # Saída da Fase 0 (/speckit.plan)
├── data-model.md        # Saída da Fase 1 (/speckit.plan)
├── quickstart.md        # Saída da Fase 1 (/speckit.plan)
├── contracts/           # Saída da Fase 1 (/speckit.plan)
└── tasks.md             # Saída da Fase 2 (/speckit.tasks – não criado por /speckit.plan)
```

### Código-Fonte (raiz do repositório)

```text
supabase/
├── migrations/
│   ├── 20251109000001_enable_extensions.sql      # Enable uuid-ossp and PostGIS
│   ├── 20251109000002_create_core_tables.sql     # caregivers, loved_ones
│   ├── 20251109000003_create_data_tables.sql     # gps_locations, health_metrics
│   ├── 20251109000004_create_feature_tables.sql  # safe_zones, activities, alerts
│   ├── 20251109000005_create_support_tables.sql  # chat_messages, emergency_contacts, preferences, location_shares
│   ├── 20251109000006_create_indexes.sql         # All performance indexes (standard, GiST, partial, composite)
│   ├── 20251109000007_enable_rls.sql             # Enable RLS on all tables
│   ├── 20251109000008_create_rls_policies.sql    # All RLS policies
│   ├── 20251109000009_create_functions.sql       # Utility functions (updated_at, handle_new_user, etc.)
│   ├── 20251109000010_create_triggers.sql        # All triggers
│   └── 20251109000011_seed_data.sql              # Development seed data
└── config.toml                                    # Supabase configuration

shared/
└── types/
    └── database.types.ts                          # Generated via `supabase gen types typescript`
```

**Decisão de Estrutura**: Infraestrutura backend pura usando Supabase Cloud. Todas as alterações à base de dados são versionadas como migrações SQL na pasta `/supabase/migrations/`. Cada migração tem uma responsabilidade única (single responsibility principle). A ordem das migrações é crítica: extensions → tables → indexes → RLS → policies → functions → triggers → seed data. Types TypeScript serão gerados automaticamente para uso em `/shared` pelo frontend React Native e web.

## Monitorização de Complexidade

**Não aplicável** - Nenhuma violação da Constituição KIMI identificada. Todos os princípios aplicáveis foram cumpridos.
