# Configuração de Variáveis de Ambiente - Railway

## ❌ PROBLEMA IDENTIFICADO
**CORS Error**: Frontend usando URL diferente da configurada no backend

- **Frontend atual**: `https://sistema-zara-frontend.vercel.app`
- **Backend configurado**: `https://sistema-zara-frontend-2wr5skeq2-05nblol-designs-projects.vercel.app/login`

## ✅ SOLUÇÃO

### 1. Variáveis de Ambiente para Railway

Configure estas variáveis no Railway Dashboard:

```env
# Database
DATABASE_URL=postgresql://postgres:bBBAa*A-4EE*4EcbGEGCfCBdGgBGEGbE@viaduct.proxy.rlwy.net:18006/railway

# JWT
JWT_SECRET=zara-jwt-secret-key-2024
JWT_EXPIRES_IN=7d

# CORS - URLs ATUALIZADAS
CORS_ORIGIN=http://localhost:3000,https://sistema-zara-frontend.vercel.app,https://sistema-zara-frontend-2wr5skeq2-05nblol-designs-projects.vercel.app,http://localhost:5173,http://localhost:5174

# URLs
CLIENT_URL=https://sistema-zara-frontend.vercel.app
FRONTEND_URL=https://sistema-zara-frontend.vercel.app
SERVER_URL=https://zara-backend-production-aab3.up.railway.app

# Environment
NODE_ENV=production
PORT=5000

# Notifications
NOTIFICATIONS_ENABLED=true
EMAIL_NOTIFICATIONS=true
PUSH_NOTIFICATIONS=true

# Scheduler
SCHEDULER_ENABLED=true
DAILY_REPORT_TIME=18:00
TEFLON_CHECK_INTERVAL=6
```

### 2. Passos para Configurar no Railway

1. **Acesse**: https://railway.app/dashboard
2. **Selecione**: Projeto "zara-backend-production"
3. **Vá em**: Variables tab
4. **Adicione/Atualize**: Cada variável acima
5. **Salve**: As alterações
6. **Aguarde**: Redeploy automático (2-3 minutos)

### 3. Teste Rápido

Após o redeploy, teste:

```bash
curl -X POST https://zara-backend-production-aab3.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://sistema-zara-frontend.vercel.app" \
  -d '{"email":"test@test.com","password":"123456"}'
```

**Resultado esperado**: 
- ❌ Antes: `CORS blocked origin`
- ✅ Depois: `{"error":"Usuário não encontrado"}` (banco funcionando)

### 4. URLs Corretas

- **Frontend Principal**: https://sistema-zara-frontend.vercel.app
- **Frontend Alternativo**: https://sistema-zara-frontend-2wr5skeq2-05nblol-designs-projects.vercel.app
- **Backend**: https://zara-backend-production-aab3.up.railway.app

## ⏱️ Tempo Estimado
- **Configuração**: 2-3 minutos
- **Redeploy**: 2-3 minutos
- **Total**: 5-6 minutos

## 🔍 Validação

Após correção, o erro deve mudar de:
- `CORS blocked origin` → `Usuário não encontrado` (sistema funcionando)