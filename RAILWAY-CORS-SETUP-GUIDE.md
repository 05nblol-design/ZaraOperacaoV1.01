# 🚂 Guia de Configuração CORS - Railway

## ❌ Problema Identificado
O backend Railway **NÃO** está configurado para aceitar requisições do frontend Vercel.

### Status Atual:
- ❌ CORS Headers: **NÃO CONFIGURADOS**
- ❌ Vercel Origin: **NÃO PERMITIDO**
- ❌ Preflight OPTIONS: **FALHANDO**

## ✅ Solução: Configurar CORS_ORIGINS

### Passo 1: Acessar Railway Dashboard
1. Acesse: https://railway.app/dashboard
2. Faça login na sua conta
3. Selecione o projeto: **zara-backend-production-aab3**

### Passo 2: Configurar Variável de Ambiente
1. Clique na aba **"Variables"** ou **"Environment"**
2. Procure por `CORS_ORIGINS` (se não existir, crie uma nova)
3. Configure o valor:

```
CORS_ORIGINS=https://sistema-zara-frontend.vercel.app
```

### Passo 3: Aguardar Redeploy
- O Railway fará redeploy automático (2-3 minutos)
- Aguarde até o status ficar "Deployed" ✅

### Passo 4: Testar Configuração
Execute o teste novamente:
```bash
node test-cors-vercel-railway.js
```

## 🔧 Configurações Alternativas

### Múltiplos Domínios (se necessário):
```
CORS_ORIGINS=https://sistema-zara-frontend.vercel.app,https://localhost:3000,https://outro-dominio.com
```

### Desenvolvimento + Produção:
```
CORS_ORIGINS=https://sistema-zara-frontend.vercel.app,http://localhost:3000,http://localhost:5173
```

## 📋 Checklist de Verificação

- [ ] Acessei Railway Dashboard
- [ ] Configurei CORS_ORIGINS com URL do Vercel
- [ ] Aguardei redeploy completar
- [ ] Testei com `node test-cors-vercel-railway.js`
- [ ] Headers CORS aparecem configurados
- [ ] Status 200 nos testes
- [ ] Testei aplicação completa

## 🚨 Troubleshooting

### Se ainda não funcionar:
1. **Verifique a URL exata do Vercel**
   - Deve ser: `https://sistema-zara-frontend.vercel.app`
   - Sem barra final `/`

2. **Verifique se o backend está rodando**
   ```bash
   node test-railway-backend.js
   ```

3. **Limpe cache do navegador**
   - Ctrl+Shift+R (Windows)
   - Cmd+Shift+R (Mac)

4. **Verifique logs do Railway**
   - Acesse Railway Dashboard
   - Vá em "Deployments" > "View Logs"

## 🔗 Links Importantes

- 🚂 **Railway Dashboard**: https://railway.app/dashboard
- 🌐 **Frontend Vercel**: https://sistema-zara-frontend.vercel.app
- ⚡ **Backend Railway**: https://zara-backend-production-aab3.up.railway.app
- 📊 **Health Check**: https://zara-backend-production-aab3.up.railway.app/api/health

## 📝 Notas Técnicas

- O arquivo `server/config/security.js` já está preparado para CORS
- A variável `CORS_ORIGINS` é lida automaticamente
- Não precisa alterar código, apenas configurar no Railway
- O redeploy é automático após mudança de variáveis

---

**⚠️ IMPORTANTE**: Após configurar, aguarde 2-3 minutos para o redeploy e teste novamente!