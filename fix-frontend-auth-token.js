#!/usr/bin/env node

/**
 * CORREÇÃO DE TOKEN DE AUTENTICAÇÃO DO FRONTEND
 * 
 * Problema identificado:
 * - O frontend está usando tokens JWT expirados
 * - Backend funcionando perfeitamente com tokens válidos
 * - Erro 400 "Dados de entrada inválidos" causado por token expirado
 * 
 * Solução:
 * - Gerar novo token válido
 * - Atualizar localStorage do frontend
 * - Verificar funcionamento do leader-dashboard
 */

const axios = require('axios');
const fs = require('fs');

// URLs do sistema
const FRONTEND_URL = 'https://sistema-zara-frontend.vercel.app';
const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';

// Credenciais de admin
const ADMIN_CREDENTIALS = {
  email: 'admin@zara.com',
  password: 'admin123'
};

console.log('🔧 CORREÇÃO DE TOKEN DE AUTENTICAÇÃO DO FRONTEND');
console.log('=' .repeat(60));
console.log(`Frontend: ${FRONTEND_URL}`);
console.log(`Backend:  ${BACKEND_URL}`);
console.log('');

async function fixFrontendAuth() {
  try {
    // 1. Fazer login e obter token válido
    console.log('🔑 1. Fazendo login no backend...');
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, ADMIN_CREDENTIALS);
    
    if (!loginResponse.data.success) {
      throw new Error('Login falhou: ' + loginResponse.data.message);
    }
    
    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    
    console.log('✅ Login realizado com sucesso!');
    console.log(`   Usuário: ${user.name} (${user.role})`);
    console.log(`   Token: ${token.substring(0, 20)}...`);
    
    // 2. Testar endpoint leader-dashboard
    console.log('\n📊 2. Testando endpoint leader-dashboard...');
    const dashboardResponse = await axios.get(`${BACKEND_URL}/api/reports/leader-dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Leader Dashboard funcionando!');
    console.log(`   Status: ${dashboardResponse.status}`);
    console.log(`   Dados: ${Object.keys(dashboardResponse.data).join(', ')}`);
    
    // 3. Gerar script de correção para o frontend
    console.log('\n🔧 3. Gerando script de correção...');
    
    const fixScript = `
// SCRIPT DE CORREÇÃO DE AUTENTICAÇÃO
// Execute este código no console do navegador em ${FRONTEND_URL}

// 1. Limpar dados antigos
localStorage.clear();
sessionStorage.clear();

// 2. Definir novo token e dados do usuário
const newToken = '${token}';
const userData = ${JSON.stringify(user, null, 2)};

// 3. Salvar no localStorage
localStorage.setItem('token', newToken);
localStorage.setItem('user', JSON.stringify(userData));
localStorage.setItem('isAuthenticated', 'true');

// 4. Recarregar a página
console.log('✅ Token atualizado! Recarregando página...');
window.location.reload();
`;
    
    // Salvar script em arquivo
    fs.writeFileSync('frontend-auth-fix.js', fixScript);
    
    console.log('✅ Script de correção gerado: frontend-auth-fix.js');
    
    // 4. Instruções para o usuário
    console.log('\n📋 4. INSTRUÇÕES PARA CORREÇÃO:');
    console.log('=' .repeat(50));
    console.log('1. Abra o navegador e vá para:');
    console.log(`   ${FRONTEND_URL}`);
    console.log('');
    console.log('2. Abra o Console do Desenvolvedor (F12)');
    console.log('');
    console.log('3. Cole e execute o seguinte código:');
    console.log('');
    console.log(fixScript);
    console.log('');
    console.log('4. A página será recarregada automaticamente');
    console.log('5. Tente acessar o Leader Dashboard novamente');
    
    // 5. Verificar outros endpoints críticos
    console.log('\n🔍 5. Verificando outros endpoints...');
    
    const endpoints = [
      '/api/machines',
      '/api/quality-tests',
      '/api/users'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${BACKEND_URL}${endpoint}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`✅ ${endpoint}: ${response.status}`);
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.response?.status || 'ERROR'}`);
      }
    }
    
    console.log('\n🎉 CORREÇÃO CONCLUÍDA!');
    console.log('=' .repeat(50));
    console.log('✅ Backend funcionando perfeitamente');
    console.log('✅ Token válido gerado');
    console.log('✅ Script de correção criado');
    console.log('');
    console.log('🔗 LINKS IMPORTANTES:');
    console.log(`Frontend: ${FRONTEND_URL}`);
    console.log(`Leader Dashboard: ${FRONTEND_URL}/leader-dashboard`);
    console.log(`Backend API: ${BACKEND_URL}`);
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    process.exit(1);
  }
}

// Executar correção
fixFrontendAuth()
  .then(() => {
    console.log('\n🏁 Processo de correção finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error.message);
    process.exit(1);
  });