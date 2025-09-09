#!/usr/bin/env node

/**
 * 🔍 VERIFICAÇÃO CONFIGURAÇÃO VERCEL
 * 
 * Verifica se o projeto sistema-zara-frontend no Vercel está configurado
 * corretamente para conectar com o backend Railway
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// URLs para verificação
const RAILWAY_BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';
const RAILWAY_API_URL = `${RAILWAY_BACKEND_URL}/api`;
const VERCEL_FRONTEND_URL = 'https://sistema-zara-frontend.vercel.app'; // URL esperada

console.log('\n🔍 VERIFICANDO CONFIGURAÇÃO VERCEL...');
console.log(`🎯 Backend Railway: ${RAILWAY_BACKEND_URL}`);
console.log(`🌐 Frontend Vercel: ${VERCEL_FRONTEND_URL}`);

// Função para fazer requisições HTTPS
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { timeout: 10000 }, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          data: data
        });
      });
    });
    
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
    
    request.on('error', (error) => {
      reject(error);
    });
  });
}

// Verificar backend Railway
async function checkRailwayBackend() {
  console.log('\n🔧 VERIFICANDO BACKEND RAILWAY...');
  
  try {
    const response = await makeRequest(`${RAILWAY_API_URL}/health`);
    
    if (response.statusCode === 200) {
      console.log('✅ Backend Railway: FUNCIONANDO');
      console.log(`   Status: ${response.statusCode}`);
      return true;
    } else {
      console.log(`❌ Backend Railway: ERRO ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Backend Railway: ERRO - ${error.message}`);
    return false;
  }
}

// Verificar frontend Vercel
async function checkVercelFrontend() {
  console.log('\n🌐 VERIFICANDO FRONTEND VERCEL...');
  
  try {
    const response = await makeRequest(VERCEL_FRONTEND_URL);
    
    if (response.statusCode === 200) {
      console.log('✅ Frontend Vercel: FUNCIONANDO');
      console.log(`   Status: ${response.statusCode}`);
      
      // Verificar se contém referências ao Railway
      const hasRailwayRef = response.data.includes('zara-backend-production-aab3.up.railway.app');
      if (hasRailwayRef) {
        console.log('✅ Configuração Railway: DETECTADA no frontend');
      } else {
        console.log('⚠️  Configuração Railway: NÃO DETECTADA no frontend');
      }
      
      return true;
    } else {
      console.log(`❌ Frontend Vercel: ERRO ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Frontend Vercel: ERRO - ${error.message}`);
    return false;
  }
}

// Verificar arquivos de configuração local
function checkLocalConfig() {
  console.log('\n📁 VERIFICANDO CONFIGURAÇÃO LOCAL...');
  
  const configFiles = [
    'frontend/.env.production',
    'frontend/.env.vercel',
    'frontend/vercel.json'
  ];
  
  let allConfigsOk = true;
  
  configFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}: EXISTE`);
      
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('zara-backend-production-aab3.up.railway.app')) {
        console.log(`   ✅ URLs Railway: CONFIGURADAS`);
      } else {
        console.log(`   ❌ URLs Railway: NÃO CONFIGURADAS`);
        allConfigsOk = false;
      }
    } else {
      console.log(`❌ ${file}: NÃO EXISTE`);
      allConfigsOk = false;
    }
  });
  
  return allConfigsOk;
}

// Verificar variáveis de ambiente necessárias
function checkRequiredEnvVars() {
  console.log('\n⚙️  VERIFICANDO VARIÁVEIS DE AMBIENTE...');
  
  const requiredVars = [
    'VITE_API_URL',
    'VITE_SOCKET_URL',
    'VITE_BACKEND_URL',
    'VITE_APP_NAME',
    'VITE_APP_VERSION'
  ];
  
  const envFile = path.join(__dirname, 'frontend', '.env.vercel');
  
  if (!fs.existsSync(envFile)) {
    console.log('❌ Arquivo .env.vercel não encontrado');
    return false;
  }
  
  const envContent = fs.readFileSync(envFile, 'utf8');
  let allVarsPresent = true;
  
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`✅ ${varName}: CONFIGURADA`);
    } else {
      console.log(`❌ ${varName}: NÃO CONFIGURADA`);
      allVarsPresent = false;
    }
  });
  
  return allVarsPresent;
}

// Função principal
async function main() {
  console.log('\n🚀 INICIANDO VERIFICAÇÃO COMPLETA...');
  
  const railwayOk = await checkRailwayBackend();
  const vercelOk = await checkVercelFrontend();
  const localConfigOk = checkLocalConfig();
  const envVarsOk = checkRequiredEnvVars();
  
  console.log('\n📊 RESUMO DA VERIFICAÇÃO:');
  console.log(`   Backend Railway: ${railwayOk ? '✅ OK' : '❌ ERRO'}`);
  console.log(`   Frontend Vercel: ${vercelOk ? '✅ OK' : '❌ ERRO'}`);
  console.log(`   Configuração Local: ${localConfigOk ? '✅ OK' : '❌ ERRO'}`);
  console.log(`   Variáveis de Ambiente: ${envVarsOk ? '✅ OK' : '❌ ERRO'}`);
  
  if (railwayOk && vercelOk && localConfigOk && envVarsOk) {
    console.log('\n🎉 TUDO CONFIGURADO CORRETAMENTE!');
    console.log('\n✅ O projeto sistema-zara-frontend está pronto para produção!');
  } else {
    console.log('\n⚠️  PROBLEMAS DETECTADOS!');
    
    if (!railwayOk) {
      console.log('\n🔧 AÇÕES PARA BACKEND RAILWAY:');
      console.log('   1. Verifique se o serviço está rodando');
      console.log('   2. Confirme a URL do backend');
      console.log('   3. Teste a rota /api/health');
    }
    
    if (!vercelOk) {
      console.log('\n🌐 AÇÕES PARA FRONTEND VERCEL:');
      console.log('   1. Verifique se o deploy foi realizado');
      console.log('   2. Confirme a URL do Vercel');
      console.log('   3. Verifique os logs de build');
    }
    
    if (!localConfigOk) {
      console.log('\n📁 AÇÕES PARA CONFIGURAÇÃO LOCAL:');
      console.log('   1. Execute: node configure-frontend-vercel.js');
      console.log('   2. Verifique os arquivos de configuração');
      console.log('   3. Confirme as URLs do Railway');
    }
    
    if (!envVarsOk) {
      console.log('\n⚙️  AÇÕES PARA VARIÁVEIS DE AMBIENTE:');
      console.log('   1. Configure as variáveis no Vercel Dashboard');
      console.log('   2. Use as variáveis do arquivo .env.vercel');
      console.log('   3. Faça redeploy após configurar');
    }
  }
  
  console.log('\n🔗 LINKS ÚTEIS:');
  console.log(`   🎯 Backend: ${RAILWAY_BACKEND_URL}`);
  console.log(`   🌐 Frontend: ${VERCEL_FRONTEND_URL}`);
  console.log('   ⚙️  Vercel Dashboard: https://vercel.com/dashboard');
  console.log('   🚂 Railway Dashboard: https://railway.app/dashboard');
  
  console.log('\n============================================================');
  console.log('🔍 VERIFICAÇÃO CONCLUÍDA!');
  console.log('============================================================\n');
}

// Executar verificação
main().catch(error => {
  console.error('❌ Erro durante verificação:', error.message);
  process.exit(1);
});