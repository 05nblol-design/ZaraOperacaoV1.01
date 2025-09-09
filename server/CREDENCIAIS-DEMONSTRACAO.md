# 🎯 CREDENCIAIS DE DEMONSTRAÇÃO - SISTEMA ZARA

## ✅ Status do Banco de Dados
- **PostgreSQL**: ✅ Conectado e funcional
- **Tabelas**: ✅ 14 tabelas criadas (incluindo `users`)
- **Migrações**: ✅ Executadas com sucesso
- **URL**: `postgresql://postgres:GNquZiBhCMsFDZbvDTevPkrWFdRyyLQM@interchange.proxy.rlwy.net:17733/railway`

## 👥 USUÁRIOS CRIADOS

### 👑 ADMINISTRADOR
- **Email**: `admin@zara.com`
- **Senha**: `admin123`
- **Role**: `ADMIN`
- **ID**: `2`
- **Status**: Ativo
- **Permissões**: Acesso completo ao sistema

### 👤 OPERADOR
- **Email**: `demo@zara.com`
- **Senha**: `demo123`
- **Role**: `OPERATOR`
- **ID**: `1`
- **Status**: Ativo
- **Permissões**: Operações básicas

## 🔧 Como Usar

### 1. Para Testes no Frontend
```
URL do Frontend: https://seu-frontend.vercel.app
URL do Backend: https://zaraoperacaov101-production.up.railway.app
```

### 2. Login no Sistema
1. Acesse o frontend
2. Use uma das credenciais acima
3. Teste as funcionalidades conforme o nível de acesso

### 3. Diferenças entre Roles
- **ADMIN**: Pode gerenciar usuários, máquinas, relatórios completos
- **OPERATOR**: Pode operar máquinas, visualizar dados básicos

## 🚨 PRÓXIMOS PASSOS URGENTES

### ⚠️ Railway Dashboard
1. **Acessar**: https://railway.app/dashboard
2. **Configurar DATABASE_URL**: 
   ```
   postgresql://postgres:GNquZiBhCMsFDZbvDTevPkrWFdRyyLQM@interchange.proxy.rlwy.net:17733/railway
   ```
3. **Redeploy**: Fazer novo deploy da aplicação
4. **Testar**: Verificar se API responde (atualmente 404)

### 📊 Status Atual
- ✅ **Banco de Dados**: Funcional
- ✅ **Tabelas**: Criadas
- ✅ **Usuários**: Cadastrados
- ❌ **Railway App**: Não responde (404)
- ⏳ **Ação Necessária**: Configurar DATABASE_URL no Railway

## 🔍 Verificação

### Testar Conexão Local
```bash
node create-demo-user.js  # Verificar usuário demo
node create-admin-user.js # Verificar usuário admin
```

### Testar API (após redeploy)
```bash
curl -X POST https://zaraoperacaov101-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@zara.com","password":"demo123"}'
```

## 📝 Observações

1. **Senhas**: Todas as senhas estão com hash bcrypt
2. **Segurança**: Credenciais são apenas para demonstração
3. **Produção**: Alterar senhas em ambiente de produção
4. **Backup**: Manter backup das credenciais

---

**Data de Criação**: $(Get-Date -Format "dd/MM/yyyy HH:mm")
**Status**: ✅ Usuários criados com sucesso
**Próximo**: Configurar Railway Dashboard