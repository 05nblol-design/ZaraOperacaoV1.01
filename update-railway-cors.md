# Atualização CORS Railway - URGENTE

## Problema Identificado
O backend Railway está rejeitando requisições do frontend Vercel devido a configurações CORS desatualizadas.

## URLs Atualizadas
- **Frontend Vercel**: `https://zara-operacao-v1-01-frontend.vercel.app`
- **Backend Railway**: `https://zara-backend-production-aab3.up.railway.app`

## Variáveis de Ambiente para Atualizar no Railway

Acesse o dashboard do Railway e atualize estas variáveis:

```env
CLIENT_URL=https://zara-operacao-v1-01-frontend.vercel.app
CORS_ORIGIN=http://localhost:3000,https://zara-operacao-v1-01-frontend.vercel.app,http://localhost:5173,http://localhost:5174
FRONTEND_URL=https://zara-operacao-v1-01-frontend.vercel.app
SERVER_URL=https://zara-backend-production-aab3.up.railway.app
```

## Passos para Correção Manual

1. **Acesse Railway Dashboard**: https://railway.app/dashboard
2. **Selecione o projeto**: zara-backend-production
3. **Vá para Variables**: Clique na aba "Variables"
4. **Atualize as variáveis** listadas acima
5. **Redeploy**: O Railway fará redeploy automático

## Verificação
Após o redeploy, teste:
```bash
curl -H "Origin: https://zara-operacao-v1-01-frontend.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type,Authorization" \
     -X OPTIONS \
     https://zara-backend-production-aab3.up.railway.app/api/auth/login
```

## Status
- ✅ Frontend corrigido e deployado
- ⏳ Backend precisa de atualização CORS
- ❌ Conexão ainda falhando devido ao CORS