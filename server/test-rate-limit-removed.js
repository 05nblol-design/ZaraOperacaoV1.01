const axios = require('axios');

// Configuração
const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';
const TEST_CREDENTIALS = {
  email: 'test@test.com', // Credencial inválida para testar rate limiting
  password: 'wrongpassword'
};

/**
 * Testa se o rate limiting foi removido fazendo múltiplas tentativas de login
 */
async function testRateLimitRemoved() {
  console.log('🧪 TESTE: Verificando se Rate Limiting foi removido\n');
  
  console.log('📋 Configuração do teste:');
  console.log(`   Backend: ${BACKEND_URL}`);
  console.log(`   Tentativas: 10 (anteriormente limitado a 5)`);
  console.log(`   Credenciais: ${TEST_CREDENTIALS.email} (inválidas para teste)\n`);
  
  let successCount = 0;
  let errorCount = 0;
  let rateLimitCount = 0;
  
  for (let i = 1; i <= 10; i++) {
    try {
      console.log(`🔄 Tentativa ${i}/10...`);
      
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, TEST_CREDENTIALS, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://sistema-zara-frontend.vercel.app'
        }
      });
      
      console.log(`   ✅ Status: ${response.status}`);
      successCount++;
      
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        console.log(`   📊 Status: ${status}`);
        console.log(`   📝 Resposta: ${JSON.stringify(data)}`);
        
        if (status === 429 || (data && data.error === 'Muitas tentativas de login')) {
          console.log(`   ❌ RATE LIMITING AINDA ATIVO!`);
          rateLimitCount++;
        } else {
          console.log(`   ✅ Sem rate limiting (erro esperado: credenciais inválidas)`);
          errorCount++;
        }
      } else {
        console.log(`   ❌ Erro de conexão: ${error.message}`);
      }
    }
    
    // Pequena pausa entre tentativas
    if (i < 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log('\n📊 RESULTADO DO TESTE:');
  console.log(`   ✅ Tentativas sem rate limiting: ${errorCount}`);
  console.log(`   ❌ Tentativas bloqueadas por rate limiting: ${rateLimitCount}`);
  console.log(`   📡 Tentativas com sucesso: ${successCount}`);
  
  if (rateLimitCount === 0) {
    console.log('\n🎉 SUCESSO: Rate limiting foi removido com sucesso!');
    console.log('   ✅ Sistema permite múltiplas tentativas de login');
    console.log('   ✅ Usuários não serão mais bloqueados por 15 minutos');
  } else {
    console.log('\n⚠️  ATENÇÃO: Rate limiting ainda está ativo!');
    console.log('   ❌ Algumas tentativas foram bloqueadas');
    console.log('   🔧 Pode ser necessário reiniciar o servidor Railway');
  }
  
  console.log('\n🔄 PRÓXIMOS PASSOS:');
  if (rateLimitCount === 0) {
    console.log('   1. ✅ Rate limiting removido - sistema pronto');
    console.log('   2. 🧪 Testar login com credenciais válidas');
    console.log('   3. 🚀 Sistema totalmente funcional');
  } else {
    console.log('   1. 🔄 Fazer redeploy no Railway Dashboard');
    console.log('   2. ⏳ Aguardar 2-3 minutos para aplicar mudanças');
    console.log('   3. 🧪 Executar este teste novamente');
  }
  
  console.log('\n📋 CREDENCIAIS PARA TESTE REAL:');
  console.log('   👤 Admin: admin@zara.com / admin123');
  console.log('   👤 Demo: demo@zara.com / demo123');
}

// Executar teste
testRateLimitRemoved().catch(console.error);