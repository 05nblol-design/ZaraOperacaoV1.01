#!/usr/bin/env node

/**
 * 🔗 TESTE CONEXÃO VERCEL ↔ RAILWAY
 * 
 * Testa a conectividade entre o frontend Vercel e backend Railway
 */

const https = require('https');
const http = require('http');

// URLs para teste
const RAILWAY_BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';
const VERCEL_FRONTEND_URL = 'https://sistema-zara-frontend.vercel.app';

console.log('\n🔗 TESTANDO CONEXÃO VERCEL ↔ RAILWAY...');
console.log(`🎯 Backend: ${RAILWAY_BACKEND_URL}`);
console.log(`🌐 Frontend: ${VERCEL_FRONTEND_URL}`);

// Função para fazer requisições com headers apropriados
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    };
    
    const requestOptions = { ...defaultOptions, ...options };
    
    const request = https.get(url, requestOptions, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          data: data,
          url: url
        });
      });
    });
    
    request.on('timeout', () => {
      request.destroy();
      reject(new Error(`Timeout para ${url}`));
    });
    
    request.on('error', (error) => {
      reject(new Error(`Erro em ${url}: ${error.message}`));
    });
  });
}

// Testar endpoints do Railway
async function testRailwayEndpoints() {
  console.log('\n🚂 TESTANDO ENDPOINTS RAILWAY...');
  
  const endpoints = [
    { name: 'Root', path: '' },
    { name: 'Health Check', path: '/api/health' },
    { name: 'API Base', path: '/api' },
    { name: 'Auth', path: '/api/auth' },
    { name: 'Users', path: '/api/users' }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const url = `${RAILWAY_BACKEND_URL}${endpoint.path}`;
    
    try {
      console.log(`\n⏳ Testando: ${endpoint.name} (${endpoint.path})`);
      const response = await makeRequest(url);
      
      console.log(`   📊 Status: ${response.statusCode}`);
      
      if (response.statusCode === 200) {
        console.log('   ✅ Sucesso!');
        try {
          const jsonData = JSON.parse(response.data);
          console.log(`   📄 Dados:`, JSON.stringify(jsonData, null, 2).substring(0, 200) + '...');
        } catch {
          console.log(`   📄 Resposta: ${response.data.substring(0, 100)}...`);
        }
      } else if (response.statusCode === 401) {
        console.log('   🔐 Não autorizado (normal para endpoints protegidos)');
      } else if (response.statusCode === 404) {
        console.log('   📍 Endpoint não encontrado');
      } else {
        console.log(`   ⚠️  Status inesperado: ${response.statusCode}`);
      }
      
      results.push({
        endpoint: endpoint.name,
        path: endpoint.path,
        status: response.statusCode,
        success: response.statusCode === 200 || response.statusCode === 401
      });
      
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
      results.push({
        endpoint: endpoint.name,
        path: endpoint.path,
        status: 'ERROR',
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

// Testar frontend Vercel
async function testVercelFrontend() {
  console.log('\n🌐 TESTANDO FRONTEND VERCEL...');
  
  try {
    const response = await makeRequest(VERCEL_FRONTEND_URL);
    
    console.log(`📊 Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log('✅ Frontend Vercel: FUNCIONANDO');
      
      // Verificar se contém configurações do Railway
      const content = response.data.toLowerCase();
      const hasRailwayConfig = content.includes('zara-backend-production-aab3');
      
      if (hasRailwayConfig) {
        console.log('✅ Configuração Railway: DETECTADA');
      } else {
        console.log('⚠️  Configuração Railway: NÃO DETECTADA no HTML');
        console.log('   (Isso é normal se as variáveis estão em JS compilado)');
      }
      
      return { success: true, status: response.statusCode };
    } else {
      console.log(`❌ Frontend Vercel: ERRO ${response.statusCode}`);
      return { success: false, status: response.statusCode };
    }
  } catch (error) {
    console.log(`❌ Frontend Vercel: ERRO - ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Testar CORS entre Vercel e Railway
async function testCORS() {
  console.log('\n🔒 TESTANDO CORS...');
  
  try {
    const response = await makeRequest(`${RAILWAY_BACKEND_URL}/api/health`, {
      headers: {
        'Origin': VERCEL_FRONTEND_URL,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    const corsHeaders = {
      'access-control-allow-origin': response.headers['access-control-allow-origin'],
      'access-control-allow-methods': response.headers['access-control-allow-methods'],
      'access-control-allow-headers': response.headers['access-control-allow-headers']
    };
    
    console.log('📋 Headers CORS:');
    Object.entries(corsHeaders).forEach(([key, value]) => {
      if (value) {
        console.log(`   ✅ ${key}: ${value}`);
      } else {
        console.log(`   ❌ ${key}: NÃO CONFIGURADO`);
      }
    });
    
    const allowsVercel = corsHeaders['access-control-allow-origin'] === '*' || 
                        corsHeaders['access-control-allow-origin'] === VERCEL_FRONTEND_URL;
    
    if (allowsVercel) {
      console.log('✅ CORS: Vercel permitido');
    } else {
      console.log('⚠️  CORS: Vercel pode não estar permitido');
    }
    
    return { success: allowsVercel, headers: corsHeaders };
    
  } catch (error) {
    console.log(`❌ Erro ao testar CORS: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Função principal
async function main() {
  console.log('\n🚀 INICIANDO TESTE COMPLETO DE CONECTIVIDADE...');
  
  const railwayResults = await testRailwayEndpoints();
  const vercelResult = await testVercelFrontend();
  const corsResult = await testCORS();
  
  console.log('\n📊 RESUMO DOS TESTES:');
  
  // Resumo Railway
  console.log('\n🚂 BACKEND RAILWAY:');
  const railwayWorking = railwayResults.some(r => r.success);
  console.log(`   Status Geral: ${railwayWorking ? '✅ FUNCIONANDO' : '❌ COM PROBLEMAS'}`);
  
  railwayResults.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`   ${status} ${result.endpoint}: ${result.status}`);
  });
  
  // Resumo Vercel
  console.log('\n🌐 FRONTEND VERCEL:');
  console.log(`   Status: ${vercelResult.success ? '✅ FUNCIONANDO' : '❌ COM PROBLEMAS'}`);
  
  // Resumo CORS
  console.log('\n🔒 CORS:');
  console.log(`   Status: ${corsResult.success ? '✅ CONFIGURADO' : '⚠️  VERIFICAR'}`);
  
  // Diagnóstico final
  console.log('\n🎯 DIAGNÓSTICO FINAL:');
  
  if (railwayWorking && vercelResult.success && corsResult.success) {
    console.log('\n🎉 TUDO FUNCIONANDO PERFEITAMENTE!');
    console.log('✅ Backend Railway: OK');
    console.log('✅ Frontend Vercel: OK');
    console.log('✅ CORS: OK');
    console.log('\n🚀 O sistema está pronto para uso!');
  } else {
    console.log('\n⚠️  PROBLEMAS DETECTADOS:');
    
    if (!railwayWorking) {
      console.log('\n🔧 BACKEND RAILWAY:');
      console.log('   - Verifique se o serviço está rodando');
      console.log('   - Confirme as variáveis de ambiente');
      console.log('   - Verifique os logs no Railway Dashboard');
    }
    
    if (!vercelResult.success) {
      console.log('\n🌐 FRONTEND VERCEL:');
      console.log('   - Verifique se o deploy foi bem-sucedido');
      console.log('   - Confirme as variáveis de ambiente no Vercel');
      console.log('   - Verifique os logs de build');
    }
    
    if (!corsResult.success) {
      console.log('\n🔒 CORS:');
      console.log('   - Configure CORS no backend para permitir Vercel');
      console.log('   - Adicione o domínio Vercel nas origens permitidas');
      console.log('   - Verifique middleware de CORS');
    }
  }
  
  console.log('\n🔗 LINKS PARA VERIFICAÇÃO:');
  console.log(`   🎯 Backend Health: ${RAILWAY_BACKEND_URL}/api/health`);
  console.log(`   🌐 Frontend: ${VERCEL_FRONTEND_URL}`);
  console.log('   ⚙️  Vercel Dashboard: https://vercel.com/dashboard');
  console.log('   🚂 Railway Dashboard: https://railway.app/dashboard');
  
  console.log('\n============================================================');
  console.log('🔗 TESTE DE CONECTIVIDADE CONCLUÍDO!');
  console.log('============================================================\n');
}

// Executar teste
main().catch(error => {
  console.error('❌ Erro durante teste:', error.message);
  process.exit(1);
});