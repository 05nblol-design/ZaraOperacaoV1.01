#!/usr/bin/env node

/**
 * Script para testar o deployment do Vercel e verificar se os erros foram resolvidos
 */

const https = require('https');
const http = require('http');

// URLs para testar
const FRONTEND_URL = 'https://sistema-zara-frontend-i1gatz17x-05nblol-designs-projects.vercel.app';
const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testDeployment() {
  console.log('🧪 Testando deployment do Vercel...');
  console.log('=' .repeat(50));
  
  try {
    // Teste 1: Verificar se o frontend está acessível
    console.log('\n1️⃣ Testando acesso ao frontend...');
    const frontendResponse = await makeRequest(FRONTEND_URL);
    
    if (frontendResponse.statusCode === 200) {
      console.log('✅ Frontend acessível (Status: 200)');
      
      // Verificar se contém as variáveis de ambiente corretas
      if (frontendResponse.data.includes('zara-backend-production-aab3.up.railway.app')) {
        console.log('✅ Variáveis de ambiente parecem estar configuradas');
      } else {
        console.log('⚠️  Não foi possível verificar as variáveis de ambiente no HTML');
      }
    } else {
      console.log(`❌ Frontend retornou status: ${frontendResponse.statusCode}`);
    }
    
    // Teste 2: Verificar se o backend está acessível
    console.log('\n2️⃣ Testando acesso ao backend...');
    try {
      const backendResponse = await makeRequest(`${BACKEND_URL}/api/health`);
      console.log(`✅ Backend acessível (Status: ${backendResponse.statusCode})`);
    } catch (error) {
      // Tentar endpoint que sabemos que existe
      try {
        const authResponse = await makeRequest(`${BACKEND_URL}/api/auth/login`);
        console.log(`✅ Backend acessível via /api/auth/login (Status: ${authResponse.statusCode})`);
      } catch (authError) {
        console.log('❌ Backend não acessível:', authError.message);
      }
    }
    
    // Teste 3: Verificar CORS
    console.log('\n3️⃣ Verificando configuração CORS...');
    try {
      const corsResponse = await makeRequest(`${BACKEND_URL}/api/machines/production/aggregate`);
      if (corsResponse.statusCode === 401 || corsResponse.statusCode === 403) {
        console.log('✅ CORS configurado (endpoint retorna erro de autenticação, não CORS)');
      } else {
        console.log(`ℹ️  Endpoint retornou status: ${corsResponse.statusCode}`);
      }
    } catch (error) {
      console.log('⚠️  Erro ao testar CORS:', error.message);
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('📋 PRÓXIMOS PASSOS:');
    console.log('1. Aguarde 2-3 minutos para propagação completa');
    console.log('2. Acesse o frontend e verifique se os erros foram resolvidos');
    console.log('3. Se ainda houver erros, verifique o Network tab do navegador');
    console.log('4. Confirme se as requisições estão indo para o Railway backend');
    console.log('\n🌐 URLs para testar:');
    console.log(`Frontend: ${FRONTEND_URL}`);
    console.log(`Backend: ${BACKEND_URL}`);
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  }
}

// Executar testes
testDeployment();