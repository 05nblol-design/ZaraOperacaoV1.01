const axios = require('axios');

// Configurações
const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';
const credentials = {
  email: 'admin@zara.com',
  password: 'admin123'
};

console.log('🔍 TESTE SIMPLES: Verificando rota de notificações');
console.log('=' .repeat(50));

async function testNotificationsRoute() {
  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, credentials);
    const token = loginResponse.data.data.token;
    console.log('   ✅ Login realizado com sucesso');
    console.log('   🔑 Token:', token ? token.substring(0, 20) + '...' : 'Token não encontrado');
    
    if (!token) {
      console.log('   ❌ Token não foi retornado no login');
      console.log('   📊 Resposta do login:', JSON.stringify(loginResponse.data, null, 2));
      return;
    }
    
    // 2. Testar se a rota existe (sem autenticação)
    console.log('\n2️⃣ Testando se a rota existe (sem auth)...');
    try {
      const response = await axios.get(`${BACKEND_URL}/api/notifications`);
      console.log('   ✅ Rota existe e retornou:', response.status);
    } catch (error) {
      console.log('   📊 Status da resposta:', error.response?.status);
      console.log('   📝 Mensagem:', error.response?.data?.message || error.message);
      if (error.response?.status === 401) {
        console.log('   ✅ Rota existe (erro 401 é esperado sem auth)');
      } else if (error.response?.status === 404) {
        console.log('   ❌ Rota NÃO existe (erro 404)');
      }
    }

    // 3. Testar com token válido
    console.log('\n3️⃣ Testando com token válido...');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    try {
      const response = await axios.get(`${BACKEND_URL}/api/notifications`, { headers });
      console.log('   ✅ Sucesso com token:', response.status);
      console.log('   📊 Dados recebidos:', Object.keys(response.data));
    } catch (error) {
      console.log('   ❌ Erro com token válido:', error.response?.status);
      console.log('   📝 Resposta:', JSON.stringify(error.response?.data, null, 2));
      
      // Verificar se é problema de validação ou autenticação
      if (error.response?.status === 400) {
        console.log('   🔍 Problema de validação detectado');
      } else if (error.response?.status === 401) {
        console.log('   🔍 Problema de autenticação detectado');
      }
    }

    // 4. Testar outros endpoints para comparação
    console.log('\n4️⃣ Testando outros endpoints para comparação...');
    
    // Testar dashboard
    try {
      const dashResponse = await axios.get(`${BACKEND_URL}/api/reports/dashboard`, { headers });
      console.log('   ✅ Dashboard funciona:', dashResponse.status);
    } catch (error) {
      console.log('   ❌ Dashboard falha:', error.response?.status);
    }
    
    // Testar usuários
    try {
      const usersResponse = await axios.get(`${BACKEND_URL}/api/users`, { headers });
      console.log('   ✅ Users funciona:', usersResponse.status);
    } catch (error) {
      console.log('   ❌ Users falha:', error.response?.status);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testNotificationsRoute();