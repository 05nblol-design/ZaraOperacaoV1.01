const https = require('https');

console.log('🔍 TESTANDO URLs DO RAILWAY BACKEND:');
console.log('=' .repeat(50));

const urls = [
  'https://zaraoperacaov101-production.up.railway.app/api/health',
  'https://zara-backend-production-aab3.up.railway.app/api/health',
  'https://sistema-zara-backend-production.up.railway.app/api/health',
  'https://zaraoperacaov101-production.up.railway.app/api/auth/health',
  'https://zara-backend-production-aab3.up.railway.app/api/auth/health'
];

let completedTests = 0;
const totalTests = urls.length;

urls.forEach((url, index) => {
  console.log(`\n${index + 1}. Testando: ${url}`);
  
  const req = https.get(url, (res) => {
    console.log(`   ✅ Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log(`   📄 Response:`, response);
      } catch (e) {
        console.log(`   📄 Response (text):`, data.substring(0, 100));
      }
      
      completedTests++;
      if (completedTests === totalTests) {
        console.log('\n' + '=' .repeat(50));
        console.log('🏁 TESTE CONCLUÍDO');
      }
    });
  });
  
  req.on('error', (err) => {
    console.log(`   ❌ Erro: ${err.message}`);
    completedTests++;
    if (completedTests === totalTests) {
      console.log('\n' + '=' .repeat(50));
      console.log('🏁 TESTE CONCLUÍDO');
    }
  });
  
  req.setTimeout(10000, () => {
    console.log(`   ⏰ Timeout: ${url}`);
    req.destroy();
    completedTests++;
    if (completedTests === totalTests) {
      console.log('\n' + '=' .repeat(50));
      console.log('🏁 TESTE CONCLUÍDO');
    }
  });
});