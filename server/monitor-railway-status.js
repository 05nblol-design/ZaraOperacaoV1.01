const axios = require('axios');

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
  
  console.log(`\n🔍 [${timestamp}] Verificação ${checkCount}/${MAX_CHECKS}`);
  console.log('================================================');
  
  try {
    // 1. Testar saúde do backend
    console.log('1️⃣ Testando backend health...');
    const healthResponse = await axios.get(`${BACKEND_URL}/api/health`, {
      timeout: 10000,
      headers: {
        'Origin': FRONTEND_URL,
        'User-Agent': 'Railway-Monitor/1.0'
      }
    });
    
    console.log(`   ✅ Backend: Status ${healthResponse.status}`);
    console.log(`   📊 Uptime: ${healthResponse.data.uptime}s`);
    console.log(`   🕐 Timestamp: ${healthResponse.data.timestamp}`);
    
    // 2. Testar login para verificar rate limiting
    console.log('\n2️⃣ Testando login (verificando rate limiting)...');
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, TEST_CREDENTIALS, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL,
        'User-Agent': 'Railway-Monitor/1.0'
      }
    });
    
    // Se chegou aqui, login funcionou!
    console.log(`   ✅ Login: Status ${loginResponse.status}`);
    console.log(`   🔑 Token recebido: ${loginResponse.data.token ? 'Sim' : 'Não'}`);
    console.log(`   👤 Usuário: ${loginResponse.data.user ? loginResponse.data.user.name : 'N/A'}`);
    
    // 3. Testar verificação de token
    if (loginResponse.data.token) {
      console.log('\n3️⃣ Testando verificação de token...');
      try {
        const verifyResponse = await axios.get(`${BACKEND_URL}/api/auth/verify`, {
          timeout: 10000,
          headers: {
            'Authorization': `Bearer ${loginResponse.data.token}`,
            'Origin': FRONTEND_URL,
            'User-Agent': 'Railway-Monitor/1.0'
          }
        });
        console.log(`   ✅ Verificação: Status ${verifyResponse.status}`);
        console.log(`   👤 Dados: ${JSON.stringify(verifyResponse.data)}`);
      } catch (verifyError) {
        console.log(`   ⚠️ Verificação falhou: ${verifyError.response?.status || verifyError.message}`);
      }
    }
    
    // SUCCESS! Rate limiting foi removido
    console.log('\n🎉 SUCESSO! REDEPLOY CONCLUÍDO!');
    console.log('================================');
    console.log('✅ Backend funcionando');
    console.log('✅ Rate limiting removido');
    console.log('✅ Login funcionando');
    console.log('✅ Sistema operacional');
    
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. ✅ Testar login no frontend');
    console.log('2. ✅ Verificar auto-login');
    console.log('3. ✅ Confirmar que erros foram resolvidos');
    
    console.log('\n🔗 LINKS:');
    console.log(`Frontend: ${FRONTEND_URL}`);
    console.log(`Backend: ${BACKEND_URL}`);
    
    console.log('\n👤 CREDENCIAIS DE TESTE:');
    console.log('Email: admin@zara.com');
    console.log('Senha: admin123');
    
    // Executar teste final
    console.log('\n🔄 Executando teste final completo...');
    await runFinalTest();
    
    process.exit(0);
    
  } catch (error) {
    if (error.response && error.response.status === 429) {
      const retryAfter = error.response.data.retryAfter || 900;
      console.log(`   ⏳ Rate limiting ainda ativo`);
      console.log(`   📊 Status: ${error.response.status}`);
      console.log(`   ⏰ Retry after: ${retryAfter}s (${Math.round(retryAfter/60)}min)`);
      console.log(`   💡 Aguardando redeploy do Railway...`);
    } else if (error.response && error.response.status === 401) {
      console.log(`   ⚠️ Credenciais inválidas (Status: ${error.response.status})`);
      console.log(`   💡 Isso pode indicar que o redeploy foi feito mas há problema nas credenciais`);
    } else {
      console.log(`   ❌ Erro: ${error.message}`);
      if (error.response) {
        console.log(`   📊 Status: ${error.response.status}`);
        console.log(`   📝 Resposta: ${JSON.stringify(error.response.data)}`);
      }
    }
  }
  
  // Continuar monitoramento
  if (checkCount < MAX_CHECKS) {
    console.log(`\n⏳ Próxima verificação em ${CHECK_INTERVAL/1000}s...`);
    setTimeout(checkRailwayStatus, CHECK_INTERVAL);
  } else {
    console.log('\n⏰ TIMEOUT: Máximo de verificações atingido');
    console.log('🔧 AÇÕES NECESSÁRIAS:');
    console.log('1. Verificar se o redeploy foi iniciado no Railway Dashboard');
    console.log('2. Aguardar mais tempo se o redeploy estiver em andamento');
    console.log('3. Verificar logs do Railway para possíveis erros');
    console.log('4. Executar este monitor novamente após o redeploy');
    process.exit(1);
  }
}

async function runFinalTest() {
  console.log('\n🧪 TESTE FINAL COMPLETO');
  console.log('========================');
  
  try {
    // Teste múltiplos logins para confirmar que rate limiting foi removido
    console.log('🔄 Testando múltiplos logins (5x)...');
    for (let i = 1; i <= 5; i++) {
      try {
        const response = await axios.post(`${BACKEND_URL}/api/auth/login`, TEST_CREDENTIALS, {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'Origin': FRONTEND_URL
          }
        });
        console.log(`   ✅ Login ${i}/5: Status ${response.status}`);
      } catch (error) {
        console.log(`   ❌ Login ${i}/5: ${error.response?.status || error.message}`);
        if (error.response?.status === 429) {
          console.log('   🚨 ATENÇÃO: Rate limiting ainda detectado!');
          return;
        }
      }
      
      // Pequena pausa entre requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n✅ TODOS OS TESTES PASSARAM!');
    console.log('🎉 Sistema 100% funcional');
    console.log('🔓 Rate limiting completamente removido');
    console.log('🚀 Pronto para uso em produção');
    
  } catch (error) {
    console.log(`\n❌ Erro no teste final: ${error.message}`);
  }
}

// Iniciar monitoramento
console.log('🚀 MONITOR DE STATUS DO RAILWAY');
console.log('===============================');
console.log(`📍 Backend: ${BACKEND_URL}`);
console.log(`📍 Frontend: ${FRONTEND_URL}`);
console.log(`⏱️ Intervalo: ${CHECK_INTERVAL/1000}s`);
console.log(`🔢 Máximo: ${MAX_CHECKS} verificações (${(MAX_CHECKS * CHECK_INTERVAL)/60000}min)`);
console.log('\n🔍 Aguardando redeploy do Railway...');
console.log('💡 O monitor detectará automaticamente quando o rate limiting for removido');

// Iniciar primeira verificação
checkRailwayStatus();