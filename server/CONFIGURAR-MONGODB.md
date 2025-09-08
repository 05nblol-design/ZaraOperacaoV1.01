# 🔧 CONFIGURAÇÃO MONGODB ATLAS - PASSO A PASSO

## ⚠️ AÇÃO NECESSÁRIA: Configurar Senha do Banco

O sistema está configurado para MongoDB Atlas, mas você precisa **substituir a senha** na string de conexão.

### 📋 Passos para Configurar:

#### 1. **Obter a Senha do MongoDB Atlas**
   - Acesse [MongoDB Atlas](https://cloud.mongodb.com/)
   - Faça login na sua conta
   - Vá em **Database Access** (Acesso ao Banco)
   - Localize o usuário `05`
   - Se necessário, **redefina a senha** ou **crie um novo usuário**

#### 2. **Atualizar os Arquivos de Configuração**

**No arquivo `.env.production`:**
```env
# Substitua <db_password> pela senha real
MONGODB_URI=mongodb+srv://05:SUA_SENHA_AQUI@cluster0.hvggzox.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DATABASE_URL=mongodb+srv://05:SUA_SENHA_AQUI@cluster0.hvggzox.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

**No arquivo `.env` (desenvolvimento):**
```env
# Adicione as mesmas configurações
MONGODB_URI=mongodb+srv://05:SUA_SENHA_AQUI@cluster0.hvggzox.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DATABASE_URL=mongodb+srv://05:SUA_SENHA_AQUI@cluster0.hvggzox.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

#### 3. **Configurar Acesso de Rede no MongoDB Atlas**
   - No MongoDB Atlas, vá em **Network Access**
   - Adicione seu IP atual ou `0.0.0.0/0` (para qualquer IP)
   - **⚠️ Cuidado:** `0.0.0.0/0` permite acesso de qualquer lugar (menos seguro)

#### 4. **Testar a Conexão**

Após configurar a senha, execute:

```bash
# No diretório server
node migrate-to-mongodb.js
```

### 🔍 **Exemplo de String de Conexão Correta:**

```
mongodb+srv://05:minhasenha123@cluster0.hvggzox.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### 🚨 **Problemas Comuns:**

1. **Senha com caracteres especiais:**
   - Use URL encoding: `@` → `%40`, `#` → `%23`, etc.
   - Ou crie uma senha sem caracteres especiais

2. **IP não autorizado:**
   - Verifique **Network Access** no MongoDB Atlas
   - Adicione seu IP atual

3. **Usuário não existe:**
   - Verifique **Database Access** no MongoDB Atlas
   - Crie um usuário com permissões de leitura/escrita

### 📝 **Próximos Passos Após Configurar:**

1. ✅ Configurar senha do MongoDB
2. ✅ Testar conexão com `node migrate-to-mongodb.js`
3. ✅ Executar `npx prisma generate`
4. ✅ Testar o sistema localmente
5. ✅ Fazer deploy para produção

---

**💡 Dica:** Mantenha suas credenciais seguras e nunca as compartilhe publicamente!