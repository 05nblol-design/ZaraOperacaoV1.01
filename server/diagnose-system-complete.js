const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://zara-backend-production-aab3.up.railway.app/api';

async function diagnoseCompleteSystem() {
    console.log('🔍 DIAGNÓSTICO COMPLETO DO SISTEMA ZARA');
    console.log('============================================================');
    
    const results = {
        connectivity: {},
        authentication: {},
        endpoints: {},
        validation: {},
        consoleLogs: [],
        errors: []
    };
    
    // 1. Teste de Conectividade
    console.log('\n1️⃣ TESTANDO CONECTIVIDADE...');
    await testConnectivity(results);
    
    // 2. Teste de Autenticação
    console.log('\n2️⃣ TESTANDO AUTENTICAÇÃO...');
    await testAuthentication(results);
    
    // 3. Teste de Endpoints
    console.log('\n3️⃣ TESTANDO ENDPOINTS...');
    await testEndpoints(results);
    
    // 4. Teste de Validação
    console.log('\n4️⃣ TESTANDO VALIDAÇÃO...');
    await testValidation(results);
    
    // 5. Verificar Console Logs no Código
    console.log('\n5️⃣ VERIFICANDO CONSOLE LOGS NO CÓDIGO...');
    await findConsoleLogs(results);
    
    // 6. Relatório Final
    console.log('\n6️⃣ RELATÓRIO FINAL...');
    generateReport(results);
}

async function testConnectivity(results) {
    const tests = [
        { name: 'Health Check', url: `${BASE_URL}/health` },
        { name: 'Root API', url: `${BASE_URL}/` },
        { name: 'Auth Endpoint', url: `${BASE_URL}/auth` }
    ];
    
    for (const test of tests) {
        try {
            console.log(`   🔍 ${test.name}...`);
            const response = await axios.get(test.url, { 
                timeout: 15000,
                headers: {
                    'User-Agent': 'ZARA-Diagnostic/1.0'
                }
            });
            results.connectivity[test.name] = {
                status: response.status,
                success: true,
                data: response.data
            };
            console.log(`   ✅ ${test.name}: ${response.status}`);
        } catch (error) {
            results.connectivity[test.name] = {
                status: error.response?.status || 'TIMEOUT',
                success: false,
                error: error.message,
                headers: error.response?.headers
            };
            console.log(`   ❌ ${test.name}: ${error.response?.status || 'TIMEOUT'} - ${error.message}`);
        }
    }
}

async function testAuthentication(results) {
    const credentials = [
        { email: 'admin@zara.com', password: 'admin123', name: 'Admin' },
        { email: 'operador@zara.com', password: 'operador123', name: 'Operador' },
        { email: 'lucas@zara.com', password: 'lucas123', name: 'Lucas' }
    ];
    
    for (const cred of credentials) {
        try {
            console.log(`   🔍 Login ${cred.name}...`);
            const response = await axios.post(`${BASE_URL}/auth/login`, {
                email: cred.email,
                password: cred.password
            }, {
                timeout: 15000,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'ZARA-Diagnostic/1.0'
                }
            });
            
            results.authentication[cred.name] = {
                success: true,
                status: response.status,
                hasToken: !!response.data.data?.token,
                token: response.data.data?.token?.substring(0, 20) + '...',
                user: response.data.data?.user
            };
            console.log(`   ✅ ${cred.name}: Login OK - Token: ${!!response.data.data?.token}`);
            
            // Salvar token para testes posteriores
            if (response.data.data?.token) {
                results.authToken = response.data.data.token;
            }
            
        } catch (error) {
            results.authentication[cred.name] = {
                success: false,
                status: error.response?.status || 'TIMEOUT',
                error: error.message,
                data: error.response?.data
            };
            console.log(`   ❌ ${cred.name}: ${error.response?.status || 'TIMEOUT'} - ${error.message}`);
        }
    }
}

async function testEndpoints(results) {
    if (!results.authToken) {
        console.log('   ❌ Sem token de autenticação - pulando testes de endpoints');
        return;
    }
    
    const endpoints = [
        { name: 'Users', path: '/users' },
        { name: 'Machines', path: '/machines' },
        { name: 'Notifications', path: '/notifications' },
        { name: 'Reports', path: '/reports' },
        { name: 'Quality Tests', path: '/quality-tests' }
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`   🔍 ${endpoint.name}...`);
            const response = await axios.get(`${BASE_URL}${endpoint.path}`, {
                timeout: 15000,
                headers: {
                    'Authorization': `Bearer ${results.authToken}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'ZARA-Diagnostic/1.0'
                }
            });
            
            results.endpoints[endpoint.name] = {
                success: true,
                status: response.status,
                dataCount: Array.isArray(response.data.data) ? response.data.data.length : 'N/A',
                data: response.data
            };
            console.log(`   ✅ ${endpoint.name}: ${response.status} - ${Array.isArray(response.data.data) ? response.data.data.length + ' items' : 'OK'}`);
            
        } catch (error) {
            results.endpoints[endpoint.name] = {
                success: false,
                status: error.response?.status || 'TIMEOUT',
                error: error.message,
                data: error.response?.data
            };
            console.log(`   ❌ ${endpoint.name}: ${error.response?.status || 'TIMEOUT'} - ${error.message}`);
        }
    }
}

async function testValidation(results) {
    if (!results.authToken) {
        console.log('   ❌ Sem token de autenticação - pulando testes de validação');
        return;
    }
    
    const validationTests = [
        {
            name: 'Notifications - Parâmetros Inválidos',
            url: `${BASE_URL}/notifications?page=abc&limit=xyz`,
            expectedStatus: 400
        },
        {
            name: 'Users - ID Inválido',
            url: `${BASE_URL}/users/invalid-id`,
            expectedStatus: 400
        },
        {
            name: 'Machines - Parâmetros Inválidos',
            url: `${BASE_URL}/machines?status=invalid`,
            expectedStatus: 400
        }
    ];
    
    for (const test of validationTests) {
        try {
            console.log(`   🔍 ${test.name}...`);
            const response = await axios.get(test.url, {
                timeout: 15000,
                headers: {
                    'Authorization': `Bearer ${results.authToken}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'ZARA-Diagnostic/1.0'
                }
            });
            
            results.validation[test.name] = {
                success: false,
                status: response.status,
                expected: test.expectedStatus,
                message: `Deveria retornar ${test.expectedStatus}, mas retornou ${response.status}`
            };
            console.log(`   ❌ ${test.name}: ${response.status} (esperado: ${test.expectedStatus})`);
            
        } catch (error) {
            const actualStatus = error.response?.status;
            const isExpected = actualStatus === test.expectedStatus;
            
            results.validation[test.name] = {
                success: isExpected,
                status: actualStatus,
                expected: test.expectedStatus,
                message: isExpected ? 'Validação funcionando corretamente' : error.message
            };
            
            if (isExpected) {
                console.log(`   ✅ ${test.name}: ${actualStatus} (validação OK)`);
            } else {
                console.log(`   ❌ ${test.name}: ${actualStatus || 'TIMEOUT'} - ${error.message}`);
            }
        }
    }
}

async function findConsoleLogs(results) {
    const serverDir = path.join(__dirname);
    const filesToCheck = [];
    
    // Buscar arquivos .js recursivamente
    function findJSFiles(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
                findJSFiles(fullPath);
            } else if (file.endsWith('.js') && !file.includes('test') && !file.includes('diagnose')) {
                filesToCheck.push(fullPath);
            }
        }
    }
    
    findJSFiles(serverDir);
    
    console.log(`   🔍 Verificando ${filesToCheck.length} arquivos...`);
    
    for (const filePath of filesToCheck) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            
            lines.forEach((line, index) => {
                const trimmedLine = line.trim();
                if (trimmedLine.includes('console.log') || 
                    trimmedLine.includes('console.error') || 
                    trimmedLine.includes('console.warn') || 
                    trimmedLine.includes('console.info') ||
                    trimmedLine.includes('console.debug')) {
                    
                    results.consoleLogs.push({
                        file: path.relative(serverDir, filePath),
                        line: index + 1,
                        content: trimmedLine,
                        type: trimmedLine.includes('console.error') ? 'error' : 
                              trimmedLine.includes('console.warn') ? 'warn' : 'log'
                    });
                }
            });
        } catch (error) {
            results.errors.push(`Erro ao ler arquivo ${filePath}: ${error.message}`);
        }
    }
    
    console.log(`   📊 Encontrados ${results.consoleLogs.length} console logs`);
}

function generateReport(results) {
    console.log('\n📋 RELATÓRIO FINAL DO DIAGNÓSTICO');
    console.log('============================================================');
    
    // Conectividade
    console.log('\n🌐 CONECTIVIDADE:');
    Object.entries(results.connectivity).forEach(([name, result]) => {
        const status = result.success ? '✅' : '❌';
        console.log(`   ${status} ${name}: ${result.status}`);
    });
    
    // Autenticação
    console.log('\n🔐 AUTENTICAÇÃO:');
    Object.entries(results.authentication).forEach(([name, result]) => {
        const status = result.success ? '✅' : '❌';
        console.log(`   ${status} ${name}: ${result.status} ${result.hasToken ? '(Token OK)' : ''}`);
    });
    
    // Endpoints
    console.log('\n🔗 ENDPOINTS:');
    Object.entries(results.endpoints).forEach(([name, result]) => {
        const status = result.success ? '✅' : '❌';
        console.log(`   ${status} ${name}: ${result.status} ${result.dataCount !== 'N/A' ? `(${result.dataCount} items)` : ''}`);
    });
    
    // Validação
    console.log('\n✅ VALIDAÇÃO:');
    Object.entries(results.validation).forEach(([name, result]) => {
        const status = result.success ? '✅' : '❌';
        console.log(`   ${status} ${name}: ${result.status} (esperado: ${result.expected})`);
    });
    
    // Console Logs
    console.log('\n📝 CONSOLE LOGS ENCONTRADOS:');
    if (results.consoleLogs.length === 0) {
        console.log('   ✅ Nenhum console log encontrado!');
    } else {
        const groupedLogs = {};
        results.consoleLogs.forEach(log => {
            if (!groupedLogs[log.file]) {
                groupedLogs[log.file] = [];
            }
            groupedLogs[log.file].push(log);
        });
        
        Object.entries(groupedLogs).forEach(([file, logs]) => {
            console.log(`   📁 ${file}: ${logs.length} logs`);
            logs.forEach(log => {
                const icon = log.type === 'error' ? '🔴' : log.type === 'warn' ? '🟡' : '🔵';
                console.log(`      ${icon} Linha ${log.line}: ${log.content}`);
            });
        });
    }
    
    // Resumo
    console.log('\n📊 RESUMO:');
    const connectivityOK = Object.values(results.connectivity).filter(r => r.success).length;
    const authOK = Object.values(results.authentication).filter(r => r.success).length;
    const endpointsOK = Object.values(results.endpoints).filter(r => r.success).length;
    const validationOK = Object.values(results.validation).filter(r => r.success).length;
    
    console.log(`   🌐 Conectividade: ${connectivityOK}/${Object.keys(results.connectivity).length}`);
    console.log(`   🔐 Autenticação: ${authOK}/${Object.keys(results.authentication).length}`);
    console.log(`   🔗 Endpoints: ${endpointsOK}/${Object.keys(results.endpoints).length}`);
    console.log(`   ✅ Validação: ${validationOK}/${Object.keys(results.validation).length}`);
    console.log(`   📝 Console Logs: ${results.consoleLogs.length}`);
    
    // Salvar relatório
    const reportPath = path.join(__dirname, 'diagnostic-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Relatório salvo em: ${reportPath}`);
    
    // Próximos passos
    console.log('\n🚀 PRÓXIMOS PASSOS:');
    if (results.consoleLogs.length > 0) {
        console.log('   1. Remover/comentar console logs encontrados');
        console.log('   2. Substituir por sistema de logging adequado');
    }
    if (Object.values(results.validation).some(r => !r.success)) {
        console.log('   3. Corrigir validações que não estão funcionando');
    }
    if (Object.values(results.endpoints).some(r => !r.success)) {
        console.log('   4. Investigar endpoints com falha');
    }
    
    console.log('\n✅ DIAGNÓSTICO COMPLETO FINALIZADO!');
}

diagnoseCompleteSystem().catch(console.error);