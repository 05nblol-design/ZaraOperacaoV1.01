#!/usr/bin/env node

/**
 * VALIDAÇÃO FINAL DA DATABASE_URL DO RAILWAY
 * 
 * Valida a URL correta fornecida pelo usuário:
 * postgresql://postgres:GNquZiBhCMsFDZbvDTevPkrWFdRyyLQM@postgres.railway.internal:5432/railway
 */

console.log('🎯 VALIDAÇÃO FINAL DA DATABASE_URL DO RAILWAY\n');

// URL correta fornecida pelo usuário
const correctUrl = 'postgresql://postgres:GNquZiBhCMsFDZbvDTevPkrWFdRyyLQM@postgres.railway.internal:5432/railway';

// Função para validar URL completa
function validateUrl(url) {
    try {
        const testUrl = url.replace(/^postgresql:\/\//, 'http://');
        const parsed = new URL(testUrl);
        
        return {
            valid: true,
            protocol: url.startsWith('postgresql://') ? 'postgresql' : 'invalid',
            username: parsed.username,
            password: parsed.password,
            hostname: parsed.hostname,
            port: parsed.port,
            database: parsed.pathname.substring(1),
            fullUrl: url
        };
    } catch (error) {
        return {
            valid: false,
            error: error.message
        };
    }
}

// Validar a URL correta
console.log('✅ URL CORRETA FORNECIDA:');
console.log(correctUrl);
console.log();

const validation = validateUrl(correctUrl);

if (validation.valid) {
    console.log('📊 COMPONENTES VALIDADOS:');
    console.log(`   Protocolo: ${validation.protocol} ✅`);
    console.log(`   Usuário: ${validation.username} ✅`);
    console.log(`   Senha: ${validation.password ? '[PRESENTE]' : '[AUSENTE]'} ✅`);
    console.log(`   Host: ${validation.hostname} ✅`);
    console.log(`   Porta: ${validation.port} ✅`);
    console.log(`   Database: ${validation.database} ✅`);
    
    // Verificações específicas
    const checks = [];
    
    if (validation.port === '5432') {
        checks.push('✅ Porta padrão PostgreSQL (5432)');
    } else {
        checks.push(`⚠️  Porta não padrão: ${validation.port}`);
    }
    
    if (validation.hostname.includes('railway.internal')) {
        checks.push('✅ Hostname interno do Railway');
    } else {
        checks.push(`⚠️  Hostname não é do Railway: ${validation.hostname}`);
    }
    
    if (validation.username === 'postgres') {
        checks.push('✅ Usuário padrão PostgreSQL');
    }
    
    if (validation.database === 'railway') {
        checks.push('✅ Database padrão do Railway');
    }
    
    console.log('\n🔍 VERIFICAÇÕES ESPECÍFICAS:');
    checks.forEach(check => console.log(`   ${check}`));
    
} else {
    console.log('❌ ERRO NA VALIDAÇÃO:', validation.error);
}

// Comparar com variável de ambiente atual
const currentUrl = process.env.DATABASE_URL;
console.log('\n🔍 COMPARAÇÃO COM AMBIENTE ATUAL:');

if (currentUrl) {
    console.log('Atual:', currentUrl);
    console.log('Correta:', correctUrl);
    
    if (currentUrl === correctUrl) {
        console.log('✅ URLs são IDÊNTICAS - Configuração correta!');
    } else {
        console.log('❌ URLs são DIFERENTES - Necessária atualização!');
    }
} else {
    console.log('❌ DATABASE_URL não encontrada no ambiente atual');
    console.log('✅ Necessário configurar no Railway Dashboard');
}

// Instruções de configuração
console.log('\n🔧 INSTRUÇÕES DE CONFIGURAÇÃO:');
console.log('\n1. Acesse Railway Dashboard:');
console.log('   https://railway.app/dashboard');
console.log('\n2. No serviço BACKEND (não PostgreSQL):');
console.log('   • Clique no serviço do backend');
console.log('   • Vá em "Variables"');
console.log('   • Adicione/edite DATABASE_URL');
console.log('   • Cole a URL correta (mostrada acima)');
console.log('   • Clique "Deploy"');

console.log('\n3. Aguarde redeploy (1-2 minutos)');

console.log('\n🧪 TESTE APÓS CONFIGURAÇÃO:');
console.log('curl https://seu-backend.railway.app/api/health');

console.log('\n📋 CREDENCIAIS PARA REFERÊNCIA:');
console.log('Usuário: postgres');
console.log('Senha: GNquZiBhCMsFDZbvDTevPkrWFdRyyLQM');
console.log('Host: postgres.railway.internal');
console.log('Porta: 5432');
console.log('Database: railway');

console.log('\n🎯 RESULTADO ESPERADO:');
console.log('✅ Erro "invalid port number" será RESOLVIDO');
console.log('✅ Conexão PostgreSQL será ESTABELECIDA');
console.log('✅ Aplicação ficará OPERACIONAL');

console.log('\n⏱️  Tempo total estimado: 3-5 minutos');