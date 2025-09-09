const axios = require('axios');

// URLs para teste
const BACKEND_URL = 'https://zaraoperacaov101-production.up.railway.app';
const FRONTEND_URL = 'https://sistema-zara-frontend.vercel.app';

// Credenciais de teste
const testCredentials = {
  demo: { email: 'demo@zara.com', password: 'demo123' },
  admin: { email: 'admin@zara.com', password: 'admin123' }
};

async function diagnoseLoginError() {
  console.log('🔍 DIAGNÓSTICO DE ERRO DE LOGIN');
  console.log('================================\n');
  
  console.log('📍 URLs configuradas:');
  console.log('Frontend:', FRONTEND_URL);
  console.log('Backend:', BACKEND_URL);
  console.log('');
  
  // 1. Testar se backend está respondendo
  console.log('1️⃣ Testando conectividade do backend...');
  try {
    const healthResponse = await axios.get(`${BACKEND_URL}/health`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Zara-Diagnostic-Tool/1.0'
      }
    });
    console.log('✅ Backend respondendo:', healthResponse.status);
    console.log('📊 Health data:', healthResponse.data);
  } catch (error) {
    console.log('❌ Backend não responde:');
    console.log('   Status:', error.response?.status || 'N/A');
    console.log('   Erro:', error.message);
    console.log('   Code:', error.code);
    
    if (error.response?.status === 404) {
      console.log('\n🚨 PROBLEMA IDENTIFICADO: Backend retorna 404');
      console.log('   Possíveis causas:');
      console.log('   - Aplicação não foi deployada corretamente');
      console.log('   - DATABASE_URL não configurada no Railway');
      console.log('   - Aplicação falhou ao iniciar');
      console.log('   - URL do Railway mudou');
    }
  }
  
  console.log('\n2️⃣ Testando endpoint de login...');
  try {
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, testCredentials.demo, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Zara-Diagnostic-Tool/1.0'
      }
    });
    console.log('✅ Login funcionando:', loginResponse.status);
    console.log('🔑 Token recebido:', loginResponse.data.token ? 'Sim' : 'Não');
  } catch (error) {
    console.log('❌ Login falhou:');
    console.log('   Status:', error.response?.status || 'N/A');
    console.log('   Erro:', error.message);
    console.log('   Response:', error.response?.data || 'N/A');
  }
  
  console.log('\n3️⃣ Testando CORS...');
  try {
    const corsResponse = await axios.options(`${BACKEND_URL}/api/auth/login`, {
      timeout: 5000,
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    console.log('✅ CORS configurado:', corsResponse.status);
    console.log('🌐 CORS headers:', corsResponse.headers['access-control-allow-origin']);
  } catch (error) {
    console.log('❌ CORS problema:');
    console.log('   Status:', error.response?.status || 'N/A');
    console.log('   Erro:', error.message);
  }
  
  console.log('\n4️⃣ Verificando variáveis de ambiente...');
  console.log('DATABASE_URL configurada:', process.env.DATABASE_URL ? '✅ Sim' : '❌ Não');
  console.log('CORS_ORIGIN configurada:', process.env.CORS_ORIGIN ? '✅ Sim' : '❌ Não');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
  
  console.log('\n📋 RESUMO DO DIAGNÓSTICO:');
  console.log('========================');
  console.log('\n🎯 AÇÕES NECESSÁRIAS:');
  console.log('1. Acessar Railway Dashboard');
  console.log('2. Configurar DATABASE_URL:');
  console.log('   postgresql://postgres:GNquZiBhCMsFDZbvDTevPkrWFdRyyLQM@interchange.proxy.rlwy.net:17733/railway');
  console.log('3. Configurar CORS_ORIGIN:');
  console.log('   https://sistema-zara-frontend.vercel.app');
  console.log('4. Fazer redeploy da aplicação');
  console.log('5. Testar novamente o login');
  
  console.log('\n✅ CREDENCIAIS PARA TESTE:');
  console.log('👤 Demo: demo@zara.com / demo123');
  console.log('👑 Admin: admin@zara.com / admin123');
  
  console.log('\n⏱️ Tempo estimado para correção: 5-10 minutos');
}

// Executar diagnóstico
diagnoseLoginError()
  .then(() => {
    console.log('\n🏁 Diagnóstico concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro no diagnóstico:', error.message);
    process.exit(1);
  });