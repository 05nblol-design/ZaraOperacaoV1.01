// Teste das duas URLs do Railway encontradas nos arquivos
const https = require('https');
const http = require('http');

const urls = [
  'https://zara-backend-production-aab3.up.railway.app',
  'https://zaraoperacaov101-production.up.railway.app'
];

const endpoints = [
  '',
  '/health',
  '/api',
  '/api/health',
  '/api/auth/login'
];

async function testUrl(url) {
  return new Promise((resolve) => {
    const request = https.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          headers: res.headers,
          body: data.substring(0, 200)
        });
      });
    });
    
    request.on('error', (error) => {
      resolve({
        url,
        status: 'ERROR',
        error: error.message
      });
    });
    
    request.on('timeout', () => {
      request.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        error: 'Request timeout'
      });
    });
  });
}

async function testLogin(baseUrl) {
  const loginUrl = `${baseUrl}/api/auth/login`;
  const postData = JSON.stringify({
    email: 'admin@zara.com',
    password: 'admin123'
  });
  
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
        resolve({
          url: loginUrl,
          status: res.statusCode,
          body: data.substring(0, 300)
        });
      });
    });
    
    request.on('error', (error) => {
      resolve({
        url: loginUrl,
        status: 'ERROR',
        error: error.message
      });
    });
    
    request.write(postData);
    request.end();
  });
}

async function main() {
  console.log('🔍 Testando URLs do Railway encontradas nos arquivos...\n');
  
  for (const baseUrl of urls) {
    console.log(`\n📡 Testando: ${baseUrl}`);
    console.log('=' .repeat(60));
    
    for (const endpoint of endpoints) {
      const fullUrl = baseUrl + endpoint;
      const result = await testUrl(fullUrl);
      
      if (result.status === 'ERROR' || result.status === 'TIMEOUT') {
        console.log(`❌ ${endpoint || '/'}: ${result.error}`);
      } else {
        console.log(`${result.status === 200 ? '✅' : '⚠️'} ${endpoint || '/'}: ${result.status}`);
        if (result.body && result.status === 200) {
          console.log(`   📄 Body: ${result.body.replace(/\n/g, ' ').trim()}`);
        }
      }
    }
    
    // Teste de login se a URL base funcionar
    const healthResult = await testUrl(baseUrl + '/health');
    if (healthResult.status === 200) {
      console.log('\n🔐 Testando login...');
      const loginResult = await testLogin(baseUrl);
      if (loginResult.status === 'ERROR') {
        console.log(`❌ Login: ${loginResult.error}`);
      } else {
        console.log(`${loginResult.status === 200 ? '✅' : '⚠️'} Login: ${loginResult.status}`);
        if (loginResult.body) {
          console.log(`   📄 Response: ${loginResult.body.replace(/\n/g, ' ').trim()}`);
        }
      }
    }
  }
  
  console.log('\n📋 RESUMO:');
  console.log('- Se alguma URL retornar 200, a aplicação está funcionando');
  console.log('- Se todas retornarem 404, a aplicação pode ter sido removida');
  console.log('- Se retornar erro de conexão, pode estar offline temporariamente');
}

main().catch(console.error);