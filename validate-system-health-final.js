#!/usr/bin/env node

/**
 * Script final de validação da saúde do sistema
 * - Aguarda deploy do Vercel completar
 * - Testa se erro 'acc is not defined' foi corrigido
 * - Valida todos os endpoints
 * - Gera relatório final
 */

const https = require('https');
const fs = require('fs');

const VERCEL_URL = 'https://zara-operacao-v1-01.vercel.app';
const RAILWAY_URL = 'https://zara-backend-production-aab3.up.railway.app';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function testURL(url, description, timeout = 10000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = https.request(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'System-Health-Validator/1.0',
        'Accept': 'text/html,application/json,*/*'
      }
    }, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const status = res.statusCode;
        const isOk = status >= 200 && status < 400;
        
        // Verificar se há erro 'acc is not defined' no HTML
        const hasAccError = data.toLowerCase().includes('acc is not defined');
        
        resolve({
          url,
          description,
          status,
          responseTime,
          isOk,
          hasAccError,
          dataLength: data.length,
          contentType: res.headers['content-type'] || 'unknown'
        });
      });
    });
    
    req.on('error', (err) => {
      resolve({
        url,
        description,
        status: 0,
        error: err.message,
        isOk: false,
        hasAccError: false
      });
    });
    
    req.setTimeout(timeout, () => {
      req.destroy();
      resolve({
        url,
        description,
        status: 0,
        error: 'Timeout',
        isOk: false,
        hasAccError: false
      });
    });
    
    req.end();
  });
}

function checkVercelDeployStatus() {
  console.log('🔍 VERIFICANDO STATUS DO DEPLOY VERCEL');
  console.log('=' .repeat(50));
  
  return testURL(VERCEL_URL, 'Vercel Frontend');
}

function checkRailwayHealth() {
  console.log('\n🔍 VERIFICANDO SAÚDE DO RAILWAY');
  console.log('=' .repeat(50));
  
  return testURL(`${RAILWAY_URL}/api/health`, 'Railway Health Check');
}

async function waitForVercelDeploy(maxAttempts = 10) {
  console.log('⏳ AGUARDANDO DEPLOY DO VERCEL COMPLETAR');
  console.log('=' .repeat(50));
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`\n🔄 Tentativa ${attempt}/${maxAttempts}`);
    
    const result = await checkVercelDeployStatus();
    
    if (result.isOk) {
      console.log(`✅ Status: ${result.status} (${result.responseTime}ms)`);
      console.log(`📊 Tamanho: ${result.dataLength} bytes`);
      console.log(`🎯 Erro 'acc is not defined': ${result.hasAccError ? '❌ AINDA PRESENTE' : '✅ CORRIGIDO'}`);
      
      if (!result.hasAccError) {
        console.log('🎉 Deploy completado com sucesso!');
        return result;
      } else {
        console.log('⚠️ Deploy completado mas erro ainda presente');
      }
    } else {
      console.log(`❌ Status: ${result.status || 'ERRO'} - ${result.error || 'Falha na conexão'}`);
    }
    
    if (attempt < maxAttempts) {
      console.log('⏳ Aguardando 30 segundos antes da próxima tentativa...');
      await sleep(30000);
    }
  }
  
  console.log('⚠️ Máximo de tentativas atingido');
  return null;
}

async function runCompleteHealthCheck() {
  console.log('\n🧪 EXECUTANDO VERIFICAÇÃO COMPLETA DE SAÚDE');
  console.log('=' .repeat(60));
  
  const tests = [
    { url: VERCEL_URL, description: 'Vercel Frontend' },
    { url: `${VERCEL_URL}/login`, description: 'Vercel Login Page' },
    { url: `${RAILWAY_URL}/api/health`, description: 'Railway Health' },
    { url: `${RAILWAY_URL}/api/machines`, description: 'Railway Machines API' },
    { url: `${RAILWAY_URL}/api/users`, description: 'Railway Users API' }
  ];
  
  console.log('\n🔍 Testando todos os endpoints...');
  
  const results = [];
  for (const test of tests) {
    console.log(`\n📡 Testando: ${test.description}`);
    const result = await testURL(test.url, test.description);
    
    const statusIcon = result.isOk ? '✅' : '❌';
    const accIcon = result.hasAccError ? '🐛' : '✨';
    
    console.log(`   ${statusIcon} Status: ${result.status} (${result.responseTime || 0}ms)`);
    if (result.hasAccError) {
      console.log(`   ${accIcon} ERRO 'acc is not defined' detectado!`);
    }
    
    results.push(result);
  }
  
  return results;
}

function generateFinalReport(vercelResult, railwayResult, allResults) {
  console.log('\n📋 RELATÓRIO FINAL DE SAÚDE DO SISTEMA');
  console.log('=' .repeat(60));
  
  // Status geral
  const workingEndpoints = allResults.filter(r => r.isOk).length;
  const totalEndpoints = allResults.length;
  const hasAnyAccError = allResults.some(r => r.hasAccError);
  
  console.log('\n🎯 RESUMO GERAL:');
  console.log(`   📊 Endpoints funcionando: ${workingEndpoints}/${totalEndpoints}`);
  console.log(`   🐛 Erro 'acc is not defined': ${hasAnyAccError ? '❌ PRESENTE' : '✅ CORRIGIDO'}`);
  console.log(`   🌐 Vercel: ${vercelResult?.isOk ? '✅ OK' : '❌ PROBLEMA'}`);
  console.log(`   🚂 Railway: ${railwayResult?.isOk ? '✅ OK' : '❌ PROBLEMA'}`);
  
  // Detalhes por serviço
  console.log('\n📊 DETALHES POR SERVIÇO:');
  console.log('-' .repeat(40));
  
  allResults.forEach(result => {
    const icon = result.isOk ? '✅' : '❌';
    const accStatus = result.hasAccError ? ' 🐛 ACC_ERROR' : '';
    console.log(`${icon} ${result.description}: ${result.status}${accStatus}`);
  });
  
  // Status final
  console.log('\n🏆 STATUS FINAL:');
  console.log('-' .repeat(20));
  
  if (workingEndpoints === totalEndpoints && !hasAnyAccError) {
    console.log('🎉 SISTEMA TOTALMENTE FUNCIONAL!');
    console.log('✅ Todas as correções foram aplicadas com sucesso');
    console.log('✅ Erro "acc is not defined" foi corrigido');
    console.log('✅ Railway está funcionando corretamente');
    console.log('✅ Vercel foi redeployado com sucesso');
  } else {
    console.log('⚠️ SISTEMA PARCIALMENTE FUNCIONAL');
    
    if (hasAnyAccError) {
      console.log('❌ Erro "acc is not defined" ainda presente');
      console.log('🔧 Ação necessária: Verificar arquivos JSX no Vercel');
    }
    
    if (workingEndpoints < totalEndpoints) {
      console.log(`❌ ${totalEndpoints - workingEndpoints} endpoints com problemas`);
      console.log('🔧 Ação necessária: Verificar configurações de API');
    }
  }
  
  // Salvar relatório
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      workingEndpoints,
      totalEndpoints,
      hasAccError: hasAnyAccError,
      vercelOk: vercelResult?.isOk || false,
      railwayOk: railwayResult?.isOk || false
    },
    results: allResults
  };
  
  fs.writeFileSync('final-health-report.json', JSON.stringify(report, null, 2));
  console.log('\n💾 Relatório salvo em: final-health-report.json');
  
  return report;
}

async function main() {
  console.log('🏥 VALIDAÇÃO FINAL DA SAÚDE DO SISTEMA ZARA');
  console.log('=' .repeat(70));
  console.log('Verificando se todas as correções foram aplicadas...');
  
  try {
    // 1. Aguardar deploy do Vercel
    const vercelResult = await waitForVercelDeploy();
    
    // 2. Verificar Railway
    const railwayResult = await checkRailwayHealth();
    
    // 3. Executar verificação completa
    const allResults = await runCompleteHealthCheck();
    
    // 4. Gerar relatório final
    const finalReport = generateFinalReport(vercelResult, railwayResult, allResults);
    
    // 5. Próximos passos
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    if (finalReport.summary.hasAccError) {
      console.log('1. ⚠️ Erro "acc is not defined" ainda presente');
      console.log('2. 🔍 Verifique o console do navegador em:', VERCEL_URL);
      console.log('3. 🔧 Pode ser necessário aguardar mais tempo para o deploy');
    } else {
      console.log('1. ✅ Sistema funcionando corretamente');
      console.log('2. 🧪 Teste manual em:', VERCEL_URL);
      console.log('3. 🎉 Correções aplicadas com sucesso!');
    }
    
  } catch (error) {
    console.error('❌ Erro durante validação:', error.message);
  }
}

// Executar validação
main().catch(console.error);