#!/usr/bin/env node

/**
 * Script para forçar redeploy do Railway e verificar status
 * Criado para resolver erro 404 "Application not found"
 */

const https = require('https');
const fs = require('fs');

console.log('🚂 FORÇANDO REDEPLOY DO RAILWAY...');
console.log('=' .repeat(50));

// URLs para teste
const RAILWAY_URLS = [
  'https://sistema-zara-backend-production.up.railway.app',
  'https://sistema-zara-backend-production.up.railway.app/api/health',
  'https://sistema-zara-backend-production.up.railway.app/api/quality-tests'
];

// Função para testar URL
function testUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          headers: res.headers,
          body: data.substring(0, 500)
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        url,
        status: 'ERROR',
        error: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        error: 'Request timeout'
      });
    });
  });
}

// Função principal
async function main() {
  console.log('\n🔍 TESTANDO URLS DO RAILWAY:');
  console.log('-'.repeat(40));
  
  for (const url of RAILWAY_URLS) {
    console.log(`\n📡 Testando: ${url}`);
    const result = await testUrl(url);
    
    if (result.status === 'ERROR' || result.status === 'TIMEOUT') {
      console.log(`❌ ${result.status}: ${result.error}`);
    } else {
      console.log(`📊 Status: ${result.status}`);
      if (result.body) {
        console.log(`📄 Resposta: ${result.body.substring(0, 200)}...`);
      }
    }
  }
  
  console.log('\n🔧 DIAGNÓSTICO:');
  console.log('-'.repeat(30));
  
  const healthResult = await testUrl(RAILWAY_URLS[1]);
  
  if (healthResult.status === 404) {
    console.log('❌ PROBLEMA: Application not found (404)');
    console.log('\n🛠️  SOLUÇÕES RECOMENDADAS:');
    console.log('1. ✅ Verificar se o Railway está online');
    console.log('2. ✅ Verificar variáveis de ambiente');
    console.log('3. ✅ Forçar redeploy manual');
    console.log('4. ✅ Verificar logs do Railway');
    console.log('5. ✅ Verificar configuração do Dockerfile');
    
    console.log('\n📋 COMANDOS PARA EXECUTAR:');
    console.log('=' .repeat(40));
    console.log('# 1. Acesse Railway Dashboard:');
    console.log('https://railway.app/dashboard');
    console.log('');
    console.log('# 2. Vá para o projeto sistema-zara-backend');
    console.log('# 3. Clique em "Deployments"');
    console.log('# 4. Clique em "Redeploy" no último deployment');
    console.log('');
    console.log('# 5. Ou force redeploy via CLI (se configurado):');
    console.log('# railway redeploy');
    
  } else if (healthResult.status === 200) {
    console.log('✅ BACKEND ONLINE: Railway funcionando corretamente');
  } else {
    console.log(`⚠️  STATUS INESPERADO: ${healthResult.status}`);
  }
  
  console.log('\n🎯 PRÓXIMOS PASSOS:');
  console.log('-'.repeat(25));
  console.log('1. 🔄 Forçar redeploy no Railway Dashboard');
  console.log('2. ⏱️  Aguardar 2-3 minutos para deploy');
  console.log('3. 🧪 Testar novamente as URLs');
  console.log('4. 🔍 Verificar logs se ainda houver erro');
  console.log('5. ✅ Configurar variáveis de ambiente se necessário');
  
  // Salvar relatório
  const report = {
    timestamp: new Date().toISOString(),
    railway_status: healthResult.status,
    urls_tested: RAILWAY_URLS.length,
    recommendations: [
      'Force redeploy on Railway Dashboard',
      'Check environment variables',
      'Verify Dockerfile configuration',
      'Check Railway logs'
    ]
  };
  
  fs.writeFileSync(
    `railway-diagnosis-${Date.now()}.json`,
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n📄 Relatório salvo em: railway-diagnosis-[timestamp].json');
  console.log('\n🚂 DIAGNÓSTICO DO RAILWAY CONCLUÍDO!');
}

// Executar
main().catch(console.error);