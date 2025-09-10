const axios = require('axios');
const fs = require('fs');

// Configurações
const BACKEND_URL = process.env.BACKEND_URL || 'https://zara-backend-production-aab3.up.railway.app';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://sistema-zara-frontend.vercel.app';

// Credenciais de teste
const TEST_CREDENTIALS = {
  email: 'admin@zara.com',
  password: 'admin123'
};

async function debugLeaderDashboardError() {
  console.log('🔍 DIAGNÓSTICO: Erro ao buscar dados do dashboard (Leader Dashboard)');
  console.log('================================================================');
  console.log(`🌐 Backend URL: ${BACKEND_URL}`);
  console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
  console.log('');

  let authToken = null;

  // 1. Testar autenticação
  console.log('1️⃣ Testando autenticação...');
  try {
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, TEST_CREDENTIALS, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL
      }
    });
    
    if (loginResponse.data.success && loginResponse.data.data && loginResponse.data.data.token) {
      authToken = loginResponse.data.data.token;
      console.log('   ✅ Login realizado com sucesso');
      console.log('   📊 Usuário:', loginResponse.data.data.user.name);
      console.log('   🔑 Role:', loginResponse.data.data.user.role);
    } else {
      throw new Error('Login falhou - resposta inválida');
    }
  } catch (error) {
    console.log(`   ❌ Erro no login: ${error.message}`);
    if (error.response) {
      console.log(`   📊 Status: ${error.response.status}`);
      console.log(`   📝 Resposta: ${JSON.stringify(error.response.data)}`);
    }
    return;
  }

  // 2. Testar endpoint leader-dashboard
  console.log('\n2️⃣ Testando endpoint /reports/leader-dashboard...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/reports/leader-dashboard?timeRange=today`, {
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL
      }
    });
    
    console.log(`   ✅ Leader Dashboard: Status ${response.status}`);
    console.log('   📊 Estrutura da resposta:');
    console.log('   - success:', response.data.success);
    console.log('   - data:', !!response.data.data);
    
    if (response.data.data) {
      const data = response.data.data;
      console.log('   📈 Dados disponíveis:');
      console.log('   - teamPerformance:', !!data.teamPerformance);
      console.log('   - shiftMetrics:', !!data.shiftMetrics);
      console.log('   - alerts:', !!data.alerts);
      console.log('   - teamMembers:', Array.isArray(data.teamMembers) ? data.teamMembers.length : 'N/A');
      console.log('   - supervisedMachines:', Array.isArray(data.supervisedMachines) ? data.supervisedMachines.length : 'N/A');
      console.log('   - recentAlerts:', Array.isArray(data.recentAlerts) ? data.recentAlerts.length : 'N/A');
    }
  } catch (error) {
    console.log(`   ❌ Erro no leader-dashboard: ${error.message}`);
    if (error.response) {
      console.log(`   📊 Status: ${error.response.status}`);
      console.log(`   📝 Resposta: ${JSON.stringify(error.response.data, null, 2)}`);
      
      // Salvar resposta de erro para análise
      const errorData = {
        timestamp: new Date().toISOString(),
        url: `${BACKEND_URL}/api/reports/leader-dashboard?timeRange=today`,
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data
      };
      
      fs.writeFileSync('leader-dashboard-error.json', JSON.stringify(errorData, null, 2));
      console.log('   💾 Erro salvo em: leader-dashboard-error.json');
    }
  }

  // 3. Testar outros endpoints relacionados
  console.log('\n3️⃣ Testando endpoints relacionados...');
  
  const relatedEndpoints = [
    { name: 'Machines', path: '/machines' },
    { name: 'Notifications', path: '/notifications' },
    { name: 'Dashboard Regular', path: '/reports/dashboard' },
    { name: 'Quality Tests', path: '/quality-tests' }
  ];
  
  for (const endpoint of relatedEndpoints) {
    try {
      console.log(`   🔍 ${endpoint.name}...`);
      const response = await axios.get(`${BACKEND_URL}/api${endpoint.path}`, {
        timeout: 15000,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Origin': FRONTEND_URL
        }
      });
      
      console.log(`   ✅ ${endpoint.name}: Status ${response.status}`);
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: ${error.response?.status || 'TIMEOUT'} - ${error.message}`);
    }
  }

  // 4. Verificar banco de dados (através de endpoint de health)
  console.log('\n4️⃣ Verificando conectividade do banco de dados...');
  try {
    const healthResponse = await axios.get(`${BACKEND_URL}/api/health`, {
      timeout: 10000
    });
    
    console.log(`   ✅ Health Check: Status ${healthResponse.status}`);
    if (healthResponse.data.database) {
      console.log('   📊 Database:', healthResponse.data.database.status);
    }
  } catch (error) {
    console.log(`   ❌ Health Check falhou: ${error.message}`);
  }

  // 5. Testar com diferentes timeRanges
  console.log('\n5️⃣ Testando diferentes timeRanges...');
  const timeRanges = ['today', 'week', 'month'];
  
  for (const timeRange of timeRanges) {
    try {
      console.log(`   🔍 TimeRange: ${timeRange}...`);
      const response = await axios.get(`${BACKEND_URL}/api/reports/leader-dashboard?timeRange=${timeRange}`, {
        timeout: 20000,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Origin': FRONTEND_URL
        }
      });
      
      console.log(`   ✅ ${timeRange}: Status ${response.status}`);
    } catch (error) {
      console.log(`   ❌ ${timeRange}: ${error.response?.status || 'TIMEOUT'} - ${error.message}`);
    }
  }

  console.log('\n📊 RESUMO DO DIAGNÓSTICO:');
  console.log('==========================');
  console.log('✅ Autenticação: Funcionando');
  console.log('❓ Leader Dashboard: Verificar logs acima');
  console.log('✅ Outros Endpoints: Verificar logs acima');
  
  console.log('\n🔧 POSSÍVEIS CAUSAS:');
  console.log('=====================');
  console.log('1. 🔍 Erro no middleware requireLeader');
  console.log('2. 📊 Problema na consulta ao banco de dados (Prisma)');
  console.log('3. 🔑 Problema de permissões de role');
  console.log('4. ⏱️ Timeout na consulta (dados muito grandes)');
  console.log('5. 🗄️ Tabelas do banco não existem ou estão vazias');
  
  console.log('\n⏱️ PRÓXIMOS PASSOS:');
  console.log('1. Verificar logs do Railway Dashboard');
  console.log('2. Verificar se o usuário tem role LEADER, MANAGER ou ADMIN');
  console.log('3. Verificar se as tabelas do banco existem (Machine, QualityTest, Notification)');
  console.log('4. Testar endpoint com usuário ADMIN');
  console.log('5. Verificar variáveis de ambiente (DATABASE_URL, JWT_SECRET)');
}

// Executar diagnóstico
debugLeaderDashboardError()
  .then(() => {
    console.log('\n🏁 Diagnóstico do Leader Dashboard concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro no diagnóstico:', error.message);
    process.exit(1);
  });