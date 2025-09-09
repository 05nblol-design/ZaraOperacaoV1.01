const axios = require('axios');

// Configurações
const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';
const FRONTEND_URL = 'https://sistema-zara-frontend.vercel.app';
const VALID_CREDENTIALS = {
  email: 'admin@zara.com',
  password: 'admin123'
};

console.log('🔍 TESTE FINAL: Notificações com headers do frontend');
console.log('=' .repeat(60));

async function testNotificationsFinal() {
  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, VALID_CREDENTIALS, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL
      }
    });
    
    const token = loginResponse.data.data.token;
    console.log('   ✅ Login realizado com sucesso');
    console.log(`   🔑 Token: ${token.substring(0, 20)}...`);

    // 2. Testar notificações com diferentes configurações de headers
    const testConfigs = [
      {
        name: 'Headers básicos',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      },
      {
        name: 'Headers com Origin',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Origin': FRONTEND_URL
        }
      },
      {
        name: 'Headers completos do frontend',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Origin': FRONTEND_URL,
          'Referer': FRONTEND_URL,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    ];

    for (const config of testConfigs) {
      console.log(`\n🧪 Testando: ${config.name}`);
      
      try {
        const response = await axios.get(`${BACKEND_URL}/api/notifications?page=1&limit=10`, {
          headers: config.headers,
          timeout: 10000
        });
        
        console.log(`   ✅ Sucesso: ${response.status}`);
        console.log(`   📊 Dados: ${JSON.stringify(Object.keys(response.data))}`);
        
        if (response.data.data && response.data.data.notifications) {
          console.log(`   📝 Notificações encontradas: ${response.data.data.notifications.length}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Erro: ${error.response?.status}`);
        console.log(`   📝 Mensagem: ${error.response?.data?.message}`);
        
        if (error.response?.data?.errors) {
          console.log(`   🔍 Erros de validação:`);
          error.response.data.errors.forEach(err => {
            console.log(`     - ${err.path}: ${err.msg} (valor: '${err.value}')`);
          });
        }
      }
    }

    // 3. Testar diferentes URLs de notificações
    console.log('\n🔗 Testando diferentes URLs...');
    const urls = [
      `${BACKEND_URL}/api/notifications`,
      `${BACKEND_URL}/api/notifications?page=1`,
      `${BACKEND_URL}/api/notifications?limit=10`,
      `${BACKEND_URL}/api/notifications?page=1&limit=10`,
      `${BACKEND_URL}/api/notifications?page=1&limit=10&read=false`
    ];

    for (const url of urls) {
      console.log(`\n📍 URL: ${url}`);
      try {
        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
        
        console.log(`   ✅ Sucesso: ${response.status}`);
      } catch (error) {
        console.log(`   ❌ Erro: ${error.response?.status} - ${error.response?.data?.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testNotificationsFinal();