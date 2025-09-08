# 🚂 Deploy Zara no Railway

## ⚡ Quick Start

### 1. Preparar Repositório
```bash
# Fazer commit das alterações
git add .
git commit -m "Configure Railway deployment with PostgreSQL"
git push origin main
```

### 2. Criar Projeto no Railway
1. Acesse [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub repo"
3. Selecione este repositório

### 3. Adicionar PostgreSQL
1. No projeto Railway: "+ New" → "Database" → "PostgreSQL"
2. Copie a `DATABASE_URL` gerada

### 4. Configurar Variáveis de Ambiente
No painel "Variables" do seu serviço:

```env
DATABASE_URL=postgresql://user:pass@host:port/db
NODE_ENV=production
PORT=5000
JWT_SECRET=seu-jwt-secret-super-seguro
CORS_ORIGINS=https://seu-frontend.railway.app
SESSION_SECRET=seu-session-secret
```

### 5. Deploy Automático
- Railway detecta automaticamente o `railway.toml`
- Build context: `server/`
- Start command: `npm start`
- Health check: `/api/health`

## 📁 Arquivos Criados

- `railway.toml` - Configuração do Railway
- `server/.env.railway` - Exemplo de variáveis
- `RAILWAY-DEPLOY.md` - Guia completo
- `.gitignore` - Arquivos ignorados

## 🔧 Scripts Adicionados

```json
{
  "railway:build": "npm install && prisma generate",
  "railway:start": "prisma migrate deploy && npm start",
  "prisma:migrate": "prisma migrate deploy"
}
```

## ✅ Checklist de Deploy

- [x] Configuração Railway (`railway.toml`)
- [x] Scripts de build e deploy
- [x] Variáveis de ambiente
- [x] PostgreSQL configurado
- [x] Documentação criada
- [ ] Deploy realizado
- [ ] Migrações executadas
- [ ] Testes de API

## 🆘 Suporte

Para problemas, consulte:
- `RAILWAY-DEPLOY.md` - Guia detalhado
- [Railway Docs](https://docs.railway.app)
- [Prisma Railway Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-railway)

---

**Próximo passo**: Fazer deploy no Railway seguindo as instruções acima! 🚀