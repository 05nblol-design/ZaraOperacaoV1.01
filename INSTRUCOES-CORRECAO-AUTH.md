
# 🔧 INSTRUÇÕES PARA CORRIGIR AUTENTICAÇÃO DO FRONTEND

## 🚨 Problema Identificado

O frontend está apresentando erros de JSON parsing porque:
- O auto-login está falhando
- Requisições sem token retornam 401 Unauthorized
- Frontend recebe HTML de erro em vez de JSON

## ✅ Solução - Configuração Manual

### Método 1: Usando o Console do Navegador

1. **Abra o frontend**: https://sistema-zara-frontend.vercel.app
2. **Abra o DevTools**: Pressione F12
3. **Vá para Console**: Clique na aba "Console"
4. **Cole e execute o script abaixo**:

```javascript
// Limpar dados antigos
localStorage.clear();
sessionStorage.clear();

// Configurar autenticação
localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzU3NDY2ODUxLCJleHAiOjE3NTgwNzE2NTF9.Np45pqt147s55phQ54qIBBNkAOAWlTKuSt72H40QGJY');
localStorage.setItem('user', '{"id":2,"email":"admin@zara.com","name":"Administrador","role":"ADMIN","isActive":true}');

// Recarregar página
window.location.reload();
```

### Método 2: Usando o Script Gerado

1. Abra o arquivo: `frontend-auth-fix.js`
2. Copie todo o conteúdo
3. Cole no Console do navegador
4. Execute

## 🎯 Resultado Esperado

Após executar o script:
- ✅ Token válido configurado
- ✅ Usuário autenticado: Administrador (ADMIN)
- ✅ Todos os endpoints funcionando
- ✅ Dashboard carregando dados
- ✅ Relatórios funcionando
- ✅ Sem mais erros de JSON parsing

## 🔍 Verificação

Para verificar se funcionou:
1. Recarregue a página
2. Verifique se não há erros no Console
3. Teste o Dashboard
4. Teste os Relatórios

## 🛠️ Solução Permanente

Para corrigir definitivamente:
1. Verificar por que o auto-login está falhando
2. Corrigir credenciais ou lógica de auto-login
3. Testar em ambiente de desenvolvimento
4. Fazer deploy da correção

---

**Data:** 09/09/2025, 22:14:11
**Token gerado em:** 09/09/2025, 22:14:11
**Válido até:** 16/09/2025, 22:14:11
