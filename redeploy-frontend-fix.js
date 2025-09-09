#!/usr/bin/env node

/**
 * Script para fazer redeploy do frontend com correções de URL
 * Corrige o problema de URLs hardcoded que causavam ERR_FAILED
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔧 REDEPLOY FRONTEND - CORREÇÃO DE URLS');
console.log('=====================================');

// Verificar se estamos no diretório correto
const frontendDir = path.join(__dirname, 'frontend');
if (!fs.existsSync(frontendDir)) {
  console.error('❌ Diretório frontend não encontrado!');
  process.exit(1);
}

process.chdir(frontendDir);
console.log('📁 Diretório atual:', process.cwd());

try {
  // 1. Verificar se as correções foram aplicadas
  console.log('\n1️⃣ Verificando correções aplicadas...');
  
  const apiFile = fs.readFileSync('src/services/api.js', 'utf8');
  const socketFile = fs.readFileSync('src/hooks/useSocket.jsx', 'utf8');
  
  if (apiFile.includes('zara-backend-production-aab3.up.railway.app/api') && 
      socketFile.includes('zara-backend-production-aab3.up.railway.app')) {
    console.log('✅ Correções de URL aplicadas com sucesso!');
  } else {
    console.log('❌ Correções não encontradas nos arquivos!');
    process.exit(1);
  }

  // 2. Instalar dependências
  console.log('\n2️⃣ Instalando dependências...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });

  // 3. Fazer build local para testar
  console.log('\n3️⃣ Fazendo build local...');
  execSync('npm run build', { stdio: 'inherit' });

  // 4. Verificar se Vercel CLI está instalado
  console.log('\n4️⃣ Verificando Vercel CLI...');
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    console.log('✅ Vercel CLI encontrado!');
  } catch (error) {
    console.log('⚠️  Vercel CLI não encontrado. Instalando...');
    execSync('npm install -g vercel', { stdio: 'inherit' });
  }

  // 5. Deploy no Vercel
  console.log('\n5️⃣ Fazendo deploy no Vercel...');
  console.log('🚀 Iniciando deploy com correções de URL...');
  
  // Deploy com force para garantir que as mudanças sejam aplicadas
  execSync('vercel --prod --force', { stdio: 'inherit' });

  console.log('\n✅ DEPLOY CONCLUÍDO COM SUCESSO!');
  console.log('=====================================');
  console.log('🎯 Correções aplicadas:');
  console.log('   • API URL: Corrigida para usar Railway backend');
  console.log('   • Socket URL: Corrigida para usar Railway backend');
  console.log('   • Removida lógica de hostname hardcoded');
  console.log('\n🌐 O frontend agora deve conectar corretamente ao backend Railway!');
  console.log('\n📝 Próximos passos:');
  console.log('   1. Aguardar propagação do deploy (1-2 minutos)');
  console.log('   2. Testar login no frontend');
  console.log('   3. Verificar se não há mais erros ERR_FAILED');

} catch (error) {
  console.error('\n❌ Erro durante o redeploy:', error.message);
  console.log('\n🔍 Possíveis soluções:');
  console.log('   • Verificar se está logado no Vercel: vercel login');
  console.log('   • Verificar conexão com internet');
  console.log('   • Tentar novamente em alguns minutos');
  process.exit(1);
}