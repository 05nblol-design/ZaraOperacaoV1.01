#!/usr/bin/env node

/**
 * 🚨 DIAGNÓSTICO: Erro de Host Inválido na DATABASE_URL
 * 
 * Este script diagnostica o erro "Can't reach database server at host:5432"
 * e fornece instruções específicas para correção no Railway.
 */

console.log('\n🚨 DIAGNÓSTICO: Erro de Host Inválido na DATABASE_URL\n');

// Verificar DATABASE_URL atual
const currentUrl = process.env.DATABASE_URL;

console.log('📊 ANÁLISE DA CONFIGURAÇÃO ATUAL:');
console.log('================================');

if (!currentUrl) {
    console.log('❌ DATABASE_URL: NÃO DEFINIDA');
    console.log('   Status: CRÍTICO - Variável ausente');
} else {
    console.log(`🔍 DATABASE_URL atual: ${currentUrl}`);
    
    // Analisar componentes da URL
    try {
        if (currentUrl.includes('host:5432')) {
            console.log('❌ PROBLEMA IDENTIFICADO: Host genérico "host:5432"');
            console.log('   Causa: URL incompleta ou malformada');
            console.log('   Impacto: Impossível conectar ao PostgreSQL');
        } else if (currentUrl.includes('localhost')) {
            console.log('❌ PROBLEMA: Host localhost em produção');
            console.log('   Causa: Configuração de desenvolvimento');
            console.log('   Impacto: Não funciona no Railway');
        } else if (!currentUrl.includes('postgres.railway.internal')) {
            console.log('⚠️  AVISO: Host não é do Railway');
            console.log('   Verificar se é a URL correta do Railway');
        } else {
            console.log('✅ Host parece correto (Railway internal)');
        }
        
        // Verificar protocolo
        if (!currentUrl.startsWith('postgresql://')) {
            console.log('❌ PROBLEMA: Protocolo incorreto');
            console.log('   Esperado: postgresql://');
            console.log(`   Atual: ${currentUrl.split('://')[0]}://`);
        } else {
            console.log('✅ Protocolo correto: postgresql://');
        }
        
    } catch (error) {
        console.log('❌ ERRO: URL malformada');
        console.log(`   Detalhes: ${error.message}`);
    }
}

console.log('\n🎯 SOLUÇÃO ESPECÍFICA PARA O ERRO:');
console.log('==================================');

console.log('\n📋 PASSOS PARA CORREÇÃO NO RAILWAY:');
console.log('\n1. 🌐 Acesse: https://railway.app/dashboard');
console.log('2. 🎯 Clique no serviço BACKEND (não PostgreSQL)');
console.log('3. ⚙️  Vá em "Variables"');
console.log('4. 🔍 Localize "DATABASE_URL"');
console.log('5. ✏️  SUBSTITUA o valor por:');
console.log('   postgresql://postgres:GNquZiBhCMsFDZbvDTevPkrWFdRyyLQM@postgres.railway.internal:5432/railway');
console.log('6. 💾 Salve e clique "Deploy"');

console.log('\n🔧 URL CORRETA PARA O RAILWAY:');
console.log('==============================');
const correctUrl = 'postgresql://postgres:GNquZiBhCMsFDZbvDTevPkrWFdRyyLQM@postgres.railway.internal:5432/railway';
console.log(`✅ ${correctUrl}`);

console.log('\n📊 COMPONENTES DA URL CORRETA:');
console.log('==============================');
console.log('🔹 Protocolo: postgresql://');
console.log('🔹 Usuário: postgres');
console.log('🔹 Senha: GNquZiBhCMsFDZbvDTevPkrWFdRyyLQM');
console.log('🔹 Host: postgres.railway.internal');
console.log('🔹 Porta: 5432');
console.log('🔹 Database: railway');

console.log('\n🧪 VERIFICAÇÃO PÓS-CORREÇÃO:');
console.log('============================');
console.log('\n✅ Logs esperados após correção:');
console.log('   - "prisma:info Starting a postgresql pool"');
console.log('   - "Database connected successfully"');
console.log('   - "Servidor ZARA (HTTP) rodando na porta 8080"');
console.log('   - SEM erros "Can\'t reach database server"');

console.log('\n❌ Se o erro "host:5432" aparecer, significa:');
console.log('   - DATABASE_URL ainda não foi corrigida');
console.log('   - Redeploy não foi feito');
console.log('   - URL foi copiada incorretamente');

console.log('\n🔄 TESTE DE CONECTIVIDADE:');
console.log('==========================');
console.log('Após correção, teste:');
console.log('curl https://seu-backend.railway.app/api/health');

console.log('\n⏱️  TEMPO ESTIMADO:');
console.log('==================');
console.log('🔹 Correção no Dashboard: 2-3 minutos');
console.log('🔹 Redeploy automático: 1-2 minutos');
console.log('🔹 Verificação: 1 minuto');
console.log('🔹 Total: 4-6 minutos');

console.log('\n🎯 STATUS ATUAL:');
console.log('================');
if (!currentUrl || currentUrl.includes('host:5432')) {
    console.log('🚨 CRÍTICO: DATABASE_URL precisa ser corrigida IMEDIATAMENTE');
    console.log('📋 AÇÃO: Acesse Railway Dashboard e configure a URL correta');
} else {
    console.log('✅ DATABASE_URL parece estar configurada');
    console.log('🔍 Verifique se é exatamente a URL do Railway');
}

console.log('\n🚀 PRÓXIMO PASSO:');
console.log('=================');
console.log('👉 ACESSE AGORA: https://railway.app/dashboard');
console.log('👉 CORRIJA a DATABASE_URL no serviço Backend');
console.log('👉 AGUARDE o redeploy');
console.log('👉 VERIFIQUE os logs para confirmar sucesso');

console.log('\n✨ Após correção, a aplicação funcionará perfeitamente!\n');