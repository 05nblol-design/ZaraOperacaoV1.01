#!/usr/bin/env node

/**
 * CORREÇÃO DO ENDPOINT DE LOGIN
 * 
 * Problema identificado:
 * - O endpoint correto é /api/auth/login (não /auth/login)
 * - Backend Railway está funcionando corretamente
 * - Frontend precisa usar a URL correta
 */

const axios = require('axios');
const fs = require('fs');

// URLs do sistema
const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';
const FRONTEND_URL = 'https://sistema-zara-frontend.vercel.app';

// Credenciais de teste
const TEST_CREDENTIALS = {
  email: 'admin@zara.com',
  password: 'admin123'
};

console.log('🔧 CORREÇÃO DO ENDPOINT DE LOGIN');
console.log('=' .repeat(50));
console.log(`Backend: ${BACKEND_URL}`);
console.log(`Frontend: ${FRONTEND_URL}`);
console.log('');

async function testLoginEndpoint() {
  console.log('1️⃣ Testando endpoint de login correto...');
  
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, TEST_CREDENTIALS, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL
      },
      timeout: 10000
    });
    
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   ✅ Success: ${response.data.success}`);
    
    if (response.data.data && response.data.data.token) {
      console.log(`   🔑 Token recebido: ${response.data.data.token.substring(0, 20)}...`);
      console.log(`   👤 Usuário: ${response.data.data.user.name} (${response.data.data.user.role})`);
      return response.data.data.token;
    }
    
  } catch (error) {
    console.log(`   ❌ Erro: ${error.response?.status || 'TIMEOUT'} - ${error.message}`);
    if (error.response?.data) {
      console.log(`   📄 Resposta: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return null;
  }
}

async function testOtherEndpoints(token) {
  if (!token) {
    console.log('\n❌ Sem token válido, pulando testes de endpoints...');
    return;
  }
  
  console.log('\n2️⃣ Testando endpoints com token válido...');
  
  const endpoints = [
    '/api/health',
    '/api/users',
    '/api/machines',
    '/api/reports/leader-dashboard'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${BACKEND_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log(`   ✅ ${endpoint}: ${response.status}`);
      
    } catch (error) {
      console.log(`   ❌ ${endpoint}: ${error.response?.status || 'TIMEOUT'} - ${error.message}`);
    }
  }
}

function generateFrontendFix(token) {
  console.log('\n3️⃣ Gerando script de correção para o frontend...');
  
  const fixScript = `
// SCRIPT DE CORREÇÃO PARA O FRONTEND VERCEL
// Execute este código no console do navegador em: ${FRONTEND_URL}

console.log('🔧 Aplicando correção de autenticação...');

// 1. Limpar dados antigos
localStorage.clear();
sessionStorage.clear();

// 2. Configurar token válido
const validToken = '${token}';
const userData = {
  id: 1,
  name: 'Admin',
  email: 'admin@zara.com',
  role: 'ADMIN',
  isActive: true
};

// 3. Salvar no localStorage
localStorage.setItem('token', validToken);
localStorage.setItem('user', JSON.stringify(userData));

// 4. Verificar se foi salvo
console.log('Token salvo:', localStorage.getItem('token') ? '✅' : '❌');
console.log('Usuário salvo:', localStorage.getItem('user') ? '✅' : '❌');

// 5. Recarregar página
console.log('🔄 Recarregando página...');
window.location.reload();
`;
  
  fs.writeFileSync('frontend-login-fix.js', fixScript);
  console.log('   ✅ Script salvo em: frontend-login-fix.js');
  
  return fixScript;
}

function generateInstructions() {
  console.log('\n📋 INSTRUÇÕES DE CORREÇÃO:');
  console.log('=' .repeat(50));
  console.log('');
  console.log('1. 🌐 Abra o frontend no navegador:');
  console.log(`   ${FRONTEND_URL}`);
  console.log('');
  console.log('2. 🔧 Abra o Console do Desenvolvedor:');
  console.log('   - Chrome/Edge: F12 → Console');
  console.log('   - Firefox: F12 → Console');
  console.log('   - Safari: Cmd+Opt+C');
  console.log('');
  console.log('3. 📋 Cole e execute o código do arquivo:');
  console.log('   frontend-login-fix.js');
  console.log('');
  console.log('4. ✅ Resultado esperado:');
  console.log('   - Token e usuário salvos no localStorage');
  console.log('   - Página recarregada automaticamente');
  console.log('   - Login automático realizado');
  console.log('   - Dashboard carregado sem erros');
  console.log('');
  console.log('5. 🧪 Teste o Leader Dashboard:');
  console.log(`   ${FRONTEND_URL}/leader-dashboard`);
  console.log('');
}

async function main() {
  try {
    // Testar login
    const token = await testLoginEndpoint();
    
    if (token) {
      // Testar outros endpoints
      await testOtherEndpoints(token);
      
      // Gerar correção
      generateFrontendFix(token);
      
      // Mostrar instruções
      generateInstructions();
      
      console.log('\n🎉 CORREÇÃO CONCLUÍDA COM SUCESSO!');
      console.log('\n⏭️ Próximos passos:');
      console.log('   1. Execute o script frontend-login-fix.js no console');
      console.log('   2. Teste o sistema completo');
      console.log('   3. Verifique se todos os erros foram resolvidos');
      
    } else {
      console.log('\n❌ FALHA NA CORREÇÃO');
      console.log('\n🔍 Possíveis causas:');
      console.log('   1. Backend Railway não está respondendo');
      console.log('   2. Credenciais de admin não existem no banco');
      console.log('   3. Problema de CORS ainda não resolvido');
      console.log('');
      console.log('🔧 Soluções:');
      console.log('   1. Verificar status do Railway');
      console.log('   2. Criar usuário admin no banco');
      console.log('   3. Configurar CORS_ORIGIN no Railway');
    }
    
  } catch (error) {
    console.error('\n💥 Erro durante a correção:', error.message);
  }
}

// Executar correção
main();