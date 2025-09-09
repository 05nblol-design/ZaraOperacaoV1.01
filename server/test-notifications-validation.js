const axios = require('axios');

// Configurações
const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';
const credentials = {
  email: 'admin@zara.com',
  password: 'admin123'
};

console.log('🔍 TESTE DE VALIDAÇÃO: Notificações');
console.log('=' .repeat(50));

async function testNotificationsValidation() {
  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, credentials);
    const token = loginResponse.data.data.token;
    console.log('   ✅ Login realizado com sucesso');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Testar diferentes combinações de parâmetros
    const testCases = [
      {
        name: 'Sem parâmetros',
        url: `${BACKEND_URL}/api/notifications`,
        params: {}
      },
      {
        name: 'Com page válido',
        url: `${BACKEND_URL}/api/notifications?page=1`,
        params: { page: '1' }
      },
      {
        name: 'Com limit válido',
        url: `${BACKEND_URL}/api/notifications?limit=10`,
        params: { limit: '10' }
      },
      {
        name: 'Com read válido',
        url: `${BACKEND_URL}/api/notifications?read=true`,
        params: { read: 'true' }
      },
      {
        name: 'Com type válido',
        url: `${BACKEND_URL}/api/notifications?type=SYSTEM_ALERT`,
        params: { type: 'SYSTEM_ALERT' }
      },
      {
        name: 'Com priority válido',
        url: `${BACKEND_URL}/api/notifications?priority=HIGH`,
        params: { priority: 'HIGH' }
      },
      {
        name: 'Todos os parâmetros válidos',
        url: `${BACKEND_URL}/api/notifications?page=1&limit=10&read=true&type=SYSTEM_ALERT&priority=HIGH`,
        params: { page: '1', limit: '10', read: 'true', type: 'SYSTEM_ALERT', priority: 'HIGH' }
      },
      {
        name: 'Page inválido (0)',
        url: `${BACKEND_URL}/api/notifications?page=0`,
        params: { page: '0' }
      },
      {
        name: 'Limit inválido (101)',
        url: `${BACKEND_URL}/api/notifications?limit=101`,
        params: { limit: '101' }
      },
      {
        name: 'Read inválido',
        url: `${BACKEND_URL}/api/notifications?read=invalid`,
        params: { read: 'invalid' }
      },
      {
        name: 'Type inválido',
        url: `${BACKEND_URL}/api/notifications?type=INVALID_TYPE`,
        params: { type: 'INVALID_TYPE' }
      },
      {
        name: 'Priority inválido',
        url: `${BACKEND_URL}/api/notifications?priority=INVALID_PRIORITY`,
        params: { priority: 'INVALID_PRIORITY' }
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n🧪 Testando: ${testCase.name}`);
      console.log(`   📍 URL: ${testCase.url}`);
      
      try {
        const response = await axios.get(testCase.url, { headers });
        console.log(`   ✅ Sucesso: ${response.status}`);
        console.log(`   📊 Dados: ${JSON.stringify(Object.keys(response.data))}`);
      } catch (error) {
        console.log(`   ❌ Erro: ${error.response?.status}`);
        if (error.response?.data) {
          console.log(`   📝 Resposta:`, JSON.stringify(error.response.data, null, 2));
        }
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testNotificationsValidation();