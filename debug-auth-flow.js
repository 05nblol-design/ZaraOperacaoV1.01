// Script de diagnóstico completo do fluxo de autenticação
const axios = require('axios');

// Configurações
const API_BASE = 'https://zara-backend-production-aab3.up.railway.app/api';
const FRONTEND_ORIGIN = 'https://sistema-zara-frontend-i90xa6vrg-05nblol-designs-projects.vercel.app';

const headers = {
  'Content-Type': 'application/json',
  'Origin': FRONTEND_ORIGIN
};

async function testAuthFlow() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DO FLUXO DE AUTENTICAÇÃO\n');
  
  try {
    // 1. Teste de Login
    console.log('1️⃣ Testando LOGIN...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'teste@zara.com',
      password: '123456'
    }, { headers });
    
    if (loginResponse.data.success) {
      const { token, user } = loginResponse.data.data;
      console.log('✅ LOGIN SUCESSO!');
      console.log(`   Token: ${token.substring(0, 50)}...`);
      console.log(`   Usuário: ${user.name} (${user.role})`);
      
      // 2. Teste de rotas protegidas COM token
      console.log('\n2️⃣ Testando ROTAS PROTEGIDAS com token...');
      const authHeaders = {
        ...headers,
        'Authorization': `Bearer ${token}`
      };
      
      // Teste Quality Tests
      try {
        const qualityResponse = await axios.get(`${API_BASE}/quality-tests`, { headers: authHeaders });
        console.log('✅ /quality-tests: SUCESSO');
        console.log(`   Dados: ${JSON.stringify(qualityResponse.data).substring(0, 100)}...`);
      } catch (error) {
        console.log('❌ /quality-tests: ERRO');
        console.log(`   Erro: ${error.response?.data?.message || error.message}`);
      }
      
      // Teste Machines
      try {
        const machinesResponse = await axios.get(`${API_BASE}/machines`, { headers: authHeaders });
        console.log('✅ /machines: SUCESSO');
        console.log(`   Dados: ${JSON.stringify(machinesResponse.data).substring(0, 100)}...`);
      } catch (error) {
        console.log('❌ /machines: ERRO');
        console.log(`   Erro: ${error.response?.data?.message || error.message}`);
      }
      
      // Teste Dashboard
      try {
        const dashboardResponse = await axios.get(`${API_BASE}/dashboard/stats`, { headers: authHeaders });
        console.log('✅ /dashboard/stats: SUCESSO');
        console.log(`   Dados: ${JSON.stringify(dashboardResponse.data).substring(0, 100)}...`);
      } catch (error) {
        console.log('❌ /dashboard/stats: ERRO');
        console.log(`   Erro: ${error.response?.data?.message || error.message}`);
      }
      
      // 3. Teste de rotas protegidas SEM token
      console.log('\n3️⃣ Testando ROTAS PROTEGIDAS sem token...');
      try {
        const noTokenResponse = await axios.get(`${API_BASE}/quality-tests`, { headers });
        console.log('❌ PROBLEMA: Rota deveria estar protegida!');
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('✅ Proteção funcionando: 401 Unauthorized');
        } else {
          console.log(`❌ Erro inesperado: ${error.response?.status} - ${error.response?.data?.message}`);
        }
      }
      
      // 4. Verificar estrutura do token
      console.log('\n4️⃣ Analisando TOKEN JWT...');
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        try {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          console.log('✅ Token JWT válido');
          console.log(`   User ID: ${payload.userId}`);
          console.log(`   Role: ${payload.role}`);
          console.log(`   Expira em: ${new Date(payload.exp * 1000).toLocaleString()}`);
        } catch (e) {
          console.log('❌ Erro ao decodificar token JWT');
        }
      } else {
        console.log('❌ Token JWT inválido (formato incorreto)');
      }
      
    } else {
      console.log('❌ LOGIN FALHOU!');
      console.log(`   Erro: ${loginResponse.data.message}`);
    }
    
  } catch (error) {
    console.log('❌ ERRO CRÍTICO NO TESTE!');
    console.log(`   Erro: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Dados: ${JSON.stringify(error.response.data)}`);
    }
  }
  
  console.log('\n🏁 DIAGNÓSTICO CONCLUÍDO');
}

// Executar diagnóstico
testAuthFlow().catch(console.error);