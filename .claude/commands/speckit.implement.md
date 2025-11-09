---
description: Executa o plano de implementação processando e executando todas as tarefas definidas em tasks.md.
---

## Entrada do Utilizador

```text
$ARGUMENTS
```

Deves **OBRIGATORIAMENTE** considerar o texto introduzido pelo utilizador antes de prosseguir (caso não esteja vazio).

## Esboço Geral

1. Executa `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` na raiz do repositório e faz parsing para obter `FEATURE_DIR` e a lista `AVAILABLE_DOCS`. Todos os caminhos devem ser absolutos.  
   Para aspas simples em argumentos como “I'm Groot”, usa `'\''` (ou aspas duplas se possível: `"I'm Groot"`).

2. **Verificar estado das checklists** (se `FEATURE_DIR/checklists/` existir):
   - Analisa todos os ficheiros de checklist no diretório.
   - Para cada checklist, conta:
     - Total de itens: linhas com `- [ ]`, `- [X]` ou `- [x]`
     - Itens completos: linhas com `- [X]` ou `- [x]`
     - Itens incompletos: linhas com `- [ ]`
   - Cria uma tabela de estado:

     ```text
     | Checklist  | Total  | Completos  | Incompletos  | Estado |
     |------------|--------|------------|--------------|--------|
     | ux.md      | 12     | 12         | 0            | ✓ PASS |
     | test.md    | 8      | 5          | 3            | ✗ FAIL |
     | security.md| 6      | 6          | 0            | ✓ PASS |
     ```

   - Calcula estado geral:
     - **PASS**: todas as checklists com 0 itens incompletos.
     - **FAIL**: pelo menos uma checklist com itens incompletos.

   - **Se alguma checklist estiver incompleta**:
     - Mostra a tabela com contagem dos itens pendentes.
     - **PARA** e pergunta: “Algumas checklists estão incompletas. Queres prosseguir com a implementação mesmo assim? (sim/não)”
     - Espera pela resposta do utilizador:
       - “não / esperar / parar” → interrompe execução.
       - “sim / prosseguir / continuar” → passa para o passo 3.
   - **Se todas estiverem completas**:
     - Mostra a tabela com status PASS e prossegue automaticamente.

3. **Carregar e analisar contexto de implementação**:
   - **OBRIGATÓRIO**: ler `tasks.md` (lista de tarefas e plano de execução).
   - **OBRIGATÓRIO**: ler `plan.md` (stack tecnológica, arquitetura, estrutura).
   - **SE EXISTIR**: `data-model.md` (entidades e relações).
   - **SE EXISTIR**: `contracts/` (especificações de API e requisitos de teste).
   - **SE EXISTIR**: `research.md` (decisões técnicas e restrições).
   - **SE EXISTIR**: `quickstart.md` (cenários de integração).

4. **Verificação da Configuração do Projeto**:
   - **OBRIGATÓRIO**: criar/verificar ficheiros de ignore conforme o setup do projeto.

   **Lógica de deteção e criação**:
   - Verifica se o repositório é git:
     ```sh
     git rev-parse --git-dir 2>/dev/null
     ```
   - Se existir Dockerfile → cria/verifica `.dockerignore`
   - Se existir `.eslintrc*` → cria/verifica `.eslintignore`
   - Se existir `.prettierrc*` → cria/verifica `.prettierignore`
   - Se existir `.npmrc` ou `package.json` → cria/verifica `.npmignore`
   - Se existirem ficheiros Terraform (*.tf) → cria/verifica `.terraformignore`
   - Se houver Helm charts → cria/verifica `.helmignore`

   **Se já existir ficheiro de ignore**: valida se contém padrões essenciais e adiciona os que faltarem.  
   **Se não existir**: cria um novo com todos os padrões críticos para a tecnologia detetada.

   **Padrões comuns por tecnologia** (a partir do plan.md):
   - **Node.js/TypeScript**: `node_modules/`, `dist/`, `build/`, `*.log`, `.env*`
   - **Python**: `__pycache__/`, `*.pyc`, `.venv/`, `dist/`, `*.egg-info/`
   - **Java**: `target/`, `*.class`, `*.jar`, `.gradle/`, `build/`
   - **C#/.NET**: `bin/`, `obj/`, `*.user`, `packages/`
   - **Go**: `*.exe`, `*.test`, `vendor/`
   - **Ruby**: `.bundle/`, `log/`, `tmp/`, `*.gem`
   - **PHP**: `vendor/`, `*.log`, `*.cache`
   - **Rust**: `target/`, `debug/`, `release/`
   - **Kotlin**: `build/`, `.gradle/`, `*.class`
   - **C++ / C**: `build/`, `bin/`, `obj/`, `*.o`, `*.so`, `.exe`
   - **Swift**: `.build/`, `DerivedData/`
   - **R**: `.Rproj.user/`, `.Rhistory`, `.RData`
   - **Universal**: `.DS_Store`, `Thumbs.db`, `*.tmp`, `.vscode/`, `.idea/`

   **Padrões por ferramenta**:
   - **Docker**: `node_modules/`, `.git/`, `*.log`, `.env*`
   - **ESLint**: `dist/`, `build/`, `coverage/`
   - **Prettier**: `node_modules/`, `dist/`, `build/`
   - **Terraform**: `.terraform/`, `*.tfstate*`, `*.tfvars`
   - **Kubernetes**: `*.secret.yaml`, `secrets/`, `.kube/`

5. **Analisar estrutura do tasks.md**:
   - **Fases de tarefas**: Setup, Testes, Core, Integração, Polish.
   - **Dependências**: execução sequencial vs paralela.
   - **Detalhes**: ID, descrição, caminhos, marcadores [P].
   - **Fluxo de execução**: ordem e requisitos de dependência.

6. **Executar implementação conforme plano de tarefas**:
   - Execução fase a fase — completa cada fase antes da próxima.
   - Respeita dependências: tarefas sequenciais em ordem, paralelas [P] podem correr simultaneamente.
   - Se houver TDD: executa tarefas de teste antes das de código.
   - Tarefas que afetam o mesmo ficheiro → executar de forma sequencial.
   - Valida conclusão de cada fase antes de continuar.

7. **Regras de execução**:
   - **Setup primeiro**: estrutura, dependências, config.
   - **Testes antes do código**: contratos, entidades, integração.
   - **Desenvolvimento principal**: modelos, serviços, endpoints, CLI.
   - **Integração**: bases de dados, middleware, logs, serviços externos.
   - **Polimento e validação**: testes unitários, otimização, documentação.

8. **Acompanhamento de progresso e erros**:
   - Reporta progresso após cada tarefa.
   - Interrompe execução se falhar tarefa não paralela.
   - Para tarefas [P], continua com as que passaram e reporta falhas.
   - Mensagens de erro devem incluir contexto para debugging.
   - Sugere próximos passos se não for possível continuar.
   - **IMPORTANTE**: marca tarefas concluídas com `[X]` no ficheiro `tasks.md`.

9. **Validação final**:
   - Verifica se todas as tarefas obrigatórias foram concluídas.
   - Confirma que a implementação corresponde à especificação original.
   - Garante que os testes passam e a cobertura cumpre requisitos.
   - Confirma alinhamento com o plano técnico.
   - Reporta estado final e resumo do trabalho concluído.

**Nota:** este comando assume que o `tasks.md` já contém a lista completa de tarefas. Se estiver incompleto, recomenda executar `/speckit.tasks` antes para o regenerar.
