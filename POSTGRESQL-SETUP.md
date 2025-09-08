# Configuração PostgreSQL - Sistema Zara

## 🎯 Migração Concluída

O sistema foi **migrado com sucesso do MongoDB para PostgreSQL**! ✅

### ✅ O que foi feito:

1. **Schema Prisma atualizado** para PostgreSQL
2. **Dependências atualizadas** (removido mongoose, adicionado pg)
3. **Configuração de banco** migrada para PrismaClient
4. **Tratamento de erros** ajustado para códigos do Prisma
5. **IDs convertidos** de ObjectId para auto-increment integers
6. **Arquivo render.yaml** criado para deploy no Render

## 🚀 Opções para Banco PostgreSQL

### Opção 1: Render (Recomendado para Produção)

1. Crie uma conta no [Render](https://render.com)
2. Crie um PostgreSQL database (gratuito até 1GB)
3. Copie a DATABASE_URL fornecida
4. Configure no arquivo `.env.production`

### Opção 2: Neon (Gratuito para Desenvolvimento)

1. Crie uma conta no [Neon](https://neon.tech)
2. Crie um novo projeto
3. Copie a connection string
4. Configure no arquivo `.env`

### Opção 3: Supabase (Alternativa Gratuita)

1. Crie uma conta no [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Vá em Settings > Database
4. Copie a connection string
5. Configure no arquivo `.env`

### Opção 4: Docker Local (Se Docker estiver instalado)

```bash
# Usar o arquivo docker-compose.dev.yml já criado
docker compose -f docker-compose.dev.yml up -d
```

## ⚙️ Configuração

### 1. Atualizar variáveis de ambiente

Edite o arquivo `server/.env`:

```env
# Substitua pela sua URL PostgreSQL
DATABASE_URL="postgresql://username:password@host:5432/database_name"
```

### 2. Executar migrações

```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

### 3. Iniciar servidor

```bash
npm start
```

## 🔧 Comandos Úteis

```bash
# Gerar cliente Prisma
npx prisma generate

# Aplicar migrações
npx prisma migrate dev

# Visualizar banco de dados
npx prisma studio

# Reset do banco (cuidado!)
npx prisma migrate reset
```

## 📁 Arquivos Importantes

- `server/prisma/schema.prisma` - Schema do banco
- `server/config/database.js` - Configuração do Prisma
- `server/.env` - Variáveis de ambiente (desenvolvimento)
- `server/.env.production` - Variáveis de ambiente (produção)
- `server/render.yaml` - Configuração para deploy no Render

## 🚨 Próximos Passos

1. **Configurar banco PostgreSQL** (escolha uma das opções acima)
2. **Executar migrações** para criar as tabelas
3. **Testar aplicação** localmente
4. **Deploy no Render** usando o arquivo render.yaml

## 💡 Dicas

- Use **Neon** ou **Supabase** para desenvolvimento (gratuito)
- Use **Render** para produção (mais estável)
- Mantenha backups regulares dos dados importantes
- O Prisma Studio é útil para visualizar dados: `npx prisma studio`