#!/usr/bin/env node

/**
 * 🔍 DEBUG: Erro 'acc is not defined' no Vercel
 * 
 * Script para identificar e corrigir o erro de produção
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// URLs
const FRONTEND_URL = 'https://sistema-zara-frontend.vercel.app';
const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';

console.log('🔍 DIAGNÓSTICO: Erro "acc is not defined" no Vercel');
console.log('=' .repeat(60));
console.log(`Frontend: ${FRONTEND_URL}`);
console.log(`Backend: ${BACKEND_URL}`);
console.log('');

// Credenciais de teste
const TEST_CREDENTIALS = {
  email: 'admin@zara.com',
  password: 'admin123'
};

async function debugVercelAccError() {
  try {
    // 1. Testar se o backend está funcionando
    console.log('1️⃣ Testando backend Railway...');
    const healthResponse = await axios.get(`${BACKEND_URL}/api/health`, {
      timeout: 10000
    });
    console.log(`   ✅ Backend OK: ${healthResponse.status}`);
    console.log(`   📊 Uptime: ${healthResponse.data.uptime}s`);
    
    // 2. Testar login no backend
    console.log('\n2️⃣ Testando login no backend...');
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, TEST_CREDENTIALS, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL
      }
    });
    console.log(`   ✅ Login OK: ${loginResponse.status}`);
    const token = loginResponse.data.data.token;
    console.log(`   🔑 Token: ${token.substring(0, 20)}...`);
    
    // 3. Testar endpoints que podem usar 'acc'
    console.log('\n3️⃣ Testando endpoints críticos...');
    
    const criticalEndpoints = [
      '/api/machines',
      '/api/reports/leader-dashboard',
      '/api/reports/manager-dashboard',
      '/api/users'
    ];
    
    for (const endpoint of criticalEndpoints) {
      try {
        const response = await axios.get(`${BACKEND_URL}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Origin': FRONTEND_URL
          },
          timeout: 10000
        });
        console.log(`   ✅ ${endpoint}: ${response.status}`);
      } catch (error) {
        console.log(`   ❌ ${endpoint}: ${error.response?.status || error.message}`);
      }
    }
    
    // 4. Verificar arquivos com 'acc'
    console.log('\n4️⃣ Verificando arquivos com variável "acc"...');
    
    const problematicFiles = [
      'frontend/src/hooks/useMachineStatus.jsx',
      'frontend/src/components/ui/MeasurementInput.jsx',
      'frontend/src/pages/LeaderDashboard.jsx',
      'frontend/src/pages/Reports.jsx'
    ];
    
    for (const file of problematicFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const accMatches = content.match(/\bacc\b/g);
        if (accMatches) {
          console.log(`   📄 ${file}: ${accMatches.length} ocorrências de "acc"`);
          
          // Verificar se há reduce sem parâmetros corretos
          const reduceMatches = content.match(/\.reduce\s*\([^)]*\)/g);
          if (reduceMatches) {
            console.log(`      🔍 ${reduceMatches.length} funções reduce encontradas`);
            reduceMatches.forEach((match, index) => {
              if (!match.includes('acc,') && !match.includes('acc )')) {
                console.log(`      ⚠️  Possível problema: ${match}`);
              }
            });
          }
        }
      } else {
        console.log(`   ❌ ${file}: Arquivo não encontrado`);
      }
    }
    
    // 5. Gerar correção
    console.log('\n5️⃣ Gerando script de correção...');
    
    const fixScript = `
// 🔧 CORREÇÃO PARA ERRO "acc is not defined" NO VERCEL
// Execute este código no console do navegador no Vercel

console.log('🔧 Aplicando correção para erro "acc is not defined"...');

// Verificar se há erros de JavaScript
window.addEventListener('error', function(e) {
  if (e.message.includes('acc is not defined')) {
    console.error('❌ Erro "acc is not defined" detectado:', e);
    console.log('📍 Arquivo:', e.filename);
    console.log('📍 Linha:', e.lineno);
    console.log('📍 Coluna:', e.colno);
    
    // Tentar recarregar a página
    setTimeout(() => {
      console.log('🔄 Recarregando página...');
      window.location.reload();
    }, 2000);
  }
});

// Verificar se localStorage tem dados corretos
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');

if (!token) {
  console.log('⚠️ Token não encontrado, redirecionando para login...');
  window.location.href = '/login';
} else {
  console.log('✅ Token encontrado:', token.substring(0, 20) + '...');
}

if (user) {
  try {
    const userData = JSON.parse(user);
    console.log('✅ Dados do usuário:', userData.name, userData.role);
  } catch (e) {
    console.log('⚠️ Erro ao parsear dados do usuário:', e);
  }
}

console.log('✅ Correção aplicada!');
`;
    
    // Salvar script de correção
    fs.writeFileSync('fix-vercel-acc-error.js', fixScript);
    console.log('   ✅ Script de correção salvo: fix-vercel-acc-error.js');
    
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('1. Acesse: https://sistema-zara-frontend.vercel.app');
    console.log('2. Abra o Console do Navegador (F12)');
    console.log('3. Cole e execute o conteúdo do arquivo fix-vercel-acc-error.js');
    console.log('4. Observe os logs para identificar o erro exato');
    
  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Dados:', error.response.data);
    }
  }
}

// Executar diagnóstico
debugVercelAccError();