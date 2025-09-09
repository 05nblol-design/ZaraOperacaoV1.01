#!/usr/bin/env node

/**
 * 🧪 TESTE: Verificar se as tabelas do Prisma existem no Railway
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabaseTables() {
    console.log('🧪 TESTANDO TABELAS DO BANCO DE DADOS...\n');
    
    try {
        // Teste 1: Verificar tabela machines
        console.log('1️⃣ Testando tabela machines:');
        const machineCount = await prisma.machine.count();
        console.log('   ✅ Tabela machines existe - ' + machineCount + ' registros');
        
        // Teste 2: Verificar tabela users
        console.log('\n2️⃣ Testando tabela users:');
        const userCount = await prisma.user.count();
        console.log('   ✅ Tabela users existe - ' + userCount + ' registros');
        
        // Teste 3: Verificar tabela quality_tests
        console.log('\n3️⃣ Testando tabela quality_tests:');
        const qualityTestCount = await prisma.qualityTest.count();
        console.log('   ✅ Tabela quality_tests existe - ' + qualityTestCount + ' registros');
        
        // Teste 4: Verificar tabela machine_operations
        console.log('\n4️⃣ Testando tabela machine_operations:');
        const operationCount = await prisma.machineOperation.count();
        console.log('   ✅ Tabela machine_operations existe - ' + operationCount + ' registros');
        
        console.log('\n🎉 SUCESSO: Todas as tabelas existem no banco de dados!');
        console.log('\n📊 RESUMO:');
        console.log('   - Machines: ' + machineCount);
        console.log('   - Users: ' + userCount);
        console.log('   - Quality Tests: ' + qualityTestCount);
        console.log('   - Operations: ' + operationCount);
        
    } catch (error) {
        console.error('❌ ERRO ao testar tabelas:', error.message);
        
        if (error.code === 'P2021') {
            console.log('\n🚨 DIAGNÓSTICO:');
            console.log('   - As migrações do Prisma NÃO foram executadas');
            console.log('   - As tabelas não existem no PostgreSQL');
            console.log('   - É necessário executar: npx prisma db push');
            console.log('\n📋 PRÓXIMOS PASSOS:');
            console.log('   1. Acesse o Railway Dashboard');
            console.log('   2. Faça um novo deploy');
            console.log('   3. Verifique os logs do build');
            console.log('   4. Execute este teste novamente');
        }
        
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Executar teste
testDatabaseTables();
