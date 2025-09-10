#!/usr/bin/env node

/**
 * Script para configurar variáveis de ambiente no Vercel via CLI
 * Este script configura as variáveis necessárias para conectar ao Railway backend
 */

const { execSync } = require('child_process');
const path = require('path');

// Variáveis de ambiente que precisam ser configuradas
const ENV_VARS = {
  'VITE_API_URL': 'https://zara-backend-production-aab3.up.railway.app/api',
  'VITE_SOCKET_URL': 'https://zara-backend-production-aab3.up.railway.app',
  'VITE_BACKEND_URL': 'https://zara-backend-production-aab3.up.railway.app',
  'VITE_APP_NAME': 'Sistema ZARA',
  'VITE_APP_VERSION': '1.0.1',
  'VITE_NODE_ENV': 'production',
  'VITE_ENVIRONMENT': 'production',
  'VITE_BUILD_SOURCEMAP': 'false',
  'VITE_BUILD_MINIFY': 'true',
  'VITE_SECURE_COOKIES': 'true',
  'VITE_HTTPS_ONLY': 'true',
  'VITE_API_TIMEOUT': '30000',
  'VITE_MAX_RETRIES': '3'
};

console.log('🔧 Configurando variáveis de ambiente no Vercel...');
console.log('=' .repeat(60));

try {
  // Navega para o diretório do frontend
  const frontendDir = path.join(__dirname, 'frontend');
  process.chdir(frontendDir);
  console.log(`📁 Diretório: ${frontendDir}`);

  // Configura cada variável de ambiente
  console.log('\n📝 Configurando variáveis de ambiente:');
  
  for (const [key, value] of Object.entries(ENV_VARS)) {
    try {
      console.log(`   Setting ${key}...`);
      execSync(`vercel env add ${key} production`, {
        input: `${value}\n`,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      console.log(`   ✅ ${key} configurado`);
    } catch (error) {
      // Variável pode já existir, tentar remover e adicionar novamente
      try {
        console.log(`   🔄 Atualizando ${key}...`);
        execSync(`vercel env rm ${key} production`, {
          input: 'y\n',
          stdio: ['pipe', 'pipe', 'pipe']
        });
        execSync(`vercel env add ${key} production`, {
          input: `${value}\n`,
          stdio: ['pipe', 'pipe', 'pipe']
        });
        console.log(`   ✅ ${key} atualizado`);
      } catch (updateError) {
        console.log(`   ⚠️  Erro ao configurar ${key}: ${updateError.message}`);
      }
    }
  }

  console.log('\n🚀 Forçando novo deployment...');
  execSync('vercel --prod --force', { stdio: 'inherit' });

  console.log('\n✅ Configuração concluída!');
  console.log('🌐 Aguarde 2-3 minutos para propagação das mudanças.');
  
} catch (error) {
  console.error('❌ Erro durante a configuração:', error.message);
  console.log('\n📋 CONFIGURAÇÃO MANUAL NECESSÁRIA:');
  console.log('1. Acesse https://vercel.com/dashboard');
  console.log('2. Vá para o projeto sistema-zara-frontend');
  console.log('3. Acesse Settings > Environment Variables');
  console.log('4. Configure estas variáveis para Production:');
  console.log('');
  
  for (const [key, value] of Object.entries(ENV_VARS)) {
    console.log(`   ${key} = ${value}`);
  }
  
  console.log('\n5. Force um novo deployment na aba Deployments');
  console.log('6. Clique em "Redeploy" no último deployment');
  
  process.exit(1);
}