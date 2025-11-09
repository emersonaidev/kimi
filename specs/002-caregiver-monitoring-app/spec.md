# Especificação da Funcionalidade: Aplicação de Monitorização KIMI para Caregivers

**Branch da Funcionalidade**: `002-caregiver-monitoring-app`
**Criado em**: 2025-11-09
**Estado**: Draft
**Entrada**: Descrição do utilizador: "Constrói a aplicação de monitorização KIMI para caregivers usando /frontendtemplatekimi como base EXATA inicial. IMPORTANTE: O /frontendtemplatekimi contém TODO o fundamento visual, estrutural e de interatividade que precisamos. Não é apenas uma referência - é o ponto de partida literal. Primeiro replica EXATAMENTE tudo o que está lá, depois expande com a lógica da aplicação."

## Cenários de Utilizador e Testes *(obrigatório)*

### User Story 1 - Replicação Integral do Frontend Template (Prioridade: P1)

Como desenvolvedor, preciso que toda a estrutura base do `Frontendtemplatekimi` seja copiada integralmente para a aplicação KIMI, para que eu tenha o fundamento visual e de interatividade completo antes de adicionar qualquer funcionalidade nova.

**Motivo da prioridade**: Esta é a fundação de toda a aplicação. Sem a base visual iOS-nativa e o design system completo, qualquer funcionalidade adicionada não terá o polish e consistência necessários.

**Teste Independente**: Pode ser testado verificando que todos os ficheiros do template (estrutura, components, styles, contexts, lib) existem no projeto KIMI e que a aplicação renderiza com o mesmo visual iOS nativo.

**Cenários de Aceitação**:

1. **Dado** que o Frontendtemplatekimi existe como submodule, **Quando** a cópia é executada, **Então** toda a estrutura de pastas (src/components, src/styles, src/contexts, src/lib, src/imports) é replicada integralmente
2. **Dado** que o globals.css existe no template, **Quando** é copiado, **Então** todas as CSS variables e design system são preservados palavra por palavra
3. **Dado** que Auth.tsx existe como padrão ouro, **Quando** é copiado, **Então** todas as animações Motion, CSS variables, estrutura de forms e loading states são preservados
4. **Dado** que os componentes ShadCN ui/* existem, **Quando** são copiados, **Então** todos os componentes mantêm a consistência visual iOS
5. **Dado** que Group11.tsx (logo KIMI) existe, **Quando** é copiado, **Então** o logo é integrado na aplicação
6. **Dado** que lib/supabase.ts e contexts/* existem, **Quando** são copiados, **Então** a infraestrutura de autenticação e tema está funcional

---

### User Story 2 - Dashboard de Monitorização de Loved Ones (Prioridade: P2)

Como caregiver, preciso visualizar num dashboard central todos os meus loved ones monitorizados com informação crítica (localização, ritmo cardíaco, atividade, bateria), para que eu possa ter visibilidade imediata do estado de cada pessoa.

**Motivo da prioridade**: É a funcionalidade central da aplicação - sem o dashboard, não há valor entregue ao utilizador.

**Teste Independente**: Pode ser testado criando um dashboard que mostre cards de loved ones com dados mockados de localização, métricas e bateria, seguindo o mesmo padrão visual do Auth.tsx.

**Cenários de Aceitação**:

1. **Dado** que estou autenticado como caregiver, **Quando** acedo ao dashboard, **Então** vejo uma lista de todos os loved ones que monitorizo
2. **Dado** que um loved one tem dados recentes, **Quando** visualizo o card dele, **Então** vejo localização atual, ritmo cardíaco, número de passos e nível de bateria
3. **Dado** que um loved one está fora de uma safe zone, **Quando** visualizo o dashboard, **Então** o card dele mostra um indicador visual de alerta
4. **Dado** que um loved one tem bateria baixa (<20%), **Quando** visualizo o dashboard, **Então** vejo um aviso de bateria crítica
5. **Dado** que os dados têm mais de 30 minutos, **Quando** visualizo o dashboard, **Então** vejo um indicador de "última atualização" com timestamp

---

### User Story 3 - Mapa em Tempo Real com Histórico (Prioridade: P2)

Como caregiver, preciso visualizar num mapa a localização atual do meu loved one e o trilho de movimento nas últimas horas, para que eu possa entender os padrões de deslocação e confirmar a segurança.

**Motivo da prioridade**: Complementa o dashboard com visualização geoespacial essencial para contexto de localização.

**Teste Independente**: Pode ser testado criando um mapa com MapLibre GL que mostre a posição atual e trail de localizações históricas, com o mesmo polish visual do template.

**Cenários de Aceitação**:

1. **Dado** que seleciono um loved one, **Quando** abro o mapa, **Então** vejo a localização atual marcada com precisão
2. **Dado** que existem localizações nas últimas 24h, **Quando** visualizo o mapa, **Então** vejo um trail (linha) conectando as posições anteriores
3. **Dado** que existem safe zones definidas, **Quando** visualizo o mapa, **Então** vejo círculos semitransparentes representando cada zona segura
4. **Dado** que toco numa localização no trail, **Quando** o popup abre, **Então** vejo timestamp, precisão GPS e nível de bateria daquele momento
5. **Dado** que o loved one está em movimento, **Quando** novos dados GPS chegam, **Então** o mapa atualiza suavemente sem reload completo

---

### User Story 4 - Sistema de Geofencing e Alertas (Prioridade: P2)

Como caregiver, preciso definir zonas geográficas seguras e receber alertas quando o meu loved one sai dessas zonas, para que eu possa intervir rapidamente se necessário.

**Motivo da prioridade**: Funcionalidade crítica de segurança que previne situações de risco.

**Teste Independente**: Pode ser testado criando uma interface para definir zonas circulares no mapa e visualizar alertas quando violações são detectadas.

**Cenários de Aceitação**:

1. **Dado** que estou no mapa, **Quando** toco em "Criar Safe Zone", **Então** posso definir nome, centro (lat/lon) e raio da zona
2. **Dado** que uma safe zone está ativa, **Quando** o loved one sai do perímetro, **Então** recebo uma notificação push e vejo um alerta no dashboard
3. **Dado** que múltiplas safe zones existem, **Quando** visualizo o mapa, **Então** vejo todas as zonas com indicação de ativas/inativas
4. **Dado** que um alerta de geofence foi criado, **Quando** acedo ao centro de alertas, **Então** vejo detalhes da violação (zona, hora, distância)
5. **Dado** que quero desativar uma zona, **Quando** altero o toggle, **Então** a zona fica visualmente marcada como inativa e não gera alertas

---

### User Story 5 - Centro de Alertas e Notificações (Prioridade: P3)

Como caregiver, preciso visualizar todos os alertas recentes (quedas, ritmo cardíaco anormal, geofence, bateria baixa) organizados por severidade, para que eu possa priorizar ações urgentes.

**Motivo da prioridade**: Consolida todas as situações que requerem atenção, mas depende das outras features estarem implementadas.

**Teste Independente**: Pode ser testado criando uma lista de alertas com diferentes tipos e severidades, com interação para marcar como lido/resolvido.

**Cenários de Aceitação**:

1. **Dado** que existem alertas não lidos, **Quando** acedo ao centro de alertas, **Então** vejo uma badge com o número de alertas pendentes
2. **Dado** que visualizo a lista de alertas, **Quando** ordenados por severidade, **Então** vejo primeiro "high" (vermelho), depois "medium" (amarelo), depois "low" (azul)
3. **Dado** que um alerta é de queda detectada, **Quando** abro os detalhes, **Então** vejo timestamp, localização e botão para "Contactar Emergência"
4. **Dado** que um alerta é de bateria baixa, **Quando** visualizo, **Então** vejo percentagem atual e estimativa de tempo restante
5. **Dado** que marco um alerta como "acknowledged", **Quando** atualizo, **Então** o alerta sai da lista de pendentes mas fica no histórico

---

### User Story 6 - Monitorização Biométrica com Gráficos (Prioridade: P3)

Como caregiver, preciso visualizar métricas de saúde do loved one (ritmo cardíaco, passos, sono) em gráficos temporais, para que eu possa identificar padrões e anomalias.

**Motivo da prioridade**: Importante para análise de tendências, mas não é crítico para monitorização imediata.

**Teste Independente**: Pode ser testado criando gráficos com Recharts mostrando dados de health_metrics ao longo do tempo.

**Cenários de Aceitação**:

1. **Dado** que seleciono um loved one, **Quando** acedo à secção de métricas, **Então** vejo gráficos de ritmo cardíaco das últimas 24h
2. **Dado** que visualizo o gráfico de passos, **Quando** seleciono intervalo (dia/semana/mês), **Então** o gráfico atualiza com a granularidade apropriada
3. **Dado** que existem dados de sono, **Quando** visualizo o gráfico, **Então** vejo barras por noite com horas de sono
4. **Dado** que um valor está fora do normal (ex: BPM > 120), **Quando** visualizo o gráfico, **Então** vejo esse ponto destacado visualmente
5. **Dado** que toco num ponto do gráfico, **Quando** o tooltip aparece, **Então** vejo timestamp e valor exato daquela métrica

---

### User Story 7 - Timeline Histórica de Localizações e Eventos (Prioridade: P3)

Como caregiver, preciso visualizar uma timeline cronológica de todas as localizações e eventos do loved one, para que eu possa reconstruir o que aconteceu num período específico.

**Motivo da prioridade**: Útil para análise retroativa, mas não crítico para monitorização em tempo real.

**Teste Independente**: Pode ser testado criando uma lista vertical de eventos ordenados por timestamp, combinando dados de gps_locations e activities.

**Cenários de Aceitação**:

1. **Dado** que seleciono um loved one, **Quando** acedo à timeline, **Então** vejo eventos ordenados cronologicamente (mais recente primeiro)
2. **Dado** que um evento é mudança de localização, **Quando** visualizo, **Então** vejo timestamp, endereço aproximado e mapa miniatura
3. **Dado** que um evento é entrada/saída de safe zone, **Quando** visualizo, **Então** vejo nome da zona e indicador de entrada ou saída
4. **Dado** que seleciono um intervalo de datas, **Quando** filtro a timeline, **Então** vejo apenas eventos nesse período
5. **Dado** que toco num evento de localização, **Quando** expando, **Então** vejo detalhes completos (lat/lon, precisão, bateria)

---

### User Story 8 - Gestão de Perfis e Contactos de Emergência (Prioridade: P4)

Como caregiver, preciso gerir o perfil do loved one (nome, data nascimento, condições médicas) e lista de contactos de emergência, para que a informação crítica esteja sempre atualizada.

**Motivo da prioridade**: Funcionalidade de suporte, menos crítica que monitorização mas importante para contexto.

**Teste Independente**: Pode ser testado criando formulários para editar perfil de loved ones e lista de contactos, seguindo o padrão do Auth.tsx.

**Cenários de Aceitação**:

1. **Dado** que acedo ao perfil de um loved one, **Quando** edito o nome ou data de nascimento, **Então** as mudanças são guardadas na tabela loved_ones
2. **Dado** que adiciono um contacto de emergência, **Quando** preencho nome, telefone e relação, **Então** o contacto é guardado com prioridade automática
3. **Dado** que existem múltiplos contactos, **Quando** visualizo a lista, **Então** vejo ordenados por prioridade (1 primeiro)
4. **Dado** que edito notas médicas, **Quando** guardo, **Então** o campo emergency_notes é atualizado
5. **Dado** que removo um contacto, **Quando** confirmo, **Então** o contacto é eliminado da base de dados

---

### User Story 9 - Definições de Notificações e Limites de Alerta (Prioridade: P4)

Como caregiver, preciso configurar preferências de notificações e limites personalizados para alertas (ex: BPM > X), para que eu receba apenas alertas relevantes para o meu caso.

**Motivo da prioridade**: Personalização importante mas não crítica para funcionalidade base.

**Teste Independente**: Pode ser testado criando uma página de settings onde o caregiver pode ajustar thresholds e toggles de notificação.

**Cenários de Aceitação**:

1. **Dado** que acedo a definições, **Quando** ativo "Notificações Push", **Então** a preferência é guardada em caregiver_preferences
2. **Dado** que defino limite de BPM, **Quando** insiro "120", **Então** alertas só são gerados se ritmo cardíaco > 120
3. **Dado** que desativo alertas de bateria, **Quando** guardo, **Então** não recebo mais notificações de bateria baixa
4. **Dado** que configuro horário de "Modo Silencioso", **Quando** defino 22h-8h, **Então** alertas não-críticos são silenciados nesse período
5. **Dado** que restauro definições padrão, **Quando** confirmo, **Então** todas as preferências voltam aos valores iniciais

---

### Casos Limite

- **Sem dados GPS**: Quando o loved one não tem dados GPS recentes (> 30 min), o sistema deve mostrar "Última localização conhecida" com timestamp e aviso visual de dados desatualizados.
- **Sem conexão à Internet**: Quando o caregiver está offline, o sistema deve mostrar dados em cache e indicar claramente que a informação pode estar desatualizada.
- **Múltiplas Safe Zones Sobrepostas**: Quando safe zones se sobrepõem, o sistema deve considerar o loved one "seguro" se estiver dentro de pelo menos uma zona ativa.
- **Bateria do Wearable Crítica**: Quando bateria < 5%, o sistema deve enviar alerta de prioridade máxima e sugerir contactar o loved one.
- **Dados Biométricos Fora da Norma**: Quando BPM < 40 ou > 150, o sistema deve gerar alerta "high severity" e sugerir contactar emergência.
- **Primeira Autenticação**: Quando um caregiver novo faz login pela primeira vez, o sistema deve mostrar onboarding explicando como adicionar o primeiro loved one.
- **Sem Loved Ones Configurados**: Quando um caregiver autenticado não tem loved ones, o sistema deve mostrar empty state convidativo para adicionar o primeiro.
- **Precisão GPS Baixa**: Quando accuracy > 100 metros, o sistema deve mostrar indicador de "baixa precisão" e não gerar alertas de geofence.
- **Timezone Differences**: Quando caregiver e loved one estão em timezones diferentes, todos os timestamps devem ser mostrados no timezone do caregiver com indicação clara.
- **Eliminação de Loved One**: Quando um loved one é removido, todos os dados associados (safe_zones, alertas) devem ser eliminados em cascata ou archived.

## Requisitos *(obrigatório)*

### Requisitos Funcionais

**Fase 1: Replicação do Template**

- **FR-001**: O sistema DEVE copiar integralmente a estrutura de ficheiros e pastas do Frontendtemplatekimi
- **FR-002**: O sistema DEVE preservar o globals.css palavra por palavra, incluindo todas as CSS variables do design system iOS
- **FR-003**: O sistema DEVE copiar Auth.tsx como referência para animações Motion, estados de loading e estrutura de forms
- **FR-004**: O sistema DEVE copiar todos os componentes ShadCN (ui/*) mantendo a consistência visual
- **FR-005**: O sistema DEVE copiar Group11.tsx (logo KIMI) e integrá-lo na aplicação
- **FR-006**: O sistema DEVE copiar lib/supabase.ts e contexts/* para autenticação e gestão de tema

**Fase 2: Dashboard e Monitorização**

- **FR-007**: O sistema DEVE mostrar lista de loved ones com localização, ritmo cardíaco, passos e bateria
- **FR-008**: O sistema DEVE indicar visualmente quando um loved one está fora de safe zone
- **FR-009**: O sistema DEVE mostrar aviso de bateria crítica quando < 20%
- **FR-010**: O sistema DEVE mostrar timestamp de "última atualização" para dados > 30 min
- **FR-011**: O sistema DEVE permitir navegação entre dashboard, mapa e timeline por loved one

**Fase 3: Mapa e Geolocalização**

- **FR-012**: O sistema DEVE renderizar mapa usando MapLibre GL com localização atual do loved one
- **FR-013**: O sistema DEVE mostrar trail de localizações das últimas 24h como linha conectada
- **FR-014**: O sistema DEVE renderizar safe zones como círculos semitransparentes no mapa
- **FR-015**: O sistema DEVE mostrar popup com timestamp, precisão e bateria ao tocar em ponto do trail
- **FR-016**: O sistema DEVE atualizar o mapa suavemente quando novos dados GPS chegam (sem reload completo)

**Fase 4: Geofencing e Alertas**

- **FR-017**: O sistema DEVE permitir criar safe zones com nome, centro (lat/lon) e raio
- **FR-018**: O sistema DEVE gerar alerta quando loved one sai de safe zone ativa
- **FR-019**: O sistema DEVE mostrar todas as safe zones com indicação visual de ativa/inativa
- **FR-020**: O sistema DEVE registar violações de geofence com zona, hora e distância
- **FR-021**: O sistema DEVE permitir ativar/desativar safe zones individualmente

**Fase 5: Centro de Alertas**

- **FR-022**: O sistema DEVE mostrar badge com número de alertas pendentes
- **FR-023**: O sistema DEVE ordenar alertas por severidade (high > medium > low)
- **FR-024**: O sistema DEVE mostrar detalhes de alerta (tipo, timestamp, localização, dados relevantes)
- **FR-025**: O sistema DEVE permitir marcar alertas como "acknowledged" movendo para histórico
- **FR-026**: O sistema DEVE diferenciar visualmente alertas de queda, BPM, geofence e bateria

**Fase 6: Métricas Biométricas**

- **FR-027**: O sistema DEVE mostrar gráficos de ritmo cardíaco usando Recharts
- **FR-028**: O sistema DEVE permitir selecionar intervalo temporal (dia/semana/mês)
- **FR-029**: O sistema DEVE destacar valores fora da norma (BPM < 40 ou > 150)
- **FR-030**: O sistema DEVE mostrar tooltip com timestamp e valor exato ao tocar em ponto do gráfico
- **FR-031**: O sistema DEVE mostrar gráficos de passos e horas de sono

**Fase 7: Timeline e Histórico**

- **FR-032**: O sistema DEVE mostrar eventos ordenados cronologicamente (mais recente primeiro)
- **FR-033**: O sistema DEVE combinar dados de gps_locations e activities na timeline
- **FR-034**: O sistema DEVE mostrar mapa miniatura para eventos de localização
- **FR-035**: O sistema DEVE permitir filtrar timeline por intervalo de datas
- **FR-036**: O sistema DEVE mostrar detalhes completos ao expandir evento

**Fase 8: Gestão de Perfis**

- **FR-037**: O sistema DEVE permitir editar perfil de loved one (nome, data nascimento, condições médicas)
- **FR-038**: O sistema DEVE permitir adicionar/editar/remover contactos de emergência
- **FR-039**: O sistema DEVE ordenar contactos por prioridade
- **FR-040**: O sistema DEVE validar formato de número de telefone
- **FR-041**: O sistema DEVE permitir editar notas médicas (emergency_notes)

**Fase 9: Preferências e Configurações**

- **FR-042**: O sistema DEVE permitir ativar/desativar notificações push
- **FR-043**: O sistema DEVE permitir definir limites personalizados para alertas de BPM
- **FR-044**: O sistema DEVE permitir desativar tipos específicos de alertas
- **FR-045**: O sistema DEVE permitir configurar modo silencioso com horário
- **FR-046**: O sistema DEVE permitir restaurar definições padrão

### Entidades-Chave

- **Caregiver**: Utilizador autenticado que monitoriza loved ones. Atributos: email, full_name, phone_number
- **Loved One**: Pessoa monitorizada através de wearable. Atributos: full_name, device_id, date_of_birth, medical_conditions, emergency_notes
- **GPS Location**: Ponto de localização geográfica. Atributos: latitude, longitude, accuracy, battery_level, recorded_at
- **Safe Zone**: Zona geográfica segura definida por perímetro. Atributos: name, latitude, longitude, radius, is_active
- **Alert**: Notificação de evento que requer atenção. Atributos: alert_type, severity, title, message, acknowledged_at
- **Health Metric**: Métrica biométrica do wearable. Atributos: heart_rate, steps, calories_burned, sleep_hours, recorded_at
- **Activity**: Evento registado na timeline. Atributos: activity_type, description, metadata, occurred_at
- **Emergency Contact**: Contacto de emergência associado ao caregiver. Atributos: contact_name, phone_number, relationship, priority
- **Caregiver Preferences**: Configurações personalizadas do caregiver. Atributos: notifications_enabled, alert_sound_enabled, quiet_hours_start, quiet_hours_end

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **SC-001**: Caregivers conseguem visualizar localização atual de todos os loved ones em menos de 3 segundos após abrir a aplicação
- **SC-002**: O mapa renderiza e mostra trail de 24h de localizações em menos de 2 segundos
- **SC-003**: Alertas de geofence breach são gerados em tempo real (< 30 segundos após violação)
- **SC-004**: 95% dos caregivers conseguem criar uma safe zone sem ajuda em menos de 1 minuto
- **SC-005**: O dashboard mantém visual iOS nativo idêntico ao Auth.tsx com animações suaves (60fps)
- **SC-006**: A aplicação funciona offline mostrando dados em cache com indicação clara de desatualização
- **SC-007**: Caregivers conseguem identificar visualmente alertas críticos (bateria < 5%, BPM anormal) em menos de 5 segundos no dashboard
- **SC-008**: Gráficos de métricas biométricas carregam e renderizam em menos de 1 segundo
- **SC-009**: A timeline histórica mostra 100+ eventos sem degradação de performance
- **SC-010**: Todos os componentes novos seguem exatamente o padrão visual e de animação do Auth.tsx

### Resultados Qualitativos

- **SC-011**: Caregivers sentem que a aplicação tem o mesmo polish e feeling iOS nativo do template original
- **SC-012**: A transição entre secções (dashboard → mapa → timeline) é suave e intuitiva
- **SC-013**: Alertas críticos são imediatamente reconhecíveis através de cor e iconografia
- **SC-014**: A aplicação inspira confiança através de consistência visual e feedback claro de estado
- **SC-015**: Caregivers conseguem compreender o estado de saúde/localização dos loved ones num relance visual

## Assumptions *(opcional)*

### Suposições de Dados e Infraestrutura

- **A-001**: A base de dados Supabase já está configurada com as 11 tabelas definidas na feature 001-supabase-db-setup
- **A-002**: Os wearables enviam dados GPS a cada 5-15 minutos e métricas biométricas a cada hora
- **A-003**: A precisão GPS dos wearables é tipicamente entre 5-50 metros
- **A-004**: Os caregivers têm acesso à Internet móvel (4G/5G) ou WiFi na maioria do tempo
- **A-005**: As notificações push são geridas através de serviço externo (ex: Firebase Cloud Messaging)

### Suposições de Utilizador e Contexto

- **A-006**: Caregivers têm conhecimentos básicos de smartphone (sabem navegar, tocar, scroll)
- **A-007**: A maioria dos caregivers monitoriza 1-3 loved ones (não dezenas)
- **A-008**: Caregivers verificam a aplicação 3-10 vezes por dia em média
- **A-009**: A relação caregiver-loved one é tipicamente familiar (filho-pai, neto-avó)
- **A-010**: Caregivers valorizam simplicidade e rapidez sobre features avançadas

### Suposições Técnicas

- **A-011**: MapLibre GL é compatível com a stack React + Vite do template
- **A-012**: Recharts integra-se bem com o design system do template (CSS variables)
- **A-013**: Motion (Framer Motion) já está configurado e funcional no template
- **A-014**: As CSS variables do template são suficientes para todas as novas componentes
- **A-015**: O template usa TailwindCSS configurado para suportar as variáveis do design system

### Suposições de Negócio

- **A-016**: Esta é a primeira versão da aplicação KIMI (MVP)
- **A-017**: A aplicação será usada primariamente em iOS mas deve funcionar em web
- **A-018**: Não há requisitos de conformidade HIPAA ou regulamentação médica por agora
- **A-019**: O foco inicial é Portugal (timezone Europe/Lisbon, língua PT-PT)
- **A-020**: O modelo de negócio e monetização serão definidos futuramente (não afeta esta feature)

## Out of Scope *(opcional)*

### Funcionalidades Explicitamente Excluídas

- **OS-001**: Comunicação bidirecional (chamadas, mensagens de voz/texto) entre caregiver e loved one
- **OS-002**: Detecção automática de quedas (assumimos que vem do wearable)
- **OS-003**: Integração com sistemas de saúde ou EMR (Electronic Medical Records)
- **OS-004**: Histórico de métricas > 30 dias (limitamos a 30 dias de retenção)
- **OS-005**: Partilha de localização com múltiplos caregivers (1 loved one = 1 caregiver por agora)
- **OS-006**: Gestão de medicação e lembretes de toma
- **OS-007**: Integração com serviços de emergência (INEM 112)
- **OS-008**: Modo offline completo (apenas cache de leitura, não escrita)
- **OS-009**: Suporte para múltiplos idiomas (apenas PT-PT)
- **OS-010**: Aplicação nativa iOS (apenas web/PWA por agora)

### Decisões Técnicas Adiadas

- **OS-011**: Backend próprio para processamento de alertas (usamos Supabase functions)
- **OS-012**: Sistema de logs e analytics avançado
- **OS-013**: Testes A/B de UX
- **OS-014**: Performance profiling e otimização avançada
- **OS-015**: Estratégia de caching sofisticada (usamos defaults do Supabase)

## Dependencies *(opcional)*

### Dependências Internas (Projeto KIMI)

- **D-001**: **Feature 001-supabase-db-setup** - Base de dados Supabase com 11 tabelas, RLS, triggers e seed data deve estar deployada e funcional
- **D-002**: **Frontendtemplatekimi submodule** - Repositório deve estar clonado e acessível em `/Frontendtemplatekimi`
- **D-003**: **Supabase Project Credentials** - `SUPABASE_URL` e `SUPABASE_ANON_KEY` devem estar configuradas em `.env`

### Dependências Externas (Bibliotecas e Serviços)

- **D-004**: **MapLibre GL** - Para renderização de mapas (já declarado em package.json do template)
- **D-005**: **Recharts** - Para gráficos de métricas biométricas (já declarado em package.json)
- **D-006**: **Motion (Framer Motion)** - Para animações (já declarado em package.json)
- **D-007**: **Radix UI** - Para componentes ShadCN (já declarado em package.json)
- **D-008**: **@supabase/supabase-js** - Para comunicação com Supabase (já declarado em package.json)
- **D-009**: **Lucide React** - Para ícones (já declarado em package.json)
- **D-010**: **React Hook Form** - Para gestão de formulários (já declarado em package.json)

### Dependências de Ambiente

- **D-011**: **Node.js ≥ 20** - Runtime JavaScript
- **D-012**: **Vite** - Build tool (já configurado no template)
- **D-013**: **TailwindCSS** - Framework CSS (implícito pelo design system)
- **D-014**: **TypeScript** - Linguagem (inferido pelos .tsx files)

### Dependências de Dados

- **D-015**: **Seed Data** - Migration 20251109000011_insert_seed_data.sql deve estar executada para testes
- **D-016**: **GPS Data Stream** - Wearables devem estar enviando dados para `gps_locations` table
- **D-017**: **Health Metrics Stream** - Wearables devem estar enviando dados para `health_metrics` table

## Technical Constraints *(opcional)*

### Restrições de Frontend

- **TC-001**: DEVE usar exatamente a mesma stack do Frontendtemplatekimi (React 18, Vite, TypeScript)
- **TC-002**: DEVE preservar 100% das CSS variables do globals.css sem modificações
- **TC-003**: DEVE usar Motion para TODAS as animações (não CSS animations nativas)
- **TC-004**: DEVE seguir o padrão do Auth.tsx para estrutura de componentes (estados de loading, error handling, validação)
- **TC-005**: DEVE usar componentes ShadCN ui/* sem criar componentes custom de raiz

### Restrições de Design e UX

- **TC-006**: DEVE manter feeling iOS nativo (border-radius, shadows, spacing, tipografia)
- **TC-007**: DEVE usar apenas ícones Lucide React (consistência com template)
- **TC-008**: DEVE manter hierarquia de cores (primary, secondary, destructive) do design system
- **TC-009**: DEVE seguir a mesma estrutura de layout do Auth.tsx (centrado, max-width, padding)
- **TC-010**: NÃO DEVE introduzir novos padrões de animação ou transição diferentes do template

### Restrições de Performance

- **TC-011**: Dashboard inicial DEVE carregar em < 3 segundos (LCP - Largest Contentful Paint)
- **TC-012**: Mapa DEVE renderizar em < 2 segundos mesmo com 100+ pontos GPS
- **TC-013**: Animações DEVEM manter 60fps (16.6ms por frame)
- **TC-014**: Bundle JavaScript DEVE ser < 500KB gzipped (code splitting recomendado)
- **TC-015**: Imagens e assets DEVEM ser otimizados (WebP/AVIF quando possível)

### Restrições de Dados e API

- **TC-016**: DEVE usar Supabase Realtime para atualizações de GPS/alertas (não polling)
- **TC-017**: DEVE respeitar RLS policies (nenhuma query raw que bypasse segurança)
- **TC-018**: DEVE usar PostgREST filtering syntax para queries eficientes
- **TC-019**: NÃO DEVE fazer queries N+1 (usar .select() com joins quando aplicável)
- **TC-020**: DEVE implementar error boundaries para falhas de API

### Restrições de Segurança

- **TC-021**: DEVE usar Supabase Auth para autenticação (não custom auth)
- **TC-022**: NÃO DEVE expor SUPABASE_SERVICE_ROLE_KEY no frontend
- **TC-023**: DEVE validar inputs no frontend antes de enviar para Supabase
- **TC-024**: DEVE usar HTTPS para todas as comunicações (enforced by Supabase)
- **TC-025**: DEVE limpar dados sensíveis de logs e error messages

### Restrições de Compatibilidade

- **TC-026**: DEVE funcionar em iOS Safari 15+
- **TC-027**: DEVE funcionar em Chrome/Edge/Firefox últimas 2 versões
- **TC-028**: DEVE ser responsivo (mobile-first, breakpoints do TailwindCSS)
- **TC-029**: DEVE funcionar com JavaScript ativado (não graceful degradation)
- **TC-030**: PODE funcionar offline apenas para leitura (cache de dados)

## Risks *(opcional)*

### Riscos Técnicos (Alto Impacto)

- **R-001**: **MapLibre GL incompatibilidade** - MapLibre pode ter conflitos com Vite ou outras dependências do template. *Mitigação*: Testar integração cedo, ter fallback para mapa estático simples.
- **R-002**: **Performance do Mapa** - Renderizar 100+ pontos GPS com trail animado pode causar lag. *Mitigação*: Usar clustering, limitar trail a 50 pontos recentes, implementar virtualização.
- **R-003**: **Realtime Overhead** - Subscrições Supabase Realtime para múltiplos loved ones podem consumir recursos. *Mitigação*: Limitar subscrições ativas, usar polling inteligente quando app está em background.

### Riscos de Dados (Médio Impacto)

- **R-004**: **Latência de GPS** - Wearables podem enviar dados com delay de minutos, dando falsa sensação de tempo real. *Mitigação*: Mostrar timestamp claro, indicar "última atualização", não prometer "tempo real" estrito.
- **R-005**: **Dados Incompletos** - Health metrics podem ter gaps (wearable offline, bateria morta). *Mitigação*: UI deve lidar gracefully com null values, mostrar "sem dados" em vez de crashar.
- **R-006**: **Volume de Dados** - 24h de GPS a cada 5 min = 288 pontos/dia/loved one. Com 3 loved ones = 864 pontos. *Mitigação*: Implementar pagination, limitar queries com .limit(), arquivar dados > 30 dias.

### Riscos de UX (Médio Impacto)

- **R-007**: **Complexidade Visual** - Tentar mostrar localização + métricas + alertas simultaneamente pode sobrecarregar UI. *Mitigação*: Usar tabs/navegação clara, priorizar info crítica, esconder detalhes secundários.
- **R-008**: **Alert Fatigue** - Muitos alertas de baixa prioridade podem dessensibilizar caregivers. *Mitigação*: Implementar thresholds inteligentes, permitir fine-tuning de sensibilidade, agrupar alertas similares.
- **R-009**: **Onboarding Friction** - Caregivers novos podem não saber como começar (adicionar loved one, criar safe zones). *Mitigação*: Criar empty states convidativos, tooltips contextuais, wizard inicial.

### Riscos de Âmbito (Alto Impacto)

- **R-010**: **Scope Creep** - Pedidos para adicionar features (chat, chamadas, gestão medicação) durante desenvolvimento. *Mitigação*: Referir secção Out of Scope, manter foco no MVP, documentar pedidos para v2.
- **R-011**: **Template Drift** - Template pode ser atualizado durante desenvolvimento, causando conflitos. *Mitigação*: Pin submodule a commit específico, não atualizar mid-development.
- **R-012**: **Over-Engineering** - Tentar criar abstrações genéricas prematuramente. *Mitigação*: Seguir YAGNI, copiar padrões do Auth.tsx diretamente, refatorar só quando padrão emerge 3+ vezes.

### Riscos de Dependências (Baixo-Médio Impacto)

- **R-013**: **Breaking Changes** - Radix UI, Motion ou outras deps podem ter breaking changes. *Mitigação*: Pin versões exatas em package.json, testar updates em branch separado.
- **R-014**: **Supabase Downtime** - Serviço Supabase pode ter indisponibilidade. *Mitigação*: Implementar retry logic, mostrar mensagens de erro amigáveis, ter modo offline básico.
- **R-015**: **MapLibre Licensing** - MapLibre é BSD-licensed mas tiles podem ter restrições. *Mitigação*: Usar tiles gratuitos (OSM) para MVP, planear tiles comerciais para produção.
