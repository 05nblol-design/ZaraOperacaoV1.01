# 🚨 CORREÇÃO URGENTE - Erros Críticos Railway

## ❌ Problemas Identificados

### 1. PostgreSQL Connection Error
```
❌ Erro ao conectar PostgreSQL: Can't reach database server at `host:5432`
```
**Causa**: Variável `DATABASE_URL` não configurada no Railway

### 2. Nodemailer Error
```
❌ Erro ao configurar serviço de email: nodemailer.createTransporter is not a function
```
**Causa**: Método incorreto do nodemailer

### 3. Firebase Error
```
❌ Erro ao inicializar Firebase: Service account object must contain a string "project_id" property
```
**Causa**: Variáveis do Firebase não configuradas

## ✅ SOLUÇÕES URGENTES

### 1. Configurar PostgreSQL no Railway Dashboard

**PASSO 1**: Adicionar PostgreSQL Service
1. Acesse Railway Dashboard
2. Clique em "+ New" → "Database" → "PostgreSQL"
3. Aguarde a criação do banco

**PASSO 2**: Configurar DATABASE_URL
1. Vá em "Variables" do seu projeto
2. Adicione:
```
DATABASE_URL=postgresql://postgres:password@host:5432/railway
```
*Nota: Railway gerará automaticamente a URL correta*

### 2. Corrigir Nodemailer

**Arquivo**: `server/services/emailService.js`
**Problema**: `nodemailer.createTransporter` → **Correto**: `nodemailer.createTransport`

### 3. Configurar Firebase no Railway

**Variáveis necessárias**:
```
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@seu-projeto.iam.gserviceaccount.com
```

## 🔧 CONFIGURAÇÃO RAILWAY - VARIÁVEIS ESSENCIAIS

```bash
# Database
DATABASE_URL=postgresql://...

# App
NODE_ENV=production
PORT=3000
CORS_ORIGINS=https://seu-frontend.vercel.app

# JWT
JWT_SECRET=seu-jwt-secret-super-seguro
JWT_EXPIRES_IN=24h

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-app

# Firebase
FIREBASE_PROJECT_ID=seu-projeto-firebase
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@seu-projeto.iam.gserviceaccount.com

# Redis (opcional)
REDIS_URL=redis://...
```

## 🚀 PASSOS IMEDIATOS

### 1. Configurar PostgreSQL
```bash
# No Railway Dashboard:
1. + New → Database → PostgreSQL
2. Copiar DATABASE_URL gerada
3. Adicionar em Variables
```

### 2. Corrigir Código Nodemailer
```javascript
// ANTES (ERRO):
const transporter = nodemailer.createTransporter({

// DEPOIS (CORRETO):
const transporter = nodemailer.createTransport({
```

### 3. Configurar Firebase
```bash
# Obter credenciais do Firebase Console:
1. Project Settings → Service Accounts
2. Generate New Private Key
3. Extrair: project_id, private_key, client_email
4. Adicionar como variáveis no Railway
```

## ✅ VERIFICAÇÃO

### Testar Conexões:
```bash
# 1. PostgreSQL
curl https://seu-app.railway.app/api/health

# 2. Verificar logs
railway logs

# 3. Testar endpoints
curl https://seu-app.railway.app/api/users
```

## 📋 CHECKLIST URGENTE

- [ ] ✅ Adicionar PostgreSQL service no Railway
- [ ] ✅ Configurar DATABASE_URL
- [ ] ✅ Corrigir nodemailer.createTransporter → createTransport
- [ ] ✅ Configurar variáveis Firebase
- [ ] ✅ Testar health check
- [ ] ✅ Verificar logs de deploy
- [ ] ✅ Testar conexão com banco

## 🔥 PRIORIDADE MÁXIMA

1. **PostgreSQL**: Sem banco, app não funciona
2. **Nodemailer**: Correção simples no código
3. **Firebase**: Configurar credenciais

## 📞 PRÓXIMOS PASSOS

1. Configurar PostgreSQL no Railway Dashboard
2. Corrigir código do nodemailer
3. Adicionar variáveis Firebase
4. Fazer novo deploy
5. Testar funcionalidades

---

**Status**: 🚨 CRÍTICO - Requer ação imediata
**Tempo estimado**: 15-30 minutos
**Impacto**: App não funcional sem essas correções