#!/usr/bin/env node

/**
 * Teste de CORS entre Vercel e Railway
 */

const https = require('https');
const http = require('http');

const VERCEL_URL = 'https://sistema-zara-frontend.vercel.app';
const RAILWAY_URL = 'https://zara-backend-production-aab3.up.railway.app';

console.log('🧪 TESTANDO CORS VERCEL ↔ RAILWAY');
console.log('='.repeat(50));

// Função para fazer requisição HTTP
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        
        const req = protocol.request(url, {
            method: options.method || 'GET',
            headers: {
                'Origin': VERCEL_URL,
                'User-Agent': 'CORS-Test/1.0',
                ...options.headers
            }
        }, (res) => {
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
        
        req.on('error', reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
        
        req.end();
    });
}

// Teste 1: Health Check com Origin
async function testHealthWithOrigin() {
    console.log('\n⏳ Testando Health Check com Origin...');
    try {
        const response = await makeRequest(`${RAILWAY_URL}/api/health`);
        console.log(`   📊 Status: ${response.status}`);
        
        // Verificar headers CORS
        const corsHeaders = {
            'access-control-allow-origin': response.headers['access-control-allow-origin'],
            'access-control-allow-credentials': response.headers['access-control-allow-credentials'],
            'access-control-allow-methods': response.headers['access-control-allow-methods']
        };
        
        console.log('   🔒 Headers CORS:');
        Object.entries(corsHeaders).forEach(([key, value]) => {
            if (value) {
                console.log(`      ✅ ${key}: ${value}`);
            } else {
                console.log(`      ❌ ${key}: NÃO CONFIGURADO`);
            }
        });
        
        // Verificar se Vercel está permitido
        const allowedOrigin = response.headers['access-control-allow-origin'];
        if (allowedOrigin === VERCEL_URL || allowedOrigin === '*') {
            console.log('   ✅ CORS: Vercel PERMITIDO');
        } else {
            console.log('   ❌ CORS: Vercel NÃO PERMITIDO');
            console.log(`      Expected: ${VERCEL_URL}`);
            console.log(`      Received: ${allowedOrigin || 'undefined'}`);
        }
        
    } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
    }
}

// Teste 2: Preflight OPTIONS
async function testPreflight() {
    console.log('\n⏳ Testando Preflight OPTIONS...');
    try {
        const response = await makeRequest(`${RAILWAY_URL}/api/health`, {
            method: 'OPTIONS',
            headers: {
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'Content-Type,Authorization'
            }
        });
        
        console.log(`   📊 Status: ${response.status}`);
        
        if (response.status === 200 || response.status === 204) {
            console.log('   ✅ Preflight: SUCESSO');
        } else {
            console.log('   ❌ Preflight: FALHOU');
        }
        
    } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
    }
}

// Executar testes
async function runTests() {
    await testHealthWithOrigin();
    await testPreflight();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎯 DIAGNÓSTICO CORS CONCLUÍDO!');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Configure CORS_ORIGINS no Railway Dashboard');
    console.log('2. Aguarde redeploy automático (2-3 minutos)');
    console.log('3. Execute este teste novamente');
    console.log('4. Teste a aplicação completa');
    
    console.log('\n🔗 LINKS:');
    console.log(`   🚂 Railway: https://railway.app/dashboard`);
    console.log(`   🌐 Frontend: ${VERCEL_URL}`);
    console.log(`   ⚡ Backend: ${RAILWAY_URL}`);
}

runTests().catch(console.error);
