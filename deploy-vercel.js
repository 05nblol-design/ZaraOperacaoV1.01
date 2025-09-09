#!/usr/bin/env node

/**
 * 🚀 DEPLOY FRONTEND NO VERCEL
 * 
 * Script para fazer deploy do frontend no Vercel
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('\n🚀 INICIANDO DEPLOY NO VERCEL...');

// Navegar para o diretório do frontend
process.chdir(path.join(__dirname, 'frontend'));

try {
  // 1. Instalar dependências
  console.log('📦 Instalando dependências...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  
  // 2. Build do projeto
  console.log('🔨 Fazendo build do projeto...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // 3. Deploy no Vercel (se CLI estiver instalada)
  console.log('🚀 Fazendo deploy no Vercel...');
  try {
    execSync('vercel --prod', { stdio: 'inherit' });
    console.log('\n✅ Deploy realizado com sucesso!');
  } catch (error) {
    console.log('\n⚠️  Vercel CLI não encontrada. Faça o deploy manual:');
    console.log('1. 🌐 Acesse: https://vercel.com');
    console.log('2. 📁 Conecte o repositório');
    console.log('3. ⚙️  Configure as variáveis de ambiente');
    console.log('4. 🚀 Deploy automático');
  }
  
} catch (error) {
  console.error('❌ Erro durante o deploy:', error.message);
  process.exit(1);
}
