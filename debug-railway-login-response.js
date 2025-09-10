// Debug detalhado da resposta de login do Railway
const https = require('https');

const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';

async function debugLogin(email, password) {
  const loginUrl = `${BACKEND_URL}/api/auth/login`;
  const postData = JSON.stringify({ email, password });
  
  console.log(`🔍 Fazendo login com: ${email}`);
  console.log(`📡 URL: ${loginUrl}`);
  console.log(`📦 Payload: ${postData}`);
  
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
      console.log(`📊 Status Code: ${res.statusCode}`);
      console.log(`📋 Headers:`, res.headers);
      
      let data = '';
      res.on('data', chunk => {
        data += chunk;
        console.log(`📥 Chunk recebido: ${chunk.toString()}`);
      });
      
      res.on('end', () => {
        console.log(`📄 Response completa: ${data}`);
        console.log(`📏 Tamanho da resposta: ${data.length} bytes`);
        
        try {
          const response = JSON.parse(data);
          console.log(`✅ JSON válido:`, response);
          resolve({
            status: res.statusCode,
            success: res.statusCode === 200,
            response,
            rawData: data
          });
        } catch (e) {
          console.log(`❌ Erro ao parsear JSON: ${e.message}`);
          resolve({
            status: res.statusCode,
            success: false,
            error: 'Invalid JSON response',
            rawData: data
          });
        }
      });
    });
    
    request.on('error', (error) => {
      console.log(`❌ Erro de requisição: ${error.message}`);
      resolve({
        status: 'ERROR',
        success: false,
        error: error.message
      });
    });
    
    request.write(postData);
    request.end();
  });
}

async function testHealthEndpoint() {
  const healthUrl = `${BACKEND_URL}/api/health`;
  
  return new Promise((resolve) => {
    const request = https.get(healthUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            status: res.statusCode,
            success: res.statusCode === 200,
            response
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            success: false,
            rawData: data
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
  });
}

async function main() {
  console.log('🔍 Debug detalhado do login Railway\n');
  
  // Primeiro, testar o health endpoint
  console.log('1️⃣ Testando endpoint de health...');
  const healthResult = await testHealthEndpoint();
  console.log('Health result:', healthResult);
  console.log('');
  
  // Testar diferentes credenciais
  const credentials = [
    { email: 'admin@zara.com', password: '123456' },
    { email: 'lucas@zara.com', password: '123456' },
    { email: 'demo@zara.com', password: '123456' }
  ];
  
  for (let i = 0; i < credentials.length; i++) {
    const cred = credentials[i];
    console.log(`\n${i + 2}️⃣ Testando credencial ${i + 1}:`);
    console.log('=' .repeat(50));
    
    const result = await debugLogin(cred.email, cred.password);
    
    console.log('\n📊 RESULTADO:');
    console.log(`   Status: ${result.status}`);
    console.log(`   Success: ${result.success}`);
    
    if (result.response) {
      console.log('   Response object keys:', Object.keys(result.response));
      if (result.response.token) {
        console.log(`   Token encontrado: ${result.response.token.substring(0, 30)}...`);
      }
      if (result.response.user) {
        console.log('   User data:', result.response.user);
      }
    }
    
    if (result.success) {
      console.log('\n🎉 LOGIN BEM-SUCEDIDO! Parando aqui.');
      break;
    }
    
    // Aguardar um pouco entre tentativas
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

main().catch(console.error);