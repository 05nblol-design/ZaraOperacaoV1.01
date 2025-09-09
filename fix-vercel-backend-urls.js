#!/usr/bin/env node

/**
 * Script para corrigir URLs do backend no Vercel
 * Problema: Frontend está tentando acessar URL incorreta do backend
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 CORRIGINDO URLS DO BACKEND NO VERCEL');
console.log('='.repeat(50));

// URLs corretas identificadas
const CORRECT_BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';
const INCORRECT_URL_PATTERN = 'https://server-b5u17ivjt-05nblol-designs-projects.vercel.app';

// URLs do frontend identificadas nos logs
const FRONTEND_URLS = [
    'https://sistema-zara-frontend-aci824ddv-05nblol-designs-projects.vercel.app',
    'https://sistema-zara-frontend.vercel.app'
];

console.log('📊 ANÁLISE DO PROBLEMA:');
console.log(`   ❌ URL Incorreta: ${INCORRECT_URL_PATTERN}`);
console.log(`   ✅ URL Correta: ${CORRECT_BACKEND_URL}`);
console.log(`   🌐 Frontend URLs: ${FRONTEND_URLS.join(', ')}`);

// 1. Verificar arquivos de configuração
function checkConfigFiles() {
    console.log('\n🔍 VERIFICANDO ARQUIVOS DE CONFIGURAÇÃO...');
    
    const configFiles = [
        'frontend/.env.vercel',
        'frontend/.env.production',
        'frontend/vercel.json',
        'frontend/vite.config.js'
    ];
    
    configFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            console.log(`   ✅ ${file}: EXISTE`);
            
            const content = fs.readFileSync(filePath, 'utf8');
            if (content.includes(INCORRECT_URL_PATTERN)) {
                console.log(`   ⚠️  ${file}: CONTÉM URL INCORRETA`);
            } else if (content.includes(CORRECT_BACKEND_URL)) {
                console.log(`   ✅ ${file}: URL CORRETA CONFIGURADA`);
            }
        } else {
            console.log(`   ❌ ${file}: NÃO EXISTE`);
        }
    });
}

// 2. Criar configuração correta para Vercel
function createVercelConfig() {
    console.log('\n📝 CRIANDO CONFIGURAÇÃO CORRETA...');
    
    // Arquivo .env.vercel atualizado
    const envVercelContent = `# Variáveis de ambiente para Vercel - CORRIGIDO
# Estas variáveis devem ser configuradas no Vercel Dashboard

# URLs do Backend Railway - CORRETAS
VITE_API_URL=${CORRECT_BACKEND_URL}/api
VITE_SOCKET_URL=${CORRECT_BACKEND_URL}
VITE_BACKEND_URL=${CORRECT_BACKEND_URL}

# Configurações da aplicação
VITE_APP_NAME=Sistema ZARA
VITE_APP_VERSION=1.0.1
VITE_NODE_ENV=production
VITE_ENVIRONMENT=production

# Build settings
VITE_BUILD_SOURCEMAP=false
VITE_BUILD_MINIFY=true

# Security settings
VITE_SECURE_COOKIES=true

# CORS Origin para Railway
VITE_FRONTEND_URL=https://sistema-zara-frontend.vercel.app
`;
    
    fs.writeFileSync('frontend/.env.vercel.fixed', envVercelContent);
    console.log('   ✅ Criado: frontend/.env.vercel.fixed');
    
    // Instruções para Vercel Dashboard
    const vercelInstructions = `# 🚀 INSTRUÇÕES PARA VERCEL DASHBOARD

## Problema Identificado
❌ **URL Incorreta**: ${INCORRECT_URL_PATTERN}
✅ **URL Correta**: ${CORRECT_BACKEND_URL}

## Passos para Corrigir no Vercel:

### 1. Acessar Vercel Dashboard
- URL: https://vercel.com/dashboard
- Projeto: sistema-zara-frontend

### 2. Configurar Environment Variables
Vá em Settings > Environment Variables e configure:

\`\`\`
VITE_API_URL=${CORRECT_BACKEND_URL}/api
VITE_SOCKET_URL=${CORRECT_BACKEND_URL}
VITE_BACKEND_URL=${CORRECT_BACKEND_URL}
VITE_APP_NAME=Sistema ZARA
VITE_APP_VERSION=1.0.1
VITE_NODE_ENV=production
VITE_ENVIRONMENT=production
VITE_BUILD_SOURCEMAP=false
VITE_BUILD_MINIFY=true
VITE_SECURE_COOKIES=true
\`\`\`

### 3. Forçar Redeploy
- Vá em Deployments
- Clique em "Redeploy" no último deployment
- Aguarde 2-3 minutos

### 4. Testar Aplicação
- Acesse: https://sistema-zara-frontend.vercel.app
- Teste login e conectividade

## URLs de Referência
- 🌐 Frontend: https://sistema-zara-frontend.vercel.app
- ⚡ Backend: ${CORRECT_BACKEND_URL}
- 📊 Health Check: ${CORRECT_BACKEND_URL}/api/health
`;
    
    fs.writeFileSync('VERCEL-URL-FIX-INSTRUCTIONS.md', vercelInstructions);
    console.log('   ✅ Criado: VERCEL-URL-FIX-INSTRUCTIONS.md');
}

// 3. Testar conectividade com URLs corretas
function testConnectivity() {
    console.log('\n🧪 TESTANDO CONECTIVIDADE...');
    
    const testScript = `#!/usr/bin/env node

const https = require('https');

const BACKEND_URL = '${CORRECT_BACKEND_URL}';
const FRONTEND_URL = 'https://sistema-zara-frontend.vercel.app';

console.log('🧪 TESTE DE CONECTIVIDADE CORRIGIDA');
console.log('='.repeat(40));

function testEndpoint(url, description) {
    return new Promise((resolve) => {
        const req = https.get(url, {
            headers: {
                'Origin': FRONTEND_URL,
                'User-Agent': 'Vercel-Fix-Test/1.0'
            }
        }, (res) => {
            console.log(\`   \${description}: \${res.statusCode}\`);
            resolve(res.statusCode);
        });
        
        req.on('error', (error) => {
            console.log(\`   \${description}: ERROR - \${error.message}\`);
            resolve(0);
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            console.log(\`   \${description}: TIMEOUT\`);
            resolve(0);
        });
    });
}

async function runTests() {
    console.log('\\n⏳ Testando endpoints...');
    
    await testEndpoint(\`\${BACKEND_URL}/api/health\`, '📊 Health Check');
    await testEndpoint(\`\${BACKEND_URL}/api/auth/login\`, '🔐 Auth Login');
    await testEndpoint(\`\${BACKEND_URL}/api/users\`, '👥 Users API');
    
    console.log('\\n✅ Teste concluído!');
    console.log('\\n📋 Próximos passos:');
    console.log('1. Configure as variáveis no Vercel Dashboard');
    console.log('2. Force um redeploy');
    console.log('3. Teste a aplicação novamente');
}

runTests().catch(console.error);
`;
    
    fs.writeFileSync('test-vercel-connectivity-fix.js', testScript);
    console.log('   ✅ Criado: test-vercel-connectivity-fix.js');
}

// Executar correções
checkConfigFiles();
createVercelConfig();
testConnectivity();

console.log('\n' + '='.repeat(50));
console.log('🎯 CORREÇÃO CONCLUÍDA!');
console.log('\n📋 ARQUIVOS CRIADOS:');
console.log('   📄 frontend/.env.vercel.fixed');
console.log('   📄 VERCEL-URL-FIX-INSTRUCTIONS.md');
console.log('   📄 test-vercel-connectivity-fix.js');

console.log('\n🚀 PRÓXIMOS PASSOS:');
console.log('1. Leia: VERCEL-URL-FIX-INSTRUCTIONS.md');
console.log('2. Configure variáveis no Vercel Dashboard');
console.log('3. Execute: node test-vercel-connectivity-fix.js');
console.log('4. Teste aplicação após redeploy');

console.log('\n🔗 LINKS IMPORTANTES:');
console.log('   🌐 Vercel Dashboard: https://vercel.com/dashboard');
console.log('   🚀 Frontend: https://sistema-zara-frontend.vercel.app');
console.log('   ⚡ Backend: ' + CORRECT_BACKEND_URL);