const axios = require('axios');

// URLs para monitoramento
const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';
const FRONTEND_URL = 'https://sistema-zara-frontend.vercel.app';

/**
 * Monitor automático do redeploy Railway
 * Verifica a cada 30 segundos se o rate limiting foi removido
 */
async function monitorRailwayRedeploy() {
  console.log('🔍 MONITOR: Aguardando Redeploy Railway\n');
  console.log('📋 INSTRUÇÕES:');
  console.log('   1. Acesse: https://railway.app/dashboard');
  console.log('   2. Encontre: zara-backend-production-aab3');
  console.log('   3. Clique: "Redeploy" ou "Deploy Now"');
  console.log('   4. Aguarde: Este script detectará automaticamente\n');
  
  let attempt = 1;
  const maxAttempts = 20; // 10 minutos máximo
  
  while (attempt <= maxAttempts) {
    console.log(`🔄 Tentativa ${attempt}/${maxAttempts} - ${new Date().toLocaleTimeString()}`);
    
    try {
      // Testar backend health
      const healthResponse = await axios.get(`${BACKEND_URL}/api/health`, {
        timeout: 10000,
        headers: { 'Origin': FRONTEND_URL }
      });
      
      console.log(`   ✅ Backend Health: Status ${healthResponse.status}`);
      
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
      console.log(`   ✅ Login Test: Status ${loginResponse.status}`);
      console.log('   🎉 RATE LIMITING REMOVIDO COM SUCESSO!');
      break;
      
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 429) {
          console.log(`   ⏳ Rate limiting ainda ativo (429) - Aguardando redeploy...`);
          if (data && data.retryAfter) {
            console.log(`   ⏰ Retry após: ${data.retryAfter} segundos`);
          }
        } else if (status === 401 || status === 404) {
          console.log(`   ✅ Login funcionando (${status}) - RATE LIMITING REMOVIDO!`);
          console.log('   🎉 REDEPLOY CONCLUÍDO COM SUCESSO!');
          break;
        } else {
          console.log(`   ⚠️  Status inesperado: ${status}`);
        }
      } else {
        console.log(`   ❌ Erro de conexão: ${error.message}`);
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          console.log('   🔄 Backend pode estar reiniciando...');
        }
      }
    }
    
    if (attempt === maxAttempts) {
      console.log('\n⏰ TIMEOUT: Redeploy não detectado em 10 minutos');
      console.log('\n🔧 PRÓXIMOS PASSOS:');
      console.log('   1. Verificar Railway Dashboard');
      console.log('   2. Confirmar se redeploy foi iniciado');
      console.log('   3. Verificar logs do Railway');
      console.log('   4. Executar: node fix-4-frontend-errors.js');
      break;
    }
    
    // Aguardar 30 segundos antes da próxima tentativa
    console.log('   ⏳ Aguardando 30 segundos...\n');
    await new Promise(resolve => setTimeout(resolve, 30000));
    attempt++;
  }
  
  // Teste final completo
  if (attempt <= maxAttempts) {
    console.log('\n🧪 EXECUTANDO TESTE FINAL COMPLETO...');
    
    try {
      // Executar diagnóstico completo
      const { spawn } = require('child_process');
      const testProcess = spawn('node', ['fix-4-frontend-errors.js'], {
        stdio: 'inherit',
        cwd: __dirname
      });
      
      testProcess.on('close', (code) => {
        if (code === 0) {
          console.log('\n🎉 SISTEMA TOTALMENTE FUNCIONAL!');
          console.log('\n📋 CREDENCIAIS PARA TESTE:');
          console.log('   👤 Admin: admin@zara.com / admin123');
          console.log('   👤 Demo: demo@zara.com / demo123');
          console.log('\n🌐 FRONTEND: https://sistema-zara-frontend.vercel.app');
          console.log('🔗 BACKEND: https://zara-backend-production-aab3.up.railway.app');
        } else {
          console.log('\n⚠️  Teste final com problemas - Verificar logs');
        }
      });
      
    } catch (error) {
      console.log('\n⚠️  Erro ao executar teste final:', error.message);
    }
  }
}

// Executar monitor
monitorRailwayRedeploy().catch(console.error);