# Como Gerar e Configurar Variáveis de Ambiente para Railway

## Variáveis que Você Precisa Configurar

### 1. JWT_SECRET
**O que é:** Chave secreta para assinar tokens JWT (autenticação)

**Como gerar:**
```bash
# Opção 1: Usando Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Opção 2: Usando OpenSSL
openssl rand -hex 64

# Opção 3: Online (use sites confiáveis)
# https://generate-secret.vercel.app/64
```

**Exemplo:**
```
JWT_SECRET=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456789012345678901234567890abcdef
```

### 2. CORS_ORIGINS
**O que é:** URL do seu frontend para permitir requisições CORS

**Como obter:**
1. Após fazer deploy do frontend no Railway, você receberá uma URL
2. A URL será algo como: `https://seu-projeto-frontend.up.railway.app`
3. Ou você pode usar um domínio customizado

**Configuração no Railway:**
- Vá para o Dashboard do Railway
- Selecione seu projeto frontend
- Copie a URL gerada
- Use essa URL na variável CORS_ORIGINS

**Exemplo:**
```
CORS_ORIGINS=https://zara-frontend.up.railway.app
```

### 3. SESSION_SECRET
**O que é:** Chave secreta para sessões (se usando express-session)

**Como gerar:** (mesmo processo do JWT_SECRET)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Exemplo:**
```
SESSION_SECRET=9876543210abcdef9876543210abcdef9876543210abcdef9876543210abcdef
```

## Como Configurar no Railway

### Passo 1: Acessar Variáveis de Ambiente
1. Acesse [railway.app](https://railway.app)
2. Faça login na sua conta
3. Selecione seu projeto
4. Clique na aba **"Variables"**

### Passo 2: Adicionar as Variáveis
Adicione cada variável clicando em **"New Variable"**:

```
Nome: JWT_SECRET
Valor: [sua-chave-jwt-gerada]

Nome: CORS_ORIGINS
Valor: https://seu-frontend.up.railway.app

Nome: SESSION_SECRET
Valor: [sua-chave-session-gerada]
```

### Passo 3: Outras Variáveis Importantes
Também configure estas (se ainda não configurou):

```
Nome: NODE_ENV
Valor: production

Nome: PORT
Valor: 3000

Nome: DATABASE_URL
Valor: [já configurado pelo PostgreSQL do Railway]
```

## Script para Gerar Todas as Chaves

Crie um arquivo temporário `generate-secrets.js`:

```javascript
const crypto = require('crypto');

console.log('=== VARIÁVEIS DE AMBIENTE PARA RAILWAY ===\n');
console.log('JWT_SECRET=' + crypto.randomBytes(64).toString('hex'));
console.log('SESSION_SECRET=' + crypto.randomBytes(32).toString('hex'));
console.log('\n=== COPIE E COLE NO RAILWAY ===');
console.log('\nLembre-se de configurar CORS_ORIGINS com a URL do seu frontend!');
```

Execute:
```bash
node generate-secrets.js
```

## Verificação

Após configurar todas as variáveis:
1. Faça um novo deploy (Railway fará automaticamente)
2. Verifique os logs para confirmar que não há erros
3. Teste a aplicação

## Segurança

⚠️ **IMPORTANTE:**
- **NUNCA** commite essas chaves no Git
- Use chaves diferentes para desenvolvimento e produção
- Regenere as chaves periodicamente
- Mantenha as chaves seguras e privadas

## Próximos Passos

1. Gere as chaves usando os métodos acima
2. Configure no Railway Dashboard
3. Aguarde o redeploy automático
4. Teste sua aplicação

---

**Dica:** Salve essas chaves em um local seguro (como um gerenciador de senhas) para referência futura.