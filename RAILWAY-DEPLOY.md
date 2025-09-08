# Deploy no Railway - Guia Completo

## 📋 Pré-requisitos

- Conta no Railway (https://railway.app)
- Código no GitHub/GitLab
- PostgreSQL configurado

## 🚀 Passos para Deploy

### 1. Criar Projeto no Railway

1. Acesse https://railway.app
2. Clique em "New Project"
3. Conecte seu repositório GitHub
4. Selecione o repositório do projeto Zara

### 2. Configurar PostgreSQL

1. No dashboard do Railway, clique em "+ New"
2. Selecione "Database" → "PostgreSQL"
3. Aguarde a criação do banco
4. Copie a `DATABASE_URL` gerada

### 3. Configurar Variáveis de Ambiente

No painel do seu serviço, vá em "Variables" e adicione:

```
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
PORT=5000
JWT_SECRET=seu-jwt-secret-super-seguro
CORS_ORIGINS=https://seu-frontend.railway.app
SENTRY_DSN=seu-sentry-dsn (opcional)
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
SESSION_SECRET=seu-session-secret
```

### 4. Configurar Build

O arquivo `railway.toml` já está configurado com:
- Builder: Nixpacks (detecção automática)
- Start Command: `npm start`
- Health Check: `/api/health`
- Context: `server/`

### 5. Deploy Automático

1. Faça push para o branch principal
2. Railway detectará automaticamente e iniciará o build
3. Aguarde o deploy completar
4. Acesse a URL gerada pelo Railway

## 🔧 Comandos Úteis

### Executar Migrações
```bash
# No Railway CLI ou terminal
npx prisma migrate deploy
npx prisma generate
```

### Verificar Logs
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Ver logs
railway logs
```

## 📁 Estrutura de Arquivos Importantes

```
├── railway.toml          # Configuração do Railway
├── server/
│   ├── package.json      # Dependências
│   ├── prisma/
│   │   └── schema.prisma # Schema do banco
│   ├── .env.railway      # Exemplo de variáveis
│   └── api/
│       └── index.js      # Entrada da aplicação
```

## 🐛 Troubleshooting

### Erro de Conexão com Banco
- Verifique se a `DATABASE_URL` está correta
- Confirme se o PostgreSQL está rodando
- Execute as migrações: `npx prisma migrate deploy`

### Erro de Build
- Verifique se todas as dependências estão no `package.json`
- Confirme se o `NODE_ENV=production`
- Verifique logs no dashboard do Railway

### Erro de CORS
- Configure `CORS_ORIGINS` com a URL do frontend
- Verifique se o frontend está fazendo requisições para a URL correta

## 🔗 Links Úteis

- [Railway Docs](https://docs.railway.app)
- [Prisma Railway Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-railway)
- [Railway CLI](https://docs.railway.app/develop/cli)

## 📝 Próximos Passos

1. ✅ Configurar PostgreSQL no Railway
2. ✅ Definir variáveis de ambiente
3. ✅ Fazer deploy inicial
4. 🔄 Executar migrações do Prisma
5. 🧪 Testar endpoints da API
6. 🌐 Conectar com frontend

---

**Nota**: Lembre-se de nunca commitar arquivos `.env` com dados sensíveis!