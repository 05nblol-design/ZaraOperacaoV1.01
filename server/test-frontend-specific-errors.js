const axios = require('axios');

// URLs configuradas
const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';
const FRONTEND_URL = 'https://sistema-zara-frontend.vercel.app';

// Credenciais válidas
const VALID_CREDENTIALS = {
  email: 'admin@zara.com',
  password: 'admin123'
};

async function testFrontendSpecificErrors() {
  console.log('🔍 TESTE: Erros Específicos do Frontend');
  console.log('==========================================\n');
  
  console.log('📍 Configurações:');
  console.log('Frontend:', FRONTEND_URL);
  console.log('Backend:', BACKEND_URL);
  console.log('');
  
  let authToken = null;
  
  // 1. Fazer login para obter token
  console.log('1️⃣ Fazendo login para obter token...');
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, VALID_CREDENTIALS, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL
      }
    });
    
    if (response.data.success && response.data.data && response.data.data.token) {
      authToken = response.data.data.token;
      console.log('   ✅ Login realizado com sucesso');
      console.log(`   🔑 Token obtido: ${authToken.substring(0, 20)}...`);
    } else {
      console.log('   ❌ Login falhou - estrutura de resposta inesperada');
      console.log('   📊 Resposta:', JSON.stringify(response.data, null, 2));
      return;
    }
  } catch (error) {
    console.log(`   ❌ Erro no login: ${error.message}`);
    if (error.response) {
      console.log(`   📊 Status: ${error.response.status}`);
      console.log(`   📝 Resposta: ${JSON.stringify(error.response.data)}`);
    }
    return;
  }
  
  // 2. Testar endpoint de notificações
  console.log('\n2️⃣ Testando endpoint de notificações...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/notifications?page=1&limit=10`, {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Origin': FRONTEND_URL
      }
    });
    
    console.log(`   ✅ Notificações: Status ${response.status}`);
    console.log('   📊 Estrutura da resposta:');
    console.log('   - success:', response.data.success);
    console.log('   - data:', !!response.data.data);
    
    if (response.data.data) {
      console.log('   - notifications:', Array.isArray(response.data.data.notifications));
      console.log('   - notifications count:', response.data.data.notifications?.length || 0);
      console.log('   - unreadCount:', response.data.data.unreadCount);
    }
  } catch (error) {
    console.log(`   ❌ Erro nas notificações: ${error.message}`);
    if (error.response) {
      console.log(`   📊 Status: ${error.response.status}`);
      console.log(`   📝 Resposta: ${JSON.stringify(error.response.data)}`);
    }
  }
  
  // 3. Testar endpoint de dashboard
  console.log('\n3️⃣ Testando endpoint de dashboard...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/reports/dashboard?timeRange=today`, {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Origin': FRONTEND_URL
      }
    });
    
    console.log(`   ✅ Dashboard: Status ${response.status}`);
    console.log('   📊 Estrutura da resposta:');
    console.log('   - success:', response.data.success);
    console.log('   - data:', !!response.data.data);
    
    if (response.data.data) {
      const data = response.data.data;
      console.log('   - recentActivities:', Array.isArray(data.recentActivities));
      console.log('   - activities count:', data.recentActivities?.length || 0);
      console.log('   - outras propriedades:', Object.keys(data).filter(k => k !== 'recentActivities'));
    }
  } catch (error) {
    console.log(`   ❌ Erro no dashboard: ${error.message}`);
    if (error.response) {
      console.log(`   📊 Status: ${error.response.status}`);
      console.log(`   📝 Resposta: ${JSON.stringify(error.response.data)}`);
    }
  }
  
  // 4. Testar endpoint de dados agregados (se existir)
  console.log('\n4️⃣ Testando endpoint de dados agregados...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/reports/aggregated`, {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Origin': FRONTEND_URL
      }
    });
    
    console.log(`   ✅ Dados agregados: Status ${response.status}`);
    console.log('   📊 Estrutura da resposta:');
    console.log('   - success:', response.data.success);
    console.log('   - data:', !!response.data.data);
  } catch (error) {
    console.log(`   ❌ Erro nos dados agregados: ${error.message}`);
    if (error.response) {
      console.log(`   📊 Status: ${error.response.status}`);
      console.log(`   📝 Resposta: ${JSON.stringify(error.response.data)}`);
    }
  }
  
  // 5. Testar auto-login simulando o frontend
  console.log('\n5️⃣ Testando auto-login (simulando frontend)...');
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'admin@zara.com',
      password: 'admin123'
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL,
        'User-Agent': 'Mozilla/5.0 (compatible; Frontend-Auto-Login)'
      }
    });
    
    console.log(`   ✅ Auto-login: Status ${response.status}`);
    console.log('   📊 Estrutura da resposta:');
    console.log('   - success:', response.data.success);
    console.log('   - data:', !!response.data.data);
    console.log('   - token:', !!response.data.data?.token);
    console.log('   - user:', !!response.data.data?.user);
  } catch (error) {
    console.log(`   ❌ Erro no auto-login: ${error.message}`);
    if (error.response) {
      console.log(`   📊 Status: ${error.response.status}`);
      console.log(`   📝 Resposta: ${JSON.stringify(error.response.data)}`);
    }
  }
  
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log('====================');
  console.log('1. Login: Testado');
  console.log('2. Notificações: Testado');
  console.log('3. Dashboard: Testado');
  console.log('4. Dados Agregados: Testado');
  console.log('5. Auto-login: Testado');
  
  console.log('\n🏁 Teste dos erros específicos do frontend concluído!');
}

// Executar teste
testFrontendSpecificErrors().catch(console.error);