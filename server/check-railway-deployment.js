const https = require('https');
const logger = require('utils/logger');

// URLs para testar
const RAILWAY_URLS = [
  'https://zaraoperacaov101-production.up.railway.app',
  'https://zaraoperacaov101-production.up.railway.app/health',
  'https://zaraoperacaov101-production.up.railway.app/api',
  'https://zaraoperacaov101-production.up.railway.app/api/auth',
  'https://zaraoperacaov101-production.up.railway.app/api/auth/login'
];

function testURL(url) {
  return new Promise((resolve) => {
    logger.info(`\n🔍 Testando: ${url}`););
    
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        logger.info(`✅ Status: ${res.statusCode}`););
        logger.info(`📄 Headers:`, res.headers););
        
        if (data.length < 500) {
          logger.info(`📝 Response: ${data}`););
        } else {
          logger.info(`📝 Response: ${data.substring(0, 200)}...`););
        }
        
        resolve({
          url,
          status: res.statusCode,
          success: res.statusCode < 400,
          response: data,
          headers: res.headers
        });
      });
    });
    
    req.on('error', (error) => {
      logger.info(`❌ Erro: ${error.message}`););
      resolve({
        url,
        status: 'ERROR',
        success: false,
        error: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      logger.info(`⏰ Timeout`););
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        success: false,
        error: 'Request timeout'
      });
    });
  });
}

async function checkRailwayDeployment() {
  logger.info('🚀 Verificando deployment do Railway...'););
  logger.info('📅 Data/Hora:', new Date().toLocaleString()););
  
  const results = [];
  
  for (const url of RAILWAY_URLS) {
    const result = await testURL(url);
    results.push(result);
    
    // Pequena pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  logger.info('\n📊 RESUMO DOS TESTES:'););
  logger.info('=' .repeat(50)););
  
  let workingUrls = 0;
  
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    logger.info(`${status} ${result.url}`););
    logger.info(`   Status: ${result.status}`););
    
    if (result.success) {
      workingUrls++;
    }
    
    if (result.error) {
      logger.info(`   Erro: ${result.error}`););
    }
    
    logger.info(''););
  });
  
  logger.info('\n🎯 DIAGNÓSTICO:'););
  
  if (workingUrls === 0) {
    logger.info('❌ PROBLEMA: Nenhuma URL está respondendo'););
    logger.info('\n🔧 POSSÍVEIS CAUSAS:'););
    logger.info('1. Aplicação não foi deployada no Railway'););
    logger.info('2. DATABASE_URL não foi configurada'););
    logger.info('3. Aplicação falhou ao iniciar'););
    logger.info('4. URL do Railway mudou'););
    
    logger.info('\n📝 AÇÕES NECESSÁRIAS:'););
    logger.info('1. Acessar Railway Dashboard'););
    logger.info('2. Verificar logs da aplicação'););
    logger.info('3. Verificar variáveis de ambiente'););
    logger.info('4. Fazer redeploy se necessário'););
    
  } else if (workingUrls < RAILWAY_URLS.length) {
    logger.info('⚠️  PARCIAL: Algumas URLs estão funcionando'););
    logger.info('\n🔧 POSSÍVEL CAUSA:'););
    logger.info('- Aplicação iniciou mas algumas rotas não estão configuradas'););
    
  } else {
    logger.info('✅ SUCESSO: Todas as URLs estão respondendo!'););
    logger.info('\n🎉 A aplicação está funcionando no Railway!'););
  }
  
  logger.info('\n🔗 PRÓXIMOS PASSOS:'););
  logger.info('1. Se a aplicação não estiver funcionando:'););
  logger.info('   - Acessar https://railway.app/dashboard'););
  logger.info('   - Verificar logs da aplicação'););
  logger.info('   - Configurar DATABASE_URL se necessário'););
  logger.info('2. Se a aplicação estiver funcionando:'););
  logger.info('   - Testar login no frontend'););
  logger.info('   - Criar usuários se necessário'););
  
  return {
    totalUrls: RAILWAY_URLS.length,
    workingUrls,
    success: workingUrls > 0,
    results
  };
}

// Executar verificação
checkRailwayDeployment()
  .then(result => {
    logger.info('\n📊 RESULTADO FINAL:', {);
      totalUrls: result.totalUrls,
      workingUrls: result.workingUrls,
      success: result.success
    });
    
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    logger.error('\n💥 ERRO CRÍTICO:', error););
    process.exit(1);
  });