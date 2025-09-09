const axios = require('axios');

// URLs atuais do CORS (informadas pelo usuário)
const CURRENT_CORS = 'http://localhost:3000,https://sistema-zara-frontend.vercel.app,https://sistema-zara-frontend-2wr5skeq2-05nblol-designs-projects.vercel.app,http://localhost:5173,http://localhost:5174';

// URLs corretas do frontend Vercel (baseadas nos arquivos de configuração)
const CORRECT_FRONTEND_URLS = [
    'https://zara-operacao-v1-01.vercel.app',
    'https://zara-operacao-v1-01-git-main-lojaas-projects.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174'
];

const UPDATED_CORS = CORRECT_FRONTEND_URLS.join(',');

async function updateCorsConfiguration() {
    console.log('🔧 ATUALIZANDO CONFIGURAÇÃO CORS DO RAILWAY');
    console.log('=' .repeat(60));
    
    console.log('\n📋 CORS ATUAL (informado):');
    console.log(CURRENT_CORS);
    
    console.log('\n✅ CORS CORRETO (necessário):');
    console.log(UPDATED_CORS);
    
    console.log('\n🔍 ANÁLISE DAS URLs:');
    console.log('❌ URLs incorretas no CORS atual:');
    console.log('   - https://sistema-zara-frontend.vercel.app');
    console.log('   - https://sistema-zara-frontend-2wr5skeq2-05nblol-designs-projects.vercel.app');
    
    console.log('\n✅ URLs corretas que devem estar no CORS:');
    CORRECT_FRONTEND_URLS.forEach(url => {
        console.log(`   - ${url}`);
    });
    
    console.log('\n🎯 PROBLEMA IDENTIFICADO:');
    console.log('O CORS está configurado com URLs antigas do frontend.');
    console.log('As URLs corretas do Vercel são diferentes.');
    
    console.log('\n📝 AÇÕES NECESSÁRIAS NO RAILWAY DASHBOARD:');
    console.log('1. Acessar: https://railway.app/dashboard');
    console.log('2. Abrir projeto: ZaraOperacaoV1.01');
    console.log('3. Ir na aba: "Variables" ou "Environment"');
    console.log('4. Atualizar variável CORS_ORIGIN com o valor:');
    console.log(`   ${UPDATED_CORS}`);
    console.log('5. Salvar as alterações');
    console.log('6. Fazer redeploy da aplicação');
    
    console.log('\n⚙️ VARIÁVEIS COMPLETAS PARA O RAILWAY:');
    console.log('DATABASE_URL: postgresql://postgres:GNquZiBhCMsFDZbvDTevPkrWFdRyyLQM@interchange.proxy.rlwy.net:17733/railway');
    console.log(`CORS_ORIGIN: ${UPDATED_CORS}`);
    console.log('NODE_ENV: production');
    console.log('PORT: 3000');
    
    console.log('\n🚀 APÓS ATUALIZAR:');
    console.log('1. O frontend Vercel conseguirá se conectar ao backend Railway');
    console.log('2. Os erros de CORS serão resolvidos');
    console.log('3. O login funcionará corretamente');
    
    console.log('\n⏱️ TEMPO ESTIMADO: 2-3 minutos para atualizar e redeploy');
    
    // Testar conectividade atual
    console.log('\n🧪 TESTANDO CONECTIVIDADE ATUAL:');
    try {
        const response = await axios.get('https://zaraoperacaov101-production.up.railway.app/health', { timeout: 5000 });
        console.log(`✅ Backend Railway: ${response.status}`);
    } catch (error) {
        console.log(`❌ Backend Railway: ${error.response?.status || 'TIMEOUT'} - ${error.message}`);
        console.log('   Confirma que redeploy é necessário após atualizar CORS');
    }
}

updateCorsConfiguration().catch(console.error);