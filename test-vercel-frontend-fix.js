const https = require('https');
const http = require('http');

console.log('🔧 TESTANDO CORREÇÃO DO FRONTEND VERCEL');
console.log('=' .repeat(60));

// URLs para teste
const RAILWAY_BACKEND = 'https://zara-backend-production-aab3.up.railway.app';
const VERCEL_FRONTEND = 'https://sistema-zara-frontend.vercel.app';

// Endpoints críticos para testar
const ENDPOINTS = [
  '/api/health',
  '/api/auth/login',
  '/api/reports/leader-dashboard',
  '/api/machines',
  '/api/users'
];

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Origin': VERCEL_FRONTEND,
        'Referer': VERCEL_FRONTEND,
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          url: url
        });
      });
    });
    
    req.on('error', (error) => {
      reject({ error: error.message, url });
    });
    
    req.setTimeout(15000, () => {
      req.destroy();
      reject({ error: 'Timeout', url });
    });
  });
}

async function testBackendEndpoints() {
  console.log('\n🎯 TESTANDO ENDPOINTS DO BACKEND RAILWAY:');
  console.log('-' .repeat(50));
  
  const results = [];
  
  for (const endpoint of ENDPOINTS) {
    const url = RAILWAY_BACKEND + endpoint;
    console.log(`\n📡 Testando: ${endpoint}`);
    
    try {
      const result = await makeRequest(url);
      console.log(`   ✅ Status: ${result.status}`);
      
      if (result.status === 200) {
        try {
          const json = JSON.parse(result.data);
          console.log(`   📄 Response: ${JSON.stringify(json).substring(0, 100)}...`);
        } catch (e) {
          console.log(`   📄 Response: ${result.data.substring(0, 100)}...`);
        }
      } else {
        console.log(`   📄 Response: ${result.data.substring(0, 200)}`);
      }
      
      results.push({ endpoint, status: result.status, success: result.status < 400 });
      
    } catch (error) {
      console.log(`   ❌ Erro: ${error.error}`);
      results.push({ endpoint, status: 'ERROR', success: false, error: error.error });
    }
  }
  
  return results;
}

async function testLoginFlow() {
  console.log('\n🔐 TESTANDO FLUXO DE LOGIN:');
  console.log('-' .repeat(50));
  
  const loginUrl = RAILWAY_BACKEND + '/api/auth/login';
  const credentials = {
    email: 'admin@zara.com',
    password: 'admin123'
  };
  
  try {
    // Fazer requisição POST para login
    const postData = JSON.stringify(credentials);
    
    const result = await new Promise((resolve, reject) => {
      const req = https.request(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Origin': VERCEL_FRONTEND,
          'Referer': VERCEL_FRONTEND
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            data: data
          });
        });
      });
      
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
    
    console.log(`✅ Login Status: ${result.status}`);
    
    if (result.status === 200) {
      const loginData = JSON.parse(result.data);
      console.log(`✅ Login bem-sucedido!`);
      console.log(`🎫 Token recebido: ${loginData.token ? 'SIM' : 'NÃO'}`);
      console.log(`👤 Usuário: ${loginData.user?.name || 'N/A'}`);
      
      // Testar endpoint protegido com token
      if (loginData.token) {
        console.log('\n🛡️  Testando endpoint protegido...');
        const protectedUrl = RAILWAY_BACKEND + '/api/reports/leader-dashboard';
        
        try {
          const protectedResult = await makeRequest(protectedUrl, {
            headers: {
              'Authorization': `Bearer ${loginData.token}`
            }
          });
          
          console.log(`✅ Endpoint protegido Status: ${protectedResult.status}`);
          if (protectedResult.status === 200) {
            console.log(`✅ Dados do dashboard carregados com sucesso!`);
          } else {
            console.log(`❌ Erro no dashboard: ${protectedResult.data.substring(0, 200)}`);
          }
          
        } catch (error) {
          console.log(`❌ Erro no endpoint protegido: ${error.error}`);
        }
      }
      
    } else {
      console.log(`❌ Falha no login: ${result.data}`);
    }
    
  } catch (error) {
    console.log(`❌ Erro no teste de login: ${error.message}`);
  }
}

async function generateFrontendFix() {
  console.log('\n🔧 GERANDO SCRIPT DE CORREÇÃO PARA O FRONTEND:');
  console.log('-' .repeat(50));
  
  const fixScript = `
// SCRIPT DE CORREÇÃO PARA O FRONTEND VERCEL
// Execute este código no console do navegador em https://sistema-zara-frontend.vercel.app

console.log('🔧 Aplicando correção de URLs...');

// 1. Limpar localStorage antigo
localStorage.clear();
console.log('✅ LocalStorage limpo');

// 2. Definir URLs corretas
window.RAILWAY_API_URL = '${RAILWAY_BACKEND}/api';
window.RAILWAY_SOCKET_URL = '${RAILWAY_BACKEND}';
console.log('✅ URLs definidas:', {
  api: window.RAILWAY_API_URL,
  socket: window.RAILWAY_SOCKET_URL
});

// 3. Forçar reload da página
console.log('🔄 Recarregando página...');
window.location.reload();
`;
  
  console.log(fixScript);
  
  // Salvar script em arquivo
  const fs = require('fs');
  fs.writeFileSync('frontend-vercel-fix.js', fixScript);
  console.log('\n💾 Script salvo em: frontend-vercel-fix.js');
}

async function main() {
  try {
    // 1. Testar endpoints do backend
    const backendResults = await testBackendEndpoints();
    
    // 2. Testar fluxo de login
    await testLoginFlow();
    
    // 3. Gerar script de correção
    await generateFrontendFix();
    
    // 4. Resumo final
    console.log('\n📊 RESUMO DOS TESTES:');
    console.log('=' .repeat(60));
    
    const successfulEndpoints = backendResults.filter(r => r.success).length;
    const totalEndpoints = backendResults.length;
    
    console.log(`✅ Endpoints funcionando: ${successfulEndpoints}/${totalEndpoints}`);
    
    if (successfulEndpoints === totalEndpoints) {
      console.log('🎉 BACKEND RAILWAY ESTÁ FUNCIONANDO PERFEITAMENTE!');
      console.log('\n🔧 PRÓXIMOS PASSOS:');
      console.log('1. Execute o script frontend-vercel-fix.js no console do navegador');
      console.log('2. Acesse https://sistema-zara-frontend.vercel.app/leader-dashboard');
      console.log('3. Faça login com admin@zara.com / admin123');
    } else {
      console.log('⚠️  Alguns endpoints não estão funcionando');
      console.log('Verifique os logs do Railway para mais detalhes');
    }
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

// Executar testes
main();