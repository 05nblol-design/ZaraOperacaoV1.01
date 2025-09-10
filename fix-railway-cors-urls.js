const { execSync } = require('child_process');

console.log('🔧 Corrigindo URLs do CORS no Railway...');

// URL atual do Vercel
const CURRENT_VERCEL_URL = 'https://sistema-zara-frontend-kg85kov5j-05nblol-designs-projects.vercel.app';

// Variáveis de ambiente que precisam ser atualizadas no Railway
const envVars = {
  'FRONTEND_URL': CURRENT_VERCEL_URL,
  'CLIENT_URL': CURRENT_VERCEL_URL,
  'CORS_ORIGIN': `${CURRENT_VERCEL_URL},https://www.${CURRENT_VERCEL_URL.replace('https://', '')}`,
  'CORS_ORIGINS': `${CURRENT_VERCEL_URL},https://www.${CURRENT_VERCEL_URL.replace('https://', '')}`
};

console.log('📋 Variáveis que serão atualizadas:');
Object.entries(envVars).forEach(([key, value]) => {
  console.log(`  ${key}=${value}`);
});

try {
  // Verificar se Railway CLI está instalado
  console.log('\n🔍 Verificando Railway CLI...');
  try {
    execSync('railway --version', { stdio: 'pipe' });
    console.log('✅ Railway CLI encontrado');
  } catch (error) {
    console.log('❌ Railway CLI não encontrado');
    console.log('\n📥 Instalando Railway CLI...');
    execSync('npm install -g @railway/cli', { stdio: 'inherit' });
  }

  // Login no Railway (se necessário)
  console.log('\n🔐 Verificando autenticação Railway...');
  try {
    execSync('railway whoami', { stdio: 'pipe' });
    console.log('✅ Já autenticado no Railway');
  } catch (error) {
    console.log('❌ Não autenticado no Railway');
    console.log('\n🔑 Execute: railway login');
    console.log('Depois execute este script novamente.');
    process.exit(1);
  }

  // Navegar para o diretório do servidor
  process.chdir('./server');
  console.log('\n📁 Navegando para diretório do servidor...');

  // Atualizar cada variável de ambiente
  console.log('\n🔄 Atualizando variáveis de ambiente...');
  Object.entries(envVars).forEach(([key, value]) => {
    try {
      console.log(`  Definindo ${key}...`);
      execSync(`railway variables set ${key}="${value}"`, { stdio: 'pipe' });
      console.log(`  ✅ ${key} atualizado`);
    } catch (error) {
      console.log(`  ❌ Erro ao definir ${key}:`, error.message);
    }
  });

  // Forçar redeploy
  console.log('\n🚀 Forçando redeploy do Railway...');
  execSync('railway up --detach', { stdio: 'inherit' });

  console.log('\n✅ CORS URLs atualizadas com sucesso!');
  console.log('\n⏳ Aguarde 2-3 minutos para o deploy ser concluído.');
  console.log('\n🔍 Próximos passos:');
  console.log('1. Aguardar deploy do Railway');
  console.log('2. Testar login no frontend Vercel');
  console.log('3. Verificar Network tab para confirmar CORS');

} catch (error) {
  console.error('❌ Erro:', error.message);
  console.log('\n🔧 SOLUÇÃO MANUAL:');
  console.log('1. Acesse: https://railway.app/dashboard');
  console.log('2. Selecione seu projeto Zara');
  console.log('3. Vá em Variables');
  console.log('4. Atualize as seguintes variáveis:');
  Object.entries(envVars).forEach(([key, value]) => {
    console.log(`   ${key}=${value}`);
  });
  console.log('5. Clique em Deploy para aplicar as mudanças');
}