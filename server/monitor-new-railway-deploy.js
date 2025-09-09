const axios = require('axios');

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
  console.log(`\n🔍 VERIFICAÇÃO ${attempt}/${MAX_ATTEMPTS} - ${new Date().toLocaleTimeString()}`);
  console.log('=' .repeat(60));
  
  // 1. Testar saúde do backend
  console.log('1️⃣ Testando saúde do backend...');
  const healthResult = await testBackendHealth();
  
  if (healthResult.success) {
    console.log(`✅ Backend OK (Status: ${healthResult.status})`);
    
    // Detectar redeploy pelo uptime
    if (healthResult.uptime && lastUptime && healthResult.uptime < lastUptime) {
      console.log('🚀 REDEPLOY DETECTADO! (Uptime resetado)');
    }
    lastUptime = healthResult.uptime;
  } else {
    console.log(`❌ Backend com problemas: ${healthResult.error}`);
    return false;
  }
  
  // 2. Testar login (verificar rate limiting)
  console.log('\n2️⃣ Testando login...');
  const loginResult = await testLogin();
  
  if (loginResult.success) {
    console.log('🎉 LOGIN FUNCIONANDO!');
    console.log(`✅ Status: ${loginResult.status}`);
    console.log(`✅ Token recebido: ${loginResult.hasToken ? 'Sim' : 'Não'}`);
    return true; // Sucesso!
  } else {
    if (loginResult.isRateLimit) {
      console.log(`⏳ Rate limiting ainda ativo (Status: ${loginResult.status})`);
      console.log(`📝 Erro: ${loginResult.error}`);
    } else if (loginResult.isServerError) {
      console.log(`🔥 Erro interno do servidor (Status: ${loginResult.status})`);
      console.log(`📝 Erro: ${loginResult.error}`);
    } else {
      console.log(`❌ Erro de login (Status: ${loginResult.status})`);
      console.log(`📝 Erro: ${loginResult.error}`);
    }
    return false;
  }
}

async function runFinalTest() {
  console.log('\n🎯 EXECUTANDO TESTE FINAL...');
  console.log('=' .repeat(60));
  
  let successCount = 0;
  const totalTests = 5;
  
  for (let i = 1; i <= totalTests; i++) {
    console.log(`\nTeste ${i}/${totalTests}:`);
    const result = await testLogin();
    
    if (result.success) {
      successCount++;
      console.log(`✅ Sucesso (${result.status})`);
    } else {
      console.log(`❌ Falha (${result.status}): ${result.error}`);
    }
    
    if (i < totalTests) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2s entre testes
    }
  }
  
  console.log(`\n📊 RESULTADO FINAL: ${successCount}/${totalTests} sucessos`);
  
  if (successCount === totalTests) {
    console.log('🎉 RATE LIMITING REMOVIDO COM SUCESSO!');
    console.log('✅ Sistema pronto para uso!');
  } else if (successCount > 0) {
    console.log('⚠️ Rate limiting parcialmente removido');
    console.log('🔄 Pode precisar de mais tempo...');
  } else {
    console.log('❌ Rate limiting ainda ativo');
    console.log('🔧 Verificar configurações do Railway');
  }
}

async function main() {
  console.log('🚀 MONITOR DE DEPLOY RAILWAY - REMOÇÃO DE RATE LIMITING');
  console.log('=' .repeat(60));
  console.log(`📡 Backend: ${BACKEND_URL}`);
  console.log(`⏱️ Intervalo: ${INTERVAL/1000}s`);
  console.log(`🔄 Máximo: ${MAX_ATTEMPTS} tentativas (${(MAX_ATTEMPTS * INTERVAL/1000/60).toFixed(1)} min)`);
  console.log('=' .repeat(60));
  
  while (attempt < MAX_ATTEMPTS) {
    const success = await runVerification();
    
    if (success) {
      await runFinalTest();
      process.exit(0);
    }
    
    if (attempt < MAX_ATTEMPTS) {
      console.log(`\n⏳ Aguardando ${INTERVAL/1000}s para próxima verificação...`);
      await new Promise(resolve => setTimeout(resolve, INTERVAL));
    }
  }
  
  console.log('\n⏰ TEMPO LIMITE ATINGIDO');
  console.log('❌ Rate limiting ainda não foi removido');
  console.log('🔧 Verificar manualmente o Railway Dashboard');
  process.exit(1);
}

// Capturar Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n🛑 Monitor interrompido pelo usuário');
  process.exit(0);
});

// Executar
main().catch(error => {
  console.error('💥 Erro fatal:', error.message);
  process.exit(1);
});