#!/usr/bin/env node

/**
 * Script para forçar redeploy do Vercel com variáveis de ambiente atualizadas
 * Este script força um novo build sem cache para garantir que as variáveis sejam aplicadas
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando redeploy forçado do Vercel...');

try {
  // Verifica se o Vercel CLI está instalado
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    console.log('✅ Vercel CLI encontrado');
  } catch (error) {
    console.log('❌ Vercel CLI não encontrado. Instalando...');
    execSync('npm install -g vercel@latest', { stdio: 'inherit' });
  }

  // Navega para o diretório do frontend
  const frontendDir = path.join(__dirname, 'frontend');
  process.chdir(frontendDir);
  console.log(`📁 Mudando para diretório: ${frontendDir}`);

  // Força redeploy com --force para ignorar cache
  console.log('🔄 Executando redeploy forçado...');
  execSync('vercel --prod --force', { stdio: 'inherit' });

  console.log('✅ Redeploy concluído com sucesso!');
  console.log('🌐 Aguarde alguns minutos para que as mudanças sejam propagadas.');
  console.log('📋 Verifique se as variáveis de ambiente estão configuradas no Vercel Dashboard:');
  console.log('   - VITE_API_URL=https://zara-backend-production-aab3.up.railway.app/api');
  console.log('   - VITE_SOCKET_URL=https://zara-backend-production-aab3.up.railway.app');
  console.log('   - VITE_BACKEND_URL=https://zara-backend-production-aab3.up.railway.app');

} catch (error) {
  console.error('❌ Erro durante o redeploy:', error.message);
  console.log('\n📋 Passos manuais para resolver:');
  console.log('1. Acesse https://vercel.com/dashboard');
  console.log('2. Vá para o projeto zara-frontend');
  console.log('3. Acesse Settings > Environment Variables');
  console.log('4. Verifique se estas variáveis estão configuradas:');
  console.log('   - VITE_API_URL=https://zara-backend-production-aab3.up.railway.app/api');
  console.log('   - VITE_SOCKET_URL=https://zara-backend-production-aab3.up.railway.app');
  console.log('   - VITE_BACKEND_URL=https://zara-backend-production-aab3.up.railway.app');
  console.log('5. Force um novo deployment na aba Deployments');
  process.exit(1);
}