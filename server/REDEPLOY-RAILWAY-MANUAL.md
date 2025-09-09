# 🚀 REDEPLOY MANUAL RAILWAY - GUIA URGENTE

## 📊 STATUS ATUAL
✅ **Banco PostgreSQL**: Funcionando (2 usuários criados)  
✅ **DATABASE_URL**: Configurada e testada  
✅ **Usuários Demo**: admin@zara.com e demo@zara.com criados  
❌ **Aplicação Railway**: Retorna 404 "Application not found"  

## 🎯 PROBLEMA IDENTIFICADO
A aplicação Railway precisa de **REDEPLOY MANUAL** para aplicar as configurações.

## 📝 PASSO A PASSO PARA REDEPLOY

### 1️⃣ Acessar Railway Dashboard
```
🔗 URL: https://railway.app/dashboard
👤 Fazer login na sua conta Railway
```

### 2️⃣ Localizar o Projeto
```
📁 Procurar: "ZaraOperacaoV1.01" ou similar
🖱️ Clicar no projeto para abrir
```

### 3️⃣ Verificar Variáveis de Ambiente
```
⚙️ Ir na aba "Variables" ou "Environment"
✅ Verificar se estas variáveis estão configuradas:

   DATABASE_URL: postgresql://postgres:GNquZiBhCMsFDZbvDTevPkrWFdRyyLQM@interchange.proxy.rlwy.net:17733/railway
   CORS_ORIGIN: https://zara-operacao-v1-01.vercel.app,https://zara-operacao-v1-01-git-main-lojaas-projects.vercel.app
   NODE_ENV: production
   PORT: 3000
```

### 4️⃣ Fazer Redeploy Manual
```
🚀 Ir na aba "Deployments"
🔄 Clicar no botão "Deploy" ou "Redeploy"
⏱️ Aguardar o build completar (2-3 minutos)
```

### 5️⃣ Verificar Logs
```
📋 Na aba "Deployments", clicar no deployment ativo
👀 Verificar se não há erros nos logs
✅ Procurar por mensagens como "Server running on port 3000"
```

## 🧪 TESTE APÓS REDEPLOY

### Testar Backend
```bash
# Executar este comando após redeploy:
node check-railway-deployment.js
```

### URLs para Testar Manualmente
```
🌐 Root: https://zaraoperacaov101-production.up.railway.app
❤️ Health: https://zaraoperacaov101-production.up.railway.app/health
🔐 Login: https://zaraoperacaov101-production.up.railway.app/api/auth/login
```

## 👥 CREDENCIAIS DE TESTE

### Administrador
```
📧 Email: admin@zara.com
🔑 Senha: admin123
👤 Role: ADMIN
```

### Operador
```
📧 Email: demo@zara.com
🔑 Senha: demo123
👤 Role: OPERATOR
```

## 🎯 RESULTADO ESPERADO

Após o redeploy bem-sucedido:
- ✅ Backend Railway responderá com status 200
- ✅ Frontend conseguirá fazer login
- ✅ Sistema completo funcionando

## ⚠️ SE AINDA NÃO FUNCIONAR

1. **Verificar logs de erro no Railway**
2. **Confirmar se DATABASE_URL foi salva**
3. **Tentar criar novo deployment**
4. **Verificar se o Dockerfile está correto**

## ⏱️ TEMPO ESTIMADO
**2-3 minutos** para completar o redeploy

---

🚨 **AÇÃO URGENTE NECESSÁRIA**: Acessar Railway Dashboard e fazer redeploy manual!