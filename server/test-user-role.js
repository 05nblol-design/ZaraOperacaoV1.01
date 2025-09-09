const axios = require('axios');

// Configurações
const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';
const VALID_CREDENTIALS = {
  email: 'admin@zara.com',
  password: 'admin123'
};

console.log('🔍 TESTE: Verificando role do usuário admin');
console.log('=' .repeat(50));

async function testUserRole() {
  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, VALID_CREDENTIALS);
    
    console.log('📊 Resposta completa do login:');
    console.log(JSON.stringify(loginResponse.data, null, 2));
    
    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    
    console.log('\n👤 Informações do usuário:');
    console.log('- ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- Nome:', user.name);
    console.log('- Role:', user.role);
    console.log('- Ativo:', user.isActive);
    
    // 2. Testar endpoint que funciona (users)
    console.log('\n2️⃣ Testando endpoint que funciona (/api/users)...');
    try {
      const usersResponse = await axios.get(`${BACKEND_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Users endpoint funciona:', usersResponse.status);
    } catch (error) {
      console.log('❌ Users endpoint falha:', error.response?.status, error.response?.data?.message);
    }
    
    // 3. Testar endpoint que não funciona (notifications)
    console.log('\n3️⃣ Testando endpoint que não funciona (/api/notifications)...');
    try {
      const notificationsResponse = await axios.get(`${BACKEND_URL}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Notifications endpoint funciona:', notificationsResponse.status);
    } catch (error) {
      console.log('❌ Notifications endpoint falha:', error.response?.status, error.response?.data?.message);
      if (error.response?.data?.errors) {
        console.log('🔍 Erros de validação:', error.response.data.errors);
      }
    }
    
    // 4. Testar outros endpoints com requireOperator
    console.log('\n4️⃣ Testando outros endpoints com requireOperator...');
    
    // Testar qualityTests
    try {
      const qualityResponse = await axios.get(`${BACKEND_URL}/api/quality-tests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Quality tests endpoint funciona:', qualityResponse.status);
    } catch (error) {
      console.log('❌ Quality tests endpoint falha:', error.response?.status, error.response?.data?.message);
    }
    
    // Testar machines
    try {
      const machinesResponse = await axios.get(`${BACKEND_URL}/api/machines`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Machines endpoint funciona:', machinesResponse.status);
    } catch (error) {
      console.log('❌ Machines endpoint falha:', error.response?.status, error.response?.data?.message);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testUserRole();