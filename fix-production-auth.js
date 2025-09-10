const axios = require('axios');
const fs = require('fs');

// URLs de produção
const RAILWAY_API = 'https://zara-backend-production-aab3.up.railway.app/api';
const VERCEL_FRONTEND = 'https://zara-operacao-v1-01.vercel.app';

// Credenciais de teste
const TEST_CREDENTIALS = {
  email: 'lucas@zara.com',
  password: '123456'
};

console.log('🔧 Iniciando correção de autenticação em produção...');

async function testBackendAuth() {
  try {
    console.log('\n1️⃣ Testando login no backend Railway...');
    
    const loginResponse = await axios.post(`${RAILWAY_API}/auth/login`, TEST_CREDENTIALS);
    
    if (loginResponse.data.success) {
      console.log('✅ Login bem-sucedido!');
      console.log('👤 Usuário:', loginResponse.data.data.user.name);
      console.log('🔑 Token gerado:', loginResponse.data.data.token.substring(0, 20) + '...');
      
      return loginResponse.data.data.token;
    } else {
      throw new Error('Login falhou: ' + loginResponse.data.message);
    }
  } catch (error) {
    console.error('❌ Erro no login:', error.message);
    return null;
  }
}

async function testMachineEndpoints(token) {
  try {
    console.log('\n2️⃣ Testando endpoints de máquinas...');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Testar listagem de máquinas
    console.log('📋 Testando GET /machines...');
    const machinesResponse = await axios.get(`${RAILWAY_API}/machines`, { headers });
    
    if (machinesResponse.data.success) {
      console.log('✅ Máquinas carregadas:', machinesResponse.data.data.length);
      
      if (machinesResponse.data.data.length > 0) {
        const firstMachine = machinesResponse.data.data[0];
        console.log('🔧 Primeira máquina:', firstMachine.name, '(ID:', firstMachine.id + ')');
        
        // Testar configuração da máquina
        console.log('⚙️ Testando GET /machines/:id/config...');
        try {
          const configResponse = await axios.get(`${RAILWAY_API}/machines/${firstMachine.id}/config`, { headers });
          
          if (configResponse.data.success) {
            console.log('✅ Configuração carregada com sucesso!');
          } else {
            console.log('⚠️ Erro na configuração:', configResponse.data.message);
          }
        } catch (configError) {
          console.log('❌ Erro ao carregar configuração:', configError.response?.data?.message || configError.message);
        }
        
        return firstMachine.id;
      }
    } else {
      throw new Error('Falha ao carregar máquinas: ' + machinesResponse.data.message);
    }
  } catch (error) {
    console.error('❌ Erro nos endpoints de máquinas:', error.response?.data?.message || error.message);
    return null;
  }
}

async function generateAuthFixScript(token, machineId) {
  console.log('\n3️⃣ Gerando script de correção para o frontend...');
  
  const fixScript = `
// Script de correção de autenticação para produção
// Execute este código no console do navegador em ${VERCEL_FRONTEND}

console.log('🔧 Aplicando correção de autenticação...');

// 1. Limpar dados antigos
localStorage.clear();
sessionStorage.clear();

// 2. Definir token válido
const validToken = '${token}';
localStorage.setItem('token', validToken);

// 3. Definir dados do usuário
const userData = {
  id: 1,
  name: 'Lucas Silva',
  email: 'lucas@zara.com',
  role: 'LEADER',
  permissions: ['canEdit', 'canView', 'canManage']
};
localStorage.setItem('user', JSON.stringify(userData));

// 4. Testar API com token
fetch('${RAILWAY_API}/machines', {
  headers: {
    'Authorization': 'Bearer ' + validToken,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('✅ Token funcionando! Máquinas:', data.data.length);
    
    // Testar configuração da primeira máquina
    if (data.data.length > 0) {
      const machineId = data.data[0].id;
      return fetch('${RAILWAY_API}/machines/' + machineId + '/config', {
        headers: {
          'Authorization': 'Bearer ' + validToken,
          'Content-Type': 'application/json'
        }
      });
    }
  } else {
    throw new Error('Erro na API: ' + data.message);
  }
})
.then(response => response.json())
.then(configData => {
  if (configData.success) {
    console.log('✅ Configuração carregada com sucesso!');
    console.log('🔄 Recarregue a página para ver as correções.');
  } else {
    console.log('⚠️ Erro na configuração:', configData.message);
  }
})
.catch(error => {
  console.error('❌ Erro:', error);
});

console.log('✅ Correção aplicada! Recarregue a página.');
`;
  
  // Salvar script em arquivo
  fs.writeFileSync('fix-frontend-auth-production.js', fixScript);
  console.log('📄 Script salvo em: fix-frontend-auth-production.js');
  
  return fixScript;
}

async function main() {
  try {
    // 1. Testar autenticação no backend
    const token = await testBackendAuth();
    if (!token) {
      console.log('❌ Não foi possível obter token válido. Verifique as credenciais.');
      return;
    }
    
    // 2. Testar endpoints de máquinas
    const machineId = await testMachineEndpoints(token);
    
    // 3. Gerar script de correção
    await generateAuthFixScript(token, machineId);
    
    console.log('\n🎯 INSTRUÇÕES PARA CORREÇÃO:');
    console.log('1. Abra o frontend em produção:', VERCEL_FRONTEND);
    console.log('2. Abra o console do navegador (F12)');
    console.log('3. Cole e execute o conteúdo do arquivo: fix-frontend-auth-production.js');
    console.log('4. Recarregue a página');
    console.log('5. Teste as páginas de máquinas e configurações');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

main();