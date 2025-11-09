# 🔧 Correção da Integração Supabase

## Problemas Encontrados:

### 1. ❌ Chave do Supabase Incorreta
A chave no `.env.local` está em formato incorreto:
```
VITE_SUPABASE_ANON_KEY=sb_publishable_ARU-eMWlBhdWNKD2XTUfuA_6_hLRphz
```

**Formato correto:** Deve começar com `eyJ` (JWT token)

### 2. ❌ Toast não está sendo renderizado no Auth.tsx
O componente Auth usa `useToast()` mas não renderiza o `ToastComponent`

---

## 🔑 Como Obter as Chaves Corretas do Supabase:

1. Acesse: https://supabase.com/dashboard/project/jkzwrqmbpxptncpdmbew
2. Vá em **Settings** → **API**
3. Copie:
   - **Project URL** (deve ser: `https://jkzwrqmbpxptncpdmbew.supabase.co`)
   - **anon/public key** (deve começar com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

**IMPORTANTE:** NÃO use a chave que começa com `sb_publishable_` - essa não é a chave correta!

---

## ✅ Passos para Corrigir:

### Passo 1: Atualizar .env.local

Substitua o conteúdo do arquivo `.env.local` com as chaves corretas:

```bash
# KIMI Caregiver Monitoring App - Environment Variables
# Feature: 002-caregiver-monitoring-app

# Supabase Configuration
VITE_SUPABASE_URL=https://jkzwrqmbpxptncpdmbew.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.SEU_TOKEN_AQUI
```

### Passo 2: Reiniciar o servidor de desenvolvimento

```bash
# Parar o servidor (Ctrl+C)
# Depois:
npm run dev
```

### Passo 3: Verificar no Console do Browser

Abra o console (F12) e procure por mensagens de erro do Supabase.

---

## 🧪 Testar Autenticação:

### Teste 1: Criar Conta
1. Abra http://localhost:3000
2. Clique em "Sign Up"
3. Preencha:
   - Email: `test@example.com`
   - Password: `Test123!@#`
   - Full Name: `Test User`
4. Clique "Create Account"
5. **Esperado:** Mensagem de sucesso + email de confirmação

### Teste 2: Login
1. Vá em "Sign In"
2. Use as credenciais criadas
3. **Esperado:** Redirecionamento para `/dashboard`

---

## 📋 Checklist de Verificação:

- [ ] Chave anon começa com `eyJ`
- [ ] URL do Supabase está correta
- [ ] Servidor reiniciado após mudar .env
- [ ] Email confirmado (verifique inbox/spam)
- [ ] Console do browser sem erros de Supabase

---

## 🔍 Comandos de Diagnóstico:

### Verificar se as variáveis estão carregadas:
Abra o console do browser e execute:
```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

### Verificar conexão Supabase:
```javascript
const { data, error } = await supabase.auth.getSession();
console.log('Session:', data);
console.log('Error:', error);
```

---

## 🚨 Erros Comuns:

### "Invalid API key"
- Chave está incorreta ou no formato errado
- Use a chave **anon/public** do dashboard

### "Network error" ou "Failed to fetch"
- URL incorreta
- Firewall bloqueando Supabase
- Supabase project pausado/deletado

### "Email not confirmed"
- Verifique email (inbox + spam)
- Ou desative email confirmation no Supabase:
  - Dashboard → Authentication → Providers → Email
  - Desmarque "Confirm email"

---

## 📧 Configuração de Email (Opcional)

Se quiser desativar confirmação de email para testes:

1. Supabase Dashboard → Authentication → Providers
2. Clique em "Email"
3. Desmarque "Confirm email"
4. Save

Agora pode fazer login imediatamente após signup.

---

## 🎯 Próximos Passos Após Corrigir:

1. Criar conta de teste
2. Fazer login
3. Adicionar dados de teste (ver README principal)
4. Testar Dashboard, Mapa, Alertas

Se ainda tiver problemas, verifique:
- Console do browser (F12 → Console)
- Network tab (F12 → Network)
- Supabase logs (Dashboard → Logs)
