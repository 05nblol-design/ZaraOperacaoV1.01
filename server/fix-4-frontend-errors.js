const axios = require('axios');
const logger = require('utils/logger');

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
  logger.info('🔍 DIAGNÓSTICO: 4 Erros do Frontend\n'););
  
  const results = {
    googleFontsInter: null,
    googleFontsJetBrains: null,
    backendHealth: null,
    loginEndpoint: null,
    rateLimitStatus: null
  };
  
  // 1. Testar Google Fonts Inter
  logger.info('1️⃣ Testando Google Fonts Inter...'););
  try {
    const response = await axios.get('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap', {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    logger.info(`   ✅ Google Fonts Inter: Status ${response.status}`););
    results.googleFontsInter = 'OK';
  } catch (error) {
    logger.info(`   ❌ Google Fonts Inter: ${error.message}`););
    results.googleFontsInter = 'ERRO';
  }
  
  // 2. Testar Google Fonts JetBrains Mono
  logger.info('\n2️⃣ Testando Google Fonts JetBrains Mono...'););
  try {
    const response = await axios.get('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap', {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    logger.info(`   ✅ Google Fonts JetBrains: Status ${response.status}`););
    results.googleFontsJetBrains = 'OK';
  } catch (error) {
    logger.info(`   ❌ Google Fonts JetBrains: ${error.message}`););
    results.googleFontsJetBrains = 'ERRO';
  }
  
  // 3. Testar Backend Health (relacionado ao auto-login)
  logger.info('\n3️⃣ Testando Backend Health (auto-login)...'););
  try {
    const response = await axios.get(`${BACKEND_URL}/api/health`, {
      timeout: 10000,
      headers: {
        'Origin': FRONTEND_URL
      }
    });
    logger.info(`   ✅ Backend Health: Status ${response.status}`););
    logger.info(`   📊 Dados: ${JSON.stringify(response.data)}`););
    results.backendHealth = 'OK';
  } catch (error) {
    logger.info(`   ❌ Backend Health: ${error.message}`););
    if (error.response) {
      logger.info(`   📊 Status: ${error.response.status}`););
      logger.info(`   📝 Resposta: ${JSON.stringify(error.response.data)}`););
    }
    results.backendHealth = 'ERRO';
  }
  
  // 4. Testar Login Endpoint
  logger.info('\n4️⃣ Testando Login Endpoint...'););
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
    logger.info(`   ✅ Login Endpoint: Status ${response.status}`););
    results.loginEndpoint = 'OK';
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      logger.info(`   📊 Login Status: ${status}`););
      logger.info(`   📝 Resposta: ${JSON.stringify(data)}`););
      
      if (status === 429 || (data && data.error === 'Muitas tentativas de login')) {
        logger.info(`   ⚠️  RATE LIMITING AINDA ATIVO!`););
        results.rateLimitStatus = 'ATIVO';
        results.loginEndpoint = 'RATE_LIMITED';
      } else if (status === 401 || status === 404) {
        logger.info(`   ✅ Login funcionando (erro esperado: credenciais inválidas)`););
        results.loginEndpoint = 'OK';
        results.rateLimitStatus = 'REMOVIDO';
      } else {
        logger.info(`   ❌ Login com erro inesperado`););
        results.loginEndpoint = 'ERRO';
      }
    } else {
      logger.info(`   ❌ Login Endpoint: ${error.message}`););
      results.loginEndpoint = 'ERRO';
    }
  }
  
  // Resumo dos resultados
  logger.info('\n📊 RESUMO DOS 4 ERROS:'););
  logger.info(`   1. Google Fonts Inter: ${results.googleFontsInter}`););
  logger.info(`   2. Google Fonts JetBrains: ${results.googleFontsJetBrains}`););
  logger.info(`   3. Auto-login (Backend Health): ${results.backendHealth}`););
  logger.info(`   4. Login Endpoint: ${results.loginEndpoint}`););
  
  if (results.rateLimitStatus) {
    logger.info(`   🔒 Rate Limiting: ${results.rateLimitStatus}`););
  }
  
  // Análise e soluções
  logger.info('\n🔧 ANÁLISE E SOLUÇÕES:'););
  
  // Erros de Google Fonts
  if (results.googleFontsInter === 'ERRO' || results.googleFontsJetBrains === 'ERRO') {
    logger.info('\n📝 ERROS DE FONTES:'););
    logger.info('   ❌ Google Fonts não carregando'););
    logger.info('   🔧 Solução: Adicionar fontes locais como fallback'););
    logger.info('   📁 Arquivo: frontend/src/index.css'););
    logger.info('   💡 Alternativa: Usar fontes do sistema (Arial, sans-serif)'););
  }
  
  // Erros de backend
  if (results.backendHealth === 'ERRO') {
    logger.info('\n🔗 ERRO DE BACKEND:'););
    logger.info('   ❌ Backend não responde'););
    logger.info('   🔧 Solução: Verificar Railway Dashboard'););
    logger.info('   🌐 URL: https://railway.app/dashboard'););
  }
  
  // Rate limiting
  if (results.rateLimitStatus === 'ATIVO') {
    logger.info('\n🚫 RATE LIMITING AINDA ATIVO:'););
    logger.info('   ❌ Usuários ainda sendo bloqueados'););
    logger.info('   🔧 Solução: Redeploy necessário no Railway'););
    logger.info('   ⏳ Tempo: 2-3 minutos'););
  } else if (results.rateLimitStatus === 'REMOVIDO') {
    logger.info('\n✅ RATE LIMITING REMOVIDO:'););
    logger.info('   ✅ Login funcionando normalmente'););
    logger.info('   ✅ Usuários não são mais bloqueados'););
  }
  
  // Status geral
  const totalErrors = Object.values(results).filter(r => r === 'ERRO').length;
  const rateLimitError = results.rateLimitStatus === 'ATIVO' ? 1 : 0;
  const actualErrors = totalErrors + rateLimitError;
  
  logger.info('\n🎯 STATUS GERAL:'););
  logger.info(`   📊 Erros encontrados: ${actualErrors}/4`););
  
  if (actualErrors === 0) {
    logger.info('   🎉 TODOS OS ERROS CORRIGIDOS!'););
    logger.info('   ✅ Sistema totalmente funcional'););
  } else {
    logger.info(`   ⚠️  ${actualErrors} erro(s) ainda precisam ser corrigidos`););
  }
  
  logger.info('\n📋 CREDENCIAIS PARA TESTE FINAL:'););
  logger.info('   👤 Admin: admin@zara.com / admin123'););
  logger.info('   👤 Demo: demo@zara.com / demo123'););
  
  return results;
}

// Executar diagnóstico
logger.error(diagnose4FrontendErrors().catch(console.error););