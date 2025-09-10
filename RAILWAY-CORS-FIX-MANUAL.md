# 🚨 CORREÇÃO URGENTE - CORS Railway

## Problema Identificado
O backend Railway está retornando erro 500 quando acessado pelo frontend Vercel devido a configuração incorreta de CORS.

## ✅ SOLUÇÃO IMEDIATA

### 1. Acesse o Railway Dashboard
- Vá para: https://railway.app/dashboard
- Faça login na sua conta
- Selecione o projeto **Zara Backend**

### 2. Configure as Variáveis de Ambiente
Clique em **Variables** e adicione/atualize:

```bash
# URLs do Frontend Vercel (ATUAL)
FRONTEND_URL=https://sistema-zara-frontend-kg85kov5j-05nblol-designs-projects.vercel.app
CLIENT_URL=https://sistema-zara-frontend-kg85kov5j-05nblol-designs-projects.vercel.app

# CORS - CRÍTICO para resolver o erro
CORS_ORIGIN=https://sistema-zara-frontend-kg85kov5j-05nblol-designs-projects.vercel.app
CORS_ORIGINS=https://sistema-zara-frontend-kg85kov5j-05nblol-designs-projects.vercel.app,https://www.sistema-zara-frontend-kg85kov5j-05nblol-designs-projects.vercel.app

# Ambiente
NODE_ENV=production
```

### 3. Forçar Deploy
- Após salvar as variáveis, clique em **Deploy**
- Aguarde 2-3 minutos para o deploy ser concluído

### 4. Verificar Logs
- Vá em **Deployments** > **View Logs**
- Procure por mensagens de CORS ou erros de startup

## 🔍 TESTE APÓS CORREÇÃO

### Teste 1: Health Check
```bash
curl https://zara-backend-production-aab3.up.railway.app/api/health
```
**Esperado:** Status 200 com JSON de saúde

### Teste 2: Login com CORS
```bash
curl -X POST https://zara-backend-production-aab3.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://sistema-zara-frontend-kg85kov5j-05nblol-designs-projects.vercel.app" \
  -d '{"email":"admin@zara.com","password":"admin123"}'
```
**Esperado:** Status 200 com token JWT e headers CORS

### Teste 3: Frontend
- Acesse: https://sistema-zara-frontend-kg85kov5j-05nblol-designs-projects.vercel.app
- Tente fazer login com: admin@zara.com / admin123
- Verifique Network tab para confirmar requisições 200

## 🚨 SE O PROBLEMA PERSISTIR

### Opção A: Wildcard Temporário
Adicione no Railway:
```bash
CORS_ORIGINS=*
```
⚠️ **ATENÇÃO:** Use apenas temporariamente para teste

### Opção B: Debug Logs
Adicione no Railway:
```bash
DEBUG=cors,express:*
LOG_LEVEL=debug
```

### Opção C: Verificar Código CORS
O arquivo `server/config/security.js` deve ter:
```javascript
origin: function (origin, callback) {
  const allowedOrigins = process.env.CORS_ORIGINS.split(',');
  if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
    callback(null, true);
  } else {
    callback(new Error('CORS blocked'));
  }
}
```

## 📋 CHECKLIST DE VERIFICAÇÃO

- [ ] Variáveis CORS_ORIGIN e CORS_ORIGINS configuradas no Railway
- [ ] Deploy do Railway concluído (sem erros nos logs)
- [ ] Health check retorna 200
- [ ] Login API retorna 200 com headers CORS
- [ ] Frontend consegue fazer login
- [ ] Network tab mostra requisições 200 (não 500)

## 🔗 Links Importantes

- **Railway Dashboard:** https://railway.app/dashboard
- **Frontend Vercel:** https://sistema-zara-frontend-kg85kov5j-05nblol-designs-projects.vercel.app
- **Backend Railway:** https://zara-backend-production-aab3.up.railway.app
- **Build Logs:** https://railway.com/project/f1d2dcde-6119-4cd6-96b7-098e04b6b336/service/6d6385b3-ae68-48e7-ac57-4d6e74fba0db

---

**⏰ Tempo estimado para correção:** 5-10 minutos
**🎯 Prioridade:** CRÍTICA - Sistema não funciona sem CORS correto