#!/usr/bin/env node

/**
 * DIAGNÓSTICO COMPLETO DOS ERROS DE PRODUÇÃO
 * Sistema: Frontend Vercel + Backend Railway + PostgreSQL
 * 
 * Erros identificados:
 * - SyntaxError: Failed to execute 'json' on 'Response': Unexpected token '<'
 * - Frontend recebendo HTML em vez de JSON
 * - Múltiplos componentes afetados: Dashboard, QualityTests, Reports
 */

const axios = require('axios');
const fs = require('fs');

// URLs do sistema em produção
const PRODUCTION_URLS = {
  frontend: 'https://sistema-zara-frontend.vercel.app',
  backend: 'https://zara-backend-production-aab3.up.railway.app',
  api: 'https://zara-backend-production-aab3.up.railway.app/api'
};

// Endpoints críticos que estão falhando
const CRITICAL_ENDPOINTS = [
  '/api/reports/manager-dashboard',
  '/api/reports/leader-dashboard', 
  '/api/reports/quality-metrics',
  '/api/reports/production-data',
  '/api/machines',
  '/api/users',
  '/api/auth/login',
  '/api/health'
];

// Componentes afetados pelos erros
const AFFECTED_COMPONENTS = [
  'ManagerDashboard',
  'QualityTests', 
  'Reports',
  'ProductionData'
];

console.log('🔍 DIAGNÓSTICO COMPLETO - ERROS DE PRODUÇÃO');
console.log('=' .repeat(60));
console.log(`Frontend: ${PRODUCTION_URLS.frontend}`);
console.log(`Backend:  ${PRODUCTION_URLS.backend}`);
console.log(`API:      ${PRODUCTION_URLS.api}`);
console.log('');

// 1. Testar conectividade básica
async function testBasicConnectivity() {
  console.log('\n🌐 TESTE 1: CONECTIVIDADE BÁSICA');
  console.log('-'.repeat(40));
  
  const tests = [
    { name: 'Frontend Vercel', url: PRODUCTION_URLS.frontend },
    { name: 'Backend Railway', url: PRODUCTION_URLS.backend },
    { name: 'API Health Check', url: `${PRODUCTION_URLS.api}/health` }
  ];
  
  for (const test of tests) {
    try {
      const response = await axios.get(test.url, { timeout: 10000 });
      console.log(`✅ ${test.name}: ${response.status} ${response.statusText}`);
      
      // Verificar se está retornando HTML em vez de JSON
      const contentType = response.headers['content-type'] || '';
      if (test.url.includes('/api/') && contentType.includes('text/html')) {
        console.log(`⚠️  ${test.name}: RETORNANDO HTML EM VEZ DE JSON!`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Headers: ${JSON.stringify(error.response.headers, null, 2)}`);
      }
    }
  }
}

// 2. Testar endpoints específicos que estão falhando
async function testCriticalEndpoints() {
  console.log('\n🎯 TESTE 2: ENDPOINTS CRÍTICOS');
  console.log('-'.repeat(40));
  
  for (const endpoint of CRITICAL_ENDPOINTS) {
    const url = `${PRODUCTION_URLS.backend}${endpoint}`;
    
    try {
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      const contentType = response.headers['content-type'] || '';
      const isJson = contentType.includes('application/json');
      const isHtml = contentType.includes('text/html');
      
      console.log(`✅ ${endpoint}: ${response.status}`);
      console.log(`   Content-Type: ${contentType}`);
      
      if (isHtml && endpoint.includes('/api/')) {
        console.log(`   🚨 PROBLEMA: API retornando HTML!`);
        console.log(`   Resposta: ${response.data.substring(0, 100)}...`);
      } else if (isJson) {
        console.log(`   ✅ JSON válido retornado`);
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
      
      if (error.response) {
        const contentType = error.response.headers['content-type'] || '';
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Content-Type: ${contentType}`);
        
        if (contentType.includes('text/html')) {
          console.log(`   🚨 ERRO: Recebendo HTML em vez de JSON!`);
          console.log(`   Resposta: ${error.response.data.substring(0, 200)}...`);
        }
      }
    }
  }
}

// 3. Verificar configurações de CORS
async function testCorsConfiguration() {
  console.log('\n🔒 TESTE 3: CONFIGURAÇÃO CORS');
  console.log('-'.repeat(40));
  
  try {
    const response = await axios.options(`${PRODUCTION_URLS.api}/health`, {
      headers: {
        'Origin': PRODUCTION_URLS.frontend,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': response.headers['access-control-allow-headers']
    };
    
    console.log('✅ CORS Headers:');
    console.log(JSON.stringify(corsHeaders, null, 2));
    
    if (!corsHeaders['Access-Control-Allow-Origin']) {
      console.log('🚨 PROBLEMA: CORS não configurado!');
    }
    
  } catch (error) {
    console.log(`❌ Teste CORS falhou: ${error.message}`);
  }
}

// 4. Simular requisições do frontend
async function simulateFrontendRequests() {
  console.log('\n🖥️  TESTE 4: SIMULAÇÃO DE REQUISIÇÕES DO FRONTEND');
  console.log('-'.repeat(40));
  
  const frontendRequests = [
    { name: 'Manager Dashboard', endpoint: '/api/reports/manager-dashboard' },
    { name: 'Quality Tests', endpoint: '/api/reports/quality-metrics' },
    { name: 'Production Reports', endpoint: '/api/reports/production-data' }
  ];
  
  for (const request of frontendRequests) {
    try {
      const response = await axios.get(`${PRODUCTION_URLS.backend}${request.endpoint}`, {
        headers: {
          'Origin': PRODUCTION_URLS.frontend,
          'Referer': PRODUCTION_URLS.frontend,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });
      
      console.log(`✅ ${request.name}: ${response.status}`);
      
      // Verificar se é JSON válido
      try {
        if (typeof response.data === 'string') {
          JSON.parse(response.data);
        }
        console.log(`   ✅ JSON válido`);
      } catch (jsonError) {
        console.log(`   🚨 JSON INVÁLIDO: ${jsonError.message}`);
        console.log(`   Resposta: ${response.data.substring(0, 200)}...`);
      }
      
    } catch (error) {
      console.log(`❌ ${request.name}: ${error.message}`);
      
      if (error.response && error.response.data) {
        const data = error.response.data.toString();
        if (data.includes('<!doctype') || data.includes('<html>')) {
          console.log(`   🚨 RECEBENDO HTML EM VEZ DE JSON!`);
          console.log(`   Início da resposta: ${data.substring(0, 100)}...`);
        }
      }
    }
  }
}

// 5. Verificar variáveis de ambiente
function checkEnvironmentVariables() {
  console.log('\n⚙️  TESTE 5: VARIÁVEIS DE AMBIENTE');
  console.log('-'.repeat(40));
  
  const envFiles = [
    'frontend/.env.production',
    'frontend/vercel.json',
    'server/.env.production'
  ];
  
  envFiles.forEach(file => {
    try {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        console.log(`✅ ${file}: EXISTE`);
        
        // Verificar URLs
        if (content.includes('sistema-zara-backend-production.up.railway.app')) {
          console.log(`   ⚠️  Contém URL antiga do Railway`);
        }
        if (content.includes('zara-backend-production-aab3.up.railway.app')) {
          console.log(`   ✅ Contém URL correta do Railway`);
        }
      } else {
        console.log(`❌ ${file}: NÃO EXISTE`);
      }
    } catch (error) {
      console.log(`❌ ${file}: Erro ao ler - ${error.message}`);
    }
  });
}

// 6. Gerar relatório de diagnóstico
function generateDiagnosisReport(results) {
  const timestamp = new Date().toISOString();
  const report = {
    timestamp,
    system: {
      frontend: PRODUCTION_URLS.frontend,
      backend: PRODUCTION_URLS.backend,
      api: PRODUCTION_URLS.api
    },
    errors_identified: [
      'SyntaxError: Failed to execute json on Response',
      'Unexpected token < (HTML instead of JSON)',
      'Multiple components affected: Dashboard, QualityTests, Reports'
    ],
    affected_components: AFFECTED_COMPONENTS,
    critical_endpoints: CRITICAL_ENDPOINTS,
    diagnosis: results,
    recommendations: [
      '1. Verificar se o backend Railway está rodando corretamente',
      '2. Confirmar se as rotas da API estão respondendo JSON',
      '3. Verificar configuração de CORS no Railway',
      '4. Validar variáveis de ambiente no Vercel',
      '5. Testar redeploy do backend Railway',
      '6. Verificar logs do Railway para erros internos',
      '7. Confirmar se o PostgreSQL está conectado corretamente'
    ],
    next_steps: [
      'Executar redeploy manual do Railway',
      'Verificar logs do Railway Dashboard',
      'Testar endpoints individualmente',
      'Validar configuração do banco PostgreSQL',
      'Atualizar variáveis de ambiente se necessário'
    ]
  };
  
  const reportFile = `production-diagnosis-${Date.now()}.json`;
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  
  console.log('\n📋 RELATÓRIO DE DIAGNÓSTICO');
  console.log('-'.repeat(40));
  console.log(`Relatório salvo em: ${reportFile}`);
  console.log('\n🎯 PRINCIPAIS PROBLEMAS IDENTIFICADOS:');
  report.errors_identified.forEach(error => console.log(`   • ${error}`));
  
  console.log('\n💡 RECOMENDAÇÕES PRIORITÁRIAS:');
  report.recommendations.slice(0, 3).forEach(rec => console.log(`   ${rec}`));
  
  return report;
}

// Executar diagnóstico completo
async function runCompleteDiagnosis() {
  const results = {};
  
  try {
    console.log('🚀 INICIANDO DIAGNÓSTICO COMPLETO DO SISTEMA');
    console.log('Analisando erros de produção: Frontend Vercel + Backend Railway + PostgreSQL');
    console.log('');
    
    await testBasicConnectivity();
    await testCriticalEndpoints();
    await testCorsConfiguration();
    await simulateFrontendRequests();
    checkEnvironmentVariables();
    
    const report = generateDiagnosisReport(results);
    
    console.log('\n✅ DIAGNÓSTICO CONCLUÍDO!');
    console.log('\n🔧 PRÓXIMAS AÇÕES RECOMENDADAS:');
    console.log('1. Verificar Railway Dashboard para status do backend');
    console.log('2. Executar redeploy manual se necessário');
    console.log('3. Verificar logs do Railway para erros específicos');
    console.log('4. Testar conectividade com PostgreSQL');
    console.log('5. Validar configurações de CORS');
    
  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error.message);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runCompleteDiagnosis();
}

module.exports = {
  runCompleteDiagnosis,
  testBasicConnectivity,
  testCriticalEndpoints,
  PRODUCTION_URLS,
  CRITICAL_ENDPOINTS
};