# Especificação da Funcionalidade: [FEATURE NAME]

**Branch da Funcionalidade**: `[###-feature-name]`  
**Criado em**: [DATE]  
**Estado**: Draft  
**Entrada**: Descrição do utilizador: "$ARGUMENTS"

## Cenários de Utilizador e Testes *(obrigatório)*

<!--
  IMPORTANTE: As user stories devem ser PRIORIZADAS por ordem de importância.
  Cada história deve ser INDEPENDENTEMENTE TESTÁVEL — ou seja, se implementares apenas UMA delas,
  ainda deves ter um MVP (Produto Mínimo Viável) funcional que entregue valor.

  Atribui prioridades (P1, P2, P3, etc.), onde P1 é a mais crítica.
  Pensa em cada história como uma fatia funcional que pode ser:
  - Desenvolvida de forma independente
  - Testada de forma independente
  - Lançada de forma independente
  - Demonstrada ao utilizador de forma independente
-->

### User Story 1 - [Título Breve] (Prioridade: P1)

[Descreve esta jornada de utilizador em linguagem simples]

**Motivo da prioridade**: [Explica o valor e o motivo deste nível de prioridade]

**Teste Independente**: [Descreve como pode ser testada de forma independente — ex.: “Pode ser testada com [ação específica] e entrega [valor específico]”]

**Cenários de Aceitação**:

1. **Dado** [estado inicial], **Quando** [ação], **Então** [resultado esperado]
2. **Dado** [estado inicial], **Quando** [ação], **Então** [resultado esperado]

---

### User Story 2 - [Título Breve] (Prioridade: P2)

[Descreve esta jornada de utilizador em linguagem simples]

**Motivo da prioridade**: [Explica o valor e o motivo deste nível de prioridade]

**Teste Independente**: [Descreve como pode ser testada de forma independente]

**Cenários de Aceitação**:

1. **Dado** [estado inicial], **Quando** [ação], **Então** [resultado esperado]

---

### User Story 3 - [Título Breve] (Prioridade: P3)

[Descreve esta jornada de utilizador em linguagem simples]

**Motivo da prioridade**: [Explica o valor e o motivo deste nível de prioridade]

**Teste Independente**: [Descreve como pode ser testada de forma independente]

**Cenários de Aceitação**:

1. **Dado** [estado inicial], **Quando** [ação], **Então** [resultado esperado]

---

[Adiciona mais user stories conforme necessário, cada uma com prioridade atribuída]

### Casos Limite

<!--
  AÇÃO NECESSÁRIA: O conteúdo desta secção representa placeholders.
  Preenche com os casos limite adequados.
-->

- O que acontece quando [condição de fronteira]?
- Como o sistema lida com [cenário de erro]?

## Requisitos *(obrigatório)*

<!--
  AÇÃO NECESSÁRIA: O conteúdo desta secção representa placeholders.
  Preenche com os requisitos funcionais adequados.
-->

### Requisitos Funcionais

- **FR-001**: O sistema DEVE [capacidade específica, ex.: “permitir criar contas de utilizador”]
- **FR-002**: O sistema DEVE [capacidade específica, ex.: “validar endereços de e-mail”]
- **FR-003**: O utilizador DEVE poder [interação principal, ex.: “repor a sua password”]
- **FR-004**: O sistema DEVE [requisito de dados, ex.: “guardar preferências do utilizador”]
- **FR-005**: O sistema DEVE [comportamento, ex.: “registar todos os eventos de segurança”]

*Exemplo de requisitos pouco claros:*

- **FR-006**: O sistema DEVE autenticar utilizadores via [NEEDS CLARIFICATION: método de autenticação não especificado — email/password, SSO, OAuth?]
- **FR-007**: O sistema DEVE reter dados do utilizador por [NEEDS CLARIFICATION: período de retenção não especificado]

### Entidades-Chave *(incluir se a funcionalidade envolver dados)*

- **[Entidade 1]**: [O que representa, principais atributos sem implementação]
- **[Entidade 2]**: [O que representa, relações com outras entidades]

## Critérios de Sucesso *(obrigatório)*

<!--
  AÇÃO NECESSÁRIA: Define critérios de sucesso mensuráveis.
  Devem ser independentes da tecnologia e objetivos.
-->

### Resultados Mensuráveis

- **SC-001**: [Métrica mensurável, ex.: “Os utilizadores completam o registo em menos de 2 minutos”]
- **SC-002**: [Métrica mensurável, ex.: “O sistema suporta 1000 utilizadores concorrentes sem degradação”]
- **SC-003**: [Métrica de satisfação, ex.: “90% dos utilizadores concluem a tarefa principal à primeira tentativa”]
- **SC-004**: [Métrica de negócio, ex.: “Reduzir em 50% os tickets de suporte relacionados com [X]”]
