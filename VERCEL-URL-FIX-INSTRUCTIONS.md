# 🚀 INSTRUÇÕES PARA VERCEL DASHBOARD

## Problema Identificado
❌ **URL Incorreta**: https://server-b5u17ivjt-05nblol-designs-projects.vercel.app
✅ **URL Correta**: https://zara-backend-production-aab3.up.railway.app

## Passos para Corrigir no Vercel:

### 1. Acessar Vercel Dashboard
- URL: https://vercel.com/dashboard
- Projeto: sistema-zara-frontend

### 2. Configurar Environment Variables
Vá em Settings > Environment Variables e configure:

```
VITE_API_URL=https://zara-backend-production-aab3.up.railway.app/api
VITE_SOCKET_URL=https://zara-backend-production-aab3.up.railway.app
VITE_BACKEND_URL=https://zara-backend-production-aab3.up.railway.app
VITE_APP_NAME=Sistema ZARA
VITE_APP_VERSION=1.0.1
VITE_NODE_ENV=production
VITE_ENVIRONMENT=production
VITE_BUILD_SOURCEMAP=false
VITE_BUILD_MINIFY=true
VITE_SECURE_COOKIES=true
```

### 3. Forçar Redeploy
- Vá em Deployments
- Clique em "Redeploy" no último deployment
- Aguarde 2-3 minutos

### 4. Testar Aplicação
- Acesse: https://sistema-zara-frontend.vercel.app
- Teste login e conectividade

## URLs de Referência
- 🌐 Frontend: https://sistema-zara-frontend.vercel.app
- ⚡ Backend: https://zara-backend-production-aab3.up.railway.app
- 📊 Health Check: https://zara-backend-production-aab3.up.railway.app/api/health
