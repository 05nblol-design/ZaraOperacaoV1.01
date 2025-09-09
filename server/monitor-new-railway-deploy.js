const axios = require('axios');
const logger = require('utils/logger');

// Configurações
const BACKEND_URL = 'https://zaraoperacaov101-production.up.railway.app';
const TEST_CREDENTIALS = {
  email: 'admin@zara.com',
  password: 'admin123'
};

const MAX_ATTEMPTS = 40; // 20 minutos (30s cada)
const INTERVAL = 30000; // 30 segundos

let attempt = 0;
let lastUptime = null;

async function testBackendHealth() {
  try {
    const response = await axios.get(`${BACKEND_URL}/health`, {
      timeout: 10000
    });
    return {
      success: true,
      status: response.status,
      uptime: response.data?.uptime || null
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: error.response?.status || 'NO_RESPONSE'
    };
  }
}

async function testLogin() {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, TEST_CREDENTIALS, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: true,
      status: response.status,
      hasToken: !!response.data?.token,
      message: 'Login realizado com sucesso!'
    };
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    
    return {
      success: false,
      status: status,
      error: message,
      isRateLimit: status === 429,
      isServerError: status >= 500
    };
  }
}

async function runVerification() {
  attempt++;
  logger.info(`\n🔍 VERIFICAÇÃO ${attempt}/${MAX_ATTEMPTS} - ${new Date().toLocaleTimeString()}`););
  logger.info('=' .repeat(60)););
  
  // 1. Testar saúde do backend
  logger.info('1️⃣ Testando saúde do backend...'););
  const healthResult = await testBackendHealth();
  
  if (healthResult.success) {
    logger.info(`✅ Backend OK (Status: ${healthResult.status})`););
    
    // Detectar redeploy pelo uptime
    if (healthResult.uptime && lastUptime && healthResult.uptime < lastUptime) {
      logger.info('🚀 REDEPLOY DETECTADO! (Uptime resetado)'););
    }
    lastUptime = healthResult.uptime;
  } else {
    logger.info(`❌ Backend com problemas: ${healthResult.error}`););
    return false;
  }
  
  // 2. Testar login (verificar rate limiting)
  logger.info('\n2️⃣ Testando login...'););
  const loginResult = await testLogin();
  
  if (loginResult.success) {
    logger.info('🎉 LOGIN FUNCIONANDO!'););
    logger.info(`✅ Status: ${loginResult.status}`););
    logger.info(`✅ Token recebido: ${loginResult.hasToken ? 'Sim' : 'Não'}`););
    return true; // Sucesso!
  } else {
    if (loginResult.isRateLimit) {
      logger.info(`⏳ Rate limiting ainda ativo (Status: ${loginResult.status})`););
      logger.info(`📝 Erro: ${loginResult.error}`););
    } else if (loginResult.isServerError) {
      logger.info(`🔥 Erro interno do servidor (Status: ${loginResult.status})`););
      logger.info(`📝 Erro: ${loginResult.error}`););
    } else {
      logger.info(`❌ Erro de login (Status: ${loginResult.status})`););
      logger.info(`📝 Erro: ${loginResult.error}`););
    }
    return false;
  }
}

async function runFinalTest() {
  logger.info('\n🎯 EXECUTANDO TESTE FINAL...'););
  logger.info('=' .repeat(60)););
  
  let successCount = 0;
  const totalTests = 5;
  
  for (let i = 1; i <= totalTests; i++) {
    logger.info(`\nTeste ${i}/${totalTests}:`););
    const result = await testLogin();
    
    if (result.success) {
      successCount++;
      logger.info(`✅ Sucesso (${result.status})`););
    } else {
      logger.info(`❌ Falha (${result.status}): ${result.error}`););
    }
    
    if (i < totalTests) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2s entre testes
    }
  }
  
  logger.info(`\n📊 RESULTADO FINAL: ${successCount}/${totalTests} sucessos`););
  
  if (successCount === totalTests) {
    logger.info('🎉 RATE LIMITING REMOVIDO COM SUCESSO!'););
    logger.info('✅ Sistema pronto para uso!'););
  } else if (successCount > 0) {
    logger.info('⚠️ Rate limiting parcialmente removido'););
    logger.info('🔄 Pode precisar de mais tempo...'););
  } else {
    logger.info('❌ Rate limiting ainda ativo'););
    logger.info('🔧 Verificar configurações do Railway'););
  }
}

async function main() {
  logger.info('🚀 MONITOR DE DEPLOY RAILWAY - REMOÇÃO DE RATE LIMITING'););
  logger.info('=' .repeat(60)););
  logger.info(`📡 Backend: ${BACKEND_URL}`););
  logger.info(`⏱️ Intervalo: ${INTERVAL/1000}s`););
  logger.info(`🔄 Máximo: ${MAX_ATTEMPTS} tentativas (${(MAX_ATTEMPTS * INTERVAL/1000/60).toFixed(1)} min)`););
  logger.info('=' .repeat(60)););
  
  while (attempt < MAX_ATTEMPTS) {
    const success = await runVerification();
    
    if (success) {
      await runFinalTest();
      process.exit(0);
    }
    
    if (attempt < MAX_ATTEMPTS) {
      logger.info(`\n⏳ Aguardando ${INTERVAL/1000}s para próxima verificação...`););
      await new Promise(resolve => setTimeout(resolve, INTERVAL));
    }
  }
  
  logger.info('\n⏰ TEMPO LIMITE ATINGIDO'););
  logger.info('❌ Rate limiting ainda não foi removido'););
  logger.info('🔧 Verificar manualmente o Railway Dashboard'););
  process.exit(1);
}

// Capturar Ctrl+C
process.on('SIGINT', () => {
  logger.info('\n\n🛑 Monitor interrompido pelo usuário'););
  process.exit(0);
});

// Executar
main().catch(error => {
  logger.error('💥 Erro fatal:', error.message););
  process.exit(1);
});