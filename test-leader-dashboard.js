#!/usr/bin/env node

/**
 * Script para testar especificamente a página leader-dashboard
 * - Verifica se há erros específicos nesta página
 * - Analisa o conteúdo retornado
 * - Identifica possíveis problemas de roteamento
 */

const https = require('https');
const fs = require('fs');

const VERCEL_URL = 'https://sistema-zara-frontend.vercel.app';

function makeRequest(url, options = {}) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = https.request(url, {
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
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
    
    req.end();
  });
}

function analyzePageContent(data) {
  const analysis = {
    hasError: false,
    errorType: null,
    errorMessage: null,
    hasReactContent: false,
    hasZaraContent: false,
    hasJavaScriptErrors: false,
    pageSize: data.length
  };
  
  const lowerData = data.toLowerCase();
  
  // Verificar tipos de erro
  if (lowerData.includes('oops! algo deu errado')) {
    analysis.hasError = true;
    analysis.errorType = 'Generic Error';
    analysis.errorMessage = 'Erro genérico da aplicação';
  }
  
  if (lowerData.includes('404') || lowerData.includes('not found')) {
    analysis.hasError = true;
    analysis.errorType = '404 Not Found';
    analysis.errorMessage = 'Página não encontrada';
  }
  
  if (lowerData.includes('500') || lowerData.includes('internal server error')) {
    analysis.hasError = true;
    analysis.errorType = '500 Server Error';
    analysis.errorMessage = 'Erro interno do servidor';
  }
  
  if (lowerData.includes('referenceerror') || lowerData.includes('uncaught')) {
    analysis.hasJavaScriptErrors = true;
  }
  
  // Verificar conteúdo
  analysis.hasReactContent = lowerData.includes('react') || data.includes('__REACT');
  analysis.hasZaraContent = lowerData.includes('zara') || lowerData.includes('sistema');
  
  return analysis;
}

async function testLeaderDashboard() {
  console.log('🧪 TESTANDO PÁGINA LEADER-DASHBOARD');
  console.log('=' .repeat(60));
  
  const dashboardURL = `${VERCEL_URL}/leader-dashboard`;
  console.log(`🎯 URL: ${dashboardURL}`);
  
  try {
    const result = await makeRequest(dashboardURL);
    
    console.log(`\n📊 RESULTADO DO TESTE:`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Tempo de resposta: ${result.responseTime}ms`);
    
    if (result.error) {
      console.log(`   ❌ Erro: ${result.error}`);
      return { success: false, error: result.error };
    }
    
    if (result.status >= 200 && result.status < 300) {
      console.log(`   ✅ Página carregou com sucesso`);
      
      // Analisar conteúdo
      const analysis = analyzePageContent(result.data);
      
      console.log(`\n🔍 ANÁLISE DO CONTEÚDO:`);
      console.log(`   Tamanho da página: ${analysis.pageSize} bytes`);
      console.log(`   Conteúdo React: ${analysis.hasReactContent ? '✅' : '❌'}`);
      console.log(`   Conteúdo Zara: ${analysis.hasZaraContent ? '✅' : '❌'}`);
      console.log(`   Erros JavaScript: ${analysis.hasJavaScriptErrors ? '❌' : '✅'}`);
      
      if (analysis.hasError) {
        console.log(`\n🐛 ERRO DETECTADO:`);
        console.log(`   Tipo: ${analysis.errorType}`);
        console.log(`   Mensagem: ${analysis.errorMessage}`);
        
        // Extrair mais detalhes do erro
        const errorLines = result.data.split('\n').filter(line => 
          line.toLowerCase().includes('erro') || 
          line.toLowerCase().includes('error') ||
          line.toLowerCase().includes('oops')
        );
        
        if (errorLines.length > 0) {
          console.log(`\n📝 DETALHES DO ERRO:`);
          errorLines.slice(0, 3).forEach((line, index) => {
            console.log(`   ${index + 1}. ${line.trim()}`);
          });
        }
        
      } else {
        console.log(`\n✅ NENHUM ERRO DETECTADO NO CONTEÚDO`);
      }
      
      // Salvar conteúdo para análise
      fs.writeFileSync('leader-dashboard-content.html', result.data);
      console.log(`\n💾 Conteúdo salvo em: leader-dashboard-content.html`);
      
      return { 
        success: true, 
        analysis,
        status: result.status,
        responseTime: result.responseTime
      };
      
    } else {
      console.log(`   ❌ Erro HTTP: ${result.status}`);
      return { 
        success: false, 
        httpError: result.status,
        data: result.data 
      };
    }
    
  } catch (error) {
    console.error('❌ Erro durante teste:', error.message);
    return { success: false, error: error.message };
  }
}

async function testOtherPages() {
  console.log('\n🔍 TESTANDO OUTRAS PÁGINAS PARA COMPARAÇÃO');
  console.log('=' .repeat(50));
  
  const pages = [
    { path: '', name: 'Página Principal' },
    { path: '/login', name: 'Login' },
    { path: '/dashboard', name: 'Dashboard Normal' }
  ];
  
  const results = [];
  
  for (const page of pages) {
    const url = VERCEL_URL + page.path;
    console.log(`\n🧪 Testando: ${page.name}`);
    
    const result = await makeRequest(url);
    const analysis = analyzePageContent(result.data);
    
    const status = result.status >= 200 && result.status < 300 ? '✅' : '❌';
    const errorStatus = analysis.hasError ? '🐛' : '✨';
    
    console.log(`   ${status} Status: ${result.status}`);
    console.log(`   ${errorStatus} Erros: ${analysis.hasError ? analysis.errorType : 'Nenhum'}`);
    
    results.push({
      page: page.name,
      url,
      status: result.status,
      hasError: analysis.hasError,
      errorType: analysis.errorType
    });
  }
  
  return results;
}

function generateReport(dashboardResult, otherPagesResults) {
  const report = {
    timestamp: new Date().toISOString(),
    leaderDashboard: dashboardResult,
    otherPages: otherPagesResults,
    summary: {
      dashboardWorking: dashboardResult.success && !dashboardResult.analysis?.hasError,
      otherPagesWorking: otherPagesResults.filter(p => p.status >= 200 && p.status < 300 && !p.hasError).length,
      totalOtherPages: otherPagesResults.length
    }
  };
  
  fs.writeFileSync('leader-dashboard-test-report.json', JSON.stringify(report, null, 2));
  console.log('\n💾 Relatório completo salvo em: leader-dashboard-test-report.json');
  
  return report;
}

async function main() {
  console.log('🔍 DIAGNÓSTICO DA PÁGINA LEADER-DASHBOARD');
  console.log('=' .repeat(70));
  
  try {
    // Testar página leader-dashboard
    const dashboardResult = await testLeaderDashboard();
    
    // Testar outras páginas para comparação
    const otherPagesResults = await testOtherPages();
    
    // Gerar relatório
    const report = generateReport(dashboardResult, otherPagesResults);
    
    // Conclusão
    console.log('\n🏁 CONCLUSÃO DO DIAGNÓSTICO');
    console.log('=' .repeat(40));
    
    if (report.summary.dashboardWorking) {
      console.log('✅ LEADER-DASHBOARD: Funcionando normalmente');
    } else {
      console.log('❌ LEADER-DASHBOARD: Apresenta problemas');
      if (dashboardResult.analysis?.hasError) {
        console.log(`   🐛 Erro detectado: ${dashboardResult.analysis.errorType}`);
        console.log(`   💡 Possível causa: Problema de roteamento ou componente`);
      }
    }
    
    console.log(`\n📊 Outras páginas funcionando: ${report.summary.otherPagesWorking}/${report.summary.totalOtherPages}`);
    
    if (!report.summary.dashboardWorking) {
      console.log('\n🔧 PRÓXIMOS PASSOS RECOMENDADOS:');
      console.log('   1. Verificar se a rota /leader-dashboard existe no React Router');
      console.log('   2. Verificar se o componente LeaderDashboard está implementado');
      console.log('   3. Verificar se há erros de importação no componente');
      console.log('   4. Verificar se há problemas de autenticação/autorização');
    }
    
  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error.message);
  }
}

// Executar diagnóstico
main().catch(console.error);