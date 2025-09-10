const axios = require('axios');

// Configuração para servidor local
const API_BASE = 'http://localhost:5000/api';

// Credenciais de teste
const testCredentials = {
  email: 'admin@zara.com',
  password: 'admin123'
};

async function testLeaderDashboardLocal() {
  console.log('🧪 TESTE LOCAL - Leader Dashboard');
  console.log('================================');
  console.log('🌐 Backend URL:', API_BASE);
  
  let authToken = null;
  
  try {
    // 1. Fazer login
    console.log('\n1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, testCredentials);
    
    if (loginResponse.data.success && loginResponse.data.data && loginResponse.data.data.token) {
      authToken = loginResponse.data.data.token;
      console.log('   ✅ Login realizado com sucesso');
      console.log('   📊 Usuário:', loginResponse.data.data.user.name);
      console.log('   🔑 Role:', loginResponse.data.data.user.role);
    } else {
      throw new Error('Login falhou - resposta inválida');
    }
    
    // 2. Testar endpoint leader-dashboard
    console.log('\n2️⃣ Testando endpoint /reports/leader-dashboard...');
    
    const headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };
    
    console.log('   🔍 Headers:', headers);
    
    try {
      const dashboardResponse = await axios.get(`${API_BASE}/reports/leader-dashboard?timeRange=today`, {
        headers
      });
      
      console.log('   ✅ Leader Dashboard: Status', dashboardResponse.status);
      console.log('   📊 Dados recebidos:', JSON.stringify(dashboardResponse.data, null, 2));
      
    } catch (dashboardError) {
      console.log('   ❌ Erro no leader-dashboard:', dashboardError.message);
      console.log('   📊 Status:', dashboardError.response?.status);
      console.log('   📝 Resposta:', JSON.stringify(dashboardError.response?.data, null, 2));
      
      // Salvar detalhes do erro
      const errorDetails = {
        timestamp: new Date().toISOString(),
        url: `${API_BASE}/reports/leader-dashboard?timeRange=today`,
        status: dashboardError.response?.status,
        headers: dashboardError.response?.headers,
        data: dashboardError.response?.data,
        requestHeaders: headers
      };
      
      require('fs').writeFileSync('leader-dashboard-local-error.json', JSON.stringify(errorDetails, null, 2));
      console.log('   💾 Erro salvo em: leader-dashboard-local-error.json');
    }
    
    // 3. Testar outros timeRanges
    console.log('\n3️⃣ Testando diferentes timeRanges...');
    const timeRanges = ['week', 'month'];
    
    for (const timeRange of timeRanges) {
      try {
        console.log(`   🔍 TimeRange: ${timeRange}...`);
        const response = await axios.get(`${API_BASE}/reports/leader-dashboard?timeRange=${timeRange}`, {
          headers
        });
        console.log(`   ✅ ${timeRange}: Status ${response.status}`);
      } catch (error) {
        console.log(`   ❌ ${timeRange}: ${error.response?.status} - ${error.message}`);
      }
    }
    
    // 4. Testar sem timeRange
    console.log('\n4️⃣ Testando sem timeRange...');
    try {
      const response = await axios.get(`${API_BASE}/reports/leader-dashboard`, {
        headers
      });
      console.log('   ✅ Sem timeRange: Status', response.status);
    } catch (error) {
      console.log('   ❌ Sem timeRange:', error.response?.status, '-', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Resposta:', error.response.data);
    }
  }
  
  console.log('\n🏁 Teste local concluído!');
}

// Executar teste
testLeaderDashboardLocal().catch(console.error);