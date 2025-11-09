# Quickstart: KIMI Database Setup

**Feature**: 001-supabase-db-setup
**Tempo Estimado**: 15-20 minutos

## Prerequisites

- [ ] Supabase CLI instalado (`npm install -g supabase`)
- [ ] Conta Supabase Cloud
- [ ] Projeto KIMI-DEV criado no dashboard
- [ ] MCP Supabase configurado e autenticado

## Passo 1: Listar Projetos (2 min)

```bash
# Via MCP Supabase
mcp__supabase__list_projects
```

Anota o `project_id` do projeto KIMI-DEV.

## Passo 2: Aplicar Migrações SQL (10 min)

As 11 migrações serão aplicadas via MCP em ordem:

1. Enable extensions (uuid-ossp, PostGIS)
2. Create core tables (caregivers, loved_ones)
3. Create data tables (gps_locations, health_metrics)
4. Create feature tables (safe_zones, activities, alerts)
5. Create support tables (chat_messages, emergency_contacts, preferences, location_shares)
6. Create all indexes
7. Enable RLS on all tables
8. Create RLS policies
9. Create functions (handle_new_user, update_updated_at, check_safe_zone_breach)
10. Create triggers
11. Insert seed data

Cada migração será aplicada com:
```bash
mcp__supabase__apply_migration --project-id [KIMI-DEV-ID] --name "migration_name" --query "SQL_CONTENT"
```

## Passo 3: Criar Auth User (2 min)

Via Supabase Dashboard > Authentication > Users:
- Email: `emersonaidev@gmail.com`
- Password: [escolher password segura]
- Confirm email automaticamente

O trigger `on_auth_user_created` criará automaticamente:
- Registo em `caregivers`
- Registo em `caregiver_preferences`

## Passo 4: Validar Schema (3 min)

```bash
# Via MCP - List tables
mcp__supabase__list_tables --project-id [KIMI-DEV-ID]

# Verificar extensões
mcp__supabase__execute_sql --project-id [KIMI-DEV-ID] --query "SELECT * FROM pg_extension WHERE extname IN ('uuid-ossp', 'postgis');"

# Verificar RLS ativo
mcp__supabase__execute_sql --project-id [KIMI-DEV-ID] --query "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';"

# Contar seed data
mcp__supabase__execute_sql --project-id [KIMI-DEV-ID] --query "SELECT 'caregivers' as table_name, COUNT(*) FROM caregivers UNION ALL SELECT 'loved_ones', COUNT(*) FROM loved_ones UNION ALL SELECT 'safe_zones', COUNT(*) FROM safe_zones UNION ALL SELECT 'gps_locations', COUNT(*) FROM gps_locations;"
```

Resultados esperados:
- ✅ 11 tabelas criadas
- ✅ 2 extensions ativas (uuid-ossp, postgis)
- ✅ RLS = true em todas as tabelas
- ✅ Seed data: 1 caregiver, 1 loved_one, 3 safe_zones, ~20 GPS locations

## Passo 5: Testar RLS Policies (2 min)

```bash
# Autenticar como user de teste
# Via Supabase Dashboard > SQL Editor:

-- Simular autenticação
SELECT set_config('request.jwt.claims', '{"sub":"' || id || '"}', false)
FROM auth.users WHERE email = 'emersonaidev@gmail.com';

-- Testar SELECT em caregivers (deve retornar 1)
SELECT COUNT(*) FROM caregivers;

-- Testar SELECT em loved_ones (deve retornar 1)
SELECT COUNT(*) FROM loved_ones;

-- Testar isolation (deve retornar 0)
-- Criar segundo user e tentar aceder dados do primeiro
```

## Passo 6: Testar Performance (2 min)

```bash
# Via SQL Editor - Latest GPS location
EXPLAIN ANALYZE
SELECT * FROM gps_locations
WHERE loved_one_id = (SELECT id FROM loved_ones WHERE device_id = 'KIMI-8472')
ORDER BY recorded_at DESC
LIMIT 1;
```

Resultado esperado:
- ✅ Execution time < 50ms
- ✅ Index scan (não Seq Scan)

```bash
# Geospatial query - Safe zone check
EXPLAIN ANALYZE
SELECT sz.name,
       ST_Distance(
         ST_SetSRID(ST_MakePoint(-9.1393, 38.7223), 4326)::geography,
         ST_SetSRID(ST_MakePoint(sz.longitude, sz.latitude), 4326)::geography
       ) as distance_meters
FROM safe_zones sz
WHERE loved_one_id = (SELECT id FROM loved_ones WHERE device_id = 'KIMI-8472')
  AND is_active = true;
```

Resultado esperado:
- ✅ Execution time < 100ms
- ✅ GiST Index scan

## Passo 7: Gerar TypeScript Types (1 min)

```bash
supabase gen types typescript --project-id [KIMI-DEV-ID] > shared/types/database.types.ts
```

## Verificação Final

- [ ] Todas as 11 tabelas criadas
- [ ] PostGIS extension ativa
- [ ] RLS ativo em 100% das tabelas
- [ ] RLS policies isolam dados entre caregivers
- [ ] Triggers funcionam (auto-create caregiver on auth.user insert)
- [ ] Seed data presente
- [ ] Queries de performance passam (<100ms)
- [ ] Types TypeScript gerados

## Troubleshooting

### Migration Fail
- Verificar ordem de migrações
- Verificar foreign key dependencies
- Rollback via Supabase dashboard se necessário

### RLS Blocking Queries
- Verificar autenticação do client
- Confirmar `auth.uid()` está set
- Usar service role key temporariamente para debug

### Performance Issues
- Executar `ANALYZE [table_name]` após bulk inserts
- Verificar indexes criados via `\di` no SQL editor
- Usar EXPLAIN ANALYZE para identify slow queries

## Next Steps

Após setup bem-sucedido:
1. Configurar Realtime subscriptions no frontend
2. Implementar wearable simulator para testing
3. Integrar frontend React Native com Supabase client
4. Configurar push notifications via FCM/APNS
5. Deploy para KIMI-PROD quando validado
