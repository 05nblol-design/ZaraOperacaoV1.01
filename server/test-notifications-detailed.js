const axios = require('axios');

const BASE_URL = 'https://zara-backend-production-aab3.up.railway.app/api';

async function testNotificationsDetailed() {
    console.log('🔍 TESTE DETALHADO: Capturando resposta completa do erro');
    console.log('============================================================');
    
    try {
        // 1. Login
        console.log('1️⃣ Fazendo login...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@zara.com',
            password: 'admin123'
        });
        
        const token = loginResponse.data.data.token;
        console.log('   ✅ Login realizado com sucesso');
        console.log(`   🔑 Token: ${token.substring(0, 20)}...`);
        
        // 2. Teste detalhado das notificações
        console.log('\n2️⃣ Testando notificações com captura completa...');
        
        try {
            const response = await axios.get(`${BASE_URL}/notifications?page=1&limit=10`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            console.log('   ✅ Sucesso!');
            console.log('   📊 Status:', response.status);
            console.log('   📝 Data:', JSON.stringify(response.data, null, 2));
            
        } catch (error) {
            console.log('   ❌ Erro capturado!');
            console.log('   📊 Status:', error.response?.status);
            console.log('   📝 Status Text:', error.response?.statusText);
            console.log('   🔍 Headers da Resposta:', JSON.stringify(error.response?.headers, null, 2));
            console.log('   📄 Body da Resposta:', JSON.stringify(error.response?.data, null, 2));
            console.log('   🔧 Config da Requisição:', JSON.stringify({
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers,
                params: error.config?.params
            }, null, 2));
            
            // Tentar capturar mais detalhes do erro
            if (error.response?.data) {
                console.log('\n🔍 ANÁLISE DETALHADA DO ERRO:');
                console.log('   - Mensagem:', error.response.data.message || 'N/A');
                console.log('   - Código:', error.response.data.code || 'N/A');
                console.log('   - Detalhes:', error.response.data.details || 'N/A');
                console.log('   - Errors:', error.response.data.errors || 'N/A');
                console.log('   - Stack:', error.response.data.stack || 'N/A');
            }
        }
        
        // 3. Teste sem parâmetros
        console.log('\n3️⃣ Testando sem parâmetros...');
        try {
            const response = await axios.get(`${BASE_URL}/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('   ✅ Sucesso sem parâmetros!');
            console.log('   📊 Status:', response.status);
        } catch (error) {
            console.log('   ❌ Erro sem parâmetros:', error.response?.status, error.response?.data?.message);
        }
        
        // 4. Teste com diferentes combinações
        console.log('\n4️⃣ Testando combinações específicas...');
        const testCases = [
            { params: '?page=1', desc: 'Apenas page' },
            { params: '?limit=10', desc: 'Apenas limit' },
            { params: '?read=false', desc: 'Apenas read' },
            { params: '?type=SYSTEM', desc: 'Apenas type' },
            { params: '?priority=HIGH', desc: 'Apenas priority' }
        ];
        
        for (const testCase of testCases) {
            try {
                const response = await axios.get(`${BASE_URL}/notifications${testCase.params}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log(`   ✅ ${testCase.desc}: ${response.status}`);
            } catch (error) {
                console.log(`   ❌ ${testCase.desc}: ${error.response?.status} - ${error.response?.data?.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Erro no login:', error.message);
    }
}

testNotificationsDetailed();