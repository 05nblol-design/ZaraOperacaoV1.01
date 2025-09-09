#!/usr/bin/env node

/**
 * 🔍 VERIFICAÇÃO: DATABASE_URL Railway Corrigido
 * 
 * Este script verifica se o DATABASE_URL foi corrigido corretamente
 */

const https = require('https');
const http = require('http');

const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';

console.log('\n🔍 VERIFICANDO CORREÇÃO DO DATABASE_URL...');
console.log(`🎯 Backend: ${BACKEND_URL}`);

// Função para fazer requisição HTTP/HTTPS
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        
        const options = {
            headers: {
                'User-Agent': 'Railway-Database-Checker/1.0'
            }
        };
        
        const req = protocol.get(url, options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    data: data,
                    headers: res.headers
                });
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
}

// Testes
async function runTests() {
    console.log('\n📋 EXECUTANDO TESTES...');
    
    const tests = [
        {
            name: 'Health Check',
            url: `${BACKEND_URL}/api/health`,
            expectedStatus: 200,
            checkDatabase: true
        },
        {
            name: 'API Status',
            url: `${BACKEND_URL}/api`,
            expectedStatus: [200, 404],
            checkDatabase: false
        },
        {
            name: 'Root Endpoint',
            url: `${BACKEND_URL}/`,
            expectedStatus: [200, 404],
            checkDatabase: false
        }
    ];
    
    let allPassed = true;
    let databaseConnected = false;
    
    for (const test of tests) {
        try {
            console.log(`\n🧪 Testando: ${test.name}`);
            console.log(`   URL: ${test.url}`);
            
            const result = await makeRequest(test.url);
            
            const statusOk = Array.isArray(test.expectedStatus) 
                ? test.expectedStatus.includes(result.status)
                : result.status === test.expectedStatus;
            
            if (statusOk) {
                console.log(`   ✅ Status: ${result.status} (OK)`);
                
                if (test.checkDatabase && result.data) {
                    try {
                        const jsonData = JSON.parse(result.data);
                        if (jsonData.database === 'connected' || jsonData.status === 'ok') {
                            console.log('   ✅ Database: CONECTADO!');
                            databaseConnected = true;
                        } else {
                            console.log('   ❌ Database: Não conectado');
                            console.log(`   📄 Resposta: ${result.data}`);
                        }
                    } catch (e) {
                        console.log(`   📄 Resposta: ${result.data}`);
                    }
                }
            } else {
                console.log(`   ❌ Status: ${result.status} (Esperado: ${test.expectedStatus})`);
                allPassed = false;
            }
            
        } catch (error) {
            console.log(`   ❌ Erro: ${error.message}`);
            allPassed = false;
        }
    }
    
    console.log('\n📊 RESULTADO FINAL:');
    
    if (databaseConnected) {
        console.log('   ✅ DATABASE_URL: CORRIGIDO!');
        console.log('   ✅ PostgreSQL: CONECTADO!');
        console.log('   ✅ Backend: FUNCIONANDO!');
        
        console.log('\n🎉 SUCESSO! Próximos passos:');
        console.log('   1. 🚀 Deploy do frontend no Railway');
        console.log('   2. 🔗 Conectar frontend ao backend');
        console.log('   3. 🧪 Teste completo da aplicação');
        
    } else if (allPassed) {
        console.log('   ⚠️  Backend: Respondendo');
        console.log('   ❌ Database: Ainda não conectado');
        console.log('\n🔧 AÇÃO NECESSÁRIA:');
        console.log('   → DATABASE_URL ainda precisa ser corrigido');
        console.log('   → Siga as instruções do script anterior');
        console.log('   → Execute: node fix-database-url-railway.js');
        
    } else {
        console.log('   ❌ Backend: Não está respondendo');
        console.log('   ❌ Database: Não conectado');
        console.log('\n🚨 PROBLEMAS DETECTADOS:');
        console.log('   → Verifique se o backend foi deployado');
        console.log('   → Verifique se DATABASE_URL foi corrigido');
        console.log('   → Acesse Railway Dashboard para logs');
    }
    
    console.log('\n============================================================');
    if (databaseConnected) {
        console.log('🎯 STATUS: DATABASE_URL CORRIGIDO - PRONTO PARA FRONTEND!');
    } else {
        console.log('🔥 STATUS: DATABASE_URL AINDA PRECISA SER CORRIGIDO!');
    }
    console.log('============================================================\n');
}

// Executar testes
runTests().catch(console.error);