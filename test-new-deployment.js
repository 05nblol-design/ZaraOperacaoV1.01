#!/usr/bin/env node

/**
 * Script para testar o novo deployment do Vercel após configuração das variáveis
 */

const https = require('https');

// Nova URL do deployment
const NEW_FRONTEND_URL = 'https://sistema-zara-frontend-kg85kov5j-05nblol-designs-projects.vercel.app';
const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, options, (res) => {
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
    
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testNewDeployment() {
  console.log('🧪 Testando novo deployment do Vercel...');
  console.log('=' .repeat(60));
  console.log(`🌐 URL: ${NEW_FRONTEND_URL}`);
  console.log('');
  
  try {
    // Teste 1: Verificar se o frontend está acessível
    console.log('1️⃣ Testando acesso ao frontend...');
    const frontendResponse = await makeRequest(NEW_FRONTEND_URL);
    
    console.log(`   Status: ${frontendResponse.statusCode}`);
    
    if (frontendResponse.statusCode === 200) {
      console.log('   ✅ Frontend acessível!');
      
      // Verificar se contém as variáveis corretas no HTML
      const htmlContent = frontendResponse.data;
      
      if (htmlContent.includes('zara-backend-production-aab3.up.railway.app')) {
        console.log('   ✅ Variáveis de ambiente aplicadas corretamente!');
      } else {
        console.log('   ⚠️  Variáveis de ambiente não detectadas no HTML');
      }
      
      // Verificar se não há erros de sintaxe no HTML
      if (htmlContent.includes('<!doctype') || htmlContent.includes('<!DOCTYPE')) {
        console.log('   ✅ HTML válido retornado');
      } else {
        console.log('   ❌ HTML inválido ou incompleto');
      }
      
    } else {
      console.log(`   ❌ Frontend retornou status: ${frontendResponse.statusCode}`);
    }
    
    // Teste 2: Simular requisição AJAX para API
    console.log('\n2️⃣ Testando conectividade com backend...');
    try {
      const apiResponse = await makeRequest(`${BACKEND_URL}/api/auth/login`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Origin': NEW_FRONTEND_URL
        }
      });
      
      console.log(`   Status: ${apiResponse.statusCode}`);
      
      if (apiResponse.statusCode === 400 || apiResponse.statusCode === 401) {
        console.log('   ✅ Backend acessível (erro de autenticação esperado)');
        
        // Verificar se retorna JSON válido
        try {
          const jsonResponse = JSON.parse(apiResponse.data);
          console.log('   ✅ Backend retorna JSON válido');
          console.log(`   📄 Resposta: ${JSON.stringify(jsonResponse)}`);
        } catch (jsonError) {
          console.log('   ❌ Backend não retorna JSON válido');
        }
      } else {
        console.log(`   ⚠️  Status inesperado: ${apiResponse.statusCode}`);
      }
      
    } catch (backendError) {
      console.log(`   ❌ Erro ao conectar com backend: ${backendError.message}`);
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('📋 RESULTADO:');
    
    if (frontendResponse.statusCode === 200) {
      console.log('✅ DEPLOYMENT FUNCIONANDO!');
      console.log('🎉 Os erros de "Unexpected token \'<\'" devem estar resolvidos');
      console.log('🌐 Acesse o frontend e verifique se os dados carregam corretamente');
    } else {
      console.log('❌ DEPLOYMENT COM PROBLEMAS');
      console.log('🔧 Pode ser necessário aguardar mais tempo ou verificar configurações');
    }
    
    console.log(`\n🔗 URL para testar: ${NEW_FRONTEND_URL}`);
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    console.log('⏳ Tente novamente em alguns minutos - o deployment pode ainda estar propagando');
  }
}

// Executar teste
testNewDeployment();