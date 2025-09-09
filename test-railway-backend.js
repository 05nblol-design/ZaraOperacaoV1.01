#!/usr/bin/env node

/**
 * TESTE DO BACKEND RAILWAY COM USER-AGENT VÁLIDO
 * Verifica se o backend está funcionando corretamente
 */

const https = require('https');
const http = require('http');

const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';

console.log('🚀 TESTANDO BACKEND RAILWAY');
console.log('=' .repeat(50));
console.log(`URL: ${BACKEND_URL}`);
console.log('');

// Função para fazer requisição HTTP com User-Agent válido
function makeRequest(url, path = '') {
    return new Promise((resolve, reject) => {
        const fullUrl = url + path;
        const urlObj = new URL(fullUrl);
        const client = urlObj.protocol === 'https:' ? https : http;
        
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
                'Connection': 'keep-alive'
            }
        };
        
        const req = client.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    data: data
                });
            });
        });
        
        req.on('error', (err) => {
            reject(err);
        });
        
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
        
        req.end();
    });
}

// Testes
async function runTests() {
    const tests = [
        { name: 'Root Endpoint', path: '' },
        { name: 'Health Check', path: '/api/health' },
        { name: 'API Status', path: '/api' },
        { name: 'Users Endpoint', path: '/api/users' }
    ];
    
    console.log('🔍 EXECUTANDO TESTES COM USER-AGENT VÁLIDO:');
    console.log('');
    
    let backendWorking = false;
    
    for (const test of tests) {
        try {
            console.log(`⏳ Testando: ${test.name} (${test.path})`);
            
            const result = await makeRequest(BACKEND_URL, test.path);
            
            if (result.status === 200) {
                console.log(`   ✅ Status: ${result.status} - OK`);
                backendWorking = true;
                
                // Tentar parsear JSON
                try {
                    const json = JSON.parse(result.data);
                    console.log(`   📄 Resposta:`, JSON.stringify(json, null, 2).substring(0, 200));
                } catch {
                    console.log(`   📄 Resposta: ${result.data.substring(0, 100)}...`);
                }
            } else if (result.status === 401) {
                console.log(`   🔐 Status: ${result.status} - Não autorizado (normal para endpoints protegidos)`);
                backendWorking = true;
            } else if (result.status === 404) {
                console.log(`   📍 Status: ${result.status} - Endpoint não encontrado`);
            } else {
                console.log(`   ⚠️  Status: ${result.status}`);
                console.log(`   📄 Resposta: ${result.data.substring(0, 100)}`);
            }
            
        } catch (error) {
            console.log(`   ❌ Erro: ${error.message}`);
        }
        
        console.log('');
    }
    
    console.log('🎯 RESULTADO DOS TESTES:');
    console.log('');
    
    if (backendWorking) {
        console.log('✅ Backend Railway está funcionando!');
        console.log('📋 Configuração do Frontend:');
        console.log('');
        console.log('   🔧 Variáveis de ambiente para Railway Frontend:');
        console.log(`   VITE_API_URL=${BACKEND_URL}/api`);
        console.log(`   VITE_SOCKET_URL=${BACKEND_URL}`);
        console.log('   VITE_APP_NAME=Sistema ZARA');
        console.log('   VITE_APP_VERSION=1.0.1');
        console.log('   VITE_NODE_ENV=production');
        console.log('   VITE_BUILD_SOURCEMAP=false');
        console.log('   VITE_BUILD_MINIFY=true');
        console.log('');
        console.log('   📝 Próximos passos:');
        console.log('   1. Criar novo serviço no Railway para o frontend');
        console.log('   2. Conectar o repositório (pasta frontend)');
        console.log('   3. Configurar as variáveis acima no Railway Dashboard');
        console.log('   4. Fazer deploy do frontend');
        console.log('   5. Testar a aplicação completa');
    } else {
        console.log('❌ Backend Railway não está respondendo corretamente');
        console.log('🔧 Possíveis problemas:');
        console.log('   1. DATABASE_URL ainda está incorreta');
        console.log('   2. Variáveis de ambiente faltando');
        console.log('   3. Erro no código do backend');
        console.log('   4. Problema no deploy');
        console.log('');
        console.log('   🚨 Acesse os logs do Railway para mais detalhes');
    }
}

// Executar testes
runTests().catch(console.error);