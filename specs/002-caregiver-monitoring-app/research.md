# Pesquisa Técnica: Aplicação KIMI Caregiver Monitoring

**Feature**: 002-caregiver-monitoring-app
**Data**: 2025-11-09
**Fase**: 0 - Research & Technical Decisions

## Decisões Técnicas Principais

### 1. Frontend Framework e Tooling

**Decisão**: React 18 + TypeScript + Vite (exatamente como Frontendtemplatekimi)

**Justificação**:
- Template base já implementa esta stack com configuração otimizada
- Vite oferece HMR extremamente rápido (essencial para desenvolvimento iterativo)
- React 18 com Concurrent Features suporta atualizações realtime sem lag
- TypeScript garante type safety crítica para dados de saúde/localização

**Alternativas consideradas**:
- **Next.js**: Rejeitado porque template usa Vite e migration causaria drift
- **Vue/Svelte**: Rejeitados porque requer rewrite completo do template
- **React Native**: Fora de scope (US-010: apenas web/PWA por agora)

**Evidência**: Frontendtemplatekimi/package.json:57-61

---

### 2. Design System e Styling

**Decisão**: Tailwind CSS v4.0 + CSS Variables inline + Motion para animações

**Justificação**:
- Template usa Tailwind v4 SEM config file (convenção over configuration)
- CSS Variables (`var(--primary)`, `var(--text-base)`) permitem theming iOS nativo
- Inline styles com variables garantem consistência visual (TC-002, TC-004)
- Motion (Framer Motion) já integrado para animações 60fps (TC-013)

**Alternativas consideradas**:
- **Styled Components**: Rejeitado (aumenta bundle size, conflita com template)
- **Vanilla CSS**: Rejeitado (perde utilidades Tailwind, mantém globals.css apenas)
- **CSS Animations**: Rejeitado (Motion oferece controle fino e spring physics)

**Padrão Obrigatório** (do Auth.tsx):
```tsx
<motion.button
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  style={{
    fontSize: 'var(--text-base)',
    fontWeight: 'var(--font-weight-semibold)',
    color: 'var(--primary-foreground)'
  }}
  className="rounded-[var(--radius-button)] transition-all active:scale-[0.98]"
>
```

**Evidência**: Frontendtemplatekimi/src/styles/globals.css:1-99 + components/Auth.tsx

---

### 3. Mapeamento e Geolocalização

**Decisão**: MapLibre GL JS v4 com OpenStreetMap tiles

**Justificação**:
- MapLibre é open-source (BSD), sem vendor lock-in
- Suporta WebGL rendering (60fps mesmo com 100+ markers)
- Integração nativa com PostGIS via GeoJSON
- Tiles OSM gratuitos para MVP (R-015 mitigation)

**Alternativas consideradas**:
- **Google Maps**: Rejeitado (custo por pageview, vendor lock-in)
- **React Leaflet**: Rejeitado (rendering via Canvas, mais lento que WebGL)
- **Mapbox GL**: Rejeitado (pricing complexo, fork do MapLibre)

**Implementação**:
```typescript
// Map component seguindo padrão Auth.tsx
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const Map = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [center.lng, center.lat],
      zoom: 13
    });

    map.on('load', () => setLoading(false));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: loading ? 0.5 : 1 }}
      style={{ borderRadius: 'var(--radius-card)' }}
    >
      {loading && <Loader2 className="animate-spin" />}
      <div ref={mapContainer} />
    </motion.div>
  );
};
```

**Evidência**: R-001, R-015, TC-012, A-011

---

### 4. Gráficos Biométricos

**Decisão**: Recharts v2.15

**Justificação**:
- Já declarado em Frontendtemplatekimi/package.json:48
- Componentes React nativos (não wrapper de D3)
- Suporta CSS variables via `stroke="var(--chart-1)"`
- Responsive por default, acessível (ARIA labels)

**Alternativas consideradas**:
- **Chart.js**: Rejeitado (imperativo, não React-first)
- **Victory**: Rejeitado (bundle maior, menos performante)
- **D3 direto**: Rejeitado (aumenta complexidade, contra TC-004)

**Padrão Obrigatório**:
```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

<LineChart data={heartRateData}>
  <Line
    type="monotone"
    dataKey="bpm"
    stroke="var(--chart-1)"
    strokeWidth={2}
  />
  <Tooltip
    contentStyle={{
      backgroundColor: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)'
    }}
  />
</LineChart>
```

**Evidência**: FR-027, FR-030, A-012, Frontendtemplatekimi/package.json:48

---

### 5. Realtime e Subscriptions

**Decisão**: Supabase Realtime Channels (PostgreSQL CDC)

**Justificação**:
- Supabase já é dependência (D-008: @supabase/supabase-js)
- Realtime usa PostgreSQL Logical Replication (Change Data Capture)
- Websockets geridos automaticamente (reconnect, backoff)
- RLS policies aplicam-se a subscriptions (segurança garantida)

**Alternativas consideradas**:
- **Polling (setInterval)**: Rejeitado (TC-016: DEVE usar Realtime)
- **WebSocket custom**: Rejeitado (reinventa roda, perde RLS integration)
- **Server-Sent Events**: Rejeitado (unidirectional, não suportado por Supabase)

**Implementação**:
```typescript
// hooks/useRealtimeLocation.ts
const useRealtimeLocation = (lovedOneId: string) => {
  const [location, setLocation] = useState<GPSLocation | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`gps:${lovedOneId}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'gps_locations',
          filter: `loved_one_id=eq.${lovedOneId}`
        },
        (payload) => setLocation(payload.new as GPSLocation)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [lovedOneId]);

  return location;
};
```

**Evidência**: TC-016, D-008, R-003 mitigation

---

### 6. Routing e Navigation

**Decisão**: React Router v6 DOM

**Justificação**:
- Standard de facto para React SPAs
- Suporta lazy loading de routes (code splitting para TC-014)
- Nested routes permitem layouts partilhados (Header, Sidebar)
- TypeScript definitions completas

**Alternativas consideradas**:
- **TanStack Router**: Rejeitado (muito novo, menos community support)
- **Reach Router**: Rejeitado (merged com React Router v6)
- **Manual state**: Rejeitado (reinventa roda, perde browser history)

**Estrutura de Routes**:
```tsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthGuard><AppLayout /></AuthGuard>,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'loved-one/:id/map', element: <Map /> },
      { path: 'loved-one/:id/metrics', element: <BiometricCharts /> },
      { path: 'loved-one/:id/timeline', element: <Timeline /> },
      { path: 'alerts', element: <AlertCenter /> },
      { path: 'settings', element: <Settings /> },
    ]
  },
  { path: '/auth', element: <Auth /> }
]);
```

**Evidência**: FR-011 (navegação entre dashboard/mapa/timeline)

---

### 7. State Management

**Decisão**: React Context API + Zustand (stores específicos)

**Justificação**:
- Context API já usado no template (ThemeContext)
- Zustand para state complexo (location cache, alert queue)
- Zero boilerplate comparado a Redux
- TypeScript-first, DevTools integration

**Alternativas consideradas**:
- **Redux**: Rejeitado (over-engineering para MVP, contra TC-004)
- **Jotai/Recoil**: Rejeitados (atomic state não necessário aqui)
- **MobX**: Rejeitado (OOP model conflita com template funcional)

**Stores planejadas**:
```typescript
// stores/useAlertStore.ts
const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],
  unreadCount: 0,
  addAlert: (alert) => set(state => ({
    alerts: [alert, ...state.alerts],
    unreadCount: state.unreadCount + 1
  })),
  acknowledge: (id) => set(state => ({
    alerts: state.alerts.map(a =>
      a.id === id ? { ...a, acknowledged_at: new Date() } : a
    ),
    unreadCount: Math.max(0, state.unreadCount - 1)
  }))
}));

// stores/useLocationCache.ts
const useLocationCache = create<LocationCache>((set) => ({
  cache: new Map(),
  setLocation: (lovedOneId, location) =>
    set(state => {
      const newCache = new Map(state.cache);
      newCache.set(lovedOneId, location);
      return { cache: newCache };
    })
}));
```

**Evidência**: A-006 (simplicidade), TC-004 (padrão template)

---

### 8. Geospatial Queries

**Decisão**: PostGIS ST_DWithin + Supabase RPC functions

**Justificação**:
- PostGIS já habilitado (feature 001: migration 20251109000001)
- `ST_DWithin(geography, geography, meters)` é otimizado para geofencing
- Supabase RPC permite chamadas diretas a PostgreSQL functions
- Índices GiST já criados (migration 20251109000006)

**Alternativas consideradas**:
- **Client-side Haversine**: Rejeitado (impreciso, não escalável)
- **Turf.js**: Rejeitado (duplica lógica que DB já faz melhor)
- **Google Maps Distance Matrix**: Rejeitado (custo, latência)

**Implementação**:
```sql
-- PostgreSQL function (nova migration)
CREATE OR REPLACE FUNCTION check_geofence_breach(
  p_loved_one_id UUID,
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION
)
RETURNS TABLE(breached_zone_id UUID, breached_zone_name TEXT, distance_meters DOUBLE PRECISION)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sz.id,
    sz.name,
    ST_Distance(
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(sz.longitude, sz.latitude), 4326)::geography
    ) as distance
  FROM safe_zones sz
  WHERE sz.loved_one_id = p_loved_one_id
    AND sz.is_active = true
    AND ST_DWithin(
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(sz.longitude, sz.latitude), 4326)::geography,
      sz.radius
    ) = false;
END;
$$;
```

```typescript
// hooks/useGeofence.ts
const checkGeofence = async (lovedOneId: string, lat: number, lng: number) => {
  const { data, error } = await supabase.rpc('check_geofence_breach', {
    p_loved_one_id: lovedOneId,
    p_lat: lat,
    p_lng: lng
  });

  return data; // Array de zonas violadas
};
```

**Evidência**: D-001 (PostGIS enabled), FR-018, FR-020, A-003 (precisão GPS)

---

### 9. Error Handling e Boundaries

**Decisão**: React Error Boundaries + Custom ErrorFallback components

**Justificação**:
- TC-020: DEVE implementar error boundaries
- Previne crash da app inteira se um componente falha
- Permite logging estruturado de erros para debugging
- UX graceful (mostra mensagem friendly em vez de tela branca)

**Implementação**:
```tsx
// components/ErrorBoundary.tsx (seguindo padrão Auth.tsx)
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // TODO: Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            padding: '2rem',
            borderRadius: 'var(--radius-card)',
            backgroundColor: 'var(--card)'
          }}
        >
          <AlertCircle className="w-12 h-12" style={{ color: 'var(--destructive)' }} />
          <h2 style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-bold)' }}>
            Algo correu mal
          </h2>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--muted-foreground)' }}>
            A aplicação encontrou um erro inesperado. Por favor, recarregue a página.
          </p>
          <button onClick={() => window.location.reload()}>
            Recarregar
          </button>
        </motion.div>
      );
    }

    return this.props.children;
  }
}
```

**Evidência**: TC-020, SC-014 (inspirar confiança), R-005 mitigation

---

### 10. Performance Optimization

**Decisão**: Code Splitting + Lazy Loading + React.memo + Virtualization

**Justificação**:
- TC-014: Bundle < 500KB gzipped
- TC-011: Dashboard LCP < 3s
- TC-013: 60fps animations
- FR-032: Timeline com 100+ eventos sem degradação

**Estratégias**:
```typescript
// 1. Route-based code splitting
const Map = lazy(() => import('./components/Map'));
const BiometricCharts = lazy(() => import('./components/BiometricCharts'));

// 2. Component memoization (evita re-renders)
const LovedOneCard = memo(({ lovedOne }) => { ... });

// 3. Virtualization para listas longas
import { FixedSizeList } from 'react-window';

const Timeline = ({ events }) => (
  <FixedSizeList
    height={600}
    itemCount={events.length}
    itemSize={80}
  >
    {({ index, style }) => (
      <TimelineEvent event={events[index]} style={style} />
    )}
  </FixedSizeList>
);

// 4. Debounce em inputs de pesquisa
const debouncedSearch = useMemo(
  () => debounce((query) => fetchResults(query), 300),
  []
);
```

**Evidência**: TC-011, TC-012, TC-013, TC-014, SC-009, R-002 mitigation

---

### 11. Offline Strategy

**Decisão**: Service Worker + IndexedDB cache (read-only)

**Justificação**:
- SC-006: Funcionar offline mostrando cache
- TC-030: Offline apenas leitura (não escrita)
- PWA permite install-to-homescreen (iOS Safari)

**Implementação**:
```typescript
// vite.config.ts - adicionar plugin PWA
import { VitePWA } from 'vite-plugin-pwa';

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: { maxEntries: 50, maxAgeSeconds: 300 }
            }
          }
        ]
      }
    })
  ]
};

// hooks/useOfflineDetection.ts
const useOfflineDetection = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
```

**Evidência**: SC-006, TC-030, OS-008, A-004

---

### 12. Testing Strategy

**Decisão**: Vitest + React Testing Library + Playwright

**Justificação**:
- Vitest é nativo Vite (mesma config, mais rápido que Jest)
- RTL testa comportamento do utilizador (não implementação)
- Playwright para E2E (cross-browser)

**Estrutura de Testes**:
```
tests/
├── unit/
│   ├── components/
│   │   ├── Dashboard.test.tsx
│   │   ├── Map.test.tsx
│   │   └── AlertCenter.test.tsx
│   └── hooks/
│       ├── useRealtimeLocation.test.ts
│       └── useGeofence.test.ts
├── integration/
│   ├── auth-flow.test.tsx
│   ├── geofencing.test.tsx
│   └── realtime-updates.test.tsx
└── e2e/
    ├── dashboard-journey.spec.ts
    ├── create-safe-zone.spec.ts
    └── alert-acknowledgement.spec.ts
```

**Cobertura Mínima**:
- Unit: ≥80% coverage
- Integration: Todos os fluxos críticos (auth, geofence, realtime)
- E2E: User Stories P1 e P2

**Evidência**: D-014 (TypeScript), Quality Gates implícitos

---

## Sumário de Dependências Adicionais

**Package.json additions** (além do template):
```json
{
  "dependencies": {
    "maplibre-gl": "^4.0.0",
    "react-router-dom": "^6.22.0",
    "zustand": "^4.5.0",
    "react-window": "^1.8.10"
  },
  "devDependencies": {
    "vite-plugin-pwa": "^0.19.0",
    "vitest": "^1.3.0",
    "@testing-library/react": "^14.2.0",
    "@testing-library/user-event": "^14.5.0",
    "@playwright/test": "^1.42.0"
  }
}
```

**Evidência**: Todas as bibliotecas mencionadas acima + input do utilizador

---

## Riscos Técnicos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| MapLibre incompatibilidade Vite | Baixa | Alto | Testar integração em spike inicial (Fase 2) |
| Performance rendering 100+ GPS points | Média | Médio | Clustering + limitar trail a 50 pontos |
| Realtime subscriptions overhead | Média | Médio | Unsubscribe quando componente desmonta |
| Bundle size > 500KB | Baixa | Médio | Code splitting agressivo + tree shaking |
| Offline UX confusa | Média | Baixo | Banner persistente indicando modo offline |

**Evidência**: Secção "Risks" da spec.md

---

## Próximos Passos

✅ Research concluído - todas as decisões técnicas fundamentadas
→ **Fase 1**: Gerar data-model.md, contracts/, quickstart.md
→ **Fase 2**: Gerar tasks.md com breakdown de implementação

**Data de conclusão**: 2025-11-09
**Pronto para Fase 1**: ✅ SIM
