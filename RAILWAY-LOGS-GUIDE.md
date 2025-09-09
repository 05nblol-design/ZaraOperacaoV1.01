# 🔍 GUIA: Como Verificar Logs no Railway

## 🚀 Acesso Rápido ao Railway Dashboard

### 1. Acesse o Railway
```
https://railway.app/dashboard
```

### 2. Localize seu Projeto
- Procure pelo projeto "ZaraOperacaoV1.01" ou similar
- Clique no projeto para abrir

## 📊 Verificando Logs dos Serviços

### 🔧 Logs do Backend (Servidor)

1. **Clique no serviço do Backend**
   - Geralmente aparece como "server" ou nome do seu backend
   - Ícone pode ser Node.js ou similar

2. **Acesse os Logs**
   - Clique na aba "Deployments"
   - Clique no deployment mais recente (topo da lista)
   - Os logs aparecerão automaticamente

3. **Tipos de Logs para Verificar**
   ```
   ✅ LOGS DE SUCESSO:
   - "Server running on port 3000"
   - "Database connected successfully"
   - "Prisma Client initialized"
   - "✓ Ready in XXXms"
   
   ❌ LOGS DE ERRO:
   - "PrismaClientInitializationError"
   - "invalid port number"
   - "Can't reach database server"
   - "ECONNREFUSED"
   - "Error: connect ETIMEDOUT"
   ```

### 🗄️ Logs do PostgreSQL

1. **Clique no serviço PostgreSQL**
   - Aparece como "Postgres" ou "PostgreSQL"
   - Ícone de banco de dados

2. **Verificar Status**
   - Status deve estar "Running" (verde)
   - Se "Crashed" (vermelho), clique "Restart"

3. **Logs do PostgreSQL**
   ```
   ✅ LOGS NORMAIS:
   - "database system is ready to accept connections"
   - "listening on IPv4 address"
   
   ❌ LOGS DE PROBLEMA:
   - "could not bind IPv4 address"
   - "database system is shut down"
   ```

## 🔍 Verificações Específicas

### 1. Verificar DATABASE_URL

**No serviço Backend:**
1. Clique em "Variables"
2. Procure por `DATABASE_URL`
3. **Deve conter:**
   ```
   postgresql://postgres:GNquZiBhCMsFDZbvDTevPkrWFdRyyLQM@postgres.railway.internal:5432/railway
   ```

### 2. Verificar Conectividade

**Nos logs do backend, procure por:**
```
✅ CONEXÃO OK:
"Prisma Client initialized"
"Database connection established"

❌ CONEXÃO FALHOU:
"PrismaClientInitializationError"
"Can't reach database server at postgres.railway.internal:5432"
```

### 3. Verificar Porta da Aplicação

**Nos logs do backend:**
```
✅ PORTA CORRETA:
"Server running on port 3000"
"Listening on port $PORT"

❌ PROBLEMA DE PORTA:
"Error: listen EADDRINUSE"
"Port 3000 is already in use"
```

## 🛠️ Ações Baseadas nos Logs

### Se DATABASE_URL Estiver Incorreta:
1. **Vá em Variables no backend**
2. **Edite DATABASE_URL**
3. **Cole a URL correta:**
   ```
   postgresql://postgres:GNquZiBhCMsFDZbvDTevPkrWFdRyyLQM@postgres.railway.internal:5432/railway
   ```
4. **Clique "Deploy"**

### Se PostgreSQL Estiver Parado:
1. **Clique no serviço PostgreSQL**
2. **Clique "Restart"**
3. **Aguarde status "Running"**

### Se Build Falhar:
1. **Verifique logs de build**
2. **Procure por erros de dependências**
3. **Verifique se Dockerfile está correto**

## 📱 Logs em Tempo Real

### Acompanhar Deploy Ativo:
1. **Durante o deploy, os logs aparecem automaticamente**
2. **Acompanhe as etapas:**
   ```
   🔄 Building...
   📦 Installing dependencies...
   🏗️ Building application...
   🚀 Starting server...
   ✅ Deployment successful
   ```

### Filtrar Logs:
- **Use Ctrl+F** para buscar termos específicos
- **Procure por "error", "failed", "success"**

## 🚨 Problemas Comuns nos Logs

### 1. Erro de Porta Inválida
```
PrismaClientInitializationError: invalid port number
```
**Solução:** Corrigir DATABASE_URL

### 2. Erro de Conexão
```
Can't reach database server at postgres.railway.internal:5432
```
**Solução:** Verificar se PostgreSQL está rodando

### 3. Erro de Build
```
Error: Cannot find module 'xyz'
```
**Solução:** Verificar package.json e dependências

### 4. Erro de Memória
```
JavaScript heap out of memory
```
**Solução:** Otimizar código ou aumentar recursos

## 📋 Checklist de Verificação

- [ ] **Backend está "Running"**
- [ ] **PostgreSQL está "Running"**
- [ ] **DATABASE_URL está configurada**
- [ ] **Logs mostram "Server running"**
- [ ] **Logs mostram "Database connected"**
- [ ] **Sem erros vermelhos nos logs**
- [ ] **Deploy foi bem-sucedido**

## 🔗 Links Úteis

- **Railway Dashboard:** https://railway.app/dashboard
- **Documentação Railway:** https://docs.railway.app
- **Status Railway:** https://status.railway.app

---

**💡 Dica:** Mantenha os logs abertos durante testes para monitorar em tempo real!