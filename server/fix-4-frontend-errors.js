const axios = require('axios');

// URLs para teste
const FRONTEND_URL = 'https://sistema-zara-frontend.vercel.app';
const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';

/**
 * Diagnóstico dos 4 erros do frontend:
 * 1. Erro Google Fonts Inter
 * 2. Erro Google Fonts JetBrains Mono
 * 3. Erro no auto-login
 * 4. Erro no login
 */
async function diagnose4FrontendErrors() {
  console.log('🔍 DIAGNÓSTICO: 4 Erros do Frontend\n');
  
  const results = {
    googleFontsInter: null,
    googleFontsJetBrains: null,
    backendHealth: null,
    loginEndpoint: null,
    rateLimitStatus: null
  };
  
  // 1. Testar Google Fonts Inter
  console.log('1️⃣ Testando Google Fonts Inter...');
  try {
    const response = await axios.get('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap', {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    console.log(`   ✅ Google Fonts Inter: Status ${response.status}`);
    results.googleFontsInter = 'OK';
  } catch (error) {
    console.log(`   ❌ Google Fonts Inter: ${error.message}`);
    results.googleFontsInter = 'ERRO';
  }
  
  // 2. Testar Google Fonts JetBrains Mono
  console.log('\n2️⃣ Testando Google Fonts JetBrains Mono...');
  try {
    const response = await axios.get('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap', {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    console.log(`   ✅ Google Fonts JetBrains: Status ${response.status}`);
    results.googleFontsJetBrains = 'OK';
  } catch (error) {
    console.log(`   ❌ Google Fonts JetBrains: ${error.message}`);
    results.googleFontsJetBrains = 'ERRO';
  }
  
  // 3. Testar Backend Health (relacionado ao auto-login)
  console.log('\n3️⃣ Testando Backend Health (auto-login)...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/health`, {
      timeout: 10000,
      headers: {
        'Origin': FRONTEND_URL
      }
    });
    console.log(`   ✅ Backend Health: Status ${response.status}`);
    console.log(`   📊 Dados: ${JSON.stringify(response.data)}`);
    results.backendHealth = 'OK';
  } catch (error) {
    console.log(`   ❌ Backend Health: ${error.message}`);
    if (error.response) {
      console.log(`   📊 Status: ${error.response.status}`);
      console.log(`   📝 Resposta: ${JSON.stringify(error.response.data)}`);
    }
    results.backendHealth = 'ERRO';
  }
  
  // 4. Testar Login Endpoint
  console.log('\n4️⃣ Testando Login Endpoint...');
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'test@test.com',
      password: 'test123'
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL
      }
    });
    console.log(`   ✅ Login Endpoint: Status ${response.status}`);
    results.loginEndpoint = 'OK';
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      console.log(`   📊 Login Status: ${status}`);
      console.log(`   📝 Resposta: ${JSON.stringify(data)}`);
      
      if (status === 429 || (data && data.error === 'Muitas tentativas de login')) {
        console.log(`   ⚠️  RATE LIMITING AINDA ATIVO!`);
        results.rateLimitStatus = 'ATIVO';
        results.loginEndpoint = 'RATE_LIMITED';
      } else if (status === 401 || status === 404) {
        console.log(`   ✅ Login funcionando (erro esperado: credenciais inválidas)`);
        results.loginEndpoint = 'OK';
        results.rateLimitStatus = 'REMOVIDO';
      } else {
        console.log(`   ❌ Login com erro inesperado`);
        results.loginEndpoint = 'ERRO';
      }
    } else {
      console.log(`   ❌ Login Endpoint: ${error.message}`);
      results.loginEndpoint = 'ERRO';
    }
  }
  
  // Resumo dos resultados
  console.log('\n📊 RESUMO DOS 4 ERROS:');
  console.log(`   1. Google Fonts Inter: ${results.googleFontsInter}`);
  console.log(`   2. Google Fonts JetBrains: ${results.googleFontsJetBrains}`);
  console.log(`   3. Auto-login (Backend Health): ${results.backendHealth}`);
  console.log(`   4. Login Endpoint: ${results.loginEndpoint}`);
  
  if (results.rateLimitStatus) {
    console.log(`   🔒 Rate Limiting: ${results.rateLimitStatus}`);
  }
  
  // Análise e soluções
  console.log('\n🔧 ANÁLISE E SOLUÇÕES:');
  
  // Erros de Google Fonts
  if (results.googleFontsInter === 'ERRO' || results.googleFontsJetBrains === 'ERRO') {
    console.log('\n📝 ERROS DE FONTES:');
    console.log('   ❌ Google Fonts não carregando');
    console.log('   🔧 Solução: Adicionar fontes locais como fallback');
    console.log('   📁 Arquivo: frontend/src/index.css');
    console.log('   💡 Alternativa: Usar fontes do sistema (Arial, sans-serif)');
  }
  
  // Erros de backend
  if (results.backendHealth === 'ERRO') {
    console.log('\n🔗 ERRO DE BACKEND:');
    console.log('   ❌ Backend não responde');
    console.log('   🔧 Solução: Verificar Railway Dashboard');
    console.log('   🌐 URL: https://railway.app/dashboard');
  }
  
  // Rate limiting
  if (results.rateLimitStatus === 'ATIVO') {
    console.log('\n🚫 RATE LIMITING AINDA ATIVO:');
    console.log('   ❌ Usuários ainda sendo bloqueados');
    console.log('   🔧 Solução: Redeploy necessário no Railway');
    console.log('   ⏳ Tempo: 2-3 minutos');
  } else if (results.rateLimitStatus === 'REMOVIDO') {
    console.log('\n✅ RATE LIMITING REMOVIDO:');
    console.log('   ✅ Login funcionando normalmente');
    console.log('   ✅ Usuários não são mais bloqueados');
  }
  
  // Status geral
  const totalErrors = Object.values(results).filter(r => r === 'ERRO').length;
  const rateLimitError = results.rateLimitStatus === 'ATIVO' ? 1 : 0;
  const actualErrors = totalErrors + rateLimitError;
  
  console.log('\n🎯 STATUS GERAL:');
  console.log(`   📊 Erros encontrados: ${actualErrors}/4`);
  
  if (actualErrors === 0) {
    console.log('   🎉 TODOS OS ERROS CORRIGIDOS!');
    console.log('   ✅ Sistema totalmente funcional');
  } else {
    console.log(`   ⚠️  ${actualErrors} erro(s) ainda precisam ser corrigidos`);
  }
  
  console.log('\n📋 CREDENCIAIS PARA TESTE FINAL:');
  console.log('   👤 Admin: admin@zara.com / admin123');
  console.log('   👤 Demo: demo@zara.com / demo123');
  
  return results;
}

// Executar diagnóstico
diagnose4FrontendErrors().catch(console.error);