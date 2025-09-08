# 🚨 CORREÇÃO URGENTE - DATABASE_URL Railway

## ❌ ERRO CONFIRMADO
```
Can't reach database server at `host:5432`
PrismaClientInitializationError
```

## 🔍 PROBLEMA IDENTIFICADO
O DATABASE_URL está usando hostname genérico `host` ao invés do hostname real do PostgreSQL do Railway.

## ⚡ SOLUÇÃO IMEDIATA

### 1. Acesse o Railway Dashboard
```
https://railway.app/dashboard
```

### 2. Vá para seu Projeto
- Clique no projeto da aplicação Zara
- Selecione o serviço **PostgreSQL**

### 3. Copie a URL Correta
- Vá na aba **Variables**
- Procure por `DATABASE_URL`
- Copie o valor completo (deve começar com `postgresql://`)

### 4. Configure no Backend
- Vá para o serviço do **Backend**
- Aba **Variables**
- Adicione/Edite: `DATABASE_URL`
- Cole a URL copiada do PostgreSQL

## 📋 FORMATO CORRETO
```
postgresql://postgres:senha@railway-host.railway.app:5432/railway
```

**NÃO DEVE SER:**
```
postgresql://postgres:senha@host:5432/railway  ❌
```

## 🔧 VERIFICAÇÃO RÁPIDA

### Comando para testar:
```bash
node diagnose-database-host.js
```

### URL de teste do health check:
```
https://seu-backend.railway.app/health
```

## ⏱️ TEMPO ESTIMADO
- Correção: 2-3 minutos
- Redeployment: 3-5 minutos
- Teste: 1 minuto

## 🎯 PRÓXIMOS PASSOS
1. ✅ Corrigir DATABASE_URL no Railway
2. ✅ Aguardar redeployment automático
3. ✅ Testar endpoint `/health`
4. ✅ Verificar logs de produção

## 📞 SUPORTE
Se o problema persistir após a correção, verifique:
- Serviço PostgreSQL está ativo no Railway
- Variáveis de ambiente estão corretas
- Não há caracteres especiais não escapados na senha

---
**Status:** 🔴 CRÍTICO - Requer correção imediata
**Impacto:** Aplicação não consegue conectar ao banco de dados
**Prioridade:** MÁXIMA