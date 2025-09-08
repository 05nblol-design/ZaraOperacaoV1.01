# 🍃 Configuração MongoDB Atlas - Sistema ZARA

## 📋 Informações da Conexão

**String de Conexão Fornecida:**
```
mongodb+srv://05:<db_password>@cluster0.hvggzox.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

## 🔧 Configuração Passo a Passo

### 1. Obter a Senha do Banco

**⚠️ IMPORTANTE:** Você precisa substituir `<db_password>` pela senha real do usuário "05" no MongoDB Atlas.

### 2. Configurar no Ambiente Local

**Arquivo:** `server/.env`
```env
# Banco de dados MongoDB Atlas
MONGODB_URI=mongodb+srv://05:SUA_SENHA_AQUI@cluster0.hvggzox.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DATABASE_URL=mongodb+srv://05:SUA_SENHA_AQUI@cluster0.hvggzox.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### 3. Configurar no Vercel (Produção)

No painel do Vercel, adicione as variáveis de ambiente:

```env
MONGODB_URI=mongodb+srv://05:SUA_SENHA_AQUI@cluster0.hvggzox.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DATABASE_URL=mongodb+srv://05:SUA_SENHA_AQUI@cluster0.hvggzox.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

## 🔐 Configurações de Segurança

### Verificar Permissões do Usuário

O usuário "05" deve ter as seguintes permissões:
- **readWrite** no banco de dados
- Acesso ao cluster **Cluster0**
- Permissões para criar coleções e índices

### Configurar IP Whitelist

No MongoDB Atlas, certifique-se de que os seguintes IPs estão liberados:
- **0.0.0.0/0** (para desenvolvimento - não recomendado para produção)
- **IPs específicos do Vercel** (para produção)

## 🗄️ Estrutura do Banco de Dados

### Coleções Principais

```javascript
// Usuários
users: {
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hash),
  role: String,
  createdAt: Date
}

// Máquinas
machines: {
  _id: ObjectId,
  name: String,
  status: String,
  location: String,
  operator: ObjectId,
  createdAt: Date
}

// Operações
operations: {
  _id: ObjectId,
  machineId: ObjectId,
  operatorId: ObjectId,
  startTime: Date,
  endTime: Date,
  production: Number,
  status: String
}

// Notificações
notifications: {
  _id: ObjectId,
  userId: ObjectId,
  message: String,
  type: String,
  read: Boolean,
  createdAt: Date
}
```

## 🧪 Testar a Conexão

### 1. Teste Local

```bash
# No diretório server/
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb+srv://05:SUA_SENHA@cluster0.hvggzox.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0').then(() => console.log('✅ Conexão OK')).catch(err => console.error('❌ Erro:', err))"
```

### 2. Teste no Sistema

```bash
# Executar o servidor
npm run dev

# Verificar logs de conexão
# Deve aparecer: "✅ MongoDB conectado com sucesso"
```

## 🚀 Deploy no Vercel

### Configurar Variáveis de Ambiente

1. Acesse o painel do Vercel
2. Vá para **Settings > Environment Variables**
3. Adicione as variáveis:

| Nome | Valor |
|------|-------|
| `MONGODB_URI` | `mongodb+srv://05:SUA_SENHA@cluster0.hvggzox.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0` |
| `DATABASE_URL` | `mongodb+srv://05:SUA_SENHA@cluster0.hvggzox.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0` |

### Verificar Deploy

1. Faça o deploy do backend
2. Verifique os logs do Vercel
3. Teste as rotas da API
4. Confirme a conexão com o banco

## 🔍 Troubleshooting

### Erro: "Authentication failed"
- ✅ Verifique se a senha está correta
- ✅ Confirme se o usuário "05" existe
- ✅ Verifique as permissões do usuário

### Erro: "Connection timeout"
- ✅ Verifique a whitelist de IPs
- ✅ Confirme se o cluster está ativo
- ✅ Teste a conectividade de rede

### Erro: "Database not found"
- ✅ O banco será criado automaticamente na primeira conexão
- ✅ Verifique se o usuário tem permissão de criação

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs** do servidor
2. **Teste a conexão** localmente primeiro
3. **Confirme as credenciais** no MongoDB Atlas
4. **Verifique a configuração** das variáveis de ambiente

---

**✅ Configuração Completa!**

Após seguir todos os passos, seu sistema ZARA estará conectado ao MongoDB Atlas e pronto para produção.