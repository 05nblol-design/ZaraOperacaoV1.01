// Script para atualizar CORS_ORIGIN no Railway com URLs corretas
const https = require('https');
const logger = require('utils/logger');

logger.info('🔧 ATUALIZANDO CORS_ORIGIN NO RAILWAY'););
logger.info('=' .repeat(50)););

// URLs corretas fornecidas pelo usuário
const corsOrigin = 'https://sistema-zara-frontend.vercel.app,https://sistema-zara-frontend-peas4bni7-05nblol-designs-projects.vercel.app,http://localhost:3000,http://localhost:5173';

logger.info('\n📋 CONFIGURAÇÃO CORS ATUALIZADA:'););
logger.info('-'.repeat(40)););
logger.info(`CORS_ORIGIN=${corsOrigin}`););

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
  logger.info('\n🧪 VALIDANDO URLs DO CORS:'););
  logger.info('-'.repeat(30)););
  
  const urls = corsOrigin.split(',');
  const results = [];
  
  for (const url of urls) {
    logger.info(`Testando: ${url}`););
    const result = await testUrl(url.trim());
    results.push(result);
    
    if (result.active) {
      logger.info(`✅ VÁLIDA - Status: ${result.status}`););
    } else {
      logger.info(`❌ INVÁLIDA - Status: ${result.status}`););
    }
  }
  
  const validUrls = results.filter(r => r.active).length;
  const totalUrls = results.length;
  
  logger.info(`\n📊 RESUMO: ${validUrls}/${totalUrls} URLs válidas`););
  
  return results;
}

// Testar conectividade com Railway
function testRailwayBackend() {
  return new Promise((resolve) => {
    const railwayUrl = 'https://zara-backend-production-aab3.up.railway.app';
    
    logger.info('\n🚂 TESTANDO BACKEND RAILWAY:'););
    logger.info('-'.repeat(30)););
    logger.info(`URL: ${railwayUrl}`););
    
    const req = https.get(railwayUrl, (res) => {
      logger.info(`Status: ${res.statusCode}`););
      resolve({
        status: res.statusCode,
        active: res.statusCode < 500
      });
    });
    
    req.on('error', (error) => {
      logger.info(`Erro: ${error.message}`););
      resolve({
        status: 'ERROR',
        active: false
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      logger.info('Status: TIMEOUT'););
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
  logger.info('\n🚀 INSTRUÇÕES PARA RAILWAY DASHBOARD:'););
  logger.info('=' .repeat(50)););
  
  logger.info('\n1️⃣ ACESSE O RAILWAY DASHBOARD:'););
  logger.info('   https://railway.app/dashboard'););
  
  logger.info('\n2️⃣ SELECIONE O PROJETO DO BACKEND'););
  
  logger.info('\n3️⃣ VÁ PARA VARIABLES:'););
  logger.info('   - Clique na aba "Variables"'););
  
  logger.info('\n4️⃣ CONFIGURE CORS_ORIGIN:'););
  logger.info('   - Encontre ou crie a variável CORS_ORIGIN'););
  logger.info('   - Cole o valor abaixo:'););
  logger.info(`   ${corsOrigin}`););
  
  logger.info('\n5️⃣ SALVE E REDEPLOY:'););
  logger.info('   - Clique em "Save"'););
  logger.info('   - Vá para "Deployments"'););
  logger.info('   - Clique em "Deploy"'););
  
  logger.info('\n6️⃣ AGUARDE O DEPLOY:'););
  logger.info('   - Monitore os logs'););
  logger.info('   - Aguarde status "Success"'););
  
  logger.info('\n🧪 TESTE APÓS DEPLOY:'););
  logger.info('-'.repeat(25)););
  logger.info('1. Acesse: https://sistema-zara-frontend.vercel.app'););
  logger.info('2. Tente fazer login:'););
  logger.info('   - Email: admin@zara.com'););
  logger.info('   - Senha: admin123'););
  
  if (railwayResult.status === 404) {
    logger.info('\n⚠️  ATENÇÃO:'););
    logger.info('   Backend Railway retorna 404 - REDEPLOY NECESSÁRIO'););
  } else if (railwayResult.active) {
    logger.info('\n✅ Backend Railway está respondendo'););
  } else {
    logger.info('\n❌ Backend Railway não está acessível'););
  }
  
  logger.info('\n' + '=' .repeat(50)););
  logger.info('✅ CONFIGURAÇÃO CORS PRONTA PARA APLICAR'););
}

// Executar
logger.error(main().catch(console.error););