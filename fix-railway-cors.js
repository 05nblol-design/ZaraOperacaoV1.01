#!/usr/bin/env node

/**
 * Script para configurar CORS no Railway com URL do frontend Vercel
 * Corrige o problema de conectividade entre Vercel e Railway
 */

const fs = require('fs');
const path = require('path');

// URLs identificadas
const VERCEL_FRONTEND_URL = 'https://sistema-zara-frontend.vercel.app';
const RAILWAY_BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';

console.log('🔧 CONFIGURANDO CORS NO RAILWAY PARA VERCEL');
console.log('=' .repeat(60));

// 1. Verificar configuração atual de CORS
console.log('\n📋 VERIFICANDO CONFIGURAÇÃO ATUAL...');

const securityConfigPath = path.join(__dirname, 'server', 'config', 'security.js');
if (fs.existsSync(securityConfigPath)) {
    console.log('✅ Arquivo security.js encontrado');
    const content = fs.readFileSync(securityConfigPath, 'utf8');
    
    if (content.includes('CORS_ORIGINS') || content.includes('CORS_ORIGIN')) {
        console.log('✅ Configuração CORS encontrada no código');
    } else {
        console.log('⚠️  Configuração CORS não encontrada');
    }
} else {
    console.log('❌ Arquivo security.js não encontrado');
}

// 2. Criar arquivo de configuração para Railway
console.log('\n🚂 CRIANDO CONFIGURAÇÃO PARA RAILWAY...');

const railwayEnvConfig = `# Configuração de CORS para Railway
# Adicione estas variáveis no Railway Dashboard

# CORS - URLs permitidas (CRÍTICO!)
CORS_ORIGINS=${VERCEL_FRONTEND_URL}

# Alternativa com múltiplas URLs
# CORS_ORIGINS=${VERCEL_FRONTEND_URL},https://sistema-zara-frontend-*.vercel.app

# Para desenvolvimento/teste (temporário)
# CORS_ORIGINS=*

# Outras variáveis importantes
NODE_ENV=production
PORT=5000

# Frontend URL para referência
FRONTEND_URL=${VERCEL_FRONTEND_URL}
CLIENT_URL=${VERCEL_FRONTEND_URL}

# Backend URL para referência
BACKEND_URL=${RAILWAY_BACKEND_URL}
API_URL=${RAILWAY_BACKEND_URL}/api
`;

fs.writeFileSync('railway-cors-config.env', railwayEnvConfig);
console.log('✅ Arquivo railway-cors-config.env criado');

// 3. Criar script de teste de CORS
console.log('\n🧪 CRIANDO SCRIPT DE TESTE...');

const testCorsScript = `#!/usr/bin/env node

/**
 * Teste de CORS entre Vercel e Railway
 */

const https = require('https');
const http = require('http');

const VERCEL_URL = '${VERCEL_FRONTEND_URL}';
const RAILWAY_URL = '${RAILWAY_BACKEND_URL}';

console.log('🧪 TESTANDO CORS VERCEL ↔ RAILWAY');
console.log('=' .repeat(50));

// Função para fazer requisição HTTP
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        
        const req = protocol.request(url, {
            method: 'GET',
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
        const response = await makeRequest(\`\${RAILWAY_URL}/api/health\`);
        console.log(\`   📊 Status: \${response.status}\`);
        
        // Verificar headers CORS
        const corsHeaders = {
            'access-control-allow-origin': response.headers['access-control-allow-origin'],
            'access-control-allow-credentials': response.headers['access-control-allow-credentials'],
            'access-control-allow-methods': response.headers['access-control-allow-methods']
        };
        
        console.log('   🔒 Headers CORS:');
        Object.entries(corsHeaders).forEach(([key, value]) => {
            if (value) {
                console.log(\`      ✅ \${key}: \${value}\`);
            } else {
                console.log(\`      ❌ \${key}: NÃO CONFIGURADO\`);
            }
        });
        
        // Verificar se Vercel está permitido
        const allowedOrigin = response.headers['access-control-allow-origin'];
        if (allowedOrigin === VERCEL_URL || allowedOrigin === '*') {
            console.log('   ✅ CORS: Vercel PERMITIDO');
        } else {
            console.log('   ❌ CORS: Vercel NÃO PERMITIDO');
            console.log(\`      Expected: \${VERCEL_URL}\`);
            console.log(\`      Received: \${allowedOrigin || 'undefined'}\`);
        }
        
    } catch (error) {
        console.log(\`   ❌ Erro: \${error.message}\`);
    }
}

// Teste 2: Preflight OPTIONS
async function testPreflight() {
    console.log('\n⏳ Testando Preflight OPTIONS...');
    try {
        const response = await makeRequest(\`\${RAILWAY_URL}/api/health\`, {
            method: 'OPTIONS',
            headers: {
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'Content-Type,Authorization'
            }
        });
        
        console.log(\`   📊 Status: \${response.status}\`);
        
        if (response.status === 200 || response.status === 204) {
            console.log('   ✅ Preflight: SUCESSO');
        } else {
            console.log('   ❌ Preflight: FALHOU');
        }
        
    } catch (error) {
        console.log(\`   ❌ Erro: \${error.message}\`);
    }
}

// Executar testes
async function runTests() {
    await testHealthWithOrigin();
    await testPreflight();
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎯 DIAGNÓSTICO CORS CONCLUÍDO!');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Configure CORS_ORIGINS no Railway Dashboard');
    console.log('2. Aguarde redeploy automático (2-3 minutos)');
    console.log('3. Execute este teste novamente');
    console.log('4. Teste a aplicação completa');
    
    console.log('\n🔗 LINKS:');
    console.log(\`   🚂 Railway: https://railway.app/dashboard\`);
    console.log(\`   🌐 Frontend: \${VERCEL_URL}\`);
    console.log(\`   ⚡ Backend: \${RAILWAY_URL}\`);
}

runTests().catch(console.error);
`;

fs.writeFileSync('test-cors-vercel-railway.js', testCorsScript);
console.log('✅ Script test-cors-vercel-railway.js criado');

// 4. Instruções finais
console.log('\n' + '=' .repeat(60));
console.log('🎯 CONFIGURAÇÃO CORS PREPARADA!');
console.log('=' .repeat(60));

console.log('\n📋 PRÓXIMOS PASSOS OBRIGATÓRIOS:');
console.log('\n1. 🚂 ACESSE O RAILWAY DASHBOARD:');
console.log('   → https://railway.app/dashboard');
console.log('   → Selecione seu projeto backend');
console.log('   → Vá em "Variables"');

console.log('\n2. ⚙️  ADICIONE/ATUALIZE VARIÁVEL:');
console.log('   Nome: CORS_ORIGINS');
console.log(`   Valor: ${VERCEL_FRONTEND_URL}`);
console.log('   (Copie exatamente como mostrado acima)');

console.log('\n3. 🔄 AGUARDE REDEPLOY:');
console.log('   → Railway fará redeploy automático');
console.log('   → Aguarde 2-3 minutos');
console.log('   → Verifique logs em "Deployments"');

console.log('\n4. 🧪 TESTE A CORREÇÃO:');
console.log('   → node test-cors-vercel-railway.js');

console.log('\n⚠️  IMPORTANTE:');
console.log('   • Use a URL EXATA do Vercel');
console.log('   • Não adicione barra no final');
console.log('   • Verifique se é https://');
console.log('   • Aguarde o redeploy completar');

console.log('\n🔗 ARQUIVOS CRIADOS:');
console.log('   📄 railway-cors-config.env - Configuração para Railway');
console.log('   🧪 test-cors-vercel-railway.js - Teste de CORS');

console.log('\n✅ CONFIGURAÇÃO PRONTA! Siga os passos acima.');