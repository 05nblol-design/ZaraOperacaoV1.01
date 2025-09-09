const axios = require('axios');

// Configurações
const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';
const credentials = {
  email: 'admin@zara.com',
  password: 'admin123'
};

console.log('🔍 DEBUG: Testando endpoint de notificações em detalhes');
console.log('=' .repeat(60));

async function debugNotifications() {
  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, credentials);
    const token = loginResponse.data.token;
    console.log('   ✅ Login realizado com sucesso');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Testar notificações sem parâmetros
    console.log('\n2️⃣ Testando notificações SEM parâmetros...');
    try {
      const response = await axios.get(`${BACKEND_URL}/api/notifications`, { headers });
      console.log('   ✅ Sucesso sem parâmetros:', response.status);
      console.log('   📊 Dados:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('   ❌ Erro sem parâmetros:', error.response?.status);
      console.log('   📝 Resposta:', JSON.stringify(error.response?.data, null, 2));
    }

    // 3. Testar com parâmetros válidos
    console.log('\n3️⃣ Testando notificações COM parâmetros válidos...');
    const validParams = {
      page: '1',
      limit: '10'
    };
    
    try {
      const response = await axios.get(`${BACKEND_URL}/api/notifications`, { 
        headers,
        params: validParams
      });
      console.log('   ✅ Sucesso com parâmetros válidos:', response.status);
      console.log('   📊 Dados:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('   ❌ Erro com parâmetros válidos:', error.response?.status);
      console.log('   📝 Resposta:', JSON.stringify(error.response?.data, null, 2));
    }

    // 4. Testar com parâmetro read
    console.log('\n4️⃣ Testando com parâmetro read=true...');
    const readParams = {
      page: '1',
      limit: '10',
      read: 'true'
    };
    
    try {
      const response = await axios.get(`${BACKEND_URL}/api/notifications`, { 
        headers,
        params: readParams
      });
      console.log('   ✅ Sucesso com read=true:', response.status);
      console.log('   📊 Dados:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('   ❌ Erro com read=true:', error.response?.status);
      console.log('   📝 Resposta:', JSON.stringify(error.response?.data, null, 2));
    }

    // 5. Testar com parâmetro read=false
    console.log('\n5️⃣ Testando com parâmetro read=false...');
    const unreadParams = {
      page: '1',
      limit: '10',
      read: 'false'
    };
    
    try {
      const response = await axios.get(`${BACKEND_URL}/api/notifications`, { 
        headers,
        params: unreadParams
      });
      console.log('   ✅ Sucesso com read=false:', response.status);
      console.log('   📊 Dados:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('   ❌ Erro com read=false:', error.response?.status);
      console.log('   📝 Resposta:', JSON.stringify(error.response?.data, null, 2));
    }

    // 6. Testar com todos os parâmetros
    console.log('\n6️⃣ Testando com TODOS os parâmetros...');
    const allParams = {
      page: '1',
      limit: '10',
      read: 'true',
      type: 'info',
      priority: 'medium'
    };
    
    try {
      const response = await axios.get(`${BACKEND_URL}/api/notifications`, { 
        headers,
        params: allParams
      });
      console.log('   ✅ Sucesso com todos os parâmetros:', response.status);
      console.log('   📊 Dados:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('   ❌ Erro com todos os parâmetros:', error.response?.status);
      console.log('   📝 Resposta:', JSON.stringify(error.response?.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

debugNotifications();