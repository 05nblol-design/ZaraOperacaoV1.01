# 🔍 COMO IDENTIFICAR SUAS URLs REAIS DO VERCEL

## 📋 **Situação Atual:**

Você tem placeholders (URLs temporárias) nos arquivos de configuração:
- `https://seu-frontend.vercel.app`
- `https://seu-backend.vercel.app`

Precisamos substituir por suas URLs reais do Vercel.

---

## 🔎 **PASSO 1: Encontrar Suas URLs do Vercel**

### **Método 1: Dashboard do Vercel**
1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Faça login na sua conta
3. Procure por projetos com nomes como:
   - `zara-frontend` ou `zara-operacao-frontend`
   - `zara-backend` ou `zara-operacao-backend`
4. Clique em cada projeto para ver a URL

### **Método 2: Verificar Deploys Existentes**
Se você já fez deploy, as URLs serão algo como:
- Frontend: `https://zara-operacao-v1-01-frontend.vercel.app`
- Backend: `https://zara-operacao-v1-01-server.vercel.app`

### **Método 3: Criar Novos Projetos**
Se ainda não fez deploy:
1. Vá para [vercel.com/new](https://vercel.com/new)
2. Conecte seu repositório GitHub
3. Configure dois projetos separados:
   - **Frontend**: Aponte para a pasta `/frontend`
   - **Backend**: Aponte para a pasta `/server`

---

## ⚙️ **PASSO 2: Configurar as URLs nos Arquivos**

### **Exemplo de URLs Reais:**
Supondo que suas URLs sejam:
- Frontend: `https://zara-sistema-frontend.vercel.app`
- Backend: `https://zara-sistema-backend.vercel.app`

### **Arquivos para Atualizar:**

#### **1. `server/.env.production`**
```env
FRONTEND_URL=https://zara-sistema-frontend.vercel.app
SERVER_URL=https://zara-sistema-backend.vercel.app
CLIENT_URL=https://zara-sistema-frontend.vercel.app
CORS_ORIGIN=https://zara-sistema-frontend.vercel.app,https://www.zara-sistema-frontend.vercel.app
```

#### **2. `frontend/.env.production`**
```env
VITE_API_URL=https://zara-sistema-backend.vercel.app/api
VITE_SOCKET_URL=https://zara-sistema-backend.vercel.app
```

#### **3. `server/.env` (desenvolvimento)**
```env
FRONTEND_URL=https://zara-sistema-frontend.vercel.app
SERVER_URL=https://zara-sistema-backend.vercel.app
CLIENT_URL=https://zara-sistema-frontend.vercel.app
CORS_ORIGIN=http://localhost:3000,https://zara-sistema-frontend.vercel.app
```

---

## 🚀 **PASSO 3: Configurar Variáveis no Vercel Dashboard**

### **Para o Backend (Server):**
1. Vá para o projeto backend no Vercel
2. Settings → Environment Variables
3. Adicione:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://05:SUA_SENHA@cluster0.hvggzox.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DATABASE_URL=mongodb+srv://05:SUA_SENHA@cluster0.hvggzox.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=zara-production-jwt-secret-key-2024-ultra-secure
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://SUA-URL-FRONTEND.vercel.app
SERVER_URL=https://SUA-URL-BACKEND.vercel.app
CLIENT_URL=https://SUA-URL-FRONTEND.vercel.app
CORS_ORIGIN=https://SUA-URL-FRONTEND.vercel.app
```

### **Para o Frontend:**
1. Vá para o projeto frontend no Vercel
2. Settings → Environment Variables
3. Adicione:
```
VITE_API_URL=https://SUA-URL-BACKEND.vercel.app/api
VITE_SOCKET_URL=https://SUA-URL-BACKEND.vercel.app
```

---

## 🧪 **PASSO 4: Testar as URLs**

Após configurar, teste:

### **Backend Health Check:**
```
https://SUA-URL-BACKEND.vercel.app/api/health
```
Deve retornar: `{"status":"ok","timestamp":"..."}`

### **Frontend:**
```
https://SUA-URL-FRONTEND.vercel.app
```
Deve carregar a aplicação

---

## 📝 **TEMPLATE PARA SUAS URLs:**

**Preencha com suas URLs reais:**

```
✅ Frontend URL: https://_________________________.vercel.app
✅ Backend URL:  https://_________________________.vercel.app
```

**Depois substitua nos arquivos:**
- `server/.env.production`
- `frontend/.env.production`
- `server/.env`
- Variáveis do Vercel Dashboard

---

## 🆘 **Se Não Tem Deploy Ainda:**

1. **Crie conta no Vercel**: [vercel.com/signup](https://vercel.com/signup)
2. **Conecte GitHub**: Autorize acesso aos repositórios
3. **Deploy Frontend**:
   - New Project → Selecione repositório
   - Root Directory: `frontend`
   - Framework: Vite
   - Deploy
4. **Deploy Backend**:
   - New Project → Selecione repositório
   - Root Directory: `server`
   - Framework: Other
   - Deploy

---

## ✅ **Checklist Final:**

- [ ] URLs reais identificadas
- [ ] `server/.env.production` atualizado
- [ ] `frontend/.env.production` atualizado
- [ ] `server/.env` atualizado
- [ ] Variáveis configuradas no Vercel Dashboard
- [ ] Backend health check funcionando
- [ ] Frontend carregando
- [ ] Comunicação frontend ↔ backend funcionando

**🎉 Pronto! Seu sistema estará com as URLs corretas!**