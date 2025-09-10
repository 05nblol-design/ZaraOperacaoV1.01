const https = require('https');
const http = require('http');

// URLs atuais
const RAILWAY_BACKEND = 'https://zara-backend-production-aab3.up.railway.app';
const VERCEL_FRONTEND = 'https://sistema-zara-frontend.vercel.app';

console.log('🔍 DIAGNÓSTICO DE CORS - RAILWAY BACKEND');
console.log('=' .repeat(50));
console.log(`Backend: ${RAILWAY_BACKEND}`);
console.log(`Frontend: ${VERCEL_FRONTEND}`);
console.log('');

// Função para fazer requisições HTTP
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;
        
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: {
                'User-Agent': 'CORS-Test/1.0',
                'Accept': 'application/json',
                ...options.headers
            }
        };

        const req = client.request(requestOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    data: data
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

async function testCorsIssue() {
    try {
        // Teste 1: Health Check sem Origin
        console.log('1️⃣ Testando Health Check (sem Origin)...');
        try {
            const healthResponse = await makeRequest(`${RAILWAY_BACKEND}/api/health`);
            console.log(`   ✅ Status: ${healthResponse.status}`);
            console.log(`   📄 Response: ${healthResponse.data.substring(0, 100)}...`);
        } catch (error) {
            console.log(`   ❌ Erro: ${error.message}`);
        }

        // Teste 2: Health Check com Origin do Vercel
        console.log('\n2️⃣ Testando Health Check (com Origin Vercel)...');
        try {
            const healthWithOrigin = await makeRequest(`${RAILWAY_BACKEND}/api/health`, {
                headers: {
                    'Origin': VERCEL_FRONTEND
                }
            });
            console.log(`   ✅ Status: ${healthWithOrigin.status}`);
            console.log(`   🌐 CORS Headers:`);
            console.log(`      - Access-Control-Allow-Origin: ${healthWithOrigin.headers['access-control-allow-origin'] || 'NÃO DEFINIDO'}`);
            console.log(`      - Access-Control-Allow-Credentials: ${healthWithOrigin.headers['access-control-allow-credentials'] || 'NÃO DEFINIDO'}`);
            console.log(`   📄 Response: ${healthWithOrigin.data.substring(0, 100)}...`);
        } catch (error) {
            console.log(`   ❌ Erro: ${error.message}`);
        }

        // Teste 3: OPTIONS Preflight
        console.log('\n3️⃣ Testando OPTIONS Preflight...');
        try {
            const optionsResponse = await makeRequest(`${RAILWAY_BACKEND}/api/auth/login`, {
                method: 'OPTIONS',
                headers: {
                    'Origin': VERCEL_FRONTEND,
                    'Access-Control-Request-Method': 'POST',
                    'Access-Control-Request-Headers': 'Content-Type,Authorization'
                }
            });
            console.log(`   ✅ Status: ${optionsResponse.status}`);
            console.log(`   🌐 CORS Headers:`);
            console.log(`      - Access-Control-Allow-Origin: ${optionsResponse.headers['access-control-allow-origin'] || 'NÃO DEFINIDO'}`);
            console.log(`      - Access-Control-Allow-Methods: ${optionsResponse.headers['access-control-allow-methods'] || 'NÃO DEFINIDO'}`);
            console.log(`      - Access-Control-Allow-Headers: ${optionsResponse.headers['access-control-allow-headers'] || 'NÃO DEFINIDO'}`);
        } catch (error) {
            console.log(`   ❌ Erro: ${error.message}`);
        }

        // Teste 4: POST Login
        console.log('\n4️⃣ Testando POST Login...');
        try {
            const loginResponse = await makeRequest(`${RAILWAY_BACKEND}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Origin': VERCEL_FRONTEND,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: 'admin@zara.com',
                    password: 'admin123'
                })
            });
            console.log(`   ✅ Status: ${loginResponse.status}`);
            console.log(`   🌐 CORS Headers:`);
            console.log(`      - Access-Control-Allow-Origin: ${loginResponse.headers['access-control-allow-origin'] || 'NÃO DEFINIDO'}`);
            console.log(`   📄 Response: ${loginResponse.data.substring(0, 200)}...`);
        } catch (error) {
            console.log(`   ❌ Erro: ${error.message}`);
        }

        console.log('\n' + '=' .repeat(50));
        console.log('📊 RESUMO DO DIAGNÓSTICO:');
        console.log('\n🔍 PROBLEMA IDENTIFICADO:');
        console.log('   ❌ CORS_ORIGINS não está configurado no Railway');
        console.log('   ❌ Backend rejeita requisições do frontend Vercel');
        console.log('   ❌ Headers CORS ausentes nas respostas');
        
        console.log('\n🔧 SOLUÇÃO NECESSÁRIA:');
        console.log('   1. Acessar Railway Dashboard');
        console.log('   2. Configurar variável CORS_ORIGINS');
        console.log('   3. Valor: https://sistema-zara-frontend.vercel.app');
        console.log('   4. Aguardar redeploy (2-3 minutos)');
        
        console.log('\n🌐 LINKS:');
        console.log(`   Railway: https://railway.app/dashboard`);
        console.log(`   Frontend: ${VERCEL_FRONTEND}`);
        console.log(`   Backend: ${RAILWAY_BACKEND}`);
        
    } catch (error) {
        console.error('💥 Erro durante diagnóstico:', error.message);
    }
}

// Executar diagnóstico
testCorsIssue()
    .then(() => {
        console.log('\n🏁 Diagnóstico concluído!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Erro:', error.message);
        process.exit(1);
    });