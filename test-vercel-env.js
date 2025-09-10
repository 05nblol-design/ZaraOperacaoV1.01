// Script para testar configurações do Vercel
const { execSync } = require('child_process');

console.log('🔍 Testando configurações do Vercel...');

try {
  // Verificar se está logado no Vercel
  console.log('\n1. Verificando login no Vercel:');
  const whoami = execSync('npx vercel whoami', { encoding: 'utf8' });
  console.log('✅ Logado como:', whoami.trim());
  
  // Listar projetos
  console.log('\n2. Listando projetos:');
  const projects = execSync('npx vercel ls', { encoding: 'utf8' });
  console.log(projects);
  
  // Verificar variáveis de ambiente do projeto frontend
  console.log('\n3. Verificando variáveis de ambiente:');
  try {
    const envs = execSync('npx vercel env ls', { 
      cwd: './frontend',
      encoding: 'utf8' 
    });
    console.log(envs);
  } catch (envError) {
    console.log('❌ Erro ao verificar variáveis:', envError.message);
  }
  
} catch (error) {
  console.error('❌ Erro:', error.message);
  
  if (error.message.includes('not authenticated')) {
    console.log('\n🔧 Para resolver:');
    console.log('1. Execute: npx vercel login');
    console.log('2. Faça login com sua conta');
    console.log('3. Execute este script novamente');
  }
}

console.log('\n🔍 Verificando arquivo .env.production:');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, 'frontend', '.env.production');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ Arquivo .env.production encontrado:');
  console.log(envContent);
} else {
  console.log('❌ Arquivo .env.production não encontrado');
}

console.log('\n🔍 Testando conectividade com Railway:');
const https = require('https');

const testUrl = 'https://zara-backend-production-aab3.up.railway.app/api/health';
https.get(testUrl, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('✅ Railway respondendo:', res.statusCode);
    console.log('📊 Resposta:', data);
  });
}).on('error', (err) => {
  console.log('❌ Erro ao conectar com Railway:', err.message);
});