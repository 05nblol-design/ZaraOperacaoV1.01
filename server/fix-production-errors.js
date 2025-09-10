const axios = require('axios');
const fs = require('fs');
const path = require('path');

console.log('🔧 DIAGNÓSTICO E CORREÇÃO DE ERROS DE PRODUÇÃO');
console.log('=' .repeat(60));

// URLs de produção
const RAILWAY_URL = 'https://sistema-zara-backend-production.up.railway.app';
const VERCEL_URL = 'https://sistema-zara-frontend.vercel.app';

async function testEndpoint(url, description) {
  try {
    console.log(`\n🧪 Testando: ${description}`);
    console.log(`📍 URL: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 10000,
      validateStatus: () => true // Aceitar qualquer status
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Content-Type: ${response.headers['content-type']}`);
    
    if (response.headers['content-type']?.includes('text/html')) {
      console.log('⚠️  PROBLEMA: Recebendo HTML ao invés de JSON!');
      console.log('📝 Primeiros 200 caracteres da resposta:');
      console.log(response.data.substring(0, 200) + '...');
      return false;
    }
    
    if (response.status >= 200 && response.status < 300) {
      console.log('✅ Endpoint funcionando corretamente');
      return true;
    } else {
      console.log(`❌ Erro HTTP ${response.status}:`, response.data);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erro de conexão: ${error.message}`);
    if (error.code === 'ENOTFOUND') {
      console.log('🔍 DNS não encontrado - serviço pode estar offline');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('🔍 Conexão recusada - serviço não está rodando');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('🔍 Timeout - serviço muito lento ou indisponível');
    }
    return false;
  }
}

async function checkCORS(url) {
  try {
    console.log(`\n🌐 Verificando CORS para: ${url}`);
    
    const response = await axios.options(url, {
      headers: {
        'Origin': VERCEL_URL,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      },
      timeout: 5000,
      validateStatus: () => true
    });
    
    console.log(`Status: ${response.status}`);
    console.log('CORS Headers:');
    console.log(`  Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin']}`);
    console.log(`  Access-Control-Allow-Methods: ${response.headers['access-control-allow-methods']}`);
    console.log(`  Access-Control-Allow-Headers: ${response.headers['access-control-allow-headers']}`);
    
    return response.status === 204 || response.status === 200;
  } catch (error) {
    console.log(`❌ Erro CORS: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('\n📊 TESTANDO ENDPOINTS DE PRODUÇÃO\n');
  
  // Testar Railway Backend
  console.log('🚂 RAILWAY BACKEND');
  console.log('-'.repeat(30));
  
  const railwayHealth = await testEndpoint(`${RAILWAY_URL}/api/health`, 'Railway Health Check');
  const railwayQuality = await testEndpoint(`${RAILWAY_URL}/api/quality-tests`, 'Railway Quality Tests');
  const railwayReports = await testEndpoint(`${RAILWAY_URL}/api/reports/quality-metrics`, 'Railway Reports');
  
  // Testar CORS
  const corsOk = await checkCORS(`${RAILWAY_URL}/api/health`);
  
  // Testar Vercel Frontend
  console.log('\n🌐 VERCEL FRONTEND');
  console.log('-'.repeat(30));
  
  const vercelHome = await testEndpoint(VERCEL_URL, 'Vercel Home Page');
  const vercelQuality = await testEndpoint(`${VERCEL_URL}/quality`, 'Vercel Quality Page');
  
  // Resumo dos problemas
  console.log('\n📋 RESUMO DOS PROBLEMAS ENCONTRADOS');
  console.log('=' .repeat(50));
  
  const problems = [];
  
  if (!railwayHealth) {
    problems.push('❌ Railway backend não está respondendo');
  }
  
  if (!railwayQuality) {
    problems.push('❌ Rota /api/quality-tests não funciona no Railway');
  }
  
  if (!railwayReports) {
    problems.push('❌ Rota /api/reports não funciona no Railway');
  }
  
  if (!corsOk) {
    problems.push('❌ CORS não configurado corretamente');
  }
  
  if (!vercelHome) {
    problems.push('❌ Frontend Vercel com problemas');
  }
  
  if (problems.length === 0) {
    console.log('✅ Nenhum problema encontrado!');
  } else {
    problems.forEach(problem => console.log(problem));
  }
  
  // Soluções recomendadas
  console.log('\n🔧 SOLUÇÕES RECOMENDADAS');
  console.log('=' .repeat(50));
  
  if (!railwayHealth) {
    console.log('\n1. 🚂 RAILWAY BACKEND OFFLINE:');
    console.log('   - Verificar se o deploy foi bem-sucedido');
    console.log('   - Verificar logs do Railway');
    console.log('   - Redeployar se necessário');
    console.log('   - Comando: railway up --detach');
  }
  
  if (!corsOk) {
    console.log('\n2. 🌐 CONFIGURAR CORS NO RAILWAY:');
    console.log('   - Acessar Railway Dashboard');
    console.log('   - Ir em Variables');
    console.log('   - Adicionar: CORS_ORIGINS=https://sistema-zara-frontend.vercel.app');
    console.log('   - Adicionar: CLIENT_URL=https://sistema-zara-frontend.vercel.app');
    console.log('   - Redeployar o serviço');
  }
  
  if (!railwayQuality || !railwayReports) {
    console.log('\n3. 🔧 VERIFICAR ROTAS DA API:');
    console.log('   - Verificar se todas as rotas estão registradas');
    console.log('   - Verificar middleware de autenticação');
    console.log('   - Verificar conexão com banco de dados');
  }
  
  console.log('\n4. 🔄 COMANDOS PARA CORREÇÃO:');
  console.log('   - git add . && git commit -m "fix: production errors"');
  console.log('   - git push origin main');
  console.log('   - Aguardar redeploy automático');
  
  console.log('\n✅ Diagnóstico concluído!');
}

main().catch(console.error);