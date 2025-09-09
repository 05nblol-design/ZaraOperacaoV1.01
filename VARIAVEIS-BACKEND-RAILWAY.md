# 🔧 VARIÁVEIS DE AMBIENTE - BACKEND RAILWAY

## 📋 CONFIGURAÇÕES ATUAIS DO BACKEND

### 🌐 **APP_URL (URL do Backend)**
```
APP_URL=https://zaraoperacaov101-production.up.railway.app
```
**Descrição:** URL principal do backend hospedado no Railway

### 🏗️ **NODE_ENV (Ambiente)**
```
NODE_ENV=production
```
**Descrição:** Define o ambiente como produção

### 🚪 **PORT (Porta)**
```
PORT=5000
```
**Descrição:** Porta onde o servidor Express está rodando

## 🗂️ VARIÁVEIS COMPLETAS DO RAILWAY

### ✅ **OBRIGATÓRIAS (Já Configuradas)**
```bash
# Ambiente
NODE_ENV=production
PORT=5000

# Banco de Dados
DATABASE_URL=postgresql://postgres:GNquZiBhCMsFDZbvDTevPkrWFdRyyLQM@postgres.railway.internal:5432/railway

# JWT
JWT_SECRET=zara-production-jwt-secret-key-2024-ultra-secure
JWT_EXPIRES_IN=7d

# URLs
APP_URL=https://zaraoperacaov101-production.up.railway.app
FRONTEND_URL=https://zara-operacao-v1-01.vercel.app
SERVER_URL=https://zaraoperacaov101-production.up.railway.app
CLIENT_URL=https://zara-operacao-v1-01.vercel.app

# CORS
CORS_ORIGIN=https://zara-operacao-v1-01.vercel.app,https://www.zara-operacao-v1-01.vercel.app
```

### 📊 **OPCIONAIS (Para Funcionalidades Extras)**
```bash
# Redis (Cache)
REDIS_URL=redis://seu-redis-host:6379

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
EMAIL_FROM=noreply@zara-operacao.com

# Notificações
NOTIFICATIONS_ENABLED=true
EMAIL_NOTIFICATIONS=true
PUSH_NOTIFICATIONS=true

# Scheduler
SCHEDULER_ENABLED=true
DAILY_REPORT_TIME=18:00
```

## 🎯 **RESUMO RÁPIDO**

| Variável | Valor | Descrição |
|----------|-------|----------|
| **APP_URL** | `https://zaraoperacaov101-production.up.railway.app` | URL do backend |
| **NODE_ENV** | `production` | Ambiente de produção |
| **PORT** | `5000` | Porta do servidor |
| **DATABASE_URL** | `postgresql://postgres:...@postgres.railway.internal:5432/railway` | PostgreSQL Railway |
| **FRONTEND_URL** | `https://zara-operacao-v1-01.vercel.app` | URL do frontend |

## 🔗 **LINKS IMPORTANTES**

- **Railway Dashboard:** https://railway.app/dashboard
- **Backend URL:** https://zaraoperacaov101-production.up.railway.app
- **Health Check:** https://zaraoperacaov101-production.up.railway.app/health
- **Frontend URL:** https://zara-operacao-v1-01.vercel.app

## ⚙️ **COMO CONFIGURAR NO RAILWAY**

1. **Acesse:** https://railway.app/dashboard
2. **Clique no serviço BACKEND**
3. **Vá em "Variables"**
4. **Adicione/Verifique as variáveis acima**
5. **Salve e faça redeploy**

---
*Configurações atualizadas para Railway PostgreSQL*