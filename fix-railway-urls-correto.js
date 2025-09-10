#!/usr/bin/env node

/**
 * Script para corrigir URLs do Railway com a URL correta do Vercel
 * 
 * PROBLEMA IDENTIFICADO:
 * - CORS configurado com URLs antigas: sistema-zara-frontend-652ymeopa-05nblol-designs-projects.vercel.app
 * - URL correta atual: sistema-zara-frontend.vercel.app
 * 
 * SOLUÇÃO:
 * - Atualizar variáveis FRONTEND_URL, CLIENT_URL, CORS_ORIGIN no Railway
 */

const { execSync } = require('child_process');

const CORRECT_VERCEL_URL = 'https://sistema-zara-frontend.vercel.app';
const RAILWAY_BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';

console.log('🔧 CORREÇÃO DE URLs DO RAILWAY');
console.log('================================');
console.log('');
console.log('❌ URLs ANTIGAS (incorretas):');
console.log('   - https://sistema-zara-frontend-652ymeopa-05nblol-designs-projects.vercel.app');
console.log('   - https://sistema-zara-frontend-kg85kov5j-05nblol-designs-projects.vercel.app');
console.log('');
console.log('✅ URL CORRETA:');
console.log(`   - ${CORRECT_VERCEL_URL}`);
console.log('');

function runCommand(command, description) {
  console.log(`🔄 ${description}...`);
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${description} - Sucesso`);
    return result;
  } catch (error) {
    console.log(`❌ ${description} - Erro:`, error.message);
    return null;
  }
}

function checkRailwayCLI() {
  console.log('🔍 Verificando Railway CLI...');
  try {
    execSync('railway --version', { stdio: 'pipe' });
    console.log('✅ Railway CLI encontrado');
    return true;
  } catch (error) {
    console.log('❌ Railway CLI não encontrado');
    console.log('📥 Instale com: npm install -g @railway/cli');
    return false;
  }
}

function updateRailwayVariables() {
  console.log('\n🚀 ATUALIZANDO VARIÁVEIS DO RAILWAY');
  console.log('===================================');
  
  const variables = {
    'FRONTEND_URL': CORRECT_VERCEL_URL,
    'CLIENT_URL': CORRECT_VERCEL_URL,
    'CORS_ORIGIN': `${CORRECT_VERCEL_URL},https://www.sistema-zara-frontend.vercel.app`
  };
  
  let success = true;
  
  for (const [key, value] of Object.entries(variables)) {
    const result = runCommand(
      `railway variables set ${key}="${value}"`,
      `Definindo ${key}`
    );
    if (!result) success = false;
  }
  
  return success;
}

function forceRedeploy() {
  console.log('\n🔄 FORÇANDO REDEPLOY...');
  const result = runCommand(
    'railway up --detach',
    'Redeploy do Railway'
  );
  return result !== null;
}

function main() {
  console.log('🎯 INICIANDO CORREÇÃO DE URLs...');
  console.log('');
  
  // 1. Verificar Railway CLI
  if (!checkRailwayCLI()) {
    console.log('\n❌ FALHA: Railway CLI não encontrado');
    console.log('\n📋 PASSOS MANUAIS:');
    console.log('1. Instale Railway CLI: npm install -g @railway/cli');
    console.log('2. Faça login: railway login');
    console.log('3. Execute este script novamente');
    return;
  }
  
  // 2. Atualizar variáveis
  const variablesUpdated = updateRailwayVariables();
  
  if (!variablesUpdated) {
    console.log('\n❌ FALHA: Erro ao atualizar variáveis');
    console.log('\n📋 CORREÇÃO MANUAL NECESSÁRIA:');
    console.log('1. Acesse: https://railway.app/dashboard');
    console.log('2. Selecione seu projeto: zara-backend-production');
    console.log('3. Vá em Variables');
    console.log('4. Atualize:');
    console.log(`   - FRONTEND_URL = ${CORRECT_VERCEL_URL}`);
    console.log(`   - CLIENT_URL = ${CORRECT_VERCEL_URL}`);
    console.log(`   - CORS_ORIGIN = ${CORRECT_VERCEL_URL},https://www.sistema-zara-frontend.vercel.app`);
    console.log('5. Clique em Deploy');
    return;
  }
  
  // 3. Forçar redeploy
  const redeploySuccess = forceRedeploy();
  
  console.log('\n🎉 CORREÇÃO CONCLUÍDA!');
  console.log('======================');
  console.log('');
  console.log('✅ URLs atualizadas no Railway:');
  console.log(`   - FRONTEND_URL: ${CORRECT_VERCEL_URL}`);
  console.log(`   - CLIENT_URL: ${CORRECT_VERCEL_URL}`);
  console.log(`   - CORS_ORIGIN: ${CORRECT_VERCEL_URL}`);
  console.log('');
  
  if (redeploySuccess) {
    console.log('✅ Redeploy iniciado');
    console.log('⏳ Aguarde 2-3 minutos para o deploy completar');
  } else {
    console.log('⚠️  Redeploy manual necessário');
    console.log('   Acesse Railway Dashboard e clique em Deploy');
  }
  
  console.log('');
  console.log('🧪 PRÓXIMOS PASSOS:');
  console.log('1. Aguarde o deploy do Railway (2-3 min)');
  console.log('2. Teste o login em: https://sistema-zara-frontend.vercel.app');
  console.log('3. Verifique se os erros de CORS foram resolvidos');
  console.log('');
  console.log('🔗 URLs CORRETAS:');
  console.log(`   Frontend: ${CORRECT_VERCEL_URL}`);
  console.log(`   Backend:  ${RAILWAY_BACKEND_URL}`);
}

if (require.main === module) {
  main();
}

module.exports = { main };