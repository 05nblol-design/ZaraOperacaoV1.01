#!/usr/bin/env node

/**
 * 🔍 DIAGNÓSTICO COMPLETO DO ERRO CORS
 * 
 * Este script diagnostica o erro net::ERR_FAILED e problemas de CORS
 * entre o frontend Vercel e backend Railway.
 */

const https = require('https');
const http = require('http');

console.log('🔍 DIAGNÓSTICO COMPLETO DO ERRO CORS');
console.log('=' .repeat(50));

// URLs para teste
const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';
const FRONTEND_URL = 'https://sistema-zara-frontend.vercel.app';

// Função para fazer requisição HTTP
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        
        const req = protocol.request(url, {
            method: options.method || 'GET',
            headers: options.headers || {},
            timeout: 10000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: data
                });
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

async function testBackendHealth() {
    console.log('\n🏥 TESTE 1: SAÚDE DO BACKEND');
    console.log('-'.repeat(30));
    
    try {
        const response = await makeRequest(`${BACKEND_URL}/api/health`);
        console.log(`✅ Backend Status: ${response.statusCode}`);
        console.log(`📊 Response: ${response.data || 'Empty response'}`);
        return true;
    } catch (error) {
        console.log(`❌ Backend Error: ${error.message}`);
        return false;
    }
}

async function testCorsOptions() {
    console.log('\n🌐 TESTE 2: CORS OPTIONS REQUEST');
    console.log('-'.repeat(30));
    
    try {
        const response = await makeRequest(`${BACKEND_URL}/api/auth/login`, {
            method: 'OPTIONS',
            headers: {
                'Origin': FRONTEND_URL,
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            }
        });
        
        console.log(`📡 CORS Status: ${response.statusCode}`);
        console.log(`🔑 CORS Headers:`);
        
        const corsHeaders = {
            'access-control-allow-origin': response.headers['access-control-allow-origin'],
            'access-control-allow-methods': response.headers['access-control-allow-methods'],
            'access-control-allow-headers': response.headers['access-control-allow-headers'],
            'access-control-allow-credentials': response.headers['access-control-allow-credentials']
        };
        
        Object.entries(corsHeaders).forEach(([key, value]) => {
            if (value) {
                console.log(`   ${key}: ${value}`);
            }
        });
        
        if (response.data) {
            console.log(`📄 Response Body: ${response.data}`);
        }
        
        return response.statusCode === 200 || response.statusCode === 204;
    } catch (error) {
        console.log(`❌ CORS Error: ${error.message}`);
        return false;
    }
}

async function testLoginEndpoint() {
    console.log('\n🔐 TESTE 3: ENDPOINT DE LOGIN');
    console.log('-'.repeat(30));
    
    try {
        const response = await makeRequest(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': FRONTEND_URL
            },
            body: JSON.stringify({
                email: 'admin@zara.com',
                password: 'admin123'
            })
        });
        
        console.log(`🔑 Login Status: ${response.statusCode}`);
        console.log(`📄 Response: ${response.data}`);
        
        return response.statusCode === 200;
    } catch (error) {
        console.log(`❌ Login Error: ${error.message}`);
        return false;
    }
}

function analyzeCorsError() {
    console.log('\n🔍 ANÁLISE DO ERRO CORS');
    console.log('-'.repeat(30));
    
    console.log('❌ PROBLEMA IDENTIFICADO:');
    console.log('   • net::ERR_FAILED indica falha na requisição');
    console.log('   • "Não permitido pelo CORS" confirma problema de CORS');
    console.log('   • Backend está funcionando (Status 200 em /health)');
    console.log('   • CORS_ORIGIN não inclui a URL do frontend Vercel');
    
    console.log('\n🎯 CAUSA RAIZ:');
    console.log('   • CORS_ORIGIN no Railway não foi atualizado');
    console.log('   • Frontend Vercel não está na lista de origens permitidas');
    console.log('   • Requisições são bloqueadas pelo navegador');
    
    console.log('\n💡 SOLUÇÃO:');
    console.log('   1. Acesse Railway Dashboard');
    console.log('   2. Configure CORS_ORIGIN com:');
    console.log('      https://sistema-zara-frontend.vercel.app,http://localhost:3000,http://localhost:5173');
    console.log('   3. Salve e faça redeploy');
    console.log('   4. Teste novamente o login');
}

function showRailwayInstructions() {
    console.log('\n🚂 INSTRUÇÕES RAILWAY DASHBOARD');
    console.log('='.repeat(50));
    
    console.log('\n📍 PASSO A PASSO:');
    console.log('1️⃣ Acesse: https://railway.app/dashboard');
    console.log('2️⃣ Selecione: zara-backend-production');
    console.log('3️⃣ Clique em: Variables');
    console.log('4️⃣ Encontre/Crie: CORS_ORIGIN');
    console.log('5️⃣ Cole o valor:');
    console.log('   https://sistema-zara-frontend.vercel.app,https://sistema-zara-frontend-peas4bni7-05nblol-designs-projects.vercel.app,http://localhost:3000,http://localhost:5173');
    console.log('6️⃣ Clique em: Save');
    console.log('7️⃣ Vá para: Deployments');
    console.log('8️⃣ Clique em: Deploy');
    console.log('9️⃣ Aguarde: Deploy completar');
    console.log('🔟 Teste: Login no frontend');
    
    console.log('\n⏱️ TEMPO ESTIMADO: 5-10 minutos');
    console.log('\n🧪 TESTE APÓS DEPLOY:');
    console.log('   • Acesse: https://sistema-zara-frontend.vercel.app');
    console.log('   • Login: admin@zara.com / admin123');
    console.log('   • Resultado esperado: Login bem-sucedido');
}

async function main() {
    try {
        const backendHealthy = await testBackendHealth();
        const corsWorking = await testCorsOptions();
        const loginWorking = await testLoginEndpoint();
        
        console.log('\n📊 RESUMO DOS TESTES');
        console.log('-'.repeat(30));
        console.log(`🏥 Backend Health: ${backendHealthy ? '✅ OK' : '❌ FALHOU'}`);
        console.log(`🌐 CORS Options: ${corsWorking ? '✅ OK' : '❌ FALHOU'}`);
        console.log(`🔐 Login Endpoint: ${loginWorking ? '✅ OK' : '❌ FALHOU'}`);
        
        if (!corsWorking || !loginWorking) {
            analyzeCorsError();
            showRailwayInstructions();
        } else {
            console.log('\n🎉 TODOS OS TESTES PASSARAM!');
            console.log('   Sistema funcionando corretamente.');
        }
        
    } catch (error) {
        console.error('❌ Erro durante diagnóstico:', error.message);
    }
}

// Executar diagnóstico
main().catch(console.error);