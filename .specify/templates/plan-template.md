# Plano de Implementação: [FEATURE]

**Branch**: `[###-feature-name]` | **Data**: [DATE] | **Spec**: [link]  
**Entrada**: Especificação da funcionalidade a partir de `/specs/[###-feature-name]/spec.md`

**Nota**: Este template é preenchido pelo comando `/speckit.plan`. Consulta `.specify/templates/commands/plan.md` para o fluxo de execução.

## Resumo

[Extrai da especificação da funcionalidade: requisito principal + abordagem técnica resultante da pesquisa]

## Contexto Técnico

<!--
  AÇÃO NECESSÁRIA: Substituir o conteúdo desta secção pelos detalhes técnicos
  do projeto. A estrutura apresentada é apenas orientadora para o processo de iteração.
-->

**Linguagem/Versão**: [ex.: Python 3.11, Swift 5.9, Rust 1.75 ou NEEDS CLARIFICATION]  
**Dependências Principais**: [ex.: FastAPI, UIKit, LLVM ou NEEDS CLARIFICATION]  
**Armazenamento**: [se aplicável, ex.: PostgreSQL, CoreData, ficheiros ou N/A]  
**Testes**: [ex.: pytest, XCTest, cargo test ou NEEDS CLARIFICATION]  
**Plataforma-Alvo**: [ex.: Linux server, iOS 15+, WASM ou NEEDS CLARIFICATION]  
**Tipo de Projeto**: [single/web/mobile – determina a estrutura do código-fonte]  
**Objetivos de Performance**: [domínio-específico, ex.: 1000 req/s, 10k linhas/s, 60 fps ou NEEDS CLARIFICATION]  
**Restrições**: [domínio-específico, ex.: <200ms p95, <100MB memória, offline-capable ou NEEDS CLARIFICATION]  
**Escala/Escopo**: [domínio-específico, ex.: 10k utilizadores, 1M LOC, 50 ecrãs ou NEEDS CLARIFICATION]

## Verificação da Constituição

*GATE: Deve ser validado antes da Fase 0 (pesquisa). Revalidar após o design da Fase 1.*

[Gates definidos com base no ficheiro da constituição]

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

<!--
  AÇÃO NECESSÁRIA: Substituir a árvore abaixo pela estrutura concreta
  desta funcionalidade. Remove opções não usadas e detalha a estrutura
  escolhida com caminhos reais (ex.: apps/admin, packages/api).
  O plano entregue não deve conter etiquetas de opção.
-->

```text
# [REMOVER SE NÃO USADO] Opção 1: Projeto único (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVER SE NÃO USADO] Opção 2: Aplicação Web (quando “frontend” + “backend” detetados)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVER SE NÃO USADO] Opção 3: Mobile + API (quando “iOS/Android” detetado)
api/
└── [igual ao backend acima]

ios/ ou android/
└── [estrutura específica da plataforma: módulos de feature, fluxos de UI, testes]
```

**Decisão de Estrutura**: [Documenta a estrutura selecionada e referencia os diretórios reais apresentados acima]

## Monitorização de Complexidade

> **Preencher apenas se o Constitution Check tiver violações que precisem de justificação**

| Violação | Motivo | Alternativa mais simples rejeitada porque |
|-----------|--------|-------------------------------------------|
| [ex.: 4º projeto] | [necessidade atual] | [por que 3 projetos não chegam] |
| [ex.: Padrão Repository] | [problema específico] | [por que acesso direto à DB é insuficiente] |
