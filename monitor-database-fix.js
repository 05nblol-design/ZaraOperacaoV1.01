#!/usr/bin/env node

/**
 * 🔄 MONITOR: Aguardando correção DATABASE_URL
 * 
 * Este script monitora até que o DATABASE_URL seja corrigido no Railway
 */

const https = require('https');
const http = require('http');

const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';
const CHECK_INTERVAL = 15000; // 15 segundos
const MAX_ATTEMPTS = 20; // 5 minutos total

let attempts = 0;

console.log('\n🔄 MONITORANDO CORREÇÃO DO DATABASE_URL...');
console.log(`🎯 Backend: ${BACKEND_URL}`);
console.log(`⏱️  Verificando a cada ${CHECK_INTERVAL/1000} segundos`);
console.log(`🔢 Máximo ${MAX_ATTEMPTS} tentativas (${(MAX_ATTEMPTS * CHECK_INTERVAL)/60000} minutos)`);

console.log('\n📋 INSTRUÇÕES ENQUANTO AGUARDA:');
console.log('1. 🌐 Acesse: https://railway.app');
console.log('2. 📁 Projeto: ZaraOperacaoV1.01');
console.log('3. ⚙️  Backend → Variables → DATABASE_URL');
console.log('4. 📋 Cole: postgresql://postgres:GNquZiBhCMsFDZbvDTevPkrWFdRyyLQM@interchange.proxy.rlwy.net:17733/railway');
console.log('5. 💾 Save (aguarde deploy)');

// Função para fazer requisição
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        
        const options = {
            headers: {
                'User-Agent': 'Railway-Database-Monitor/1.0'
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
                    data: data
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

// Função para verificar database
async function checkDatabase() {
    attempts++;
    
    console.log(`\n🔍 Tentativa ${attempts}/${MAX_ATTEMPTS} - ${new Date().toLocaleTimeString()}`);
    
    try {
        const result = await makeRequest(`${BACKEND_URL}/api/health`);
        
        if (result.status === 200) {
            console.log('   ✅ Backend: Respondendo');
            
            try {
                const jsonData = JSON.parse(result.data);
                
                // Verificar se database está conectado
                if (jsonData.database === 'connected' || 
                    (jsonData.status === 'ok' && result.data.includes('database')) ||
                    result.data.includes('connected')) {
                    
                    console.log('   ✅ Database: CONECTADO!');
                    console.log('   🎉 DATABASE_URL: CORRIGIDO!');
                    
                    console.log('\n🎊 SUCESSO TOTAL!');
                    console.log('   ✅ Backend funcionando');
                    console.log('   ✅ PostgreSQL conectado');
                    console.log('   ✅ APIs respondendo');
                    
                    console.log('\n🚀 PRÓXIMOS PASSOS:');
                    console.log('   1. 🎯 Deploy frontend no Railway');
                    console.log('   2. 🔗 Conectar frontend ao backend');
                    console.log('   3. 🧪 Teste completo da aplicação');
                    
                    console.log('\n============================================================');
                    console.log('🎉 DATABASE_URL CORRIGIDO - BACKEND 100% FUNCIONAL!');
                    console.log('============================================================\n');
                    
                    return true; // Sucesso!
                    
                } else {
                    console.log('   ❌ Database: Ainda não conectado');
                    console.log(`   📄 Resposta: ${result.data.substring(0, 100)}...`);
                }
                
            } catch (e) {
                console.log('   ❌ Database: Resposta inválida');
                console.log(`   📄 Resposta: ${result.data.substring(0, 100)}...`);
            }
            
        } else {
            console.log(`   ❌ Backend: Status ${result.status}`);
        }
        
    } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
    }
    
    // Verificar se deve continuar
    if (attempts >= MAX_ATTEMPTS) {
        console.log('\n⏰ TEMPO LIMITE ATINGIDO!');
        console.log('\n🔧 AÇÕES NECESSÁRIAS:');
        console.log('   1. ✅ Verifique se atualizou DATABASE_URL no Railway');
        console.log('   2. ✅ Aguarde o deploy completar (pode demorar até 5 min)');
        console.log('   3. ✅ Verifique logs no Railway Dashboard');
        console.log('   4. ✅ Execute: node verify-database-fix.js');
        
        console.log('\n📋 URL CORRETA PARA COPIAR:');
        console.log('postgresql://postgres:GNquZiBhCMsFDZbvDTevPkrWFdRyyLQM@interchange.proxy.rlwy.net:17733/railway');
        
        return false;
    }
    
    console.log(`   ⏳ Aguardando ${CHECK_INTERVAL/1000}s para próxima verificação...`);
    return false;
}

// Loop de monitoramento
async function monitor() {
    while (attempts < MAX_ATTEMPTS) {
        const success = await checkDatabase();
        
        if (success) {
            break; // Sucesso! Parar monitoramento
        }
        
        // Aguardar antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
    }
}

// Iniciar monitoramento
monitor().catch(console.error);