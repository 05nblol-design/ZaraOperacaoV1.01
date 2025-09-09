const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 REDEPLOY VERCEL - SISTEMA ZARA');
console.log('=====================================\n');

// Verificar se está no diretório correto
const frontendDir = path.join(__dirname, 'frontend');
if (!fs.existsSync(frontendDir)) {
    console.error('❌ Diretório frontend não encontrado!');
    process.exit(1);
}

console.log('📁 Navegando para o diretório frontend...');
process.chdir(frontendDir);

// Verificar se vercel CLI está instalado
try {
    execSync('vercel --version', { stdio: 'pipe' });
    console.log('✅ Vercel CLI encontrado');
} catch (error) {
    console.log('📦 Instalando Vercel CLI...');
    try {
        execSync('npm install -g vercel', { stdio: 'inherit' });
        console.log('✅ Vercel CLI instalado com sucesso');
    } catch (installError) {
        console.error('❌ Erro ao instalar Vercel CLI:', installError.message);
        console.log('\n🔧 Instale manualmente: npm install -g vercel');
        process.exit(1);
    }
}

// Verificar arquivos de configuração
console.log('\n🔍 Verificando arquivos de configuração...');

const configFiles = [
    '.env.production',
    '.env.vercel',
    'vercel.json',
    'package.json'
];

configFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} - OK`);
    } else {
        console.log(`⚠️  ${file} - NÃO ENCONTRADO`);
    }
});

// Mostrar variáveis de ambiente
console.log('\n📋 Variáveis de ambiente (.env.production):');
if (fs.existsSync('.env.production')) {
    const envContent = fs.readFileSync('.env.production', 'utf8');
    const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    envLines.forEach(line => {
        const [key] = line.split('=');
        console.log(`   ${key}`);
    });
} else {
    console.log('   ❌ Arquivo .env.production não encontrado');
}

console.log('\n🎯 INSTRUÇÕES PARA REDEPLOY MANUAL:');
console.log('=====================================');
console.log('1. Acesse: https://vercel.com/dashboard');
console.log('2. Encontre o projeto: sistema-zara-frontend');
console.log('3. Vá em Settings → Environment Variables');
console.log('4. Configure as variáveis:');
console.log('   VITE_API_URL = https://zara-backend-production-aab3.up.railway.app/api');
console.log('   VITE_SOCKET_URL = https://zara-backend-production-aab3.up.railway.app');
console.log('   VITE_BACKEND_URL = https://zara-backend-production-aab3.up.railway.app');
console.log('5. Vá em Deployments → Redeploy (sem cache)');
console.log('\n');

// Tentar fazer login no Vercel
console.log('🔐 Tentando fazer login no Vercel...');
try {
    // Verificar se já está logado
    const whoami = execSync('vercel whoami', { stdio: 'pipe', encoding: 'utf8' });
    console.log(`✅ Logado como: ${whoami.trim()}`);
    
    // Tentar fazer redeploy
    console.log('\n🚀 Iniciando redeploy...');
    console.log('⚠️  IMPORTANTE: Quando solicitado, escolha:');
    console.log('   - Link to existing project: YES');
    console.log('   - Project name: sistema-zara-frontend (ou similar)');
    console.log('\n');
    
    // Fazer redeploy com force
    execSync('vercel --prod --force', { stdio: 'inherit' });
    
    console.log('\n✅ REDEPLOY CONCLUÍDO!');
    console.log('🔗 Acesse: https://sistema-zara-frontend.vercel.app');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Aguarde 2-3 minutos para o deploy completar');
    console.log('2. Teste o frontend');
    console.log('3. Verifique se os erros de API foram resolvidos');
    
} catch (error) {
    console.log('\n⚠️  Não foi possível fazer redeploy automático');
    console.log('Motivo:', error.message);
    
    console.log('\n🔧 SOLUÇÃO ALTERNATIVA:');
    console.log('1. Execute: vercel login');
    console.log('2. Execute: vercel --prod --force');
    console.log('3. Ou use o Vercel Dashboard para redeploy manual');
    
    console.log('\n📋 CHECKLIST VERCEL DASHBOARD:');
    console.log('✓ Settings → Environment Variables configuradas');
    console.log('✓ Deployments → Redeploy (desmarcando "Use existing Build Cache")');
    console.log('✓ Aguardar status "Ready"');
    console.log('✓ Testar frontend após deploy');
}

console.log('\n🎉 Script concluído!');
console.log('📞 Se houver problemas, verifique o arquivo DIAGNOSTICO-FRONTEND-VERCEL.md');