#!/usr/bin/env node

const https = require('https');

const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';
const FRONTEND_URL = 'https://sistema-zara-frontend.vercel.app';

console.log('🧪 TESTE DE CONECTIVIDADE CORRIGIDA');
console.log('='.repeat(40));

function testEndpoint(url, description) {
    return new Promise((resolve) => {
        const req = https.get(url, {
            headers: {
                'Origin': FRONTEND_URL,
                'User-Agent': 'Vercel-Fix-Test/1.0'
            }
        }, (res) => {
            console.log(`   ${description}: ${res.statusCode}`);
            resolve(res.statusCode);
        });
        
        req.on('error', (error) => {
            console.log(`   ${description}: ERROR - ${error.message}`);
            resolve(0);
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            console.log(`   ${description}: TIMEOUT`);
            resolve(0);
        });
    });
}

async function runTests() {
    console.log('\n⏳ Testando endpoints...');
    
    await testEndpoint(`${BACKEND_URL}/api/health`, '📊 Health Check');
    await testEndpoint(`${BACKEND_URL}/api/auth/login`, '🔐 Auth Login');
    await testEndpoint(`${BACKEND_URL}/api/users`, '👥 Users API');
    
    console.log('\n✅ Teste concluído!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Configure as variáveis no Vercel Dashboard');
    console.log('2. Force um redeploy');
    console.log('3. Teste a aplicação novamente');
}

runTests().catch(console.error);
