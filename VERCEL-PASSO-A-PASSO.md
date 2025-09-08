# 🚀 Deploy no Vercel - Guia Passo a Passo

## 📋 Pré-requisitos

- Conta no GitHub
- Conta no Vercel (gratuita)
- Repositório do projeto no GitHub
- Node.js 18+ instalado localmente

## 🎯 Estratégia de Deploy

Vamos fazer deploy de:
- **Frontend**: Vercel (Static Site)
- **Backend**: Vercel (Serverless Functions)

---

## 📱 PARTE 1: Deploy do Frontend

### Passo 1: Preparar o Frontend

1. **Navegue para a pasta do frontend:**
```bash
cd frontend
```

2. **Verifique se o build funciona localmente:**
```bash
npm run build
```

3. **Teste o build localmente:**
```bash
npm run preview
```

### Passo 2: Configurar Variáveis de Ambiente

1. **Edite o arquivo `.env.production`:**
```env
VITE_API_URL=https://seu-backend-vercel.vercel.app/api
VITE_SOCKET_URL=https://seu-backend-vercel.vercel.app
VITE_APP_NAME=Sistema ZARA
VITE_APP_VERSION=1.0.1
```

### Passo 3: Deploy no Vercel

1. **Acesse [vercel.com](https://vercel.com)**

2. **Faça login com sua conta GitHub**

3. **Clique em "New Project"**

4. **Selecione seu repositório do GitHub**

5. **Configure o projeto:**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

6. **Adicione as variáveis de ambiente:**
   - Vá em "Environment Variables"
   - Adicione cada variável do `.env.production`:
     - `VITE_API_URL`
     - `VITE_SOCKET_URL`
     - `VITE_APP_NAME`
     - `VITE_APP_VERSION`

7. **Clique em "Deploy"**

### Passo 4: Verificar Deploy do Frontend

1. **Aguarde o build completar**
2. **Acesse a URL fornecida pelo Vercel**
3. **Teste se a aplicação carrega**

---

## 🖥️ PARTE 2: Deploy do Backend

### Passo 1: Preparar o Backend

1. **Navegue para a pasta do servidor:**
```bash
cd server
```

2. **Verifique o arquivo `vercel.json`:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "index.js": {
      "maxDuration": 30
    }
  }
}
```

### Passo 2: Configurar Banco de Dados

1. **Crie um banco PostgreSQL gratuito:**
   - **Opção 1**: [Neon](https://neon.tech) (Recomendado)
   - **Opção 2**: [Supabase](https://supabase.com)
   - **Opção 3**: [PlanetScale](https://planetscale.com)

2. **Obtenha a URL de conexão:**
```
postgresql://usuario:senha@host:porta/database?sslmode=require
```

### Passo 3: Deploy do Backend no Vercel

1. **Acesse [vercel.com](https://vercel.com)**

2. **Clique em "New Project"**

3. **Selecione o mesmo repositório**

4. **Configure o projeto:**
   - **Framework Preset**: Other
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npx prisma generate`
   - **Output Directory**: (deixe vazio)
   - **Install Command**: `npm install`

5. **Adicione as variáveis de ambiente:**
```env
# Banco de Dados MongoDB Atlas
MONGODB_URI=mongodb+srv://05:<db_password>@cluster0.hvggzox.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DATABASE_URL=mongodb+srv://05:<db_password>@cluster0.hvggzox.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# IMPORTANTE: Substitua <db_password> pela senha real do seu MongoDB Atlas

# JWT
JWT_SECRET=zara-production-jwt-secret-key-2024-ultra-secure
JWT_EXPIRES_IN=7d

# URLs (substitua pelas URLs reais após o deploy)
FRONTEND_URL=https://seu-frontend.vercel.app
CLIENT_URL=https://seu-frontend.vercel.app
CORS_ORIGIN=https://seu-frontend.vercel.app

# Configurações
NODE_ENV=production
```

**⚠️ ATENÇÃO IMPORTANTE:**
- Substitua `<db_password>` pela senha real do seu MongoDB Atlas
- A string de conexão fornecida já está configurada para o Cluster0
- Certifique-se de que o usuário "05" tem as permissões necessárias no MongoDB

6. **Clique em "Deploy"**

### Passo 4: Configurar Banco de Dados

1. **Após o deploy, acesse o terminal do Vercel:**
   - Vá no projeto do backend
   - Clique em "Functions"
   - Clique em "View Function Logs"

2. **Execute as migrações:**
```bash
npx prisma db push
```

3. **Execute o seed (opcional):**
```bash
npx prisma db seed
```

---

## 🔗 PARTE 3: Conectar Frontend e Backend

### Passo 1: Atualizar URLs do Frontend

1. **Copie a URL do backend do Vercel**
2. **Vá no projeto do frontend no Vercel**
3. **Acesse "Settings" > "Environment Variables"**
4. **Atualize as variáveis:**
```env
VITE_API_URL=https://seu-backend.vercel.app/api
VITE_SOCKET_URL=https://seu-backend.vercel.app
```

### Passo 2: Atualizar CORS do Backend

1. **Vá no projeto do backend no Vercel**
2. **Acesse "Settings" > "Environment Variables"**
3. **Atualize a variável:**
```env
CORS_ORIGIN=https://seu-frontend.vercel.app
```

### Passo 3: Fazer Redeploy

1. **Frontend**: Vá em "Deployments" > "Redeploy"
2. **Backend**: Vá em "Deployments" > "Redeploy"

---

## ✅ PARTE 4: Verificação Final

### Checklist de Testes:

- [ ] **Frontend carrega**: Acesse a URL do frontend
- [ ] **API responde**: Teste `https://seu-backend.vercel.app/api/health`
- [ ] **Login funciona**: Teste o sistema de autenticação
- [ ] **Dashboard carrega**: Verifique se os dados aparecem
- [ ] **WebSocket conecta**: Teste notificações em tempo real
- [ ] **Responsivo**: Teste em dispositivos móveis

### URLs Importantes:

- **Frontend**: `https://seu-frontend.vercel.app`
- **Backend**: `https://seu-backend.vercel.app`
- **API Health**: `https://seu-backend.vercel.app/api/health`
- **Prisma Studio**: Execute localmente com `npx prisma studio`

---

## 🔧 PARTE 5: Configurações Avançadas

### Domínio Personalizado (Opcional)

1. **No projeto do frontend:**
   - Vá em "Settings" > "Domains"
   - Adicione seu domínio personalizado
   - Configure os DNS conforme instruções

2. **No projeto do backend:**
   - Adicione subdomínio (ex: `api.seudominio.com`)
   - Atualize as variáveis de ambiente

### Monitoramento

1. **Analytics**: Habilitado automaticamente no Vercel
2. **Logs**: Acesse em "Functions" > "View Function Logs"
3. **Performance**: Monitore em "Analytics"

### Backup do Banco

1. **Configure backups automáticos** na plataforma do banco
2. **Exporte dados regularmente**:
```bash
npx prisma db pull
npx prisma generate
```

---

## 🆘 Troubleshooting

### Problemas Comuns:

**1. Build falha no frontend:**
```bash
# Limpe o cache e reinstale
rm -rf node_modules package-lock.json
npm install
npm run build
```

**2. API não responde:**
- Verifique as variáveis de ambiente
- Confirme se o banco está acessível
- Verifique os logs do Vercel

**3. CORS Error:**
- Confirme CORS_ORIGIN no backend
- Verifique VITE_API_URL no frontend

**4. WebSocket não conecta:**
- Vercel tem limitações com WebSocket
- Considere usar Polling como fallback

**5. Banco de dados não conecta:**
- Verifique DATABASE_URL
- Confirme se SSL está habilitado
- Execute `npx prisma db push`

### Comandos Úteis:

```bash
# Verificar build local
npm run build
npm run preview

# Testar API local
npm run dev
curl http://localhost:5000/api/health

# Verificar banco
npx prisma studio
npx prisma db push

# Logs do Vercel
vercel logs
```

---

## 📞 Suporte

- **Documentação Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Prisma Docs**: [prisma.io/docs](https://prisma.io/docs)
- **Logs do projeto**: Acesse via dashboard do Vercel

---

**✅ Pronto! Seu Sistema ZARA está online no Vercel!**

*Última atualização: Janeiro 2025*