#!/usr/bin/env node

/**
 * CORREÇÃO URGENTE: Erro de porta inválida na DATABASE_URL
 * 
 * Erro: "invalid port number in database URL"
 * Causa: Porta malformada, caracteres especiais não escapados, ou formato incorreto
 */

console.log('🔍 DIAGNÓSTICO: Erro de porta inválida na DATABASE_URL\n');

// Verificar variável de ambiente atual
const currentUrl = process.env.DATABASE_URL;

if (!currentUrl) {
    console.log('❌ DATABASE_URL não encontrada no ambiente atual');
    console.log('\n📋 Variáveis disponíveis:');
    Object.keys(process.env)
        .filter(key => key.includes('DATABASE') || key.includes('POSTGRES'))
        .forEach(key => console.log(`   ${key}=${process.env[key]}`));
} else {
    console.log('✅ DATABASE_URL encontrada:', currentUrl);
    
    // Analisar problemas na URL
    console.log('\n🔍 ANÁLISE DA URL:');
    
    try {
        const url = new URL(currentUrl.replace('postgresql://', 'http://'));
        console.log('   Host:', url.hostname);
        console.log('   Porta:', url.port);
        console.log('   Usuário:', url.username);
        console.log('   Senha:', url.password ? '[PRESENTE]' : '[AUSENTE]');
        console.log('   Database:', url.pathname.substring(1));
        
        // Verificar problemas específicos
        const problems = [];
        
        if (!url.port || url.port === '') {
            problems.push('❌ Porta não especificada');
        } else if (isNaN(parseInt(url.port))) {
            problems.push(`❌ Porta inválida: "${url.port}" (deve ser numérica)`);
        } else if (parseInt(url.port) < 1 || parseInt(url.port) > 65535) {
            problems.push(`❌ Porta fora do range válido: ${url.port}`);
        }
        
        if (url.hostname === 'host' || url.hostname === 'localhost') {
            problems.push(`❌ Hostname genérico: "${url.hostname}"`);
        }
        
        if (problems.length > 0) {
            console.log('\n🚨 PROBLEMAS IDENTIFICADOS:');
            problems.forEach(problem => console.log(`   ${problem}`));
        } else {
            console.log('\n✅ Formato da URL parece correto');
        }
        
    } catch (error) {
        console.log('❌ Erro ao analisar URL:', error.message);
    }
}

console.log('\n🔧 CORREÇÃO NO RAILWAY DASHBOARD:');
console.log('\n1. Acesse: https://railway.app/dashboard');
console.log('2. Selecione seu projeto');
console.log('3. Clique no serviço PostgreSQL');
console.log('4. Vá em "Variables" ou "Connect"');
console.log('5. Copie a DATABASE_URL correta');
console.log('\n6. No serviço do backend:');
console.log('   - Vá em "Variables"');
console.log('   - Adicione/edite DATABASE_URL');
console.log('   - Cole a URL correta do PostgreSQL');
console.log('   - Clique "Deploy"');

console.log('\n📝 FORMATO CORRETO DA DATABASE_URL:');
console.log('postgresql://usuario:senha@hostname.railway.internal:5432/railway');
console.log('\nExemplo:');
console.log('postgresql://postgres:abc123@postgres.railway.internal:5432/railway');

console.log('\n❌ FORMATOS INCORRETOS COMUNS:');
console.log('postgresql://user:pass@host:5432/db          (hostname genérico)');
console.log('postgresql://user:pass@host.com:/db        (porta vazia)');
console.log('postgresql://user:pass@host.com:abc/db     (porta não numérica)');
console.log('postgresql://user:pass@host.com:99999/db   (porta inválida)');

console.log('\n🧪 TESTE APÓS CORREÇÃO:');
console.log('curl https://seu-backend.railway.app/api/health');

console.log('\n⏱️  TEMPO ESTIMADO: 2-3 minutos para correção + 1-2 minutos para redeploy');
console.log('\n🆘 Se o problema persistir:');
console.log('   1. Verifique se o serviço PostgreSQL está ativo');
console.log('   2. Regenere as credenciais do banco');
console.log('   3. Verifique logs do deploy no Railway');