const axios = require('axios');

const BASE_URL = 'https://zara-backend-production-aab3.up.railway.app/api';

async function waitAndTest() {
    console.log('🚨 PROBLEMA IDENTIFICADO: Rate Limiting do Railway Edge');
    console.log('============================================================');
    console.log('❌ O rate limiting NÃO é do nosso código');
    console.log('❌ É do Railway Edge (infraestrutura)');
    console.log('📊 Limite: 100 requests por 900 segundos (15 minutos)');
    console.log('⏰ Retry-After: 317 segundos (~5 minutos)');
    
    console.log('\n🔍 AGUARDANDO RESET DO RATE LIMIT...');
    console.log('⏳ Aguardando 6 minutos para o rate limit resetar...');
    
    // Aguardar 6 minutos (360 segundos)
    const waitTime = 360; // 6 minutos
    let remaining = waitTime;
    
    const interval = setInterval(() => {
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        process.stdout.write(`\r⏰ Tempo restante: ${minutes}:${seconds.toString().padStart(2, '0')}`);
        remaining--;
        
        if (remaining < 0) {
            clearInterval(interval);
            console.log('\n\n🔄 TESTANDO APÓS RESET...');
            testAfterReset();
        }
    }, 1000);
}

async function testAfterReset() {
    try {
        console.log('\n1️⃣ Testando login após reset do rate limit...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@zara.com',
            password: 'admin123'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'ZARA-Test/1.0'
            },
            timeout: 10000
        });
        
        console.log('✅ LOGIN SUCESSO:', loginResponse.status);
        console.log('🔑 Token obtido:', loginResponse.data.data?.token ? 'SIM' : 'NÃO');
        
        if (loginResponse.data.data?.token) {
            const token = loginResponse.data.data.token;
            
            // Testar endpoint de notificações
            console.log('\n2️⃣ Testando endpoint de notificações...');
            const notificationsResponse = await axios.get(`${BASE_URL}/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'ZARA-Test/1.0'
                },
                timeout: 10000
            });
            
            console.log('✅ NOTIFICAÇÕES SUCESSO:', notificationsResponse.status);
            console.log('📊 Dados:', notificationsResponse.data);
            
            // Testar parâmetros de validação
            console.log('\n3️⃣ Testando validação de parâmetros...');
            try {
                const invalidResponse = await axios.get(`${BASE_URL}/notifications?page=abc&limit=xyz`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'User-Agent': 'ZARA-Test/1.0'
                    },
                    timeout: 10000
                });
                console.log('❌ ERRO: Deveria ter retornado 400, mas retornou:', invalidResponse.status);
            } catch (error) {
                if (error.response?.status === 400) {
                    console.log('✅ VALIDAÇÃO FUNCIONANDO: Status 400 para parâmetros inválidos');
                    console.log('📝 Mensagem:', error.response.data?.message);
                } else {
                    console.log('❌ ERRO INESPERADO:', error.response?.status, error.response?.data);
                }
            }
        }
        
    } catch (error) {
        if (error.response?.status === 429) {
            console.log('❌ AINDA COM RATE LIMITING:', error.response.status);
            console.log('📊 Headers:', error.response.headers);
            console.log('⏰ Retry-After:', error.response.headers['retry-after']);
            console.log('\n💡 SOLUÇÃO: Aguardar mais tempo ou usar IP diferente');
        } else {
            console.log('❌ ERRO:', error.response?.status, error.response?.data?.message || error.message);
        }
    }
}

// Verificar se já passou tempo suficiente
async function checkCurrentStatus() {
    try {
        console.log('🔍 Verificando status atual do rate limit...');
        const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
        console.log('✅ Rate limit resetado! Testando imediatamente...');
        testAfterReset();
    } catch (error) {
        if (error.response?.status === 429) {
            const retryAfter = parseInt(error.response.headers['retry-after']) || 300;
            console.log(`❌ Rate limit ainda ativo. Retry-After: ${retryAfter} segundos`);
            
            if (retryAfter > 600) { // Mais de 10 minutos
                console.log('⏰ Tempo muito longo. Aguardando 6 minutos...');
                waitAndTest();
            } else {
                console.log(`⏰ Aguardando ${retryAfter + 30} segundos...`);
                setTimeout(testAfterReset, (retryAfter + 30) * 1000);
            }
        } else {
            console.log('✅ Sem rate limiting. Testando...');
            testAfterReset();
        }
    }
}

checkCurrentStatus();