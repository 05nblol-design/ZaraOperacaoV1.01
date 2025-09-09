// Script para atualizar CORS_ORIGIN no Railway com URLs corretas
const https = require('https');

console.log('🔧 ATUALIZANDO CORS_ORIGIN NO RAILWAY');
console.log('=' .repeat(50));

// URLs corretas fornecidas pelo usuário
const corsOrigin = 'https://sistema-zara-frontend.vercel.app,https://sistema-zara-frontend-peas4bni7-05nblol-designs-projects.vercel.app,http://localhost:3000,http://localhost:5173';

console.log('\n📋 CONFIGURAÇÃO CORS ATUALIZADA:');
console.log('-'.repeat(40));
console.log(`CORS_ORIGIN=${corsOrigin}`);

// Testar cada URL do CORS
function testUrl(url) {
  return new Promise((resolve) => {
    if (url.startsWith('http://localhost')) {
      resolve({ url, status: 'LOCAL', active: true });
      return;
    }
    
    const req = https.get(url, (res) => {
      resolve({
        url,
        status: res.statusCode,
        active: res.statusCode < 400
      });
    });
    
    req.on('error', () => {
      resolve({
        url,
        status: 'ERROR',
        active: false
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        active: false
      });
    });
  });
}

async function validateCorsUrls() {
  console.log('\n🧪 VALIDANDO URLs DO CORS:');
  console.log('-'.repeat(30));
  
  const urls = corsOrigin.split(',');
  const results = [];
  
  for (const url of urls) {
    console.log(`Testando: ${url}`);
    const result = await testUrl(url.trim());
    results.push(result);
    
    if (result.active) {
      console.log(`✅ VÁLIDA - Status: ${result.status}`);
    } else {
      console.log(`❌ INVÁLIDA - Status: ${result.status}`);
    }
  }
  
  const validUrls = results.filter(r => r.active).length;
  const totalUrls = results.length;
  
  console.log(`\n📊 RESUMO: ${validUrls}/${totalUrls} URLs válidas`);
  
  return results;
}

// Testar conectividade com Railway
function testRailwayBackend() {
  return new Promise((resolve) => {
    const railwayUrl = 'https://zara-backend-production-aab3.up.railway.app';
    
    console.log('\n🚂 TESTANDO BACKEND RAILWAY:');
    console.log('-'.repeat(30));
    console.log(`URL: ${railwayUrl}`);
    
    const req = https.get(railwayUrl, (res) => {
      console.log(`Status: ${res.statusCode}`);
      resolve({
        status: res.statusCode,
        active: res.statusCode < 500
      });
    });
    
    req.on('error', (error) => {
      console.log(`Erro: ${error.message}`);
      resolve({
        status: 'ERROR',
        active: false
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      console.log('Status: TIMEOUT');
      resolve({
        status: 'TIMEOUT',
        active: false
      });
    });
  });
}

async function main() {
  // 1. Validar URLs do CORS
  await validateCorsUrls();
  
  // 2. Testar backend Railway
  const railwayResult = await testRailwayBackend();
  
  // 3. Mostrar instruções
  console.log('\n🚀 INSTRUÇÕES PARA RAILWAY DASHBOARD:');
  console.log('=' .repeat(50));
  
  console.log('\n1️⃣ ACESSE O RAILWAY DASHBOARD:');
  console.log('   https://railway.app/dashboard');
  
  console.log('\n2️⃣ SELECIONE O PROJETO DO BACKEND');
  
  console.log('\n3️⃣ VÁ PARA VARIABLES:');
  console.log('   - Clique na aba "Variables"');
  
  console.log('\n4️⃣ CONFIGURE CORS_ORIGIN:');
  console.log('   - Encontre ou crie a variável CORS_ORIGIN');
  console.log('   - Cole o valor abaixo:');
  console.log(`   ${corsOrigin}`);
  
  console.log('\n5️⃣ SALVE E REDEPLOY:');
  console.log('   - Clique em "Save"');
  console.log('   - Vá para "Deployments"');
  console.log('   - Clique em "Deploy"');
  
  console.log('\n6️⃣ AGUARDE O DEPLOY:');
  console.log('   - Monitore os logs');
  console.log('   - Aguarde status "Success"');
  
  console.log('\n🧪 TESTE APÓS DEPLOY:');
  console.log('-'.repeat(25));
  console.log('1. Acesse: https://sistema-zara-frontend.vercel.app');
  console.log('2. Tente fazer login:');
  console.log('   - Email: admin@zara.com');
  console.log('   - Senha: admin123');
  
  if (railwayResult.status === 404) {
    console.log('\n⚠️  ATENÇÃO:');
    console.log('   Backend Railway retorna 404 - REDEPLOY NECESSÁRIO');
  } else if (railwayResult.active) {
    console.log('\n✅ Backend Railway está respondendo');
  } else {
    console.log('\n❌ Backend Railway não está acessível');
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('✅ CONFIGURAÇÃO CORS PRONTA PARA APLICAR');
}

// Executar
main().catch(console.error);