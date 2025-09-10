// Teste de login na URL do Railway que está funcionando
const https = require('https');

const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';

// Credenciais para testar
const credentials = [
  { email: 'admin@zara.com', password: 'admin123' },
  { email: 'admin@zara.com', password: '123456' },
  { email: 'lucas@zara.com', password: '123456' },
  { email: 'demo@zara.com', password: '123456' },
  { email: 'user@zara.com', password: '123456' }
];

async function testLogin(email, password) {
  const loginUrl = `${BACKEND_URL}/api/auth/login`;
  const postData = JSON.stringify({ email, password });
  
  return new Promise((resolve) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 10000
    };
    
    const request = https.request(loginUrl, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            email,
            status: res.statusCode,
            success: res.statusCode === 200,
            response
          });
        } catch (e) {
          resolve({
            email,
            status: res.statusCode,
            success: false,
            error: 'Invalid JSON response',
            rawResponse: data
          });
        }
      });
    });
    
    request.on('error', (error) => {
      resolve({
        email,
        status: 'ERROR',
        success: false,
        error: error.message
      });
    });
    
    request.write(postData);
    request.end();
  });
}

async function testMachinesEndpoint(token) {
  const machinesUrl = `${BACKEND_URL}/api/machines`;
  
  return new Promise((resolve) => {
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    };
    
    const request = https.request(machinesUrl, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            status: res.statusCode,
            success: res.statusCode === 200,
            machines: response
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            success: false,
            error: 'Invalid JSON response',
            rawResponse: data
          });
        }
      });
    });
    
    request.on('error', (error) => {
      resolve({
        status: 'ERROR',
        success: false,
        error: error.message
      });
    });
    
    request.end();
  });
}

async function main() {
  console.log('🔐 Testando login na URL do Railway que funciona...');
  console.log(`📡 Backend: ${BACKEND_URL}\n`);
  
  let validToken = null;
  let validCredentials = null;
  
  for (const cred of credentials) {
    console.log(`🧪 Testando: ${cred.email}`);
    const result = await testLogin(cred.email, cred.password);
    
    if (result.success) {
      console.log(`✅ Login bem-sucedido!`);
      console.log(`   👤 Usuário: ${result.response.user?.name || 'N/A'}`);
      console.log(`   🎭 Role: ${result.response.user?.role || 'N/A'}`);
      console.log(`   🔑 Token: ${result.response.token?.substring(0, 20)}...`);
      
      validToken = result.response.token;
      validCredentials = cred;
      break;
    } else {
      console.log(`❌ Falha: ${result.status} - ${result.error || result.response?.message || 'Erro desconhecido'}`);
    }
  }
  
  if (validToken) {
    console.log('\n🏭 Testando endpoint de máquinas...');
    const machinesResult = await testMachinesEndpoint(validToken);
    
    if (machinesResult.success) {
      console.log(`✅ Máquinas carregadas: ${machinesResult.machines?.length || 0}`);
      if (machinesResult.machines?.length > 0) {
        console.log('   📋 Primeiras máquinas:');
        machinesResult.machines.slice(0, 3).forEach((machine, i) => {
          console.log(`   ${i + 1}. ${machine.name} (${machine.status})`);
        });
      }
    } else {
      console.log(`❌ Erro ao carregar máquinas: ${machinesResult.status} - ${machinesResult.error || 'Erro desconhecido'}`);
    }
    
    console.log('\n🎯 CREDENCIAIS VÁLIDAS ENCONTRADAS:');
    console.log(`   📧 Email: ${validCredentials.email}`);
    console.log(`   🔐 Password: ${validCredentials.password}`);
    console.log(`   🔑 Token: ${validToken.substring(0, 30)}...`);
    
  } else {
    console.log('\n❌ Nenhuma credencial válida encontrada!');
    console.log('\n🔧 Possíveis soluções:');
    console.log('1. Verificar se há usuários no banco de dados');
    console.log('2. Criar usuário admin manualmente');
    console.log('3. Verificar configuração de autenticação');
  }
}

main().catch(console.error);