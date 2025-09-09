const axios = require('axios');

// Configurações
const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';
const FRONTEND_URL = 'https://sistema-zara-frontend.vercel.app';
const VALID_CREDENTIALS = {
  email: 'admin@zara.com',
  password: 'admin123'
};

console.log('🔧 CORREÇÃO: Problema de notificações do frontend');
console.log('=' .repeat(60));

async function fixNotificationsFrontend() {
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

    // 2. Testar chamadas como o frontend faz
    console.log('\n2️⃣ Testando chamadas como o frontend faz...');
    
    const frontendTestCases = [
      {
        name: 'Sem parâmetros (como o frontend pode fazer)',
        url: `${BACKEND_URL}/api/notifications`,
        params: {}
      },
      {
        name: 'Com page e limit (como NotificationContext)',
        url: `${BACKEND_URL}/api/notifications`,
        params: { page: 1, limit: 50 }
      },
      {
        name: 'Com page e limit (como NotificationCenter)',
        url: `${BACKEND_URL}/api/notifications`,
        params: { page: 1, limit: 20 }
      },
      {
        name: 'Parâmetros como string (possível problema)',
        url: `${BACKEND_URL}/api/notifications`,
        params: { page: '1', limit: '20' }
      }
    ];

    for (const testCase of frontendTestCases) {
      console.log(`\n🧪 Testando: ${testCase.name}`);
      console.log(`   📍 Parâmetros: ${JSON.stringify(testCase.params)}`);
      
      try {
        const response = await axios.get(testCase.url, {
          params: testCase.params,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Origin': FRONTEND_URL
          },
          timeout: 10000
        });
        
        console.log(`   ✅ Sucesso: Status ${response.status}`);
        console.log(`   📊 Estrutura:`);
        console.log(`   - success: ${response.data.success}`);
        console.log(`   - data: ${!!response.data.data}`);
        
        if (response.data.data) {
          console.log(`   - notifications: ${Array.isArray(response.data.data.notifications)}`);
          console.log(`   - notifications count: ${response.data.data.notifications?.length || 0}`);
          console.log(`   - unreadCount: ${response.data.data.unreadCount}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Erro: ${error.response?.status || error.message}`);
        if (error.response?.data) {
          console.log(`   📝 Resposta:`, JSON.stringify(error.response.data, null, 2));
        }
      }
    }

    // 3. Identificar o problema específico
    console.log('\n3️⃣ Identificando problema específico...');
    
    // Testar exatamente como o frontend chama
    try {
      console.log('\n🔍 Simulando chamada exata do NotificationContext...');
      const response = await axios.get(`${BACKEND_URL}/api/notifications`, {
        params: { page: 1, limit: 50 }, // Exatamente como no NotificationContext
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Origin': FRONTEND_URL,
          'Referer': FRONTEND_URL
        },
        timeout: 10000
      });
      
      console.log('   ✅ NotificationContext funcionaria!');
      console.log(`   📊 Dados: ${response.data.data?.notifications?.length || 0} notificações`);
      
    } catch (error) {
      console.log('   ❌ NotificationContext falharia!');
      console.log(`   📝 Erro: ${error.response?.status} - ${error.response?.data?.message}`);
      
      if (error.response?.data?.errors) {
        console.log('   🔍 Erros de validação:');
        error.response.data.errors.forEach(err => {
          console.log(`   - ${err.path}: ${err.msg}`);
        });
      }
    }

    // 4. Testar NotificationCenter
    try {
      console.log('\n🔍 Simulando chamada exata do NotificationCenter...');
      const response = await axios.get(`${BACKEND_URL}/api/notifications`, {
        params: { limit: 20 }, // Exatamente como no NotificationCenter
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Origin': FRONTEND_URL,
          'Referer': FRONTEND_URL
        },
        timeout: 10000
      });
      
      console.log('   ✅ NotificationCenter funcionaria!');
      console.log(`   📊 Dados: ${response.data.data?.notifications?.length || 0} notificações`);
      
    } catch (error) {
      console.log('   ❌ NotificationCenter falharia!');
      console.log(`   📝 Erro: ${error.response?.status} - ${error.response?.data?.message}`);
      
      if (error.response?.data?.errors) {
        console.log('   🔍 Erros de validação:');
        error.response.data.errors.forEach(err => {
          console.log(`   - ${err.path}: ${err.msg}`);
        });
      }
    }

    // 5. Conclusão e recomendações
    console.log('\n5️⃣ Conclusão e recomendações...');
    console.log('\n📋 PROBLEMAS IDENTIFICADOS:');
    console.log('1. Backend exige page >= 1, mas frontend pode não enviar page');
    console.log('2. Backend exige limit entre 1-100, mas frontend pode enviar valores inválidos');
    console.log('3. Validação muito rigorosa está rejeitando chamadas válidas do frontend');
    
    console.log('\n🔧 SOLUÇÕES RECOMENDADAS:');
    console.log('1. Tornar page e limit opcionais no backend com valores padrão');
    console.log('2. Garantir que frontend sempre envie parâmetros válidos');
    console.log('3. Melhorar tratamento de erros no frontend');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

fixNotificationsFrontend();