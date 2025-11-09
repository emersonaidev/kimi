# Plano de Implementação: Aplicação de Monitorização KIMI para Caregivers

**Branch**: `002-caregiver-monitoring-app` | **Data**: 2025-11-09 | **Spec**: [spec.md](./spec.md)
**Entrada**: Especificação da funcionalidade a partir de `specs/002-caregiver-monitoring-app/spec.md`

## Resumo

**Requisito Principal**: Construir aplicação web de monitorização de loved ones para caregivers, usando Frontendtemplatekimi como base visual/estrutural exata e expandindo com funcionalidades KIMI (dashboard, mapa realtime, geofencing, alertas, métricas biométricas).

**Abordagem Técnica**:
1. **Fase 1 - Replicação Integral**: Copiar 100% da estrutura Frontendtemplatekimi (globals.css, Auth.tsx, components/ui/*, contexts/*, lib/*)
2. **Fase 2 - Expansão Features**: Adicionar componentes KIMI seguindo EXATAMENTE o mesmo padrão visual/animação do Auth.tsx (Dashboard, Map, AlertCenter, BiometricCharts)
3. **Stack**: React 18 + TypeScript + Vite + Tailwind v4 + Motion + Supabase Client + MapLibre GL
4. **Backend**: Consome API Supabase (feature 001) via PostgREST + Realtime + nova RPC function para geofencing

**Resultados Esperados**:
- SC-001: Dashboard carrega em < 3s
- SC-005: Visual iOS nativo idêntico ao template (60fps animations)
- SC-010: Todos os novos componentes seguem padrão Auth.tsx exatamente

---

## Contexto Técnico

**Linguagem/Versão**: TypeScript 5.x (inferido de Frontendtemplatekimi)
**Runtime**: Node.js ≥ 20.0.0

**Dependências Principais**:
- **Frontend Framework**: React 18.3.1 + React DOM 18.3.1
- **Build Tool**: Vite 6.3.5 (extremamente rápido HMR)
- **Styling**: Tailwind CSS v4.0 (sem config file) + CSS Variables inline
- **Animations**: Motion (motion/react) - Framer Motion fork
- **UI Components**: Radix UI (via ShadCN) - 30+ componentes acessíveis
- **Icons**: Lucide React v0.487.0 (600+ ícones)
- **Backend**: Supabase Client (@supabase/supabase-js)
- **Mapeamento**: MapLibre GL JS v4.0.0 (open-source WebGL rendering)
- **Gráficos**: Recharts v2.15.2 (React-native charts)
- **Routing**: React Router DOM v6.22.0
- **State**: Zustand v4.5.0 (stores específicos)
- **Lists**: React Window v1.8.10 (virtualização)

**Dependências Dev**:
- **PWA**: vite-plugin-pwa v0.19.0
- **Testes Unit**: Vitest v1.3.0 + React Testing Library v14.2.0
- **Testes E2E**: Playwright v1.42.0

**Armazenamento**: PostgreSQL 17 + PostGIS 3.3.7 (via Supabase) - 11 tabelas existentes (feature 001)

**Testes**:
- Vitest (unit/integration)
- Playwright (E2E cross-browser)
- Cobertura mínima: ≥80% unit, 100% fluxos críticos

**Plataforma-Alvo**: Web (iOS Safari 15+, Chrome/Edge/Firefox últimas 2 versões) + PWA (install-to-homescreen)

**Tipo de Projeto**: Web (frontend-only consumindo Supabase backend)

**Objetivos de Performance**:
- Dashboard LCP < 3s (TC-011)
- Mapa rendering < 2s com 100+ pontos (TC-012)
- Animações 60fps / 16.6ms por frame (TC-013)
- Bundle JavaScript < 500KB gzipped (TC-014)

**Restrições**:
- **Visual**: DEVE preservar 100% das CSS variables do globals.css (TC-002)
- **Animações**: DEVE usar Motion para TODAS as transições (TC-003)
- **Componentes**: DEVE seguir padrão Auth.tsx (TC-004)
- **Realtime**: DEVE usar Supabase Realtime, NÃO polling (TC-016)
- **Offline**: Modo read-only com cache (TC-030)

**Escala/Escopo**:
- Utilizadores: ~1-10k caregivers (MVP)
- Loved ones: 1-3 por caregiver (A-007)
- GPS points: ~288/dia/loved one (5 min intervals)
- 9 User Stories (P1-P4)
- ~15-20 componentes React novos

---

## Verificação da Constituição

*GATE: Constitution file está vazio (template). Nenhuma violação possível.*

**Status**: ✅ APPROVED (sem gates definidos para validar)

---

## Estrutura do Projeto

### Documentação (desta funcionalidade)

```text
specs/002-caregiver-monitoring-app/
├── spec.md              # Especificação completa (9 User Stories, 46 FRs)
├── plan.md              # Este ficheiro (plano de implementação)
├── research.md          # ✅ CONCLUÍDO - 12 decisões técnicas fundamentadas
├── data-model.md        # ✅ CONCLUÍDO - TypeScript types + queries Supabase
├── quickstart.md        # ✅ CONCLUÍDO - Setup dev environment (15-20 min)
├── contracts/
│   └── README.md        # ✅ CONCLUÍDO - Contratos API Supabase (REST + Realtime)
├── checklists/
│   └── requirements.md  # ✅ Checklist de qualidade (todos os itens passaram)
└── tasks.md             # ⏳ PENDENTE - Gerado por /speckit.tasks (Fase 2)
```

---

### Código-Fonte (raiz do repositório)

**Decisão de Estrutura**: Aplicação Web (frontend-only). Backend é Supabase (feature 001).

```text
# Raiz do Projeto KIMI
.
├── Frontendtemplatekimi/           # Git submodule (base template)
│   └── src/
│       ├── styles/globals.css      # ⭐ DESIGN SYSTEM (copiar palavra-por-palavra)
│       ├── components/
│       │   ├── Auth.tsx            # ⭐ PADRÃO OURO (estudar antes de criar novos)
│       │   └── ui/*                # ShadCN components (copiar todos)
│       ├── contexts/
│       │   └── ThemeContext.tsx    # Theme provider
│       ├── lib/
│       │   └── supabase.ts         # Supabase client setup
│       └── imports/
│           └── Group11.tsx         # Logo KIMI
│
├── frontend/                             # ⚠️ CRIAR - Aplicação KIMI
│   ├── index.html
│   ├── package.json                # Deps do template + adicionais (maplibre-gl, etc)
│   ├── vite.config.ts              # Config Vite + PWA plugin
│   ├── .env.local                  # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
│   │
│   ├── src/
│   │   ├── main.tsx                # Entry point
│   │   ├── App.tsx                 # Root component + Router
│   │   │
│   │   ├── styles/
│   │   │   └── globals.css         # ✅ COPIADO de Frontendtemplatekimi
│   │   │
│   │   ├── components/
│   │   │   ├── Auth.tsx            # ✅ COPIADO (referência de padrão)
│   │   │   ├── Dashboard.tsx       # ⚠️ CRIAR (seguindo Auth.tsx)
│   │   │   ├── Map.tsx             # ⚠️ CRIAR (MapLibre GL + geofences)
│   │   │   ├── AlertCenter.tsx     # ⚠️ CRIAR (lista de alertas)
│   │   │   ├── BiometricCharts.tsx # ⚠️ CRIAR (Recharts)
│   │   │   ├── Timeline.tsx        # ⚠️ CRIAR (eventos + GPS)
│   │   │   ├── Settings.tsx        # ⚠️ CRIAR (preferences)
│   │   │   ├── ErrorBoundary.tsx   # ⚠️ CRIAR (TC-020)
│   │   │   └── ui/*                # ✅ COPIADO de Frontendtemplatekimi
│   │   │
│   │   ├── contexts/
│   │   │   ├── ThemeContext.tsx    # ✅ COPIADO
│   │   │   └── AuthContext.tsx     # ⚠️ CRIAR (wrap Supabase auth)
│   │   │
│   │   ├── hooks/
│   │   │   ├── useRealtimeLocation.ts   # ⚠️ CRIAR (subscribe GPS)
│   │   │   ├── useGeofence.ts           # ⚠️ CRIAR (RPC geofencing)
│   │   │   ├── useAlerts.ts             # ⚠️ CRIAR (subscribe alerts)
│   │   │   └── useOfflineDetection.ts   # ⚠️ CRIAR (navigator.onLine)
│   │   │
│   │   ├── stores/
│   │   │   ├── useAlertStore.ts         # ⚠️ CRIAR (Zustand)
│   │   │   └── useLocationCache.ts      # ⚠️ CRIAR (Zustand)
│   │   │
│   │   ├── lib/
│   │   │   ├── supabase.ts         # ✅ COPIADO (setup client)
│   │   │   └── mapUtils.ts         # ⚠️ CRIAR (MapLibre helpers)
│   │   │
│   │   ├── types/
│   │   │   ├── database.types.ts   # ⚠️ GERAR via `supabase gen types`
│   │   │   └── app.types.ts        # ⚠️ CRIAR (domain types)
│   │   │
│   │   └── imports/
│   │       └── Group11.tsx         # ✅ COPIADO (logo KIMI)
│   │
│   └── tests/
│       ├── unit/
│       │   ├── components/
│       │   │   ├── Dashboard.test.tsx
│       │   │   └── Map.test.tsx
│       │   └── hooks/
│       │       └── useGeofence.test.ts
│       ├── integration/
│       │   ├── auth-flow.test.tsx
│       │   └── geofencing.test.tsx
│       └── e2e/
│           ├── dashboard-journey.spec.ts
│           └── create-safe-zone.spec.ts
│
├── supabase/
│   ├── config.toml                  # ✅ EXISTE (feature 001)
│   └── migrations/
│       ├── 20251109000001_*.sql     # ✅ EXISTEM (feature 001: 11 migrations)
│       └── 20251109000020_add_geofence_rpc_function.sql  # ⚠️ CRIAR (feature 002)
│
└── specs/                           # Documentação (estrutura acima)
```

**Legenda**:
- ✅ COPIADO: Ficheiro existe em Frontendtemplatekimi, copiar integralmente
- ⚠️ CRIAR: Ficheiro novo, criar seguindo padrão do template
- ✅ EXISTE: Já criado por feature anterior

---

## Fases de Implementação

### Fase 1: Replicação Integral do Template ✅

**Objetivo**: Ter base visual iOS-nativa 100% funcional ANTES de adicionar features KIMI.

**Tarefas**:
1. ✅ Criar diretório `app/`
2. ✅ Copiar estrutura completa de `Frontendtemplatekimi/` para `app/`
3. ✅ Copiar `globals.css` PALAVRA POR PALAVRA
4. ✅ Copiar `Auth.tsx` INTEIRO (é o padrão ouro)
5. ✅ Copiar todos `components/ui/*` (ShadCN)
6. ✅ Copiar `contexts/ThemeContext.tsx`
7. ✅ Copiar `lib/supabase.ts`
8. ✅ Copiar `imports/Group11.tsx` (logo)
9. ✅ Instalar dependências: `npm install`
10. ✅ Configurar `.env.local` com SUPABASE_URL + ANON_KEY
11. ✅ Executar `npm run dev` e verificar que Auth renderiza

**Critério de Aceitação**: Aplicação renderiza Auth.tsx com visual iOS idêntico ao template.

**Tempo estimado**: 1-2 horas

---

### Fase 2: Adicionar Dependências KIMI Features

**Objetivo**: Instalar bibliotecas adicionais necessárias para features KIMI.

**Tarefas**:
1. ⚠️ `npm install react-router-dom zustand react-window maplibre-gl`
2. ⚠️ `npm install --save-dev vite-plugin-pwa vitest @testing-library/react @playwright/test`
3. ⚠️ Atualizar `vite.config.ts` com plugin PWA
4. ⚠️ Gerar TypeScript types: `supabase gen types typescript > src/types/database.types.ts`

**Critério de Aceitação**: `npm run dev` ainda funciona sem erros.

**Tempo estimado**: 30 min

---

### Fase 3: Criar Migration PostgreSQL (Geofencing RPC)

**Objetivo**: Adicionar função `check_geofence_breach` no PostgreSQL.

**Tarefas**:
1. ⚠️ Criar `supabase/migrations/20251109000020_add_geofence_rpc_function.sql`
2. ⚠️ Adicionar função RPC (ver `quickstart.md` ou `data-model.md`)
3. ⚠️ Adicionar índices GiST para performance
4. ⚠️ Executar migration: `supabase db push`
5. ⚠️ Testar RPC no SQL Editor

**Critério de Aceitação**: Query `SELECT * FROM check_geofence_breach(...)` retorna violações.

**Tempo estimado**: 30 min

---

### Fase 4: Implementar Hooks Custom

**Objetivo**: Criar hooks reutilizáveis para lógica Supabase.

**Tarefas**:
1. ⚠️ `hooks/useRealtimeLocation.ts` - subscribe GPS updates
2. ⚠️ `hooks/useGeofence.ts` - chamar RPC function
3. ⚠️ `hooks/useAlerts.ts` - subscribe alerts
4. ⚠️ `hooks/useOfflineDetection.ts` - navigator.onLine

**Critério de Aceitação**: Todos os hooks testados isoladamente (unit tests).

**Tempo estimado**: 2-3 horas

---

### Fase 5: Criar Stores Zustand

**Objetivo**: State management para alerts e location cache.

**Tarefas**:
1. ⚠️ `stores/useAlertStore.ts` - alerts + unreadCount + acknowledge()
2. ⚠️ `stores/useLocationCache.ts` - Map<lovedOneId, location>

**Critério de Aceitação**: Stores funcionam com React DevTools.

**Tempo estimado**: 1 hora

---

### Fase 6: Implementar Dashboard Component

**Objetivo**: Primeira feature KIMI visível.

**Tarefas**:
1. ⚠️ Criar `components/Dashboard.tsx`
2. ⚠️ Seguir EXATAMENTE padrão Auth.tsx:
   - Motion animations (initial, animate, transition)
   - CSS variables inline (fontSize, color, etc)
   - Loading states com Loader2
   - Error boundaries
3. ⚠️ Query Supabase: loved_ones + last_location + last_metrics
4. ⚠️ Renderizar cards com:
   - Nome, device_id, foto (avatar)
   - Última localização (timestamp + "isStale" indicator)
   - Métricas (BPM, steps)
   - Bateria + alertas pendentes
5. ⚠️ Navegação para Map/Timeline ao clicar

**Critério de Aceitação**:
- Dashboard carrega em < 3s
- Visual iOS idêntico a Auth.tsx
- Animações 60fps

**Tempo estimado**: 4-6 horas

---

### Fase 7: Implementar Map Component

**Objetivo**: Mapa com trail + safe zones + realtime updates.

**Tarefas**:
1. ⚠️ Criar `components/Map.tsx`
2. ⚠️ Integrar MapLibre GL JS
3. ⚠️ Renderizar mapa base (OSM tiles)
4. ⚠️ Plotar current location (marker)
5. ⚠️ Plotar trail de 24h (GeoJSON LineString)
6. ⚠️ Renderizar safe zones (círculos)
7. ⚠️ Subscribe GPS updates (realtime)
8. ⚠️ Popup com detalhes ao clicar em ponto
9. ⚠️ Seguir padrão Auth.tsx para loading/error states

**Critério de Aceitação**:
- Mapa renderiza em < 2s com 100+ pontos
- Trail atualiza suavemente sem reload

**Tempo estimado**: 6-8 horas

---

### Fase 8: Implementar AlertCenter Component

**Objetivo**: Lista de alertas ordenada por severidade.

**Tarefas**:
1. ⚠️ Criar `components/AlertCenter.tsx`
2. ⚠️ Query alerts pendentes
3. ⚠️ Ordenar por severity (high > medium > low)
4. ⚠️ Renderizar lista com:
   - Ícone (tipo de alerta)
   - Título + mensagem
   - Timestamp
   - Ação "Acknowledge"
5. ⚠️ Subscribe novos alertas (realtime)
6. ⚠️ Badge com unreadCount

**Critério de Aceitação**:
- Alertas críticos visíveis em < 5s
- Subscribe funciona (novos alertas aparecem)

**Tempo estimado**: 3-4 horas

---

### Fase 9: Implementar BiometricCharts Component

**Objetivo**: Gráficos de métricas de saúde.

**Tarefas**:
1. ⚠️ Criar `components/BiometricCharts.tsx`
2. ⚠️ Integrar Recharts
3. ⚠️ Query health_metrics (últimas 24h)
4. ⚠️ Gráfico de linha (BPM) com destaque para valores anormais
5. ⚠️ Gráfico de barras (steps)
6. ⚠️ Gráfico de barras (sleep hours)
7. ⚠️ Selector de intervalo (dia/semana/mês)
8. ⚠️ Usar CSS variables do globals.css (`var(--chart-1)`, etc)

**Critério de Aceitação**:
- Gráficos renderizam em < 1s
- Visual consistente com design system

**Tempo estimado**: 3-4 horas

---

### Fase 10: Implementar Timeline Component

**Objetivo**: Histórico de eventos + GPS.

**Tarefas**:
1. ⚠️ Criar `components/Timeline.tsx`
2. ⚠️ Query gps_locations + activities
3. ⚠️ Merge client-side ordenado por timestamp
4. ⚠️ Virtualização com React Window (100+ eventos)
5. ⚠️ Renderizar diferentes tipos:
   - location_change (com mini-mapa)
   - safe_zone_entry/exit
   - alert_triggered
6. ⚠️ Filtro por data range

**Critério de Aceitação**:
- 100+ eventos sem degradação

**Tempo estimado**: 4-5 horas

---

### Fase 11: Implementar Routing e Navigation

**Objetivo**: React Router v6 com layouts.

**Tarefas**:
1. ⚠️ Configurar `createBrowserRouter`
2. ⚠️ Routes:
   - `/` → Dashboard
   - `/loved-one/:id/map` → Map
   - `/loved-one/:id/metrics` → BiometricCharts
   - `/loved-one/:id/timeline` → Timeline
   - `/alerts` → AlertCenter
   - `/settings` → Settings
   - `/auth` → Auth
3. ⚠️ Layout partilhado (Header + Sidebar)
4. ⚠️ AuthGuard (redirect se não autenticado)

**Critério de Aceitação**:
- Navegação suave entre páginas

**Tempo estimado**: 2-3 horas

---

### Fase 12: Settings e Preferences

**Objetivo**: Configurações de notificações e thresholds.

**Tarefas**:
1. ⚠️ Criar `components/Settings.tsx`
2. ⚠️ Form para caregiver_preferences
3. ⚠️ Toggles: notifications, alert_sound
4. ⚠️ Inputs: quiet_hours, BPM threshold
5. ⚠️ Gestão de emergency_contacts

**Critério de Aceitação**:
- Preferências guardam corretamente

**Tempo estimado**: 2-3 horas

---

### Fase 13: PWA e Offline

**Objetivo**: Install-to-homescreen + offline read-only.

**Tarefas**:
1. ⚠️ Configurar `vite-plugin-pwa`
2. ⚠️ Service Worker com caching strategy
3. ⚠️ Offline detection banner
4. ⚠️ Manifest.json com ícones

**Critério de Aceitação**:
- Funciona offline mostrando cache

**Tempo estimado**: 2 horas

---

### Fase 14: Testes

**Objetivo**: Cobertura ≥80% unit, 100% fluxos críticos.

**Tarefas**:
1. ⚠️ Unit tests (Vitest + RTL)
2. ⚠️ Integration tests (auth flow, geofencing)
3. ⚠️ E2E tests (Playwright)

**Critério de Aceitação**:
- `npm run test:coverage` ≥80%

**Tempo estimado**: 6-8 horas

---

### Fase 15: Build e Deploy

**Objetivo**: Deploy para staging/production.

**Tarefas**:
1. ⚠️ `npm run build`
2. ⚠️ Verificar bundle < 500KB gzipped
3. ⚠️ Deploy para Vercel/Netlify
4. ⚠️ Configurar domínio custom

**Critério de Aceitação**:
- Aplicação acessível em https://kimi.app

**Tempo estimado**: 2 horas

---

## Monitorização de Complexidade

*Constitution file vazio - sem gates para monitorizar.*

**Complexidade Atual**: Moderada
- 9 componentes React novos
- 4 hooks custom
- 2 Zustand stores
- 1 migration PostgreSQL
- Estrutura clara (frontend-only)

**Riscos Técnicos** (ver `research.md`):
- MapLibre incompatibilidade Vite: **Baixa probabilidade**
- Performance rendering 100+ GPS: **Mitigação: clustering + limit 50**
- Bundle size > 500KB: **Mitigação: code splitting agressivo**

---

## Próximos Passos

✅ **Fase 0 (Research)**: CONCLUÍDO - `research.md` com 12 decisões técnicas
✅ **Fase 1 (Design)**: CONCLUÍDO - `data-model.md`, `contracts/`, `quickstart.md`

→ **Fase 2 (Tasks)**: Executar `/speckit.tasks` para gerar breakdown detalhado de tarefas

**Comando**:
```bash
cd /Users/emersonferreira/Development/KIMI
/speckit.tasks
```

Isto gera `specs/002-caregiver-monitoring-app/tasks.md` com:
- Breakdown granular de todas as 15 fases acima
- Estimativas de tempo por tarefa
- Dependências entre tarefas
- Ordem de execução recomendada

**Tempo Total Estimado**: 45-60 horas de desenvolvimento

---

**Última Atualização**: 2025-11-09
**Status**: ✅ PRONTO PARA FASE 2 (geração de tasks)
