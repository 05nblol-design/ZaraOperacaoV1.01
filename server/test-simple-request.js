const axios = require('axios');

const BASE_URL = 'https://zara-backend-production-aab3.up.railway.app/api';

async function testSimpleRequest() {
    console.log('🔍 TESTE SIMPLES: Verificando conectividade básica');
    console.log('============================================================');
    
    try {
        // Teste 1: Health check
        console.log('1️⃣ Testando health check...');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('   ✅ Health check:', healthResponse.status, healthResponse.data);
    } catch (error) {
        console.log('   ❌ Health check falhou:', error.response?.status, error.response?.data);
    }
    
    try {
        // Teste 2: Endpoint público sem rate limiting
        console.log('\n2️⃣ Testando endpoint público...');
        const publicResponse = await axios.get(`${BASE_URL}/`);
        console.log('   ✅ Endpoint público:', publicResponse.status);
    } catch (error) {
        console.log('   ❌ Endpoint público falhou:', error.response?.status, error.response?.data);
    }
    
    try {
        // Teste 3: Login com headers mínimos
        console.log('\n3️⃣ Testando login com headers mínimos...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@zara.com',
            password: 'admin123'
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        console.log('   ✅ Login sucesso:', loginResponse.status);
        console.log('   🔑 Token obtido:', loginResponse.data.data?.token ? 'SIM' : 'NÃO');
    } catch (error) {
        console.log('   ❌ Login falhou:', error.response?.status);
        console.log('   📝 Erro:', error.response?.data?.message || error.message);
        console.log('   🔍 Headers da resposta:', JSON.stringify(error.response?.headers, null, 2));
        
        // Verificar se é rate limiting
        if (error.response?.status === 429) {
            console.log('   ⚠️  RATE LIMITING DETECTADO!');
            console.log('   📊 Retry-After:', error.response.headers['retry-after']);
            console.log('   📊 X-RateLimit-*:', {
                limit: error.response.headers['x-ratelimit-limit'],
                remaining: error.response.headers['x-ratelimit-remaining'],
                reset: error.response.headers['x-ratelimit-reset']
            });
        }
    }
    
    try {
        // Teste 4: Diferentes User-Agents
        console.log('\n4️⃣ Testando com diferentes User-Agents...');
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'axios/1.6.0',
            'PostmanRuntime/7.32.3',
            'curl/7.68.0'
        ];
        
        for (const ua of userAgents) {
            try {
                const response = await axios.post(`${BASE_URL}/auth/login`, {
                    email: 'admin@zara.com',
                    password: 'admin123'
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': ua
                    },
                    timeout: 5000
                });
                console.log(`   ✅ ${ua.substring(0, 20)}...: ${response.status}`);
                break; // Se um funcionar, parar
            } catch (error) {
                console.log(`   ❌ ${ua.substring(0, 20)}...: ${error.response?.status}`);
            }
        }
    } catch (error) {
        console.log('   ❌ Erro geral nos testes de User-Agent:', error.message);
    }
}

testSimpleRequest();