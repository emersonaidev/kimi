# Especificação da Funcionalidade: Database Setup - Supabase Cloud

**Branch da Funcionalidade**: `001-supabase-db-setup`
**Criado em**: 2025-11-09
**Estado**: Draft
**Entrada**: Descrição do utilizador: "Implementar a base de dados KIMI no Supabase Cloud seguindo EXATAMENTE a especificação detalhada em /DATABASE_SPECIFICATION.md. Utilizar o MCP do Supabase para criar todas as tabelas, indexes, triggers, RLS policies e inserir os seed data."

## Cenários de Utilizador e Testes *(obrigatório)*

### User Story 1 - Database Schema Creation (Prioridade: P1)

O sistema deve ter um esquema de base de dados completo e funcional no Supabase Cloud que permita armazenar todos os dados essenciais da aplicação KIMI: perfis de cuidadores, perfis de entes queridos, histórico de localização GPS, métricas de saúde, zonas seguras, atividades, alertas, mensagens de chat, contactos de emergência e preferências.

**Motivo da prioridade**: Sem a base de dados configurada, nenhuma funcionalidade da aplicação pode operar. É o alicerce de todo o sistema.

**Teste Independente**: Pode ser testada através de queries SQL diretas para verificar a existência de todas as 11 tabelas com as suas colunas, tipos de dados e constraints corretas.

**Cenários de Aceitação**:

1. **Dado** que o Supabase Cloud está acessível, **Quando** o esquema é criado, **Então** todas as 11 tabelas devem existir: `caregivers`, `loved_ones`, `gps_locations`, `health_metrics`, `safe_zones`, `activities`, `alerts`, `chat_messages`, `emergency_contacts`, `caregiver_preferences`, `location_shares`
2. **Dado** que as tabelas foram criadas, **Quando** se inspeciona o esquema, **Então** todas as foreign keys devem estar configuradas com `ON DELETE CASCADE` apropriado
3. **Dado** que as tabelas foram criadas, **Quando** se verifica os tipos de dados, **Então** todos os campos UUID devem usar `uuid_generate_v4()`, timestamps devem ser `TIMESTAMPTZ`, e campos de localização devem ser `DOUBLE PRECISION`
4. **Dado** que a extensão PostGIS é necessária, **Quando** se cria o esquema, **Então** a extensão `postgis` deve estar ativada
5. **Dado** que há campos com valores restritos, **Quando** se cria as tabelas, **Então** todos os `CHECK` constraints devem estar implementados (ex: `device_status`, `severity`, `theme`, etc.)

---

### User Story 2 - Performance Indexes Implementation (Prioridade: P1)

O sistema deve ter todos os indexes necessários criados para garantir performance adequada nas queries mais frequentes, incluindo indexes standard em foreign keys e indexes geoespaciais (GiST) para queries de localização e deteção de zonas seguras.

**Motivo da prioridade**: Os indexes são críticos para a performance do sistema, especialmente para queries em tempo real de localização GPS e alertas. Sem eles, o sistema será demasiado lento para uso prático.

**Teste Independente**: Pode ser testada através de queries `EXPLAIN ANALYZE` para verificar que as queries principais usam índices em vez de table scans, e através de inspeção do catálogo do PostgreSQL para confirmar existência de todos os indexes.

**Cenários de Aceitação**:

1. **Dado** que as tabelas existem, **Quando** os indexes são criados, **Então** todos os campos de foreign key devem ter indexes (ex: `idx_loved_ones_caregiver_id`, `idx_gps_locations_loved_one_id`)
2. **Dado** que há queries por timestamp, **Quando** os indexes são criados, **Então** campos `recorded_at`, `occurred_at`, `triggered_at`, `sent_at` devem ter indexes descendentes
3. **Dado** que há queries compostas, **Quando** os indexes são criados, **Então** indexes compostos devem existir (ex: `idx_gps_locations_loved_one_recorded` em `loved_one_id, recorded_at DESC`)
4. **Dado** que há queries geoespaciais, **Quando** os indexes GiST são criados, **Então** `idx_gps_locations_coordinates` e `idx_safe_zones_coordinates` devem existir usando `GIST`
5. **Dado** que há queries condicionais, **Quando** os partial indexes são criados, **Então** `idx_alerts_is_read` deve existir com condição `WHERE is_read = false`

---

### User Story 3 - Row Level Security (RLS) Policies (Prioridade: P1)

O sistema deve ter políticas de Row Level Security (RLS) ativadas em todas as tabelas para garantir que cada cuidador só pode aceder aos seus próprios dados e aos dados dos seus entes queridos, protegendo a privacidade e segurança dos utilizadores.

**Motivo da prioridade**: A segurança e privacidade dos dados são requisitos legais (GDPR) e éticos fundamentais. Sem RLS, qualquer utilizador autenticado poderia aceder a dados de outros utilizadores.

**Teste Independente**: Pode ser testada criando múltiplos utilizadores de teste e verificando que cada um só consegue aceder aos seus próprios dados através de queries com diferentes contextos de autenticação.

**Cenários de Aceitação**:

1. **Dado** que um cuidador está autenticado, **Quando** tenta ler dados da tabela `caregivers`, **Então** só deve ver o seu próprio perfil
2. **Dado** que um cuidador está autenticado, **Quando** tenta ler dados da tabela `loved_ones`, **Então** só deve ver os entes queridos associados ao seu `caregiver_id`
3. **Dado** que um cuidador está autenticado, **Quando** tenta ler `gps_locations` ou `health_metrics`, **Então** só deve ver dados dos seus entes queridos
4. **Dado** que um cuidador tenta atualizar dados, **Quando** executa um UPDATE, **Então** só pode modificar os seus próprios dados ou dados dos seus entes queridos
5. **Dado** que RLS está ativo, **Quando** se tenta aceder dados sem autenticação, **Então** nenhum dado deve ser retornado

---

### User Story 4 - Automated Triggers & Functions (Prioridade: P2)

O sistema deve ter triggers e funções automáticas para manter a integridade dos dados e executar lógica de negócio, incluindo: criação automática de perfis de cuidador quando um utilizador regista-se, atualização automática de timestamps `updated_at`, criação automática de preferências, e deteção automática de saída de zonas seguras.

**Motivo da prioridade**: Estas automatizações reduzem a complexidade da aplicação frontend, garantem consistência dos dados e implementam lógica crítica de segurança (alertas de zona segura) de forma confiável.

**Teste Independente**: Pode ser testada através de operações CRUD nas tabelas e verificação dos efeitos colaterais (registos criados automaticamente, timestamps atualizados, alertas gerados).

**Cenários de Aceitação**:

1. **Dado** que um novo utilizador é criado em `auth.users`, **Quando** o trigger `on_auth_user_created` é executado, **Então** um registo correspondente deve ser criado automaticamente em `caregivers`
2. **Dado** que um novo cuidador é criado, **Quando** o trigger `on_caregiver_created` é executado, **Então** um registo de preferências deve ser criado automaticamente em `caregiver_preferences`
3. **Dado** que um registo é atualizado em tabelas com `updated_at`, **Quando** o trigger `update_<table>_updated_at` é executado, **Então** o campo `updated_at` deve ser atualizado para `NOW()`
4. **Dado** que uma nova localização GPS é inserida, **Quando** o trigger `on_gps_location_inserted` é executado, **Então** deve verificar se o ente querido saiu de alguma zona segura ativa
5. **Dado** que um ente querido saiu de uma zona segura, **Quando** a função `check_safe_zone_breach()` é executada, **Então** um alerta do tipo `safe_zone_breach` deve ser criado automaticamente

---

### User Story 5 - Seed Data Population (Prioridade: P2)

O sistema deve ter dados iniciais (seed data) inseridos para permitir desenvolvimento e testes imediatos, incluindo: um cuidador (Emerson Ferreira), um ente querido (Ester Ferreira), zonas seguras (Casa, Escola, Parque), contactos de emergência, histórico de localização GPS das últimas 24 horas, métricas de saúde das últimas 24 horas, atividades dos últimos 7 dias, e mensagem inicial do chat AI.

**Motivo da prioridade**: Os dados iniciais permitem que a equipa de desenvolvimento e testes possa validar imediatamente a integração frontend-backend sem necessidade de simuladores ou dados manuais.

**Teste Independente**: Pode ser testada através de queries de contagem de registos em cada tabela e verificação dos valores específicos (emails, device_id, nomes).

**Cenários de Aceitação**:

1. **Dado** que o seed data é inserido, **Quando** se consulta `caregivers`, **Então** deve existir um registo para 'emersonaidev@gmail.com'
2. **Dado** que o seed data é inserido, **Quando** se consulta `loved_ones`, **Então** deve existir 'Ester Ferreira' com device_id 'KIMI-8472'
3. **Dado** que o seed data é inserido, **Quando** se consulta `safe_zones`, **Então** devem existir 3 zonas: 'Home', 'School', 'Park'
4. **Dado** que o seed data é inserido, **Quando** se consulta `gps_locations`, **Então** devem existir aproximadamente 16-24 registos das últimas 24 horas
5. **Dado** que o seed data é inserido, **Quando** se consulta `health_metrics`, **Então** devem existir 24 registos (um por hora)
6. **Dado** que o seed data é inserido, **Quando** se consulta `activities`, **Então** devem existir pelo menos 8 atividades dos últimos dias
7. **Dado** que o seed data é inserido, **Quando** se consulta `emergency_contacts`, **Então** devem existir 3 contactos (Mother, Therapist, Emergency Services)
8. **Dado** que o seed data é inserido, **Quando** se consulta `chat_messages`, **Então** deve existir uma mensagem de boas-vindas do AI

---

### Casos Limite

- **O que acontece quando** um utilizador tenta inserir um `loved_one` com um `device_id` duplicado?
  → O constraint `UNIQUE` deve rejeitar a inserção com erro.

- **O que acontece quando** se tenta inserir uma localização GPS sem um `loved_one_id` válido?
  → A foreign key deve rejeitar a inserção.

- **O que acontece quando** um cuidador é eliminado?
  → Todos os seus entes queridos, zonas seguras, alertas, mensagens de chat, contactos de emergência e preferências devem ser eliminados automaticamente devido a `ON DELETE CASCADE`.

- **O que acontece quando** um ente querido é eliminado?
  → Todas as suas localizações GPS, métricas de saúde, atividades e zonas seguras devem ser eliminadas automaticamente.

- **O que acontece quando** uma localização GPS é inserida exatamente no limite de uma zona segura (distância = raio)?
  → Não deve gerar alerta, apenas quando `distância > raio`.

- **O que acontece quando** múltiplas localizações GPS são inseridas rapidamente para a mesma saída de zona segura?
  → O `ON CONFLICT DO NOTHING` no trigger deve prevenir alertas duplicados.

- **O que acontece quando** se tenta criar uma zona segura com raio < 50m ou > 10km?
  → O constraint `CHECK (radius >= 50 AND radius <= 10000)` deve rejeitar.

- **O que acontece quando** um utilizador não autenticado tenta aceder qualquer tabela com RLS ativado?
  → Nenhum dado deve ser retornado (RLS bloqueia acesso).

## Requisitos *(obrigatório)*

### Requisitos Funcionais

**Esquema de Base de Dados:**

- **FR-001**: O sistema DEVE criar a tabela `caregivers` com campos: id (UUID PK), user_id (UUID FK para auth.users), full_name, role, phone, email, avatar_url, is_active, is_verified, created_at, updated_at
- **FR-002**: O sistema DEVE criar a tabela `loved_ones` com campos: id (UUID PK), caregiver_id (UUID FK), full_name, age, date_of_birth, condition, address, avatar_url, device_id (UNIQUE), device_status, last_seen_at, is_active, created_at, updated_at
- **FR-003**: O sistema DEVE criar a tabela `gps_locations` com campos: id (UUID PK), loved_one_id (UUID FK), latitude, longitude, accuracy, altitude, speed, heading, battery_level, recorded_at, created_at
- **FR-004**: O sistema DEVE criar a tabela `health_metrics` com campos para todas as métricas biométricas especificadas: heart_rate, resting_heart_rate, hrv_index, stress_score, wellness_load, breathing_stability, respiratory_rate, gsr_reactivity, temperature, steps, calories_burned, active_minutes, sleep_hours, sleep_quality, peak_recovery_start, peak_recovery_end
- **FR-005**: O sistema DEVE criar a tabela `safe_zones` com campos: id (UUID PK), loved_one_id, caregiver_id, name, latitude, longitude, radius (CHECK 50-10000), color, notifications_enabled, is_active, created_at, updated_at
- **FR-006**: O sistema DEVE criar a tabela `activities` com campos: id (UUID PK), loved_one_id, type (CHECK constraint), title, description, status (CHECK constraint), location_name, latitude, longitude, safe_zone_id, metadata (JSONB), occurred_at, created_at
- **FR-007**: O sistema DEVE criar a tabela `alerts` com campos: id (UUID PK), caregiver_id, loved_one_id, type (CHECK constraint), severity (CHECK constraint), title, message, activity_id, is_read, is_acknowledged, acknowledged_at, triggered_at, created_at
- **FR-008**: O sistema DEVE criar a tabela `chat_messages` com campos: id (UUID PK), caregiver_id, text, sender (CHECK 'user'/'ai'), ai_context (JSONB), sent_at
- **FR-009**: O sistema DEVE criar a tabela `emergency_contacts` com campos: id (UUID PK), caregiver_id, loved_one_id, name, phone, relationship, priority, is_active, created_at, updated_at
- **FR-010**: O sistema DEVE criar a tabela `caregiver_preferences` com campos para todas as preferências de notificações e display
- **FR-011**: O sistema DEVE criar a tabela `location_shares` com campos: id (UUID PK), caregiver_id, loved_one_id, share_token (UNIQUE), duration, expires_at, is_active, created_at, last_accessed_at

**Extensões e Tipos:**

- **FR-012**: O sistema DEVE ativar a extensão `uuid-ossp` para geração de UUIDs
- **FR-013**: O sistema DEVE ativar a extensão `postgis` para queries geoespaciais

**Indexes:**

- **FR-014**: O sistema DEVE criar indexes em todas as foreign keys para otimizar joins
- **FR-015**: O sistema DEVE criar indexes em campos de timestamp com ordenação descendente
- **FR-016**: O sistema DEVE criar indexes compostos em pares (loved_one_id, timestamp) para queries frequentes
- **FR-017**: O sistema DEVE criar indexes GiST geoespaciais em `gps_locations` e `safe_zones`
- **FR-018**: O sistema DEVE criar partial indexes em campos booleanos (ex: `is_read = false`)

**Row Level Security:**

- **FR-019**: O sistema DEVE ativar RLS em todas as 11 tabelas
- **FR-020**: O sistema DEVE criar políticas SELECT para cuidadores verem apenas seus próprios dados
- **FR-021**: O sistema DEVE criar políticas UPDATE para cuidadores editarem apenas seus próprios dados
- **FR-022**: O sistema DEVE criar políticas para cuidadores gerirem (ALL) os dados dos seus entes queridos
- **FR-023**: O sistema DEVE usar `auth.uid()` para identificar o utilizador autenticado nas políticas RLS

**Triggers e Funções:**

- **FR-024**: O sistema DEVE criar a função `handle_new_user()` que cria automaticamente um registo em `caregivers` quando um utilizador é criado em `auth.users`
- **FR-025**: O sistema DEVE criar a função `handle_new_caregiver()` que cria automaticamente preferências quando um cuidador é criado
- **FR-026**: O sistema DEVE criar a função `update_updated_at_column()` para atualizar timestamps automaticamente
- **FR-027**: O sistema DEVE criar a função `check_safe_zone_breach()` que deteta saídas de zonas seguras e cria alertas
- **FR-028**: O sistema DEVE criar triggers para executar estas funções nos eventos apropriados (AFTER INSERT, BEFORE UPDATE)

**Seed Data:**

- **FR-029**: O sistema DEVE inserir um cuidador de teste (Emerson Ferreira, emersonaidev@gmail.com)
- **FR-030**: O sistema DEVE inserir um ente querido de teste (Ester Ferreira, device KIMI-8472)
- **FR-031**: O sistema DEVE inserir 3 zonas seguras (Home, School, Park) com coordenadas realistas de Lisboa
- **FR-032**: O sistema DEVE inserir 3 contactos de emergência (Mother, Therapist, Emergency Services)
- **FR-033**: O sistema DEVE inserir aproximadamente 16-24 pontos de localização GPS das últimas 24 horas
- **FR-034**: O sistema DEVE inserir 24 registos de métricas de saúde (um por hora das últimas 24h)
- **FR-035**: O sistema DEVE inserir pelo menos 8 atividades dos últimos 7 dias com tipos variados
- **FR-036**: O sistema DEVE inserir uma mensagem de boas-vindas do AI no chat

### Entidades-Chave

- **Caregiver (Cuidador)**: Utilizador autenticado que monitoriza entes queridos. Possui perfil com informações pessoais, está vinculado 1:1 com `auth.users`, e pode ter múltiplos entes queridos (relação 1:N)
- **Loved One (Ente Querido)**: Indivíduo monitorizado que usa o dispositivo wearable KIMI. Possui informações pessoais, condição médica, e identificador único do dispositivo. Vinculado a um cuidador
- **GPS Location**: Registo de posição geográfica em timestamp específico. Contém latitude, longitude, precisão, velocidade, direção, altitude e nível de bateria. Vinculado a um ente querido
- **Health Metric**: Registo de dados biométricos em timestamp específico. Contém métricas cardiovasculares, stress, respiração, temperatura, atividade física e sono. Vinculado a um ente querido
- **Safe Zone (Zona Segura)**: Área geográfica circular definida por centro (lat/long) e raio. Possui nome, cor, configurações de notificação. Vinculada a um ente querido e ao cuidador que a criou
- **Activity (Atividade)**: Evento significativo detetado pelo sistema. Possui tipo, título, descrição, status/severidade, timestamp e opcionalmente localização. Vinculada a um ente querido
- **Alert (Alerta)**: Notificação gerada automaticamente para o cuidador. Possui tipo, severidade, mensagem, estado de leitura/reconhecimento. Vinculado a cuidador e ente querido
- **Chat Message**: Mensagem de conversação entre utilizador e AI assistant. Contém texto, remetente (user/ai), contexto AI opcional. Vinculada ao cuidador
- **Emergency Contact**: Contacto de emergência rápido. Possui nome, telefone, relação, prioridade. Vinculado ao cuidador e opcionalmente ao ente querido
- **Caregiver Preferences**: Preferências de notificações e display. Possui configurações booleanas para cada tipo de alerta, tema, idioma, zoom do mapa. Vinculadas 1:1 ao cuidador
- **Location Share**: Link temporário de partilha de localização. Possui token único, duração, expiração. Vinculado a cuidador e ente querido

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **SC-001**: Todas as 11 tabelas devem ser criadas com sucesso e serem consultáveis sem erros
- **SC-002**: Todos os 40+ indexes devem ser criados e aplicados automaticamente nas queries (verificável via EXPLAIN ANALYZE)
- **SC-003**: Todas as políticas RLS devem bloquear acesso não autorizado a 100% dos dados de outros utilizadores
- **SC-004**: Os triggers automáticos devem executar em menos de 100ms para operações individuais
- **SC-005**: A função de deteção de safe zone breach deve processar uma nova localização GPS em menos de 200ms
- **SC-006**: Todos os seed data devem ser inseridos com sucesso: 1 cuidador, 1 ente querido, 3 zonas seguras, 3 contactos, ~20 localizações GPS, 24 métricas de saúde, ~8 atividades, 1 mensagem de chat
- **SC-007**: Queries de localização atual (latest GPS point) devem executar em menos de 50ms mesmo com 10.000+ registos históricos
- **SC-008**: Queries de safe zone geoespaciais usando GiST index devem executar em menos de 100ms
- **SC-009**: O sistema deve suportar pelo menos 100 entes queridos por cuidador sem degradação de performance
- **SC-010**: A integridade referencial deve ser mantida: eliminação de um cuidador deve eliminar automaticamente todos os dados relacionados via CASCADE
- **SC-011**: Todos os CHECK constraints devem bloquear valores inválidos (ex: battery_level > 100, radius < 50m)
- **SC-012**: O schema deve estar em conformidade com GDPR através de isolamento completo de dados entre cuidadores via RLS

## Suposições

1. **Ambiente Supabase Cloud**: Assume-se que o projeto KIMI-DEV já existe no Supabase Cloud e está acessível
2. **Autenticação Prévia**: Assume-se que o Supabase Auth já está configurado e que será criado um utilizador de teste com email 'emersonaidev@gmail.com'
3. **Coordenadas de Lisboa**: Assume-se que as coordenadas usadas nos seed data (38.72xx, -9.14xx) representam localizações reais em Lisboa, Portugal
4. **Extensão PostGIS**: Assume-se que o Supabase Cloud suporta e permite ativação da extensão PostGIS
5. **Timezone UTC**: Assume-se que todos os timestamps são armazenados em UTC (TIMESTAMPTZ)
6. **Service Role para Devices**: Assume-se que o wearable device usará uma service role key separada para inserir dados de GPS e health metrics
7. **Seed Data é Temporário**: Assume-se que os seed data são para desenvolvimento/teste e serão substituídos por dados reais em produção
8. **Um Ente Querido Inicialmente**: Assume-se suporte para múltiplos entes queridos por cuidador no futuro, mas seed data inclui apenas um
9. **Bateria Linear**: Assume-se que a simulação de bateria nos seed data (dreno de ~2% por hora) é aceitável para testes
10. **Sem Migração de Dados**: Assume-se que esta é uma base de dados nova sem necessidade de migração de dados existentes

## Dependências

1. **Supabase Cloud Account**: Projeto KIMI-DEV ativo e acessível
2. **MCP Supabase Server**: MCP server do Supabase configurado e conectado
3. **Auth User**: Pelo menos um utilizador autenticado criado no Supabase Auth (emersonaidev@gmail.com) para os seed data funcionarem corretamente
4. **Database Specification**: Acesso ao ficheiro /docs/DATABASE_SPECIFICATION.md como referência autoritativa

## Restrições

1. **Tecnologia Fixa**: Deve usar Supabase Cloud exclusivamente, sem opção de outro provider
2. **PostGIS Requirement**: Obrigatório uso de PostGIS para queries geoespaciais, não podem ser usadas alternativas
3. **RLS Obrigatório**: Todas as tabelas devem ter RLS ativado sem exceções (requisito de segurança)
4. **Cascade Deletes**: Relações parent-child devem usar ON DELETE CASCADE para manter integridade
5. **Não-Modificável**: O esquema deve seguir exatamente a especificação em DATABASE_SPECIFICATION.md sem desvios
6. **Seed Data Específico**: Os seed data devem usar exatamente os nomes, emails e device_id especificados (Emerson, Ester, KIMI-8472)
