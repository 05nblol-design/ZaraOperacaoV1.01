# 🔧 Railway Template Variables - DATABASE_URL

## 📋 VARIÁVEL IDENTIFICADA
```
${{ zara-postgres.DATABASE_URL }}
```

## 🎯 O QUE SIGNIFICA
Esta é uma **variável de template do Railway** que referencia automaticamente o DATABASE_URL do serviço PostgreSQL.

### 🔍 Estrutura da Variável
- `zara-postgres`: Nome do serviço PostgreSQL no Railway
- `DATABASE_URL`: Variável de ambiente do PostgreSQL
- `${{ }}`: Sintaxe de template do Railway

## ✅ COMO CONFIGURAR CORRETAMENTE

### 1. Verificar Nome do Serviço PostgreSQL
1. Acesse Railway Dashboard
2. Vá para seu projeto
3. Verifique o nome exato do serviço PostgreSQL
4. Pode ser: `postgres`, `postgresql`, `zara-postgres`, etc.

### 2. Configurar no Backend
**No serviço Backend → Variables:**
```
DATABASE_URL = ${{ nome-do-servico-postgres.DATABASE_URL }}
```

### 3. Exemplos Corretos
```bash
# Se o serviço se chama "postgres"
DATABASE_URL = ${{ postgres.DATABASE_URL }}

# Se o serviço se chama "postgresql"
DATABASE_URL = ${{ postgresql.DATABASE_URL }}

# Se o serviço se chama "zara-postgres"
DATABASE_URL = ${{ zara-postgres.DATABASE_URL }}
```

## 🚨 PROBLEMAS COMUNS

### ❌ Erro: Nome do Serviço Incorreto
```
${{ wrong-name.DATABASE_URL }}  # Serviço não existe
```

### ❌ Erro: Sintaxe Incorreta
```
{{ zara-postgres.DATABASE_URL }}     # Faltam os $
${ zara-postgres.DATABASE_URL }      # Sintaxe errada
```

### ❌ Erro: Variável Não Existe
```
${{ zara-postgres.DB_URL }}          # Variável errada
```

## 🔧 PASSOS PARA CORREÇÃO

### 1. Identificar Nome Correto do Serviço
1. Railway Dashboard → Seu Projeto
2. Anote o nome exato do serviço PostgreSQL
3. Geralmente aparece como um card/tile

### 2. Configurar Variável no Backend
1. Clique no serviço **Backend**
2. Aba **Variables**
3. Adicione/Edite:
   ```
   Nome: DATABASE_URL
   Valor: ${{ NOME-CORRETO-DO-POSTGRES.DATABASE_URL }}
   ```
4. Clique **Save**

### 3. Aguardar Redeploy
- Railway fará redeploy automático
- Aguarde 3-5 minutos

## 🧪 VERIFICAÇÃO

### Teste 1: Logs do Deploy
```bash
# Deve aparecer nos logs:
prisma:info Starting a postgresql pool with X connections.
```

### Teste 2: Health Check
```bash
curl https://seu-backend.railway.app/health
```

### Teste 3: Variáveis de Ambiente
Nos logs do Railway, deve aparecer:
```
DATABASE_URL=postgresql://postgres:senha@host.railway.app:5432/railway
```

## 💡 ALTERNATIVA: URL DIRETA

Se a variável de template não funcionar, use a URL direta:

1. **PostgreSQL Service** → **Variables** → Copie `DATABASE_URL`
2. **Backend Service** → **Variables** → Cole diretamente

```
DATABASE_URL=postgresql://postgres:senha123@viaduct.proxy.rlwy.net:12345/railway
```

## 🎯 PRÓXIMOS PASSOS

1. ✅ Verificar nome exato do serviço PostgreSQL
2. ✅ Configurar variável com sintaxe correta
3. ✅ Aguardar redeploy
4. ✅ Testar conexão

## 📞 DIAGNÓSTICO RÁPIDO

```bash
# Execute para verificar configuração:
node fix-railway-database-urgent.js
```

---
**Status:** 🔧 Configuração de Template Variables
**Tempo:** 2-5 minutos para correção
**Impacto:** Resolve erro de conexão com PostgreSQL