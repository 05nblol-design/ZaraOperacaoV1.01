#!/usr/bin/env node

/**
 * 🚀 FORÇA REDEPLOY NO VERCEL
 * 
 * Força um novo deploy no Vercel após correções críticas
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 FORÇANDO REDEPLOY NO VERCEL');
console.log('=' .repeat(40));

try {
  // 1. Verificar se vercel CLI está instalado
  console.log('1️⃣ Verificando Vercel CLI...');
  
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    console.log('✅ Vercel CLI encontrado');
  } catch (e) {
    console.log('⚠️ Vercel CLI não encontrado, instalando...');
    execSync('npm install -g vercel', { stdio: 'inherit' });
  }

  // 2. Navegar para o diretório frontend
  const frontendDir = path.join(__dirname, 'frontend');
  process.chdir(frontendDir);
  console.log('📁 Navegando para:', frontendDir);

  // 3. Verificar se há mudanças para commit
  console.log('2️⃣ Verificando status do Git...');
  
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    if (gitStatus.trim()) {
      console.log('📝 Mudanças detectadas, fazendo commit...');
      execSync('git add .', { stdio: 'inherit' });
      execSync('git commit -m "fix: Force redeploy after acc error fix"', { stdio: 'inherit' });
      execSync('git push', { stdio: 'inherit' });
    } else {
      console.log('✅ Repositório limpo');
    }
  } catch (e) {
    console.log('⚠️ Erro no Git (pode ser normal):', e.message.split('\n')[0]);
  }

  // 4. Criar arquivo de trigger para forçar redeploy
  const triggerFile = '.vercel-redeploy-trigger';
  const timestamp = new Date().toISOString();
  
  console.log('3️⃣ Criando trigger de redeploy...');
  fs.writeFileSync(triggerFile, `Redeploy triggered at: ${timestamp}\nReason: Fix acc is not defined error\n`);
  
  // 5. Fazer deploy
  console.log('4️⃣ Iniciando deploy no Vercel...');
  
  try {
    // Tentar deploy com produção
    execSync('vercel --prod --yes', { stdio: 'inherit' });
    console.log('✅ Deploy de produção concluído!');
  } catch (e) {
    console.log('⚠️ Erro no deploy de produção, tentando deploy normal...');
    try {
      execSync('vercel --yes', { stdio: 'inherit' });
      console.log('✅ Deploy normal concluído!');
    } catch (e2) {
      console.log('❌ Erro no deploy:', e2.message);
      console.log('\n💡 ALTERNATIVA: Deploy manual');
      console.log('1. Acesse: https://vercel.com/dashboard');
      console.log('2. Encontre o projeto sistema-zara-frontend');
      console.log('3. Clique em "Redeploy" na última deployment');
      console.log('4. Aguarde o deploy completar');
    }
  }

  // 6. Limpar arquivo de trigger
  if (fs.existsSync(triggerFile)) {
    fs.unlinkSync(triggerFile);
  }

  console.log('\n🎯 PRÓXIMOS PASSOS:');
  console.log('1. Aguarde 2-3 minutos para o deploy completar');
  console.log('2. Acesse: https://sistema-zara-frontend.vercel.app/leader-dashboard');
  console.log('3. Teste se o erro "acc is not defined" foi corrigido');
  console.log('4. Se necessário, execute o script de diagnóstico no console');

} catch (error) {
  console.error('❌ Erro durante o processo:', error.message);
  console.log('\n🔧 SOLUÇÕES ALTERNATIVAS:');
  console.log('1. Deploy manual via dashboard do Vercel');
  console.log('2. Verificar se as mudanças foram commitadas no Git');
  console.log('3. Aguardar deploy automático (pode levar alguns minutos)');
}

console.log('\n✅ Processo concluído!');