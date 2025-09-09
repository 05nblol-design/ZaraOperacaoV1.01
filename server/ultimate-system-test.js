const axios = require('axios');
const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');

logger.info('🚀 TESTE FINAL COMPLETO DO SISTEMA ZARA');
logger.info('============================================================');

// Configurações
const BASE_URL = 'https://zaraoperacaov101-production.up.railway.app';
const TIMEOUT = 15000;

// Função para fazer requisições com retry
async function makeRequest(url, options = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios({
                url,
                timeout: TIMEOUT,
                ...options
            });
            return { success: true, data: response.data, status: response.status };
        } catch (error) {
            logger.warn(`Tentativa ${i + 1}/${retries} falhou para ${url}: ${error.message}`);
            if (i === retries - 1) {
                return { 
                    success: false, 
                    error: error.message, 
                    status: error.response?.status || 'TIMEOUT'
                };
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

// Função para verificar console logs
function checkConsoleLogs() {
    logger.info('\n🔍 VERIFICANDO CONSOLE LOGS...');
    
    const mainDirectories = ['api', 'routes', 'services', 'middleware', 'controllers', 'models', 'utils', 'socket'];
    let totalLogs = 0;
    const logDetails = [];
    
    mainDirectories.forEach(dirName => {
        const dirPath = path.join(__dirname, dirName);
        
        if (fs.existsSync(dirPath)) {
            function checkDirectory(dir) {
                const files = fs.readdirSync(dir);
                
                files.forEach(file => {
                    const fullPath = path.join(dir, file);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory()) {
                        checkDirectory(fullPath);
                    } else if (file.endsWith('.js')) {
                        try {
                            const content = fs.readFileSync(fullPath, 'utf8');
                            const lines = content.split('\n');
                            
                            lines.forEach((line, index) => {
                                const trimmedLine = line.trim();
                                if ((trimmedLine.includes('console.log') || 
                                     trimmedLine.includes('console.error') || 
                                     trimmedLine.includes('console.warn') || 
                                     trimmedLine.includes('console.info') ||
                                     trimmedLine.includes('console.debug')) &&
                                    !trimmedLine.startsWith('//') &&
                                    !trimmedLine.includes('// REMOVED')) {
                                    
                                    totalLogs++;
                                    logDetails.push({
                                        file: path.relative(__dirname, fullPath),
                                        line: index + 1,
                                        content: trimmedLine
                                    });
                                }
                            });
                        } catch (error) {
                            // Ignorar erros de leitura
                        }
                    }
                });
            }
            
            checkDirectory(dirPath);
        }
    });
    
    return { totalLogs, logDetails };
}

// Função principal de teste
async function runUltimateTest() {
    const testResults = {
        timestamp: new Date().toISOString(),
        connectivity: { status: 'PENDING', details: {} },
        authentication: { status: 'PENDING', details: {} },
        endpoints: { status: 'PENDING', details: {} },
        consoleLogs: { status: 'PENDING', details: {} },
        logging: { status: 'PENDING', details: {} },
        overall: { status: 'PENDING', score: 0 }
    };
    
    try {
        // 1. TESTE DE CONECTIVIDADE
        logger.info('\n1️⃣ TESTANDO CONECTIVIDADE...');
        const connectivityTest = await makeRequest(BASE_URL);
        
        if (connectivityTest.success) {
            logger.info('   ✅ Servidor online e respondendo');
            testResults.connectivity.status = 'SUCCESS';
            testResults.connectivity.details = {
                responseTime: 'OK',
                status: connectivityTest.status
            };
        } else {
            logger.error('   ❌ Servidor offline ou não respondendo');
            testResults.connectivity.status = 'FAILED';
            testResults.connectivity.details = {
                error: connectivityTest.error,
                status: connectivityTest.status
            };
        }
        
        // 2. TESTE DE AUTENTICAÇÃO
        logger.info('\n2️⃣ TESTANDO AUTENTICAÇÃO...');
        const loginTest = await makeRequest(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: {
                email: 'admin@zara.com',
                password: 'admin123'
            }
        });
        
        if (loginTest.success) {
            logger.info('   ✅ Login funcionando corretamente');
            testResults.authentication.status = 'SUCCESS';
            testResults.authentication.details = {
                hasToken: !!loginTest.data?.token,
                status: loginTest.status
            };
        } else {
            logger.error('   ❌ Falha no sistema de autenticação');
            testResults.authentication.status = 'FAILED';
            testResults.authentication.details = {
                error: loginTest.error,
                status: loginTest.status
            };
        }
        
        // 3. TESTE DE ENDPOINTS PRINCIPAIS
        logger.info('\n3️⃣ TESTANDO ENDPOINTS PRINCIPAIS...');
        const endpoints = [
            '/api/products',
            '/api/categories',
            '/api/users/profile'
        ];
        
        let endpointsWorking = 0;
        const endpointResults = {};
        
        for (const endpoint of endpoints) {
            const test = await makeRequest(`${BASE_URL}${endpoint}`);
            if (test.success) {
                endpointsWorking++;
                endpointResults[endpoint] = 'SUCCESS';
                logger.info(`   ✅ ${endpoint} - OK`);
            } else {
                endpointResults[endpoint] = 'FAILED';
                logger.error(`   ❌ ${endpoint} - FALHA`);
            }
        }
        
        testResults.endpoints.status = endpointsWorking === endpoints.length ? 'SUCCESS' : 'PARTIAL';
        testResults.endpoints.details = {
            working: endpointsWorking,
            total: endpoints.length,
            results: endpointResults
        };
        
        // 4. VERIFICAÇÃO DE CONSOLE LOGS
        logger.info('\n4️⃣ VERIFICANDO CONSOLE LOGS...');
        const logCheck = checkConsoleLogs();
        
        if (logCheck.totalLogs === 0) {
            logger.info('   ✅ Nenhum console log encontrado nos arquivos principais');
            testResults.consoleLogs.status = 'SUCCESS';
        } else {
            logger.warn(`   ⚠️  Encontrados ${logCheck.totalLogs} console logs`);
            testResults.consoleLogs.status = 'NEEDS_REVIEW';
        }
        
        testResults.consoleLogs.details = {
            totalFound: logCheck.totalLogs,
            locations: logCheck.logDetails
        };
        
        // 5. TESTE DO SISTEMA DE LOGGING
        logger.info('\n5️⃣ TESTANDO SISTEMA DE LOGGING...');
        try {
            logger.info('Teste do sistema Winston - Ultimate Test');
            logger.warn('Teste de warning');
            logger.error('Teste de error');
            
            // Verificar se os arquivos de log existem
            const logFiles = ['combined.log', 'error.log', 'out.log'];
            let logFilesExist = 0;
            
            logFiles.forEach(logFile => {
                if (fs.existsSync(path.join(__dirname, 'logs', logFile))) {
                    logFilesExist++;
                }
            });
            
            logger.info(`   ✅ Sistema de logging funcionando (${logFilesExist}/${logFiles.length} arquivos)`);
            testResults.logging.status = 'SUCCESS';
            testResults.logging.details = {
                logFilesFound: logFilesExist,
                totalLogFiles: logFiles.length
            };
        } catch (error) {
            logger.error('   ❌ Erro no sistema de logging');
            testResults.logging.status = 'FAILED';
            testResults.logging.details = { error: error.message };
        }
        
        // CÁLCULO DO SCORE GERAL
        let score = 0;
        if (testResults.connectivity.status === 'SUCCESS') score += 25;
        if (testResults.authentication.status === 'SUCCESS') score += 25;
        if (testResults.endpoints.status === 'SUCCESS') score += 20;
        else if (testResults.endpoints.status === 'PARTIAL') score += 10;
        if (testResults.consoleLogs.status === 'SUCCESS') score += 15;
        if (testResults.logging.status === 'SUCCESS') score += 15;
        
        testResults.overall.score = score;
        testResults.overall.status = score >= 90 ? 'EXCELLENT' : 
                                   score >= 70 ? 'GOOD' : 
                                   score >= 50 ? 'NEEDS_IMPROVEMENT' : 'CRITICAL';
        
        // RESULTADO FINAL
        logger.info('\n📋 RESULTADO FINAL DO TESTE COMPLETO:');
        logger.info('============================================================');
        logger.info(`🌐 Conectividade: ${testResults.connectivity.status === 'SUCCESS' ? '✅' : '❌'} ${testResults.connectivity.status}`);
        logger.info(`🔐 Autenticação: ${testResults.authentication.status === 'SUCCESS' ? '✅' : '❌'} ${testResults.authentication.status}`);
        logger.info(`🔗 Endpoints: ${testResults.endpoints.status === 'SUCCESS' ? '✅' : testResults.endpoints.status === 'PARTIAL' ? '⚠️' : '❌'} ${testResults.endpoints.status}`);
        logger.info(`📝 Console Logs: ${testResults.consoleLogs.status === 'SUCCESS' ? '✅' : '⚠️'} ${testResults.consoleLogs.status}`);
        logger.info(`📊 Sistema Logging: ${testResults.logging.status === 'SUCCESS' ? '✅' : '❌'} ${testResults.logging.status}`);
        logger.info(`\n🎯 SCORE GERAL: ${score}/100 - ${testResults.overall.status}`);
        
        if (score >= 90) {
            logger.info('\n🎉 PARABÉNS! Sistema funcionando perfeitamente!');
        } else if (score >= 70) {
            logger.info('\n👍 Sistema funcionando bem, pequenos ajustes podem ser feitos');
        } else {
            logger.warn('\n⚠️  Sistema precisa de melhorias');
        }
        
        // Salvar relatório
        fs.writeFileSync(
            path.join(__dirname, 'ultimate-test-report.json'),
            JSON.stringify(testResults, null, 2)
        );
        
        logger.info('\n💾 Relatório completo salvo: ultimate-test-report.json');
        
    } catch (error) {
        logger.error(`Erro durante o teste: ${error.message}`);
        testResults.overall.status = 'ERROR';
        testResults.overall.error = error.message;
    }
}

// Executar teste
runUltimateTest().then(() => {
    logger.info('\n✅ TESTE COMPLETO FINALIZADO!');
}).catch(error => {
    logger.error(`Erro fatal: ${error.message}`);
});