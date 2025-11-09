# Research: Database Setup - Supabase Cloud

**Feature**: 001-supabase-db-setup
**Data**: 2025-11-09
**Status**: Concluído

## Resumo Executivo

Esta pesquisa documenta todas as decisões técnicas para a implementação da base de dados KIMI no Supabase Cloud. Como esta é infraestrutura backend pura com stack tecnológica bem definida (Supabase Cloud + PostgreSQL + PostGIS), não foram identificadas incógnitas técnicas que requeressem pesquisa adicional. Todas as escolhas seguem as best practices de Supabase e PostgreSQL para aplicações healthcare com requisitos rigorosos de privacidade e performance.

## Decisões Técnicas

### 1. Database Provider: Supabase Cloud

**Decisão**: Usar Supabase Cloud (managed PostgreSQL) exclusivamente, sem setup local.

**Justificação**:
- Managed service reduz complexidade operacional (backups, scaling, patches automáticos)
- Supabase Auth integrado resolve autenticação sem código adicional
- Supabase Realtime built-in para websockets sem servidor adicional
- RLS (Row Level Security) é first-class citizen no Supabase
- PostGIS extension suportada nativamente
- Dashboard UI para debugging e monitorização
- Free tier generoso para desenvolvimento + plano Pro para produção

**Alternativas Consideradas**:
- **PostgreSQL self-hosted**: Rejeitado - maior complexidade operacional, sem Auth/Realtime integrado, equipa pequena não tem recursos para DevOps
- **Firebase**: Rejeitado - NoSQL não adequado para relações complexas (11 tabelas relacionais), RLS menos robusto, geospatial queries limitadas
- **AWS RDS + Amplify**: Rejeitado - configuração mais complexa, custos mais altos, lock-in similar mas menos features out-of-the-box

### 2. SQL Migration Strategy: Versionadas por Timestamp

**Decisão**: Criar migrações SQL separadas e versionadas por timestamp no formato `YYYYMMDDHHmmss_description.sql`.

**Justificação**:
- Migrations versionadas permitem rollback seguro
- Separação por responsabilidade facilita debugging (ex: indexes separados de tables)
- Timestamp garante ordem determinística de execução
- Idempotência via `IF NOT EXISTS` previne erros em re-runs
- Histórico completo de alterações auditável
- Supabase CLI aplica migrations automaticamente em ordem

**Alternativas Consideradas**:
- **Single monolithic migration**: Rejeitado - dificulta rollback granular, harder to review, merge conflicts em equipa
- **ORM migrations (Prisma, TypeORM)**: Rejeitado - adiciona abstração desnecessária, SQL direto é mais transparente para debugging, Supabase não é ORM-first
- **Manual SQL via dashboard**: Rejeitado - não versionado, não auditável, propenso a erros humanos

### 3. Row Level Security: Policies Granulares por Operação

**Decisão**: Criar RLS policies separadas para SELECT, INSERT, UPDATE, DELETE em vez de usar policy única com ALL.

**Justificação**:
- Princípio de least privilege - cada operação tem permissões exatas necessárias
- Facilita audit trail - logs mostram exatamente qual policy foi usada
- Debugging mais simples - failures apontam para policy específica
- Permite diferentes condições por operação (ex: INSERT pode ser mais restritivo que SELECT)
- Compliance GDPR - demonstra granularidade de controlo de acesso

**Alternativas Consideradas**:
- **Single ALL policy**: Rejeitado - menos seguro, mais difícil de auditar, viola princípio de least privilege
- **Application-level authorization**: Rejeitado - pode ser bypassado, não protege contra direct database access, duplica lógica

### 4. Geospatial Queries: PostGIS com Geography Type

**Decisão**: Usar PostGIS extension com `geography` type (não `geometry`) e SRID 4326 (WGS84).

**Justificação**:
- `geography` calcula distâncias em metros reais (não degrees), critical para safe zones radius
- SRID 4326 é o standard GPS usado por todos os wearables
- GiST indexes em geography fields providenciam performance O(log n) para spatial queries
- ST_Distance em geography é preciso para distâncias curtas (<500km) sem projeções complexas
- Supabase suporta PostGIS nativamente sem configuração adicional

**Alternativas Consideradas**:
- **Geometry type**: Rejeitado - retorna distâncias em degrees, requer conversões manuais, menos intuitivo
- **Haversine formula manual**: Rejeitado - reinventa a roda, performance pior que GiST indexes, propenso a bugs
- **External geospatial service**: Rejeitado - adiciona latência de rede, ponto extra de falha, custos adicionais

### 5. Triggers vs Application Logic: Triggers para Automatização Crítica

**Decisão**: Usar database triggers para lógica crítica (auto-create caregiver profile, updated_at, safe zone breach alerts).

**Justificação**:
- Garante consistência independente do cliente (mobile app, web app, future APIs)
- Execução atómica com transaction - rollback automático em falhas
- Performance superior - executa no mesmo servidor que o database
- Zero chance de bypass - sempre executado, mesmo em direct DB access
- Simplicidade - frontend não precisa replicar lógica crítica

**Alternativas Consideradas**:
- **Application-level logic**: Rejeitado - duplicação entre plataformas, pode ser esquecido, inconsistências entre clientes
- **Edge Functions**: Rejeitado - adiciona latência de rede, mais pontos de falha, triggers são mais rápidos para lógica simples
- **Client-side only**: Rejeitado - totalmente inseguro, fácil de bypass, viola GDPR

### 6. Seed Data Strategy: Idempotent with ON CONFLICT

**Decisão**: Seed data usa `INSERT ... ON CONFLICT DO NOTHING` para idempotência.

**Justificação**:
- Permite re-run de migration sem erros de duplicação
- Seguro para ambientes compartilhados (KIMI-DEV)
- Facilita reset de ambiente de desenvolvimento
- Garante determinismo - sempre mesmos IDs para dados de teste
- Não sobrescreve modificações manuais durante desenvolvimento

**Alternativas Consideradas**:
- **DELETE + INSERT**: Rejeitado - perde modificações manuais úteis, foreign key violations, mais destrutivo
- **UPSERT (ON CONFLICT DO UPDATE)**: Rejeitado - sobrescreve mudanças manuais de teste, seed deve ser baseline apenas
- **Separate seed script**: Rejeitado - migrations e seeds desacoplados, harder to guarantee state consistency

### 7. Index Strategy: Composite + GiST + Partial

**Decisão**: Criar 3 tipos de indexes - composite para queries frequentes, GiST para geospatial, partial para condições específicas.

**Justificação**:
- **Composite indexes** (ex: `loved_one_id, recorded_at DESC`) - otimizam queries mais comuns de timeline
- **GiST indexes** - únicos que suportam geospatial operators (ST_Distance, ST_DWithin)
- **Partial indexes** (ex: `WHERE is_read = false`) - menores, mais rápidos para queries filtradas
- EXPLAIN ANALYZE confirmará uso correto antes de deployment
- 40+ indexes cobrindo 100% das queries do frontend

**Alternativas Consideradas**:
- **Only B-tree indexes**: Rejeitado - não suportam geospatial queries, missed optimization opportunities
- **Index every column**: Rejeitado - write performance penalty, storage waste, maintenance overhead
- **No indexes**: Rejeitado - violaria performance requirements (<50ms queries)

### 8. Timestamp Strategy: TIMESTAMPTZ Everywhere

**Decisão**: Usar `TIMESTAMPTZ` (não `TIMESTAMP`) para todos os campos temporais.

**Justificação**:
- TIMESTAMPTZ armazena timezone, elimina ambiguidade
- Conversão automática para timezone do client
- Supabase clients (JS, Swift) parsam TIMESTAMPTZ corretamente
- Queries de timezone são transparentes (`AT TIME ZONE 'UTC'`)
- Best practice PostgreSQL universal

**Alternativas Consideradas**:
- **TIMESTAMP sem timezone**: Rejeitado - ambíguo, bugs em DST transitions, não segue PostgreSQL best practices
- **Unix timestamps (INTEGER)**: Rejeitado - menos legível em queries, sem suporte nativo a timezone operations
- **ISO strings em TEXT**: Rejeitado - sem type safety, sorting complexo, sem date arithmetic functions

## Boas Práticas Identificadas

### Supabase-Specific

1. **RLS Testing**: Criar múltiplos test users e validar isolation via `SET SESSION ROLE`
2. **Realtime Filters**: Frontend deve usar `.select()` filters para minimizar data transfer
3. **Service Role**: Wearable devices usam service role key (bypasses RLS) para writes
4. **Migration Naming**: `YYYYMMDDHHmmss_action_entity.sql` (ex: `20251109120000_create_caregivers.sql`)
5. **Generated Types**: Executar `supabase gen types typescript` após migrations para sync com frontend

### PostgreSQL-Specific

1. **SECURITY DEFINER**: Usar em functions que precisam elevar privilégios temporariamente
2. **Foreign Key Indexes**: PostgreSQL não cria indexes em FKs automaticamente - sempre criar manualmente
3. **ANALYZE After Bulk Inserts**: Executar `ANALYZE table_name` após seed data para atualizar query planner stats
4. **CHECK Constraints**: Preferir inline CHECKs a triggers quando possível para performance
5. **JSONB vs JSON**: Usar JSONB (não JSON) para `metadata` e `ai_context` - suporta indexing

### GDPR Compliance

1. **Cascade Deletes**: `ON DELETE CASCADE` garante right-to-be-forgotten
2. **Audit Logs**: Triggers em tables críticas para log de modificações
3. **Data Minimization**: Apenas campos necessários, sem PII desnecessária
4. **Encryption at Rest**: Supabase Cloud encrypta tudo automaticamente (AES-256)
5. **Access Logs**: RLS policies garantem que cada acesso é loggado e autorizado

### Performance

1. **EXPLAIN ANALYZE Threshold**: Queries >100ms devem ser otimizadas before merge
2. **Index Selectivity**: Partial indexes para queries com `WHERE` conditions frequentes
3. **Connection Pooling**: Supabase usa pgBouncer automaticamente - nada a configurar
4. **Prepared Statements**: Supabase clients usam prepared statements automaticamente
5. **Batch Inserts**: Seed data usa batch inserts para performance

## Dependências Externas

**Nenhuma** - Stack é completamente Supabase Cloud gerido:
- PostgreSQL 15+ (gerido)
- PostGIS 3.x (extension gerida)
- uuid-ossp (extension gerida)
- Supabase Auth (serviço gerido)
- Supabase Realtime (serviço gerido)

## Riscos Identificados

### 1. PostGIS Availability

**Risco**: PostGIS extension não estar disponível em Supabase free tier ou falhar.
**Mitigação**: Supabase garante PostGIS em todos os tiers. Fallback: Haversine formula manual (lower performance).
**Probabilidade**: Muito baixa
**Impacto**: Alto

### 2. RLS Performance at Scale

**Risco**: RLS policies podem degradar performance com muitos caregivers.
**Mitigação**: Indexes em `caregiver_id` e `user_id`, EXPLAIN ANALYZE durante development, Supabase Pro tem compute dedicado.
**Probabilidade**: Baixa
**Impacto**: Médio

### 3. Migration Rollback Failures

**Risco**: Rollback de migration falhar devido a data dependencies.
**Mitigação**: Testar rollback em ambiente DEV, manter migrations granulares, backups antes de cada deployment.
**Probabilidade**: Baixa
**Impacto**: Alto

### 4. Seed Data Conflicts

**Risco**: Seed data com UUIDs hardcoded pode conflitar com produção.
**Mitigação**: Seeds apenas em KIMI-DEV, UUIDs específicos de desenvolvimento, nunca seed em KIMI-PROD.
**Probabilidade**: Muito baixa (processo protegido)
**Impacto**: Crítico

## Próximos Passos

1. **Fase 1**: Gerar `data-model.md` com esquema completo das 11 tabelas
2. **Fase 1**: Gerar `contracts/` com API contracts (auto-generated REST endpoints do Supabase)
3. **Fase 1**: Gerar `quickstart.md` com instruções de setup
4. **Fase 1**: Atualizar contexto do agente com decisões técnicas
5. **Fase 2**: Gerar `tasks.md` com implementação detalhada

## Conclusão

Todas as decisões técnicas estão fundamentadas em best practices de Supabase, PostgreSQL e compliance GDPR. Nenhuma incógnita técnica permanece. A implementação pode prosseguir para a Fase 1 (design detalhado) com confiança.
