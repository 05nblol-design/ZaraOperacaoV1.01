const https = require('https');
const http = require('http');

console.log('🔍 Diagnosticando problema de login no frontend Vercel...');

// 1. Testar se o frontend está acessível
function testFrontend() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'sistema-zara-frontend-kg85kov5j-05nblol-designs-projects.vercel.app',
      port: 443,
      path: '/',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`✅ Frontend Status: ${res.statusCode}`);
      console.log('📋 Frontend Headers:', Object.keys(res.headers));
      resolve(res.statusCode);
    });

    req.on('error', (err) => {
      console.log('❌ Erro ao acessar frontend:', err.message);
      resolve(null);
    });

    req.end();
  });
}

// 2. Testar CORS do backend
function testBackendCORS() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      email: 'admin@zara.com',
      password: 'admin123'
    });

    const options = {
      hostname: 'zara-backend-production-aab3.up.railway.app',
      port: 443,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Origin': 'https://sistema-zara-frontend-kg85kov5j-05nblol-designs-projects.vercel.app',
        'Referer': 'https://sistema-zara-frontend-kg85kov5j-05nblol-designs-projects.vercel.app/'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`\n🔐 Backend Login Status: ${res.statusCode}`);
      console.log('🌐 CORS Headers:');
      console.log('  - Access-Control-Allow-Origin:', res.headers['access-control-allow-origin']);
      console.log('  - Access-Control-Allow-Credentials:', res.headers['access-control-allow-credentials']);
      console.log('  - Access-Control-Allow-Methods:', res.headers['access-control-allow-methods']);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('📄 Response:', response.success ? '✅ Login OK' : '❌ Login Failed');
          resolve(res.statusCode);
        } catch (e) {
          console.log('📄 Response (raw):', data.substring(0, 200));
          resolve(res.statusCode);
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ Erro no backend:', err.message);
      resolve(null);
    });

    req.write(postData);
    req.end();
  });
}

// 3. Testar OPTIONS preflight
function testPreflight() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'zara-backend-production-aab3.up.railway.app',
      port: 443,
      path: '/api/auth/login',
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://sistema-zara-frontend-kg85kov5j-05nblol-designs-projects.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`\n🚀 Preflight Status: ${res.statusCode}`);
      console.log('🎯 Preflight Headers:');
      console.log('  - Access-Control-Allow-Origin:', res.headers['access-control-allow-origin']);
      console.log('  - Access-Control-Allow-Methods:', res.headers['access-control-allow-methods']);
      console.log('  - Access-Control-Allow-Headers:', res.headers['access-control-allow-headers']);
      resolve(res.statusCode);
    });

    req.on('error', (err) => {
      console.log('❌ Erro no preflight:', err.message);
      resolve(null);
    });

    req.end();
  });
}

async function runDiagnostics() {
  console.log('🔍 Iniciando diagnósticos...\n');
  
  await testFrontend();
  await testBackendCORS();
  await testPreflight();
  
  console.log('\n📋 RESUMO:');
  console.log('1. Se Frontend Status = 200: Frontend OK');
  console.log('2. Se Backend Login Status = 200: Backend OK');
  console.log('3. Se Preflight Status = 200: CORS OK');
  console.log('4. Verificar se Access-Control-Allow-Origin inclui o domínio Vercel');
  console.log('\n💡 PRÓXIMOS PASSOS:');
  console.log('- Se CORS estiver OK, problema pode ser no código do frontend');
  console.log('- Se CORS falhar, verificar configuração do backend');
  console.log('- Verificar Network tab no browser para mais detalhes');
}

runDiagnostics().catch(console.error);