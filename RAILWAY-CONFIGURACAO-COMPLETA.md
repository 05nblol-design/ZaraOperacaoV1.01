# 🚀 CONFIGURAÇÃO COMPLETA RAILWAY - Backend + Frontend

## 📋 OVERVIEW DO PROJETO

**Status Atual:**
- ✅ Backend configurado no Railway
- ✅ PostgreSQL configurado no Railway
- ⚠️ Frontend precisa ser configurado
- 🚨 DATABASE_URL precisa correção urgente

## 🔧 CONFIGURAÇÃO DO BACKEND (Railway)

### 1. Variáveis de Ambiente - Backend

```env
# Database
DATABASE_URL=postgresql://postgres:senha@host.railway.app:5432/railway

# Servidor
PORT=5000
NODE_ENV=production

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://seu-frontend.railway.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/tmp/uploads

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_app
```

### 2. Scripts do Backend (package.json)

```json
{
  "scripts": {
    "build": "npm install && npx prisma generate && npx prisma db push",
    "start": "node index.js",
    "railway:build": "npm install && npx prisma generate",
    "railway:start": "npx prisma db push && node index.js",
    "railway:deploy": "npx prisma db push && npm start"
  }
}
```

### 3. Arquivo railway.toml (Backend)

```toml
[build]
builder = "nixpacks"
watchPatterns = ["**/*.js", "**/*.json", "prisma/**/*"]
buildCommand = "npm install && npx prisma generate && npx prisma db push"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3

[env]
NODE_ENV = "production"
PORT = "5000"
```

## 🎨 CONFIGURAÇÃO DO FRONTEND (Railway)

### 1. Variáveis de Ambiente - Frontend

```env
# URLs de Conexão
VITE_API_URL=https://seu-backend.railway.app
VITE_SOCKET_URL=https://seu-backend.railway.app

# Configurações da Aplicação
VITE_APP_NAME=Sistema ZARA
VITE_APP_VERSION=1.0.1
VITE_NODE_ENV=production

# Configurações de Build
VITE_BUILD_SOURCEMAP=false
VITE_BUILD_MINIFY=true

# URLs Locais (desenvolvimento)
VITE_API_URL_LOCAL=http://localhost:5000/api
VITE_SOCKET_URL_LOCAL=http://localhost:3001
```

### 2. Scripts do Frontend (package.json)

```json
{
  "scripts": {
    "build": "vite build",
    "start": "npm run preview",
    "preview": "vite preview --host 0.0.0.0 --port $PORT",
    "railway:build": "npm install && npm run build",
    "railway:start": "npm run preview"
  }
}
```

### 3. Arquivo railway.toml (Frontend)

```toml
[build]
builder = "nixpacks"
watchPatterns = ["src/**/*", "public/**/*", "*.config.js"]
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm run preview"
healthcheckPath = "/"
healthcheckTimeout = 300
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3

[env]
NODE_ENV = "production"
PORT = "3000"
```

## 🚨 CORREÇÃO URGENTE NECESSÁRIA

### DATABASE_URL Inválida

**Problema Atual:**
```
DATABASE_URL=host:5432  ❌ INVÁLIDA
```

**Correção Necessária:**
1. Acesse Railway Dashboard
2. Vá para o serviço PostgreSQL
3. Aba "Connect" → Copie a Database URL
4. Vá para o serviço Backend
5. Aba "Variables" → Substitua DATABASE_URL
6. Deploy o backend

**URL Correta (exemplo):**
```
DATABASE_URL=postgresql://postgres:abc123@viaduct.proxy.rlwy.net:12345/railway
```

## 📝 PASSOS DE DEPLOY COMPLETO

### Passo 1: Corrigir Backend
```bash
# 1. Corrigir DATABASE_URL no Railway Dashboard
# 2. Verificar todas as variáveis de ambiente
# 3. Fazer redeploy do backend
```

### Passo 2: Configurar Frontend
```bash
# 1. Criar novo serviço no Railway
# 2. Conectar repositório (pasta frontend)
# 3. Configurar variáveis de ambiente
# 4. Fazer deploy
```

### Passo 3: Conectar Frontend ao Backend
```bash
# 1. Obter URL do backend Railway
# 2. Atualizar VITE_API_URL no frontend
# 3. Atualizar VITE_SOCKET_URL no frontend
# 4. Redeploy do frontend
```

### Passo 4: Configurar CORS no Backend
```bash
# 1. Obter URL do frontend Railway
# 2. Atualizar CORS_ORIGIN no backend
# 3. Redeploy do backend
```

## ✅ VERIFICAÇÃO FINAL

### Backend Funcionando:
- ✅ `https://seu-backend.railway.app/api/health`
- ✅ Resposta: `{"status": "ok", "database": "connected"}`

### Frontend Funcionando:
- ✅ `https://seu-frontend.railway.app`
- ✅ Login funcional
- ✅ Dados carregando do backend

### Logs Esperados:
```
✅ PostgreSQL conectado com sucesso
✅ Prisma Client inicializado
✅ Servidor rodando na porta 5000
✅ CORS configurado para frontend
```

## ⏱️ TEMPO ESTIMADO

- **Correção DATABASE_URL**: 2-3 minutos
- **Deploy Backend**: 3-5 minutos
- **Configuração Frontend**: 5-7 minutos
- **Deploy Frontend**: 3-5 minutos
- **Testes finais**: 2-3 minutos
- **Total**: 15-23 minutos

## 🎯 PRÓXIMOS PASSOS

1. **URGENTE**: Corrigir DATABASE_URL no Railway Dashboard
2. Configurar frontend no Railway
3. Conectar frontend ao backend
4. Testar aplicação completa
5. Monitorar logs e performance

---

**🚨 AÇÃO IMEDIATA**: Acesse https://railway.app e corrija a DATABASE_URL AGORA!