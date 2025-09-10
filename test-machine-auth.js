// Script para testar autenticação com a API de máquinas
const axios = require('axios');

const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';

async function testMachineAuth() {
  console.log('🔧 Testando autenticação com API de máquinas...');
  
  try {
    // 1. Fazer login
    console.log('\n1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'teste@zara.com',
      password: '123456'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login falhou');
    }
    
    const { token, user } = loginResponse.data.data;
    console.log('✅ Login realizado com sucesso!');
    console.log(`👤 Usuário: ${user.name} (${user.role})`);
    
    // 2. Testar endpoint de máquinas
    console.log('\n2️⃣ Testando /api/machines...');
    const machinesResponse = await axios.get(`${BACKEND_URL}/api/machines`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Máquinas carregadas com sucesso!');
    console.log(`📊 Total de máquinas: ${machinesResponse.data.data.length}`);
    
    // 3. Testar máquina específica (ID 1)
    console.log('\n3️⃣ Testando /api/machines/1...');
    const machineResponse = await axios.get(`${BACKEND_URL}/api/machines/1`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Dados da máquina 1 carregados!');
    console.log(`🏭 Máquina: ${machineResponse.data.data.name}`);
    console.log(`📈 Status: ${machineResponse.data.data.status}`);
    
    // 4. Gerar script para o navegador
    console.log('\n4️⃣ Gerando script para o navegador...');
    const browserScript = `
// Cole este script no console do navegador (F12)
// na página https://sistema-zara-frontend.vercel.app

// Limpar dados antigos
localStorage.clear();
sessionStorage.clear();

// Configurar token válido
localStorage.setItem('token', '${token}');
localStorage.setItem('user', JSON.stringify(${JSON.stringify(user)}));

console.log('✅ Token configurado com sucesso!');
console.log('🔄 Recarregando página...');

// Recarregar página
window.location.reload();
`;
    
    console.log('\n📋 SCRIPT PARA O NAVEGADOR:');
    console.log('=' .repeat(50));
    console.log(browserScript);
    console.log('=' .repeat(50));
    
    console.log('\n🎯 INSTRUÇÕES:');
    console.log('1. Abra https://sistema-zara-frontend.vercel.app/machines/1/status');
    console.log('2. Pressione F12 para abrir o console');
    console.log('3. Cole o script acima no console');
    console.log('4. Pressione Enter para executar');
    console.log('5. A página será recarregada com o token válido');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Dados:', error.response.data);
    }
  }
}

testMachineAuth();