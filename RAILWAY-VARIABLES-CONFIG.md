# 🔧 Configuração das Variáveis de Ambiente no Railway

## 📋 Variáveis Geradas para Seu Projeto

### Copie e cole estas variáveis no Railway Dashboard:

```
JWT_SECRET=90d8592d5567af28fffdbb0c23638593e5408abd25d5e62d65f29da4125029b4295ffd4e8977629aa2f7c9f309497e66475d0c94cf0b7d02027f46af7f770e48

SESSION_SECRET=23afedca8eec40476c847b6dbb6f68e7093bb3d5a40a4a727dca0514a50168d7

CORS_ORIGINS=https://seu-frontend.up.railway.app
(⚠️ IMPORTANTE: Substitua pela URL real do seu frontend)

NODE_ENV=production

PORT=3000
```

## 🚀 Passo a Passo para Configurar no Railway

### 1. Acesse o Railway Dashboard
- Vá para [railway.app](https://railway.app)
- Faça login na sua conta
- Selecione seu projeto backend

### 2. Configure as Variáveis
1. Clique na aba **"Variables"** no seu projeto
2. Para cada variável, clique em **"New Variable"**
3. Adicione uma por vez:

#### Variável 1: JWT_SECRET
```
Name: JWT_SECRET
Value: 90d8592d5567af28fffdbb0c23638593e5408abd25d5e62d65f29da4125029b4295ffd4e8977629aa2f7c9f309497e66475d0c94cf0b7d02027f46af7f770e48
```

#### Variável 2: SESSION_SECRET
```
Name: SESSION_SECRET
Value: 23afedca8eec40476c847b6dbb6f68e7093bb3d5a40a4a727dca0514a50168d7
```

#### Variável 3: NODE_ENV
```
Name: NODE_ENV
Value: production
```

#### Variável 4: PORT
```
Name: PORT
Value: 3000
```

#### Variável 5: CORS_ORIGINS (IMPORTANTE)
```
Name: CORS_ORIGINS
Value: [URL do seu frontend - veja instruções abaixo]
```

### 3. Como Obter a URL do Frontend

**Se você já fez deploy do frontend:**
1. Vá para o projeto do frontend no Railway
2. Copie a URL gerada (algo como: `https://zara-frontend.up.railway.app`)
3. Use essa URL na variável CORS_ORIGINS

**Se ainda não fez deploy do frontend:**
1. Por enquanto, use: `http://localhost:3000,https://localhost:3000`
2. Depois do deploy do frontend, atualize com a URL real

### 4. Verificar DATABASE_URL
- A variável `DATABASE_URL` já deve estar configurada automaticamente pelo PostgreSQL
- Verifique se ela existe na lista de variáveis
- Se não existir, copie a URL do PostgreSQL que você recebeu anteriormente

## ✅ Após Configurar

1. **Deploy Automático**: Railway fará redeploy automaticamente
2. **Aguarde**: Espere alguns minutos para o deploy completar
3. **Verifique Logs**: Clique em "Deployments" para ver se há erros
4. **Teste**: Acesse sua aplicação para verificar se está funcionando

## 🔍 Verificação Final

Sua lista de variáveis deve conter:
- ✅ `DATABASE_URL` (PostgreSQL)
- ✅ `JWT_SECRET`
- ✅ `SESSION_SECRET`
- ✅ `NODE_ENV`
- ✅ `PORT`
- ✅ `CORS_ORIGINS`

## 🚨 Problemas Comuns

### CORS Error
- **Problema**: Frontend não consegue acessar backend
- **Solução**: Verifique se CORS_ORIGINS tem a URL correta do frontend

### 500 Internal Server Error
- **Problema**: Erro no servidor
- **Solução**: Verifique os logs no Railway Dashboard

### Database Connection Error
- **Problema**: Não consegue conectar ao PostgreSQL
- **Solução**: Verifique se DATABASE_URL está configurada corretamente

## 📞 Próximos Passos

1. Configure todas as variáveis acima
2. Aguarde o redeploy
3. Teste sua aplicação
4. Se tudo estiver funcionando, faça deploy do frontend
5. Atualize CORS_ORIGINS com a URL real do frontend

---

**💡 Dica**: Salve essas chaves em um local seguro para referência futura!