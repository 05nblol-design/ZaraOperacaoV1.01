#!/usr/bin/env node

/**
 * Script para verificar URLs alternativas do Vercel
 * - Testa diferentes formatos de URL do Vercel
 * - Verifica se o deploy está em andamento
 * - Encontra a URL correta do projeto
 */

const https = require('https');
const fs = require('fs');

function testURL(url, description, timeout = 10000) {
  return new Promise((resolve) => {
    console.log(`🔍 Testando: ${description}`);
    console.log(`   URL: ${url}`);
    
    const startTime = Date.now();
    
    const req = https.request(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    }, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const status = res.statusCode;
        const isOk = status >= 200 && status < 400;
        const isRedirect = status >= 300 && status < 400;
        
        // Verificar se há erro 'acc is not defined' no HTML
        const hasAccError = data.toLowerCase().includes('acc is not defined');
        const hasZaraContent = data.toLowerCase().includes('zara') || data.toLowerCase().includes('operacao');
        
        const statusIcon = isOk ? '✅' : (isRedirect ? '🔄' : '❌');
        console.log(`   ${statusIcon} Status: ${status} (${responseTime}ms)`);
        
        if (isRedirect && res.headers.location) {
          console.log(`   🔄 Redirecionamento para: ${res.headers.location}`);
        }
        
        if (hasZaraContent) {
          console.log(`   🎯 Conteúdo Zara detectado!`);
        }
        
        if (hasAccError) {
          console.log(`   🐛 Erro 'acc is not defined' detectado`);
        }
        
        if (isOk) {
          console.log(`   📊 Tamanho da resposta: ${data.length} bytes`);
          console.log(`   📄 Content-Type: ${res.headers['content-type'] || 'N/A'}`);
        }
        
        resolve({
          url,
          description,
          status,
          responseTime,
          isOk,
          isRedirect,
          hasAccError,
          hasZaraContent,
          dataLength: data.length,
          redirectLocation: res.headers.location,
          contentType: res.headers['content-type']
        });
      });
    });
    
    req.on('error', (err) => {
      console.log(`   ❌ Erro: ${err.message}`);
      resolve({
        url,
        description,
        status: 0,
        error: err.message,
        isOk: false
      });
    });
    
    req.setTimeout(timeout, () => {
      req.destroy();
      console.log(`   ⏰ Timeout após ${timeout}ms`);
      resolve({
        url,
        description,
        status: 0,
        error: 'Timeout',
        isOk: false
      });
    });
    
    req.end();
  });
}

async function testAlternativeURLs() {
  console.log('🔍 TESTANDO URLs ALTERNATIVAS DO VERCEL');
  console.log('=' .repeat(60));
  
  // Possíveis URLs do projeto
  const possibleURLs = [
    {
      url: 'https://zara-operacao-v1-01.vercel.app',
      description: 'URL Principal (formato padrão)'
    },
    {
      url: 'https://zara-operacao-v101.vercel.app',
      description: 'URL sem pontos'
    },
    {
      url: 'https://zaraoperacaov101.vercel.app',
      description: 'URL compacta'
    },
    {
      url: 'https://zara-operacao-v1-01-git-main-05nblol-design.vercel.app',
      description: 'URL do branch main'
    },
    {
      url: 'https://zara-operacao-v1-01-05nblol-design.vercel.app',
      description: 'URL com scope do usuário'
    },
    {
      url: 'https://zaraoperacaov101-git-main-05nblol-design.vercel.app',
      description: 'URL compacta com branch'
    },
    {
      url: 'https://sistema-zara-frontend.vercel.app',
      description: 'URL alternativa do frontend'
    },
    {
      url: 'https://zara-frontend.vercel.app',
      description: 'URL simplificada'
    }
  ];
  
  const results = [];
  
  for (const urlTest of possibleURLs) {
    console.log('\n' + '-'.repeat(50));
    const result = await testURL(urlTest.url, urlTest.description);
    results.push(result);
    
    // Se encontrou uma URL funcionando, testar algumas páginas
    if (result.isOk && result.hasZaraContent) {
      console.log('\n🎉 URL FUNCIONANDO ENCONTRADA!');
      console.log('🧪 Testando páginas específicas...');
      
      const pages = [
        { path: '/login', name: 'Login' },
        { path: '/dashboard', name: 'Dashboard' },
        { path: '/machines', name: 'Máquinas' }
      ];
      
      for (const page of pages) {
        const pageURL = result.url + page.path;
        const pageResult = await testURL(pageURL, `Página ${page.name}`);
        results.push(pageResult);
      }
      
      break; // Parar após encontrar a URL correta
    }
    
    // Pequena pausa entre testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}

function analyzeResults(results) {
  console.log('\n📊 ANÁLISE DOS RESULTADOS');
  console.log('=' .repeat(50));
  
  const workingURLs = results.filter(r => r.isOk);
  const zaraURLs = results.filter(r => r.hasZaraContent);
  const errorURLs = results.filter(r => r.hasAccError);
  
  console.log(`\n📈 Estatísticas:`);
  console.log(`   ✅ URLs funcionando: ${workingURLs.length}/${results.length}`);
  console.log(`   🎯 URLs com conteúdo Zara: ${zaraURLs.length}`);
  console.log(`   🐛 URLs com erro 'acc': ${errorURLs.length}`);
  
  if (workingURLs.length > 0) {
    console.log('\n✅ URLs FUNCIONANDO:');
    workingURLs.forEach(result => {
      const zaraIcon = result.hasZaraContent ? '🎯' : '❓';
      const accIcon = result.hasAccError ? '🐛' : '✨';
      console.log(`   ${zaraIcon}${accIcon} ${result.description}`);
      console.log(`      ${result.url}`);
      console.log(`      Status: ${result.status} (${result.responseTime}ms)`);
    });
  }
  
  if (zaraURLs.length > 0) {
    console.log('\n🎯 URL CORRETA ENCONTRADA:');
    const correctURL = zaraURLs[0];
    console.log(`   📍 URL: ${correctURL.url}`);
    console.log(`   📊 Status: ${correctURL.status}`);
    console.log(`   🐛 Erro 'acc': ${correctURL.hasAccError ? 'PRESENTE' : 'CORRIGIDO'}`);
    
    return correctURL.url;
  }
  
  console.log('\n⚠️ NENHUMA URL FUNCIONANDO ENCONTRADA');
  console.log('\n🔧 POSSÍVEIS CAUSAS:');
  console.log('   1. Deploy ainda em andamento');
  console.log('   2. Projeto foi renomeado no Vercel');
  console.log('   3. Projeto foi deletado ou pausado');
  console.log('   4. Problemas de conectividade');
  
  console.log('\n🛠️ AÇÕES RECOMENDADAS:');
  console.log('   1. Verificar dashboard do Vercel: https://vercel.com/dashboard');
  console.log('   2. Aguardar mais tempo para o deploy completar');
  console.log('   3. Verificar logs de deploy no Vercel');
  console.log('   4. Fazer redeploy manual se necessário');
  
  return null;
}

function saveReport(results, correctURL) {
  const report = {
    timestamp: new Date().toISOString(),
    correctURL,
    summary: {
      totalTested: results.length,
      working: results.filter(r => r.isOk).length,
      withZaraContent: results.filter(r => r.hasZaraContent).length,
      withAccError: results.filter(r => r.hasAccError).length
    },
    results
  };
  
  fs.writeFileSync('vercel-url-test-report.json', JSON.stringify(report, null, 2));
  console.log('\n💾 Relatório salvo em: vercel-url-test-report.json');
}

async function main() {
  console.log('🔍 VERIFICAÇÃO DE URLs ALTERNATIVAS DO VERCEL');
  console.log('=' .repeat(70));
  console.log('Procurando pela URL correta do projeto Zara...');
  
  try {
    const results = await testAlternativeURLs();
    const correctURL = analyzeResults(results);
    saveReport(results, correctURL);
    
    if (correctURL) {
      console.log('\n🎉 SUCESSO!');
      console.log(`✅ URL correta encontrada: ${correctURL}`);
      console.log('🧪 Teste manualmente para verificar se tudo está funcionando');
    } else {
      console.log('\n⚠️ URL CORRETA NÃO ENCONTRADA');
      console.log('🔧 Verifique o dashboard do Vercel para mais informações');
    }
    
  } catch (error) {
    console.error('❌ Erro durante verificação:', error.message);
  }
}

// Executar verificação
main().catch(console.error);