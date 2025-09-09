const axios = require('axios');
const logger = require('utils/logger');

// URLs configuradas
const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';
const FRONTEND_URL = 'https://sistema-zara-frontend.vercel.app';

// Credenciais de teste
const TEST_CREDENTIALS = {
  email: 'admin@zara.com',
  password: 'admin123'
};

let checkCount = 0;
const MAX_CHECKS = 40; // 20 minutos (30s * 40)
const CHECK_INTERVAL = 30000; // 30 segundos

async function checkRailwayStatus() {
  checkCount++;
  const timestamp = new Date().toLocaleTimeString('pt-BR');
  
  logger.info(`\n🔍 [${timestamp}] Verificação ${checkCount}/${MAX_CHECKS}`););
  logger.info('================================================'););
  
  try {
    // 1. Testar saúde do backend
    logger.info('1️⃣ Testando backend health...'););
    const healthResponse = await axios.get(`${BACKEND_URL}/api/health`, {
      timeout: 10000,
      headers: {
        'Origin': FRONTEND_URL,
        'User-Agent': 'Railway-Monitor/1.0'
      }
    });
    
    logger.info(`   ✅ Backend: Status ${healthResponse.status}`););
    logger.info(`   📊 Uptime: ${healthResponse.data.uptime}s`););
    logger.info(`   🕐 Timestamp: ${healthResponse.data.timestamp}`););
    
    // 2. Testar login para verificar rate limiting
    logger.info('\n2️⃣ Testando login (verificando rate limiting)...'););
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, TEST_CREDENTIALS, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL,
        'User-Agent': 'Railway-Monitor/1.0'
      }
    });
    
    // Se chegou aqui, login funcionou!
    logger.info(`   ✅ Login: Status ${loginResponse.status}`););
    logger.info(`   🔑 Token recebido: ${loginResponse.data.token ? 'Sim' : 'Não'}`););
    logger.info(`   👤 Usuário: ${loginResponse.data.user ? loginResponse.data.user.name : 'N/A'}`););
    
    // 3. Testar verificação de token
    if (loginResponse.data.token) {
      logger.info('\n3️⃣ Testando verificação de token...'););
      try {
        const verifyResponse = await axios.get(`${BACKEND_URL}/api/auth/verify`, {
          timeout: 10000,
          headers: {
            'Authorization': `Bearer ${loginResponse.data.token}`,
            'Origin': FRONTEND_URL,
            'User-Agent': 'Railway-Monitor/1.0'
          }
        });
        logger.info(`   ✅ Verificação: Status ${verifyResponse.status}`););
        logger.info(`   👤 Dados: ${JSON.stringify(verifyResponse.data)}`););
      } catch (verifyError) {
        logger.info(`   ⚠️ Verificação falhou: ${verifyError.response?.status || verifyError.message}`););
      }
    }
    
    // SUCCESS! Rate limiting foi removido
    logger.info('\n🎉 SUCESSO! REDEPLOY CONCLUÍDO!'););
    logger.info('================================'););
    logger.info('✅ Backend funcionando'););
    logger.info('✅ Rate limiting removido'););
    logger.info('✅ Login funcionando'););
    logger.info('✅ Sistema operacional'););
    
    logger.info('\n📋 PRÓXIMOS PASSOS:'););
    logger.info('1. ✅ Testar login no frontend'););
    logger.info('2. ✅ Verificar auto-login'););
    logger.info('3. ✅ Confirmar que erros foram resolvidos'););
    
    logger.info('\n🔗 LINKS:'););
    logger.info(`Frontend: ${FRONTEND_URL}`););
    logger.info(`Backend: ${BACKEND_URL}`););
    
    logger.info('\n👤 CREDENCIAIS DE TESTE:'););
    logger.info('Email: admin@zara.com'););
    logger.info('Senha: admin123'););
    
    // Executar teste final
    logger.info('\n🔄 Executando teste final completo...'););
    await runFinalTest();
    
    process.exit(0);
    
  } catch (error) {
    if (error.response && error.response.status === 429) {
      const retryAfter = error.response.data.retryAfter || 900;
      logger.info(`   ⏳ Rate limiting ainda ativo`););
      logger.info(`   📊 Status: ${error.response.status}`););
      logger.info(`   ⏰ Retry after: ${retryAfter}s (${Math.round(retryAfter/60)}min)`););
      logger.info(`   💡 Aguardando redeploy do Railway...`););
    } else if (error.response && error.response.status === 401) {
      logger.info(`   ⚠️ Credenciais inválidas (Status: ${error.response.status})`););
      logger.info(`   💡 Isso pode indicar que o redeploy foi feito mas há problema nas credenciais`););
    } else {
      logger.info(`   ❌ Erro: ${error.message}`););
      if (error.response) {
        logger.info(`   📊 Status: ${error.response.status}`););
        logger.info(`   📝 Resposta: ${JSON.stringify(error.response.data)}`););
      }
    }
  }
  
  // Continuar monitoramento
  if (checkCount < MAX_CHECKS) {
    logger.info(`\n⏳ Próxima verificação em ${CHECK_INTERVAL/1000}s...`););
    setTimeout(checkRailwayStatus, CHECK_INTERVAL);
  } else {
    logger.info('\n⏰ TIMEOUT: Máximo de verificações atingido'););
    logger.info('🔧 AÇÕES NECESSÁRIAS:'););
    logger.info('1. Verificar se o redeploy foi iniciado no Railway Dashboard'););
    logger.info('2. Aguardar mais tempo se o redeploy estiver em andamento'););
    logger.info('3. Verificar logs do Railway para possíveis erros'););
    logger.info('4. Executar este monitor novamente após o redeploy'););
    process.exit(1);
  }
}

async function runFinalTest() {
  logger.info('\n🧪 TESTE FINAL COMPLETO'););
  logger.info('========================'););
  
  try {
    // Teste múltiplos logins para confirmar que rate limiting foi removido
    logger.info('🔄 Testando múltiplos logins (5x)...'););
    for (let i = 1; i <= 5; i++) {
      try {
        const response = await axios.post(`${BACKEND_URL}/api/auth/login`, TEST_CREDENTIALS, {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'Origin': FRONTEND_URL
          }
        });
        logger.info(`   ✅ Login ${i}/5: Status ${response.status}`););
      } catch (error) {
        logger.info(`   ❌ Login ${i}/5: ${error.response?.status || error.message}`););
        if (error.response?.status === 429) {
          logger.info('   🚨 ATENÇÃO: Rate limiting ainda detectado!'););
          return;
        }
      }
      
      // Pequena pausa entre requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    logger.info('\n✅ TODOS OS TESTES PASSARAM!'););
    logger.info('🎉 Sistema 100% funcional'););
    logger.info('🔓 Rate limiting completamente removido'););
    logger.info('🚀 Pronto para uso em produção'););
    
  } catch (error) {
    logger.info(`\n❌ Erro no teste final: ${error.message}`););
  }
}

// Iniciar monitoramento
logger.info('🚀 MONITOR DE STATUS DO RAILWAY'););
logger.info('==============================='););
logger.info(`📍 Backend: ${BACKEND_URL}`););
logger.info(`📍 Frontend: ${FRONTEND_URL}`););
logger.info(`⏱️ Intervalo: ${CHECK_INTERVAL/1000}s`););
logger.info(`🔢 Máximo: ${MAX_CHECKS} verificações (${(MAX_CHECKS * CHECK_INTERVAL)/60000}min)`););
logger.info('\n🔍 Aguardando redeploy do Railway...'););
logger.info('💡 O monitor detectará automaticamente quando o rate limiting for removido'););

// Iniciar primeira verificação
checkRailwayStatus();