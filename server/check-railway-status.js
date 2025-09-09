const axios = require('axios');
const logger = require('./utils/logger');

logger.info('🚂 VERIFICANDO STATUS DO RAILWAY');
logger.info('============================================================');

// URLs para testar
const urls = [
    'https://zaraoperacaov101-production.up.railway.app',
    'https://zaraoperacaov101-production.up.railway.app/api',
    'https://zaraoperacaov101-production.up.railway.app/health',
    'https://zaraoperacaov101-production.up.railway.app/api/health'
];

async function checkRailwayStatus() {
    logger.info('\n🔍 Testando diferentes endpoints...');
    
    for (const url of urls) {
        try {
            logger.info(`\n📡 Testando: ${url}`);
            
            const response = await axios({
                url,
                method: 'GET',
                timeout: 10000,
                validateStatus: function (status) {
                    return status < 500; // Aceitar qualquer status < 500
                }
            });
            
            logger.info(`   ✅ Status: ${response.status}`);
            logger.info(`   📄 Content-Type: ${response.headers['content-type'] || 'N/A'}`);
            
            if (response.data) {
                if (typeof response.data === 'string') {
                    logger.info(`   📝 Resposta: ${response.data.substring(0, 200)}...`);
                } else {
                    logger.info(`   📝 Resposta: ${JSON.stringify(response.data).substring(0, 200)}...`);
                }
            }
            
        } catch (error) {
            if (error.response) {
                logger.error(`   ❌ Status: ${error.response.status}`);
                logger.error(`   📄 Content-Type: ${error.response.headers['content-type'] || 'N/A'}`);
                if (error.response.data) {
                    logger.error(`   📝 Erro: ${JSON.stringify(error.response.data).substring(0, 200)}...`);
                }
            } else if (error.request) {
                logger.error(`   ❌ Sem resposta do servidor: ${error.message}`);
            } else {
                logger.error(`   ❌ Erro na requisição: ${error.message}`);
            }
        }
    }
    
    // Testar se é um problema de CORS
    logger.info('\n🌐 Testando CORS...');
    try {
        const corsTest = await axios({
            url: 'https://zaraoperacaov101-production.up.railway.app',
            method: 'OPTIONS',
            timeout: 10000,
            headers: {
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'GET'
            }
        });
        
        logger.info('   ✅ CORS configurado corretamente');
        logger.info(`   📄 Headers CORS: ${JSON.stringify(corsTest.headers)}`);
        
    } catch (error) {
        logger.error(`   ❌ Problema com CORS: ${error.message}`);
    }
    
    // Verificar se o servidor está realmente online
    logger.info('\n🏥 Verificando saúde do servidor...');
    try {
        const healthCheck = await axios({
            url: 'https://zaraoperacaov101-production.up.railway.app',
            method: 'HEAD',
            timeout: 5000
        });
        
        logger.info('   ✅ Servidor respondendo a requisições HEAD');
        logger.info(`   📊 Status: ${healthCheck.status}`);
        
    } catch (error) {
        logger.error(`   ❌ Servidor não responde: ${error.message}`);
    }
    
    logger.info('\n📋 DIAGNÓSTICO COMPLETO:');
    logger.info('============================================================');
    logger.info('Se todos os testes falharam, possíveis causas:');
    logger.info('1. 🚂 Railway pode estar fazendo deploy');
    logger.info('2. 💤 Aplicação pode estar em sleep mode');
    logger.info('3. 🔧 Problemas de configuração no servidor');
    logger.info('4. 🌐 Problemas de DNS ou conectividade');
    logger.info('\nRecomendações:');
    logger.info('- Verificar logs do Railway Dashboard');
    logger.info('- Aguardar alguns minutos e tentar novamente');
    logger.info('- Verificar se há deploys em andamento');
}

checkRailwayStatus().then(() => {
    logger.info('\n✅ VERIFICAÇÃO DO RAILWAY CONCLUÍDA!');
}).catch(error => {
    logger.error(`Erro na verificação: ${error.message}`);
});