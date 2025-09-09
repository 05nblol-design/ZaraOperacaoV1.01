const https = require('https');

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
    console.log(`\n🔍 Testando: ${url}`);
    
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ Status: ${res.statusCode}`);
        console.log(`📄 Headers:`, res.headers);
        
        if (data.length < 500) {
          console.log(`📝 Response: ${data}`);
        } else {
          console.log(`📝 Response: ${data.substring(0, 200)}...`);
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
      console.log(`❌ Erro: ${error.message}`);
      resolve({
        url,
        status: 'ERROR',
        success: false,
        error: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      console.log(`⏰ Timeout`);
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
  console.log('🚀 Verificando deployment do Railway...');
  console.log('📅 Data/Hora:', new Date().toLocaleString());
  
  const results = [];
  
  for (const url of RAILWAY_URLS) {
    const result = await testURL(url);
    results.push(result);
    
    // Pequena pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log('=' .repeat(50));
  
  let workingUrls = 0;
  
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.url}`);
    console.log(`   Status: ${result.status}`);
    
    if (result.success) {
      workingUrls++;
    }
    
    if (result.error) {
      console.log(`   Erro: ${result.error}`);
    }
    
    console.log('');
  });
  
  console.log('\n🎯 DIAGNÓSTICO:');
  
  if (workingUrls === 0) {
    console.log('❌ PROBLEMA: Nenhuma URL está respondendo');
    console.log('\n🔧 POSSÍVEIS CAUSAS:');
    console.log('1. Aplicação não foi deployada no Railway');
    console.log('2. DATABASE_URL não foi configurada');
    console.log('3. Aplicação falhou ao iniciar');
    console.log('4. URL do Railway mudou');
    
    console.log('\n📝 AÇÕES NECESSÁRIAS:');
    console.log('1. Acessar Railway Dashboard');
    console.log('2. Verificar logs da aplicação');
    console.log('3. Verificar variáveis de ambiente');
    console.log('4. Fazer redeploy se necessário');
    
  } else if (workingUrls < RAILWAY_URLS.length) {
    console.log('⚠️  PARCIAL: Algumas URLs estão funcionando');
    console.log('\n🔧 POSSÍVEL CAUSA:');
    console.log('- Aplicação iniciou mas algumas rotas não estão configuradas');
    
  } else {
    console.log('✅ SUCESSO: Todas as URLs estão respondendo!');
    console.log('\n🎉 A aplicação está funcionando no Railway!');
  }
  
  console.log('\n🔗 PRÓXIMOS PASSOS:');
  console.log('1. Se a aplicação não estiver funcionando:');
  console.log('   - Acessar https://railway.app/dashboard');
  console.log('   - Verificar logs da aplicação');
  console.log('   - Configurar DATABASE_URL se necessário');
  console.log('2. Se a aplicação estiver funcionando:');
  console.log('   - Testar login no frontend');
  console.log('   - Criar usuários se necessário');
  
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
    console.log('\n📊 RESULTADO FINAL:', {
      totalUrls: result.totalUrls,
      workingUrls: result.workingUrls,
      success: result.success
    });
    
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 ERRO CRÍTICO:', error);
    process.exit(1);
  });