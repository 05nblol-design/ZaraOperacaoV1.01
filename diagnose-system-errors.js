#!/usr/bin/env node

/**
 * Script de Diagnóstico Completo do Sistema
 * - Verifica erros persistentes no Vercel
 * - Testa APIs do Railway
 * - Identifica diferenças entre localhost e produção
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const VERCEL_URL = 'https://sistema-zara-frontend.vercel.app';
const RAILWAY_URL = 'https://zaraoperacaov101-production.up.railway.app';
const LOCAL_FRONTEND = 'http://localhost:5173';
const LOCAL_BACKEND = 'http://localhost:3000';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'System-Diagnostic/1.0',
        ...options.headers
      }
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data.startsWith('{') || data.startsWith('[') ? JSON.parse(data) : data;
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ error: error.message, status: 0 });
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testEndpoint(name, url, options = {}) {
  console.log(`\n🔍 Testando ${name}...`);
  try {
    const result = await makeRequest(url, options);
    
    if (result.error) {
      console.log(`❌ ${name}: ERRO - ${result.error}`);
      return { name, status: 'error', error: result.error };
    }
    
    const statusIcon = result.status >= 200 && result.status < 300 ? '✅' : 
                      result.status >= 400 ? '❌' : '⚠️';
    
    console.log(`${statusIcon} ${name}: Status ${result.status}`);
    
    if (result.status >= 400) {
      console.log(`   Erro: ${typeof result.data === 'string' ? result.data.substring(0, 100) : JSON.stringify(result.data).substring(0, 100)}`);
    }
    
    return { name, status: result.status, data: result.data, headers: result.headers };
  } catch (error) {
    console.log(`❌ ${name}: EXCEÇÃO - ${error.message}`);
    return { name, status: 'exception', error: error.message };
  }
}

async function checkVercelErrors() {
  console.log('\n🔍 DIAGNÓSTICO DO VERCEL');
  console.log('=' .repeat(50));
  
  const vercelResult = await testEndpoint('Vercel Frontend', VERCEL_URL);
  
  if (vercelResult.status === 200 && typeof vercelResult.data === 'string') {
    // Verificar erros específicos no HTML/JS
    const html = vercelResult.data;
    
    console.log('\n📊 Análise de Erros no Vercel:');
    
    const errors = {
      'acc is not defined': html.includes('acc is not defined'),
      'ReferenceError': html.includes('ReferenceError'),
      'MachineStatus errors': html.includes('MachineStatus-') && html.includes('.js'),
      'API connection errors': html.includes('Failed to fetch') || html.includes('Network Error'),
      'Authentication errors': html.includes('401') || html.includes('Unauthorized')
    };
    
    Object.entries(errors).forEach(([error, found]) => {
      console.log(`   ${found ? '❌' : '✅'} ${error}: ${found ? 'ENCONTRADO' : 'OK'}`);
    });
    
    // Extrair arquivos JS para análise
    const jsFiles = html.match(/\/assets\/[^"']+\.js/g) || [];
    console.log(`\n📁 Arquivos JS encontrados: ${jsFiles.length}`);
    jsFiles.slice(0, 5).forEach(file => console.log(`   - ${file}`));
  }
  
  return vercelResult;
}

async function checkRailwayAPIs() {
  console.log('\n🔍 DIAGNÓSTICO DO RAILWAY (APIs)');
  console.log('=' .repeat(50));
  
  const endpoints = [
    { name: 'Health Check', url: `${RAILWAY_URL}/api/health` },
    { name: 'Auth Login', url: `${RAILWAY_URL}/api/auth/login`, method: 'POST', body: { email: 'test@test.com', password: 'test123' } },
    { name: 'Machines List', url: `${RAILWAY_URL}/api/machines` },
    { name: 'Users List', url: `${RAILWAY_URL}/api/users` },
    { name: 'Production Data', url: `${RAILWAY_URL}/api/production` },
    { name: 'Reports', url: `${RAILWAY_URL}/api/reports` }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.name, endpoint.url, {
      method: endpoint.method,
      body: endpoint.body
    });
    results.push(result);
  }
  
  // Resumo dos resultados
  console.log('\n📊 Resumo das APIs:');
  const working = results.filter(r => r.status >= 200 && r.status < 300).length;
  const broken = results.filter(r => r.status >= 400 || r.status === 'error' || r.status === 'exception').length;
  
  console.log(`   ✅ Funcionando: ${working}/${results.length}`);
  console.log(`   ❌ Quebradas: ${broken}/${results.length}`);
  
  return results;
}

async function compareLocalVsProduction() {
  console.log('\n🔍 COMPARAÇÃO LOCAL vs PRODUÇÃO');
  console.log('=' .repeat(50));
  
  const comparisons = [
    { name: 'Frontend Local', url: LOCAL_FRONTEND },
    { name: 'Frontend Vercel', url: VERCEL_URL },
    { name: 'Backend Local', url: `${LOCAL_BACKEND}/api/health` },
    { name: 'Backend Railway', url: `${RAILWAY_URL}/api/health` }
  ];
  
  const results = [];
  
  for (const comp of comparisons) {
    const result = await testEndpoint(comp.name, comp.url);
    results.push(result);
  }
  
  return results;
}

async function generateFixPlan(vercelErrors, railwayResults, localComparison) {
  console.log('\n🛠️ PLANO DE CORREÇÃO');
  console.log('=' .repeat(50));
  
  const fixes = [];
  
  // Análise dos erros do Vercel
  if (vercelErrors.status !== 200) {
    fixes.push('🔴 CRÍTICO: Vercel não está acessível - verificar deploy');
  }
  
  // Análise das APIs do Railway
  const brokenAPIs = railwayResults.filter(r => r.status >= 400 || r.status === 'error');
  if (brokenAPIs.length > 0) {
    fixes.push(`🔴 CRÍTICO: ${brokenAPIs.length} APIs quebradas no Railway`);
    brokenAPIs.forEach(api => {
      fixes.push(`   - Corrigir: ${api.name}`);
    });
  }
  
  // Verificar se local funciona mas produção não
  const localFrontend = localComparison.find(r => r.name.includes('Local'));
  const prodFrontend = localComparison.find(r => r.name.includes('Vercel'));
  
  if (localFrontend?.status === 200 && prodFrontend?.status !== 200) {
    fixes.push('🟡 MÉDIO: Diferença entre local e produção - redeploy necessário');
  }
  
  // Plano de ação
  console.log('\n📋 AÇÕES NECESSÁRIAS:');
  if (fixes.length === 0) {
    console.log('✅ Nenhuma ação crítica necessária');
  } else {
    fixes.forEach((fix, index) => {
      console.log(`${index + 1}. ${fix}`);
    });
  }
  
  // Scripts de correção
  console.log('\n🔧 SCRIPTS DE CORREÇÃO DISPONÍVEIS:');
  console.log('   - fix-vercel-acc-error.js (corrigir erro acc)');
  console.log('   - force-vercel-redeploy.js (redeploy forçado)');
  console.log('   - check-railway-redeploy.js (verificar Railway)');
  console.log('   - test-vercel-machine-errors.js (testar erros específicos)');
  
  return fixes;
}

async function main() {
  console.log('🚀 DIAGNÓSTICO COMPLETO DO SISTEMA ZARA');
  console.log('=' .repeat(60));
  console.log('Verificando Vercel, Railway e diferenças local vs produção...');
  
  try {
    // 1. Verificar erros do Vercel
    const vercelErrors = await checkVercelErrors();
    
    // 2. Testar APIs do Railway
    const railwayResults = await checkRailwayAPIs();
    
    // 3. Comparar local vs produção
    const localComparison = await compareLocalVsProduction();
    
    // 4. Gerar plano de correção
    const fixes = await generateFixPlan(vercelErrors, railwayResults, localComparison);
    
    // 5. Salvar relatório
    const report = {
      timestamp: new Date().toISOString(),
      vercel: vercelErrors,
      railway: railwayResults,
      comparison: localComparison,
      fixes: fixes
    };
    
    fs.writeFileSync('system-diagnosis-report.json', JSON.stringify(report, null, 2));
    console.log('\n💾 Relatório salvo em: system-diagnosis-report.json');
    
  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error.message);
  }
}

// Executar diagnóstico
main().catch(console.error);