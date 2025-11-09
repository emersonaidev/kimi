# Quickstart: KIMI Caregiver Monitoring App

**Feature**: 002-caregiver-monitoring-app
**Data**: 2025-11-09
**Tempo estimado de setup**: 15-20 minutos

Este guia permite configurar o ambiente de desenvolvimento local e verificar que a aplicação está funcional.

---

## Pré-requisitos

✅ **Node.js** ≥ 20.0.0 (verificar: `node --version`)
✅ **Git** instalado (verificar: `git --version`)
✅ **Supabase Project** configurado (feature 001-supabase-db-setup completa)
✅ **Frontendtemplatekimi** clonado como submodule em `/Frontendtemplatekimi`

---

## Passo 1: Copiar Template Base

### 1.1 Criar Diretório App

```bash
# Na raiz do projeto KIMI
mkdir -p app

# Copiar TODA a estrutura do Frontendtemplatekimi
cp -R Frontendtemplatekimi/* app/

# Verificar que copiou corretamente
ls app/
# Deve mostrar: index.html, package.json, vite.config.ts, src/
```

### 1.2 Verificar Ficheiros Críticos

```bash
# Globals.css (design system) - NUNCA modificar
cat app/src/styles/globals.css | head -20

# Auth.tsx (padrão ouro) - estudar antes de criar novos componentes
cat app/src/components/Auth.tsx | head -50

# Supabase setup
cat app/src/lib/supabase.ts
```

**IMPORTANTE**: O `globals.css` contém TODAS as CSS variables do design system iOS. Qualquer novo componente DEVE usar estas variables inline.

---

## Passo 2: Instalar Dependências

### 2.1 Dependências do Template

```bash
cd app
npm install
```

Isto instala (de `package.json`):
- React 18 + React DOM
- Vite 6.3.5
- TypeScript
- Tailwind CSS v4
- Motion (Framer Motion)
- Radix UI (ShadCN components)
- Supabase Client
- Recharts
- MapLibre GL
- Lucide React icons

### 2.2 Dependências Adicionais (Feature 002)

```bash
npm install react-router-dom zustand react-window maplibre-gl
npm install --save-dev vite-plugin-pwa vitest @testing-library/react @testing-library/user-event @playwright/test
```

**Versões recomendadas**:
```json
{
  "react-router-dom": "^6.22.0",
  "zustand": "^4.5.0",
  "react-window": "^1.8.10",
  "maplibre-gl": "^4.0.0",
  "vite-plugin-pwa": "^0.19.0",
  "vitest": "^1.3.0",
  "@testing-library/react": "^14.2.0",
  "@playwright/test": "^1.42.0"
}
```

---

## Passo 3: Configurar Variáveis de Ambiente

### 3.1 Criar `.env.local`

```bash
# Copiar template
cp .env.example .env.local

# Editar com as credenciais do Supabase
nano .env.local
```

### 3.2 Adicionar Credenciais

```.env
VITE_SUPABASE_URL=https://jkzwrqmbpxptncpdmbew.supabase.co
VITE_SUPABASE_ANON_KEY=<COPIAR DE specs/001-supabase-db-setup/contracts/README.md>
```

**Obter Anon Key**:
1. Opção A: `cat ../specs/001-supabase-db-setup/contracts/README.md | grep "Anon Key"`
2. Opção B: Supabase Dashboard > Settings > API > anon/public key

### 3.3 Verificar que Supabase está Acessível

```bash
# Criar teste rápido
node <<EOF
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);
const { data, error } = await supabase.from('caregivers').select('count');
console.log('Connected:', !error, 'Caregivers count:', data);
EOF
```

**Resultado esperado**: `Connected: true Caregivers count: [...]`

---

## Passo 4: Executar Migrações Adicionais (Feature 002)

Esta feature adiciona 1 migration PostgreSQL:

### 4.1 Criar Migration File

```bash
# Voltar à raiz do projeto
cd ..

# Criar nova migration
cat > supabase/migrations/20251109000020_add_geofence_rpc_function.sql <<EOF
-- Migration: Add Geofence RPC Function
-- Feature: 002-caregiver-monitoring-app
-- Description: PostgreSQL function para verificar violações de safe zones

CREATE OR REPLACE FUNCTION check_geofence_breach(
  p_loved_one_id UUID,
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION
)
RETURNS TABLE(
  breached_zone_id UUID,
  breached_zone_name TEXT,
  distance_meters DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS \$\$
BEGIN
  RETURN QUERY
  SELECT
    sz.id AS breached_zone_id,
    sz.name AS breached_zone_name,
    ST_Distance(
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(sz.longitude, sz.latitude), 4326)::geography
    ) AS distance_meters
  FROM safe_zones sz
  WHERE sz.loved_one_id = p_loved_one_id
    AND sz.is_active = true
    AND ST_DWithin(
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(sz.longitude, sz.latitude), 4326)::geography,
      sz.radius
    ) = false;
END;
\$\$;

COMMENT ON FUNCTION check_geofence_breach IS 'Verifica se coordenadas violam safe zones ativas usando PostGIS';

-- Adicionar índices GiST para performance (se ainda não existirem)
CREATE INDEX IF NOT EXISTS idx_gps_locations_geog
ON gps_locations USING GIST (
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
);

CREATE INDEX IF NOT EXISTS idx_safe_zones_geog
ON safe_zones USING GIST (
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
);
EOF
```

### 4.2 Executar Migration

**Via Supabase CLI** (recomendado):
```bash
supabase db push
```

**Via Supabase Dashboard** (alternativa):
1. Ir para: https://supabase.com/dashboard/project/jkzwrqmbpxptncpdmbew/sql
2. Copiar conteúdo de `supabase/migrations/20251109000020_add_geofence_rpc_function.sql`
3. Colar no SQL Editor
4. Executar (Run)

### 4.3 Verificar Function

```sql
-- Testar RPC function
SELECT * FROM check_geofence_breach(
  'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'::uuid,
  38.7500, -- latitude fora de todas as safe zones do seed data
  -9.1600  -- longitude fora de todas as safe zones do seed data
);
```

**Resultado esperado**: Lista de safe zones violadas (Casa, Centro de Dia).

---

## Passo 5: Gerar TypeScript Types

Gerar types do schema Supabase para type safety:

```bash
cd app

# Gerar types (requer Supabase CLI autenticado)
npx supabase gen types typescript --project-id jkzwrqmbpxptncpdmbew > src/types/database.types.ts

# Verificar que gerou
head -20 src/types/database.types.ts
```

**Resultado esperado**:
```typescript
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      caregivers: {
        Row: {
          id: string
          user_id: string
          full_name: string
          email: string
          // ...
```

---

## Passo 6: Executar Dev Server

### 6.1 Iniciar Vite

```bash
cd app
npm run dev
```

**Output esperado**:
```
  VITE v6.3.5  ready in 450 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 6.2 Abrir Browser

Navegar para: http://localhost:5173/

**Resultado esperado**: Renderiza página de Auth com visual iOS nativo (logo KIMI, form de login, botão Google Sign-In).

---

## Passo 7: Validar Setup (Smoke Tests)

### 7.1 Testar Autenticação

1. Criar conta de teste:
   - Email: `test@kimi.app`
   - Password: `Test123!`
   - Clicar "Sign Up"

2. Verificar que trigger criou caregiver automaticamente:
   ```bash
   # No Supabase SQL Editor
   SELECT * FROM caregivers WHERE email = 'test@kimi.app';
   SELECT * FROM caregiver_preferences WHERE caregiver_id = (SELECT id FROM caregivers WHERE email = 'test@kimi.app');
   ```

**Resultado esperado**: 1 row em `caregivers` e 1 row em `caregiver_preferences`.

### 7.2 Testar Supabase Client

No browser console (F12 > Console):

```javascript
// Verificar se Supabase está configurado
console.log(window.supabase);

// Testar query
const { data, error } = await window.supabase.from('loved_ones').select('*');
console.log('Loved ones:', data);
```

**Resultado esperado**: Array de loved ones (pode estar vazio se não tiver seed data).

### 7.3 Testar CSS Variables

No browser, inspecionar elemento (F12 > Elements):

```javascript
// No console
getComputedStyle(document.documentElement).getPropertyValue('--primary')
// Deve retornar: "rgba(0, 136, 255, 1.00)"

getComputedStyle(document.documentElement).getPropertyValue('--text-base')
// Deve retornar: "17px"
```

---

## Passo 8: Executar Testes

### 8.1 Unit Tests (Vitest)

```bash
# Executar todos os tests
npm run test

# Watch mode (re-run on file changes)
npm run test:watch

# Coverage report
npm run test:coverage
```

**Primeiro run**: Pode falhar porque ainda não há tests. Criar ficheiro de teste exemplo:

```bash
# Criar teste exemplo
cat > src/components/__tests__/Dashboard.test.tsx <<EOF
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dashboard } from '../Dashboard';

describe('Dashboard', () => {
  it('renders without crashing', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });
});
EOF
```

### 8.2 E2E Tests (Playwright)

```bash
# Instalar browsers
npx playwright install chromium

# Executar E2E tests
npx playwright test

# UI mode (visual debugger)
npx playwright test --ui
```

---

## Passo 9: Build para Produção

```bash
# Build otimizado
npm run build

# Preview do build
npm run preview
```

**Output esperado**:
```
vite v6.3.5 building for production...
✓ 245 modules transformed.
dist/index.html                   0.45 kB │ gzip:  0.30 kB
dist/assets/index-BwR9nV8K.css    4.87 kB │ gzip:  1.89 kB
dist/assets/index-C_RjKnV9.js   385.23 kB │ gzip: 124.56 kB

✓ built in 3.42s
```

**Verificar tamanho**:
```bash
ls -lh dist/assets/*.js | awk '{print $5, $9}'
```

**Target**: JS bundle < 500KB gzipped (TC-014).

---

## Troubleshooting

### Erro: "Module not found: maplibre-gl"

**Solução**:
```bash
npm install maplibre-gl
```

Se persistir, verificar `package.json` tem `"maplibre-gl": "*"`.

---

### Erro: "Supabase URL is not configured"

**Solução**:
1. Verificar `.env.local` existe e tem `VITE_SUPABASE_URL`
2. Reiniciar dev server: `npm run dev`
3. Verificar que `src/lib/supabase.ts` usa `import.meta.env.VITE_SUPABASE_URL`

---

### Erro: "PostGIS function does not exist"

**Solução**:
Migration 20251109000001 não foi executada (PostGIS extension).

```bash
# Executar migration de extensions
supabase db push
```

Ou via Dashboard SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA extensions;
```

---

### Erro: CSS variables não aplicadas

**Sintoma**: Elementos aparecem sem estilos corretos (cores erradas, tamanhos errados).

**Solução**:
1. Verificar que `globals.css` foi copiado: `cat app/src/styles/globals.css | grep "var(--primary)"`
2. Verificar que está importado em `main.tsx` ou `App.tsx`: `import './styles/globals.css';`
3. Inspecionar elemento no browser (F12) e verificar que CSS variables estão definidas

---

### Dev server muito lento (HMR > 5s)

**Solução**:
1. Limpar cache: `rm -rf node_modules/.vite`
2. Verificar Node version: `node --version` (deve ser ≥ 20)
3. Limitar watcher scope no `vite.config.ts`:

```typescript
export default {
  server: {
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**']
    }
  }
}
```

---

## Próximos Passos

✅ **Setup concluído!** A aplicação base está funcional.

### Para implementar features KIMI:

1. **Estudar `Auth.tsx` linha por linha** - é o padrão ouro para todos os novos componentes
2. **Criar componentes seguindo o padrão exato**:
   - `Dashboard.tsx` - cards de loved ones
   - `Map.tsx` - mapa com MapLibre GL
   - `AlertCenter.tsx` - lista de alertas
3. **Implementar hooks custom**:
   - `useRealtimeLocation.ts` - subscriptions GPS
   - `useGeofence.ts` - verificação de safe zones
4. **Configurar routing** - React Router v6
5. **Adicionar state management** - Zustand stores

**Documentação de referência**:
- `specs/002-caregiver-monitoring-app/research.md` - decisões técnicas
- `specs/002-caregiver-monitoring-app/data-model.md` - schema e types
- `specs/002-caregiver-monitoring-app/contracts/README.md` - API endpoints

### Para gerar tasks de implementação:

```bash
# Na raiz do projeto
/speckit.tasks
```

Isto gera `specs/002-caregiver-monitoring-app/tasks.md` com breakdown detalhado de todas as tarefas de implementação.

---

**Tempo total de setup**: ~15-20 minutos
**Última atualização**: 2025-11-09
**Verificado com**: Node 20.10.0, npm 10.2.3, Vite 6.3.5
