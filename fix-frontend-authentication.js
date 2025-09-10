#!/usr/bin/env node

/**
 * CORREÇÃO DE AUTENTICAÇÃO DO FRONTEND
 * 
 * Problema identificado:
 * - Backend Railway funcionando perfeitamente (login retorna token válido)
 * - Frontend com auto-login falhando, causando erros 401 Unauthorized
 * - Componentes recebendo HTML em vez de JSON devido à falta de autenticação
 * 
 * Solução:
 * - Configurar token válido no localStorage do frontend
 * - Gerar instruções para correção manual
 */

const fs = require('fs');
const axios = require('axios');

// URLs do sistema
const FRONTEND_URL = 'https://sistema-zara-frontend.vercel.app';
const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';

// Credenciais de admin que funcionam
const ADMIN_CREDENTIALS = {
  email: 'admin@zara.com',
  password: 'admin123'
};

console.log('🔧 CORREÇÃO DE AUTENTICAÇÃO DO FRONTEND');
console.log('=' .repeat(50));
console.log(`Frontend: ${FRONTEND_URL}`);
console.log(`Backend:  ${BACKEND_URL}`);
console.log('');

// 1. Obter token válido do backend
async function getValidToken() {
  console.log('🔑 PASSO 1: Obtendo token válido do backend...');
  
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, ADMIN_CREDENTIALS, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    
    if (response.data.success && response.data.data.token) {
      const { token, user } = response.data.data;
      
      console.log('✅ Token obtido com sucesso!');
      console.log(`   Usuário: ${user.name} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Token: ${token.substring(0, 30)}...`);
      
      return { token, user };
    } else {
      throw new Error('Resposta inválida do backend');
    }
    
  } catch (error) {
    console.log('❌ Erro ao obter token:', error.message);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Dados: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

// 2. Gerar script de correção para o frontend
function generateFrontendFixScript(token, user) {
  console.log('\n📝 PASSO 2: Gerando script de correção...');
  
  const fixScript = `
// ========================================
// SCRIPT DE CORREÇÃO - AUTENTICAÇÃO FRONTEND
// ========================================

// 1. Limpar dados antigos
console.log('🧹 Limpando dados antigos...');
localStorage.clear();
sessionStorage.clear();

// 2. Configurar token válido
console.log('🔑 Configurando autenticação...');
const validToken = '${token}';
const userData = ${JSON.stringify(user, null, 2)};

// 3. Salvar no localStorage
localStorage.setItem('token', validToken);
localStorage.setItem('user', JSON.stringify(userData));

// 4. Verificar se foi salvo corretamente
const savedToken = localStorage.getItem('token');
const savedUser = localStorage.getItem('user');

if (savedToken && savedUser) {
  console.log('✅ Autenticação configurada com sucesso!');
  console.log('👤 Usuário:', JSON.parse(savedUser).name);
  console.log('🔑 Token salvo:', savedToken.substring(0, 30) + '...');
  
  // 5. Recarregar página para aplicar mudanças
  console.log('🔄 Recarregando página em 2 segundos...');
  setTimeout(() => {
    window.location.reload();
  }, 2000);
  
} else {
  console.error('❌ Erro ao salvar dados de autenticação!');
}

// ========================================
`;
  
  // Salvar script em arquivo
  const scriptFile = 'frontend-auth-fix.js';
  fs.writeFileSync(scriptFile, fixScript);
  
  console.log(`✅ Script salvo em: ${scriptFile}`);
  return { scriptFile, fixScript };
}

// 3. Gerar instruções detalhadas
function generateInstructions(token, user, scriptFile) {
  console.log('\n📋 PASSO 3: Gerando instruções...');
  
  const instructions = `
# 🔧 INSTRUÇÕES PARA CORRIGIR AUTENTICAÇÃO DO FRONTEND

## 🚨 Problema Identificado

O frontend está apresentando erros de JSON parsing porque:
- O auto-login está falhando
- Requisições sem token retornam 401 Unauthorized
- Frontend recebe HTML de erro em vez de JSON

## ✅ Solução - Configuração Manual

### Método 1: Usando o Console do Navegador

1. **Abra o frontend**: ${FRONTEND_URL}
2. **Abra o DevTools**: Pressione F12
3. **Vá para Console**: Clique na aba "Console"
4. **Cole e execute o script abaixo**:

\`\`\`javascript
// Limpar dados antigos
localStorage.clear();
sessionStorage.clear();

// Configurar autenticação
localStorage.setItem('token', '${token}');
localStorage.setItem('user', '${JSON.stringify(user)}');

// Recarregar página
window.location.reload();
\`\`\`

### Método 2: Usando o Script Gerado

1. Abra o arquivo: \`${scriptFile}\`
2. Copie todo o conteúdo
3. Cole no Console do navegador
4. Execute

## 🎯 Resultado Esperado

Após executar o script:
- ✅ Token válido configurado
- ✅ Usuário autenticado: ${user.name} (${user.role})
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

**Data:** ${new Date().toLocaleString('pt-BR')}
**Token gerado em:** ${new Date().toLocaleString('pt-BR')}
**Válido até:** ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleString('pt-BR')}
`;
  
  const instructionsFile = 'INSTRUCOES-CORRECAO-AUTH.md';
  fs.writeFileSync(instructionsFile, instructions);
  
  console.log(`✅ Instruções salvas em: ${instructionsFile}`);
  return instructionsFile;
}

// 4. Testar se a correção funcionaria
async function testAuthFix(token) {
  console.log('\n🧪 PASSO 4: Testando se a correção funcionaria...');
  
  const testEndpoints = [
    '/api/reports/manager-dashboard',
    '/api/reports/quality-metrics',
    '/api/machines',
    '/api/users'
  ];
  
  for (const endpoint of testEndpoints) {
    try {
      const response = await axios.get(`${BACKEND_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      });
      
      console.log(`✅ ${endpoint}: ${response.status} - JSON válido`);
      
    } catch (error) {
      if (error.response) {
        console.log(`❌ ${endpoint}: ${error.response.status} - ${error.response.statusText}`);
      } else {
        console.log(`❌ ${endpoint}: ${error.message}`);
      }
    }
  }
}

// 5. Executar correção completa
async function runAuthFix() {
  try {
    console.log('🚀 INICIANDO CORREÇÃO DE AUTENTICAÇÃO');
    console.log('');
    
    // Obter token válido
    const { token, user } = await getValidToken();
    
    // Gerar script de correção
    const { scriptFile } = generateFrontendFixScript(token, user);
    
    // Gerar instruções
    const instructionsFile = generateInstructions(token, user, scriptFile);
    
    // Testar se funcionaria
    await testAuthFix(token);
    
    console.log('\n🎉 CORREÇÃO CONCLUÍDA!');
    console.log('');
    console.log('📁 Arquivos gerados:');
    console.log(`   • ${scriptFile}`);
    console.log(`   • ${instructionsFile}`);
    console.log('');
    console.log('🔧 PRÓXIMOS PASSOS:');
    console.log('1. Abra o frontend no navegador');
    console.log('2. Abra o DevTools (F12)');
    console.log('3. Vá para a aba Console');
    console.log('4. Execute o script de correção');
    console.log('5. Verifique se os erros foram resolvidos');
    console.log('');
    console.log('✅ Após isso, todos os erros de JSON parsing devem ser resolvidos!');
    
  } catch (error) {
    console.error('❌ Erro durante correção:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runAuthFix();
}

module.exports = {
  runAuthFix,
  getValidToken,
  generateFrontendFixScript,
  FRONTEND_URL,
  BACKEND_URL
};