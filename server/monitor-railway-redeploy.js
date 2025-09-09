const axios = require('axios');
const logger = require('utils/logger');

// URLs para monitoramento
const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';
const FRONTEND_URL = 'https://sistema-zara-frontend.vercel.app';

/**
 * Monitor automático do redeploy Railway
 * Verifica a cada 30 segundos se o rate limiting foi removido
 */
async function monitorRailwayRedeploy() {
  logger.info('🔍 MONITOR: Aguardando Redeploy Railway\n'););
  logger.info('📋 INSTRUÇÕES:'););
  logger.info('   1. Acesse: https://railway.app/dashboard'););
  logger.info('   2. Encontre: zara-backend-production-aab3'););
  logger.info('   3. Clique: "Redeploy" ou "Deploy Now"'););
  logger.info('   4. Aguarde: Este script detectará automaticamente\n'););
  
  let attempt = 1;
  const maxAttempts = 20; // 10 minutos máximo
  
  while (attempt <= maxAttempts) {
    logger.info(`🔄 Tentativa ${attempt}/${maxAttempts} - ${new Date().toLocaleTimeString()}`););
    
    try {
      // Testar backend health
      const healthResponse = await axios.get(`${BACKEND_URL}/api/health`, {
        timeout: 10000,
        headers: { 'Origin': FRONTEND_URL }
      });
      
      logger.info(`   ✅ Backend Health: Status ${healthResponse.status}`););
      
      // Testar rate limiting
      const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email: 'test@test.com',
        password: 'test123'
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Origin': FRONTEND_URL
        }
      });
      
      // Se chegou aqui sem erro 429, rate limiting foi removido
      logger.info(`   ✅ Login Test: Status ${loginResponse.status}`););
      logger.info('   🎉 RATE LIMITING REMOVIDO COM SUCESSO!'););
      break;
      
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 429) {
          logger.info(`   ⏳ Rate limiting ainda ativo (429) - Aguardando redeploy...`););
          if (data && data.retryAfter) {
            logger.info(`   ⏰ Retry após: ${data.retryAfter} segundos`););
          }
        } else if (status === 401 || status === 404) {
          logger.info(`   ✅ Login funcionando (${status}) - RATE LIMITING REMOVIDO!`););
          logger.info('   🎉 REDEPLOY CONCLUÍDO COM SUCESSO!'););
          break;
        } else {
          logger.info(`   ⚠️  Status inesperado: ${status}`););
        }
      } else {
        logger.info(`   ❌ Erro de conexão: ${error.message}`););
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          logger.info('   🔄 Backend pode estar reiniciando...'););
        }
      }
    }
    
    if (attempt === maxAttempts) {
      logger.info('\n⏰ TIMEOUT: Redeploy não detectado em 10 minutos'););
      logger.info('\n🔧 PRÓXIMOS PASSOS:'););
      logger.info('   1. Verificar Railway Dashboard'););
      logger.info('   2. Confirmar se redeploy foi iniciado'););
      logger.info('   3. Verificar logs do Railway'););
      logger.info('   4. Executar: node fix-4-frontend-errors.js'););
      break;
    }
    
    // Aguardar 30 segundos antes da próxima tentativa
    logger.info('   ⏳ Aguardando 30 segundos...\n'););
    await new Promise(resolve => setTimeout(resolve, 30000));
    attempt++;
  }
  
  // Teste final completo
  if (attempt <= maxAttempts) {
    logger.info('\n🧪 EXECUTANDO TESTE FINAL COMPLETO...'););
    
    try {
      // Executar diagnóstico completo
      const { spawn } = require('child_process');
      const testProcess = spawn('node', ['fix-4-frontend-errors.js'], {
        stdio: 'inherit',
        cwd: __dirname
      });
      
      testProcess.on('close', (code) => {
        if (code === 0) {
          logger.info('\n🎉 SISTEMA TOTALMENTE FUNCIONAL!'););
          logger.info('\n📋 CREDENCIAIS PARA TESTE:'););
          logger.info('   👤 Admin: admin@zara.com / admin123'););
          logger.info('   👤 Demo: demo@zara.com / demo123'););
          logger.info('\n🌐 FRONTEND: https://sistema-zara-frontend.vercel.app'););
          logger.info('🔗 BACKEND: https://zara-backend-production-aab3.up.railway.app'););
        } else {
          logger.info('\n⚠️  Teste final com problemas - Verificar logs'););
        }
      });
      
    } catch (error) {
      logger.info('\n⚠️  Erro ao executar teste final:', error.message););
    }
  }
}

// Executar monitor
logger.error(monitorRailwayRedeploy().catch(console.error););