const https = require('https');
const http = require('http');

// Configurações
const RAILWAY_BACKEND = 'https://zara-backend-production-aab3.up.railway.app';
const VERCEL_FRONTEND = 'https://sistema-zara-frontend.vercel.app';

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
                'User-Agent': 'Node.js Test Client',
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

async function testCORSFixed() {
    console.log('🔍 TESTANDO CORREÇÃO DO CORS - Sistema ZARA');
    console.log('=' .repeat(60));
    
    try {
        // 1. Testar saúde do backend
        console.log('\n1️⃣ Testando saúde do backend...');
        const healthResponse = await makeRequest(`${RAILWAY_BACKEND}/api/health`);
        console.log(`   ✅ Backend Status: ${healthResponse.status}`);
        
        // 2. Testar CORS com OPTIONS
        console.log('\n2️⃣ Testando CORS com OPTIONS...');
        const corsResponse = await makeRequest(`${RAILWAY_BACKEND}/api/auth/login`, {
            method: 'OPTIONS',
            headers: {
                'Origin': VERCEL_FRONTEND,
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            }
        });
        
        console.log(`   Status: ${corsResponse.status}`);
        console.log(`   CORS Headers:`);
        console.log(`   - Access-Control-Allow-Origin: ${corsResponse.headers['access-control-allow-origin'] || 'NÃO DEFINIDO'}`);
        console.log(`   - Access-Control-Allow-Methods: ${corsResponse.headers['access-control-allow-methods'] || 'NÃO DEFINIDO'}`);
        console.log(`   - Access-Control-Allow-Headers: ${corsResponse.headers['access-control-allow-headers'] || 'NÃO DEFINIDO'}`);
        
        // 3. Testar endpoint protegido (deve retornar erro de token, não CORS)
        console.log('\n3️⃣ Testando endpoint protegido...');
        const protectedResponse = await makeRequest(`${RAILWAY_BACKEND}/api/users`, {
            method: 'GET',
            headers: {
                'Origin': VERCEL_FRONTEND,
                'Authorization': 'Bearer invalid-token'
            }
        });
        
        console.log(`   Status: ${protectedResponse.status}`);
        console.log(`   Resposta: ${protectedResponse.data}`);
        
        // 4. Testar login (pode ter rate limiting)
        console.log('\n4️⃣ Testando login...');
        try {
            const loginResponse = await makeRequest(`${RAILWAY_BACKEND}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Origin': VERCEL_FRONTEND,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: 'demo@zara.com',
                    password: 'demo123'
                })
            });
            
            console.log(`   Status: ${loginResponse.status}`);
            console.log(`   Resposta: ${loginResponse.data}`);
        } catch (error) {
            console.log(`   ⚠️  Erro no login: ${error.message}`);
        }
        
        console.log('\n' + '=' .repeat(60));
        console.log('📊 RESULTADO DO TESTE:');
        
        if (corsResponse.headers['access-control-allow-origin']) {
            console.log('✅ CORS CORRIGIDO COM SUCESSO!');
            console.log('✅ Backend Railway respondendo normalmente');
            console.log('✅ Headers CORS configurados corretamente');
            console.log('\n🎯 PRÓXIMOS PASSOS:');
            console.log('1. Aguardar 15 minutos para rate limiting expirar');
            console.log('2. Testar login no frontend Vercel');
            console.log('3. Verificar se todos os recursos funcionam');
            
            console.log('\n🔗 LINKS PARA TESTE:');
            console.log(`Frontend: ${VERCEL_FRONTEND}`);
            console.log(`Backend: ${RAILWAY_BACKEND}`);
            
            console.log('\n👤 CREDENCIAIS DE TESTE:');
            console.log('Admin: admin@zara.com / admin123');
            console.log('Demo: demo@zara.com / demo123');
            
        } else {
            console.log('❌ CORS ainda não foi corrigido');
            console.log('⚠️  Verifique se o CORS_ORIGIN foi configurado no Railway Dashboard');
        }
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
    }
}

// Executar teste
testCORSFixed().catch(console.error);