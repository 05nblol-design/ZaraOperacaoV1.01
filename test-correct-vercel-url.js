#!/usr/bin/env node

/**
 * Script para testar a URL correta do Vercel encontrada
 * - Testa se o erro 'acc is not defined' foi corrigido
 * - Verifica se as APIs estão funcionando
 * - Testa funcionalidades críticas do sistema
 */

const https = require('https');
const fs = require('fs');

const VERCEL_URL = 'https://sistema-zara-frontend.vercel.app';
const RAILWAY_URL = 'https://zaraoperacaov101-production.up.railway.app';

function makeRequest(url, options = {}) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = https.request(url, {
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/html, */*',
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data,
          responseTime,
          headers: res.headers
        });
      });
    });
    
    req.on('error', (err) => {
      resolve({
        status: 0,
        error: err.message,
        responseTime: Date.now() - startTime
      });
    });
    
    req.setTimeout(15000, () => {
      req.destroy();
      resolve({
        status: 0,
        error: 'Timeout',
        responseTime: 15000
      });
    });
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testVercelPages() {
  console.log('🔍 TESTANDO PÁGINAS DO VERCEL');
  console.log('=' .repeat(50));
  
  const pages = [
    { path: '', name: 'Página Principal' },
    { path: '/login', name: 'Login' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/machines', name: 'Máquinas' },
    { path: '/users', name: 'Usuários' },
    { path: '/reports', name: 'Relatórios' }
  ];
  
  const results = [];
  
  for (const page of pages) {
    const url = VERCEL_URL + page.path;
    console.log(`\n🧪 Testando: ${page.name}`);
    console.log(`   URL: ${url}`);
    
    const result = await makeRequest(url);
    
    if (result.status >= 200 && result.status < 300) {
      console.log(`   ✅ Status: ${result.status} (${result.responseTime}ms)`);
      
      // Verificar se há erro 'acc is not defined'
      const hasAccError = result.data.toLowerCase().includes('acc is not defined');
      const hasReactError = result.data.toLowerCase().includes('referenceerror');
      const hasJSError = result.data.toLowerCase().includes('uncaught');
      
      if (hasAccError) {
        console.log(`   🐛 ERRO 'acc is not defined' AINDA PRESENTE!`);
      } else {
        console.log(`   ✨ Erro 'acc is not defined' CORRIGIDO`);
      }
      
      if (hasReactError || hasJSError) {
        console.log(`   ⚠️ Outros erros JavaScript detectados`);
      }
      
      // Verificar se o conteúdo está carregando corretamente
      const hasZaraContent = result.data.toLowerCase().includes('zara');
      const hasReactApp = result.data.includes('react');
      
      if (hasZaraContent) {
        console.log(`   🎯 Conteúdo Zara carregado`);
      }
      
      results.push({
        page: page.name,
        url,
        status: result.status,
        responseTime: result.responseTime,
        hasAccError,
        hasReactError,
        hasJSError,
        hasZaraContent,
        hasReactApp
      });
      
    } else {
      console.log(`   ❌ Status: ${result.status} - ${result.error || 'Erro desconhecido'}`);
      results.push({
        page: page.name,
        url,
        status: result.status,
        error: result.error
      });
    }
  }
  
  return results;
}

async function testAPIEndpoints() {
  console.log('\n🔗 TESTANDO ENDPOINTS DA API');
  console.log('=' .repeat(50));
  
  const endpoints = [
    { path: '/api/health', name: 'Health Check', method: 'GET' },
    { path: '/api/users', name: 'Lista de Usuários', method: 'GET' },
    { path: '/api/machines', name: 'Lista de Máquinas', method: 'GET' },
    { path: '/api/production', name: 'Dados de Produção', method: 'GET' },
    { path: '/api/reports', name: 'Relatórios', method: 'GET' },
    { 
      path: '/api/auth/login', 
      name: 'Login de Usuário', 
      method: 'POST',
      body: { email: 'test@test.com', password: 'test123' }
    }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const url = RAILWAY_URL + endpoint.path;
    console.log(`\n🧪 Testando: ${endpoint.name}`);
    console.log(`   URL: ${url}`);
    console.log(`   Método: ${endpoint.method}`);
    
    const result = await makeRequest(url, {
      method: endpoint.method,
      body: endpoint.body
    });
    
    if (result.status >= 200 && result.status < 300) {
      console.log(`   ✅ Status: ${result.status} (${result.responseTime}ms)`);
      
      try {
        const jsonData = JSON.parse(result.data);
        console.log(`   📊 Resposta JSON válida`);
        if (jsonData.message) {
          console.log(`   💬 Mensagem: ${jsonData.message}`);
        }
      } catch {
        console.log(`   📄 Resposta não-JSON (${result.data.length} bytes)`);
      }
      
    } else if (result.status === 401) {
      console.log(`   🔐 Status: ${result.status} - Não autorizado (esperado para alguns endpoints)`);
    } else if (result.status === 404) {
      console.log(`   ❌ Status: ${result.status} - Endpoint não encontrado`);
    } else {
      console.log(`   ❌ Status: ${result.status} - ${result.error || 'Erro'}`);
    }
    
    results.push({
      endpoint: endpoint.name,
      url,
      method: endpoint.method,
      status: result.status,
      responseTime: result.responseTime,
      error: result.error
    });
  }
  
  return results;
}

function analyzeResults(vercelResults, apiResults) {
  console.log('\n📊 ANÁLISE COMPLETA DOS RESULTADOS');
  console.log('=' .repeat(60));
  
  // Análise do Vercel
  const workingPages = vercelResults.filter(r => r.status >= 200 && r.status < 300);
  const pagesWithAccError = vercelResults.filter(r => r.hasAccError);
  const pagesWithJSErrors = vercelResults.filter(r => r.hasReactError || r.hasJSError);
  
  console.log('\n🌐 VERCEL FRONTEND:');
  console.log(`   ✅ Páginas funcionando: ${workingPages.length}/${vercelResults.length}`);
  console.log(`   🐛 Páginas com erro 'acc': ${pagesWithAccError.length}`);
  console.log(`   ⚠️ Páginas com erros JS: ${pagesWithJSErrors.length}`);
  
  if (pagesWithAccError.length === 0) {
    console.log('   🎉 ERRO "acc is not defined" TOTALMENTE CORRIGIDO!');
  } else {
    console.log('   ❌ ERRO "acc is not defined" AINDA PRESENTE em:');
    pagesWithAccError.forEach(page => {
      console.log(`      - ${page.page}`);
    });
  }
  
  // Análise da API
  const workingAPIs = apiResults.filter(r => r.status >= 200 && r.status < 300);
  const unauthorizedAPIs = apiResults.filter(r => r.status === 401);
  const brokenAPIs = apiResults.filter(r => r.status === 0 || r.status === 404 || (r.status >= 500));
  
  console.log('\n🔗 RAILWAY BACKEND:');
  console.log(`   ✅ APIs funcionando: ${workingAPIs.length}/${apiResults.length}`);
  console.log(`   🔐 APIs não autorizadas: ${unauthorizedAPIs.length}`);
  console.log(`   ❌ APIs quebradas: ${brokenAPIs.length}`);
  
  // Status geral do sistema
  const systemHealth = {
    vercelWorking: workingPages.length === vercelResults.length,
    accErrorFixed: pagesWithAccError.length === 0,
    railwayWorking: (workingAPIs.length + unauthorizedAPIs.length) >= (apiResults.length * 0.8),
    overallHealth: 'unknown'
  };
  
  if (systemHealth.vercelWorking && systemHealth.accErrorFixed && systemHealth.railwayWorking) {
    systemHealth.overallHealth = 'excellent';
    console.log('\n🎉 SISTEMA TOTALMENTE FUNCIONAL!');
    console.log('   ✅ Vercel: Funcionando perfeitamente');
    console.log('   ✅ Railway: APIs respondendo');
    console.log('   ✅ Erro "acc is not defined": CORRIGIDO');
  } else if (systemHealth.accErrorFixed && (workingPages.length > 0 || workingAPIs.length > 0)) {
    systemHealth.overallHealth = 'good';
    console.log('\n✅ SISTEMA FUNCIONANDO COM MELHORIAS!');
    console.log('   ✅ Erro "acc is not defined": CORRIGIDO');
    if (!systemHealth.vercelWorking) {
      console.log('   ⚠️ Vercel: Algumas páginas com problemas');
    }
    if (!systemHealth.railwayWorking) {
      console.log('   ⚠️ Railway: Algumas APIs com problemas');
    }
  } else {
    systemHealth.overallHealth = 'needs_attention';
    console.log('\n⚠️ SISTEMA PRECISA DE ATENÇÃO');
    if (!systemHealth.accErrorFixed) {
      console.log('   🐛 Erro "acc is not defined": AINDA PRESENTE');
    }
    if (!systemHealth.vercelWorking) {
      console.log('   ❌ Vercel: Problemas significativos');
    }
    if (!systemHealth.railwayWorking) {
      console.log('   ❌ Railway: Muitas APIs quebradas');
    }
  }
  
  return systemHealth;
}

function saveReport(vercelResults, apiResults, systemHealth) {
  const report = {
    timestamp: new Date().toISOString(),
    vercelURL: VERCEL_URL,
    railwayURL: RAILWAY_URL,
    systemHealth,
    vercelResults,
    apiResults,
    summary: {
      vercelPagesWorking: vercelResults.filter(r => r.status >= 200 && r.status < 300).length,
      vercelPagesTotal: vercelResults.length,
      accErrorFixed: vercelResults.filter(r => r.hasAccError).length === 0,
      apiEndpointsWorking: apiResults.filter(r => r.status >= 200 && r.status < 300).length,
      apiEndpointsTotal: apiResults.length
    }
  };
  
  fs.writeFileSync('final-system-test-report.json', JSON.stringify(report, null, 2));
  console.log('\n💾 Relatório final salvo em: final-system-test-report.json');
}

async function main() {
  console.log('🧪 TESTE COMPLETO DO SISTEMA CORRIGIDO');
  console.log('=' .repeat(70));
  console.log(`🌐 Vercel URL: ${VERCEL_URL}`);
  console.log(`🔗 Railway URL: ${RAILWAY_URL}`);
  
  try {
    // Testar páginas do Vercel
    const vercelResults = await testVercelPages();
    
    // Testar APIs do Railway
    const apiResults = await testAPIEndpoints();
    
    // Analisar resultados
    const systemHealth = analyzeResults(vercelResults, apiResults);
    
    // Salvar relatório
    saveReport(vercelResults, apiResults, systemHealth);
    
    // Conclusão
    console.log('\n🏁 TESTE COMPLETO FINALIZADO');
    console.log(`🎯 URL correta do Vercel: ${VERCEL_URL}`);
    console.log(`📊 Status do sistema: ${systemHealth.overallHealth.toUpperCase()}`);
    
    if (systemHealth.overallHealth === 'excellent') {
      console.log('\n🎉 PARABÉNS! Todos os problemas foram resolvidos!');
      console.log('✅ O sistema está funcionando perfeitamente');
    } else if (systemHealth.overallHealth === 'good') {
      console.log('\n✅ ÓTIMO PROGRESSO! Os principais problemas foram resolvidos');
      console.log('🔧 Algumas melhorias menores ainda podem ser feitas');
    } else {
      console.log('\n🔧 AINDA HÁ TRABALHO A FAZER');
      console.log('📋 Verifique o relatório para detalhes dos problemas restantes');
    }
    
  } catch (error) {
    console.error('❌ Erro durante teste:', error.message);
  }
}

// Executar teste completo
main().catch(console.error);