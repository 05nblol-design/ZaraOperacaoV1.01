#!/usr/bin/env node

/**
 * VERIFICAÇÃO DE STATUS DO RAILWAY
 * 
 * Script para orientar sobre verificação de logs e status dos serviços
 */

console.log('🚀 VERIFICAÇÃO DE STATUS - RAILWAY DASHBOARD\n');

// Informações do projeto
const projectInfo = {
    name: 'ZaraOperacaoV1.01',
    services: {
        backend: 'Serviço do Backend (Node.js)',
        postgres: 'PostgreSQL Database'
    },
    expectedUrl: 'postgresql://postgres:GNquZiBhCMsFDZbvDTevPkrWFdRyyLQM@postgres.railway.internal:5432/railway'
};

console.log('📋 INFORMAÇÕES DO PROJETO:');
console.log(`   Nome: ${projectInfo.name}`);
console.log(`   Serviços: Backend + PostgreSQL`);
console.log();

// Verificar variáveis de ambiente locais
console.log('🔍 VERIFICAÇÃO LOCAL:');
const localDbUrl = process.env.DATABASE_URL;

if (localDbUrl) {
    console.log('✅ DATABASE_URL encontrada localmente');
    console.log(`   Valor: ${localDbUrl}`);
    
    if (localDbUrl === projectInfo.expectedUrl) {
        console.log('✅ URL local corresponde à URL esperada do Railway');
    } else {
        console.log('⚠️  URL local DIFERENTE da URL esperada do Railway');
    }
} else {
    console.log('❌ DATABASE_URL NÃO encontrada localmente');
    console.log('   Isso é normal - a URL deve estar configurada no Railway');
}

console.log();

// Instruções para acessar Railway
console.log('🌐 ACESSO AO RAILWAY DASHBOARD:');
console.log('1. Abra: https://railway.app/dashboard');
console.log('2. Faça login na sua conta');
console.log('3. Localize o projeto "ZaraOperacaoV1.01"');
console.log('4. Clique no projeto para abrir');
console.log();

// Verificações específicas
console.log('🔍 VERIFICAÇÕES NECESSÁRIAS NO RAILWAY:');
console.log();

console.log('📊 1. STATUS DOS SERVIÇOS:');
console.log('   Backend (Node.js):');
console.log('   ├── Status deve estar: "Running" (verde)');
console.log('   ├── Se "Crashed": clique "Restart"');
console.log('   └── Se "Building": aguarde conclusão');
console.log();
console.log('   PostgreSQL:');
console.log('   ├── Status deve estar: "Running" (verde)');
console.log('   ├── Se "Crashed": clique "Restart"');
console.log('   └── Deve mostrar uso de memória/CPU');
console.log();

console.log('🔧 2. VARIÁVEIS DE AMBIENTE (Backend):');
console.log('   • Clique no serviço Backend');
console.log('   • Vá em "Variables"');
console.log('   • Verifique se DATABASE_URL existe');
console.log('   • Valor esperado:');
console.log(`     ${projectInfo.expectedUrl}`);
console.log();

console.log('📋 3. LOGS DO BACKEND:');
console.log('   • Clique no serviço Backend');
console.log('   • Vá em "Deployments"');
console.log('   • Clique no deployment mais recente');
console.log('   • Procure por:');
console.log();
console.log('   ✅ LOGS DE SUCESSO:');
console.log('      "Server running on port 3000"');
console.log('      "Database connected successfully"');
console.log('      "Prisma Client initialized"');
console.log();
console.log('   ❌ LOGS DE ERRO:');
console.log('      "PrismaClientInitializationError"');
console.log('      "invalid port number"');
console.log('      "Can\'t reach database server"');
console.log('      "ECONNREFUSED"');
console.log();

console.log('🗄️ 4. LOGS DO POSTGRESQL:');
console.log('   • Clique no serviço PostgreSQL');
console.log('   • Verifique os logs para:');
console.log('   ✅ "database system is ready to accept connections"');
console.log('   ❌ "database system is shut down"');
console.log();

// Ações baseadas nos resultados
console.log('🛠️ AÇÕES BASEADAS NOS LOGS:');
console.log();
console.log('Se DATABASE_URL estiver AUSENTE ou INCORRETA:');
console.log('1. No serviço Backend → Variables');
console.log('2. Adicionar/editar DATABASE_URL');
console.log('3. Colar a URL correta (mostrada acima)');
console.log('4. Clicar "Deploy"');
console.log('5. Aguardar redeploy (1-2 minutos)');
console.log();

console.log('Se PostgreSQL estiver PARADO:');
console.log('1. Clicar no serviço PostgreSQL');
console.log('2. Clicar "Restart"');
console.log('3. Aguardar status "Running"');
console.log('4. Verificar logs de inicialização');
console.log();

console.log('Se Backend estiver com ERRO:');
console.log('1. Verificar logs completos');
console.log('2. Identificar erro específico');
console.log('3. Corrigir configuração necessária');
console.log('4. Fazer redeploy se necessário');
console.log();

// Teste de conectividade
console.log('🧪 TESTE DE CONECTIVIDADE:');
console.log();
console.log('Após configuração, teste o endpoint:');
console.log('curl https://seu-backend.railway.app/api/health');
console.log();
console.log('Resposta esperada:');
console.log('{');
console.log('  "status": "ok",');
console.log('  "database": "connected",');
console.log('  "timestamp": "2024-01-XX..."');
console.log('}');
console.log();

// Resumo final
console.log('📊 RESUMO DA VERIFICAÇÃO:');
console.log('1. ✅ Acesse Railway Dashboard');
console.log('2. 🔍 Verifique status dos serviços');
console.log('3. 🔧 Confirme DATABASE_URL no backend');
console.log('4. 📋 Analise logs para erros');
console.log('5. 🛠️ Corrija problemas identificados');
console.log('6. 🧪 Teste conectividade final');
console.log();

console.log('🎯 OBJETIVO: Garantir que ambos os serviços estejam "Running" e sem erros');
console.log('⏱️  Tempo estimado: 5-10 minutos para verificação completa');
console.log();
console.log('💡 DICA: Mantenha os logs abertos durante os testes!');