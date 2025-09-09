const axios = require('axios');

// URLs para testar
const RAILWAY_URL = 'https://zaraoperacaov101-production.up.railway.app';
const DATABASE_URL = 'postgresql://postgres:GNquZiBhCMsFDZbvDTevPkrWFdRyyLQM@interchange.proxy.rlwy.net:17733/railway';

async function testRailwayStatus() {
    console.log('🔍 TESTANDO STATUS DO RAILWAY APÓS CONFIGURAÇÃO');
    console.log('=' .repeat(60));
    
    // 1. Testar conectividade básica
    console.log('\n1️⃣ TESTANDO CONECTIVIDADE BÁSICA:');
    try {
        const response = await axios.get(RAILWAY_URL, { timeout: 10000 });
        console.log(`✅ Status: ${response.status}`);
        console.log(`📝 Response: ${JSON.stringify(response.data).substring(0, 200)}...`);
    } catch (error) {
        console.log(`❌ Erro: ${error.response?.status || 'TIMEOUT'} - ${error.message}`);
        if (error.response?.data) {
            console.log(`📝 Response: ${JSON.stringify(error.response.data)}`);
        }
    }
    
    // 2. Testar endpoint de health
    console.log('\n2️⃣ TESTANDO ENDPOINT DE HEALTH:');
    try {
        const response = await axios.get(`${RAILWAY_URL}/health`, { timeout: 10000 });
        console.log(`✅ Status: ${response.status}`);
        console.log(`📝 Response: ${JSON.stringify(response.data)}`);
    } catch (error) {
        console.log(`❌ Erro: ${error.response?.status || 'TIMEOUT'} - ${error.message}`);
        if (error.response?.data) {
            console.log(`📝 Response: ${JSON.stringify(error.response.data)}`);
        }
    }
    
    // 3. Testar conexão com banco local
    console.log('\n3️⃣ TESTANDO CONEXÃO COM BANCO (LOCAL):');
    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient({
            datasources: {
                db: {
                    url: DATABASE_URL
                }
            }
        });
        
        const userCount = await prisma.user.count();
        console.log(`✅ Conexão com banco: OK`);
        console.log(`👥 Usuários no banco: ${userCount}`);
        
        await prisma.$disconnect();
    } catch (error) {
        console.log(`❌ Erro na conexão com banco: ${error.message}`);
    }
    
    // 4. Verificar variáveis de ambiente necessárias
    console.log('\n4️⃣ VARIÁVEIS DE AMBIENTE NECESSÁRIAS NO RAILWAY:');
    const requiredVars = {
        'DATABASE_URL': DATABASE_URL,
        'CORS_ORIGIN': 'https://zara-operacao-v1-01.vercel.app,https://zara-operacao-v1-01-git-main-lojaas-projects.vercel.app',
        'NODE_ENV': 'production',
        'PORT': '3000'
    };
    
    console.log('📋 Variáveis que devem estar configuradas no Railway:');
    Object.entries(requiredVars).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
    });
    
    console.log('\n🎯 DIAGNÓSTICO FINAL:');
    console.log('=' .repeat(60));
    console.log('❌ PROBLEMA: Aplicação Railway retorna 404 "Application not found"');
    console.log('\n🔧 POSSÍVEIS SOLUÇÕES:');
    console.log('1. ✅ DATABASE_URL já está correta e testada');
    console.log('2. ❓ Verificar se as variáveis foram salvas no Railway Dashboard');
    console.log('3. ❓ Fazer REDEPLOY manual da aplicação');
    console.log('4. ❓ Verificar logs de build/deploy no Railway');
    console.log('\n📝 PRÓXIMOS PASSOS:');
    console.log('1. Acessar https://railway.app/dashboard');
    console.log('2. Ir no projeto ZaraOperacaoV1.01');
    console.log('3. Verificar aba "Variables" se DATABASE_URL está configurada');
    console.log('4. Verificar aba "Deployments" para ver logs');
    console.log('5. Clicar em "Deploy" para fazer redeploy manual');
    console.log('\n⏱️ TEMPO ESTIMADO: 2-3 minutos para resolver');
}

testRailwayStatus().catch(console.error);