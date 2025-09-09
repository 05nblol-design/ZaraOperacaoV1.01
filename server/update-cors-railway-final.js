const axios = require('axios');
const logger = require('utils/logger');

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
    logger.info('🔧 ATUALIZANDO CONFIGURAÇÃO CORS DO RAILWAY'););
    logger.info('=' .repeat(60)););
    
    logger.info('\n📋 CORS ATUAL (informado):'););
    logger.info(CURRENT_CORS););
    
    logger.info('\n✅ CORS CORRETO (necessário):'););
    logger.info(UPDATED_CORS););
    
    logger.info('\n🔍 ANÁLISE DAS URLs:'););
    logger.info('❌ URLs incorretas no CORS atual:'););
    logger.info('   - https://sistema-zara-frontend.vercel.app'););
    logger.info('   - https://sistema-zara-frontend-2wr5skeq2-05nblol-designs-projects.vercel.app'););
    
    logger.info('\n✅ URLs corretas que devem estar no CORS:'););
    CORRECT_FRONTEND_URLS.forEach(url => {
        logger.info(`   - ${url}`););
    });
    
    logger.info('\n🎯 PROBLEMA IDENTIFICADO:'););
    logger.info('O CORS está configurado com URLs antigas do frontend.'););
    logger.info('As URLs corretas do Vercel são diferentes.'););
    
    logger.info('\n📝 AÇÕES NECESSÁRIAS NO RAILWAY DASHBOARD:'););
    logger.info('1. Acessar: https://railway.app/dashboard'););
    logger.info('2. Abrir projeto: ZaraOperacaoV1.01'););
    logger.info('3. Ir na aba: "Variables" ou "Environment"'););
    logger.info('4. Atualizar variável CORS_ORIGIN com o valor:'););
    logger.info(`   ${UPDATED_CORS}`););
    logger.info('5. Salvar as alterações'););
    logger.info('6. Fazer redeploy da aplicação'););
    
    logger.info('\n⚙️ VARIÁVEIS COMPLETAS PARA O RAILWAY:'););
    logger.info('DATABASE_URL: postgresql://postgres:GNquZiBhCMsFDZbvDTevPkrWFdRyyLQM@interchange.proxy.rlwy.net:17733/railway'););
    logger.info(`CORS_ORIGIN: ${UPDATED_CORS}`););
    logger.info('NODE_ENV: production'););
    logger.info('PORT: 3000'););
    
    logger.info('\n🚀 APÓS ATUALIZAR:'););
    logger.info('1. O frontend Vercel conseguirá se conectar ao backend Railway'););
    logger.info('2. Os erros de CORS serão resolvidos'););
    logger.info('3. O login funcionará corretamente'););
    
    logger.info('\n⏱️ TEMPO ESTIMADO: 2-3 minutos para atualizar e redeploy'););
    
    // Testar conectividade atual
    logger.info('\n🧪 TESTANDO CONECTIVIDADE ATUAL:'););
    try {
        const response = await axios.get('https://zaraoperacaov101-production.up.railway.app/health', { timeout: 5000 });
        logger.info(`✅ Backend Railway: ${response.status}`););
    } catch (error) {
        logger.info(`❌ Backend Railway: ${error.response?.status || 'TIMEOUT'} - ${error.message}`););
        logger.info('   Confirma que redeploy é necessário após atualizar CORS'););
    }
}

// REMOVED: logger.error(updateCorsConfiguration().catch(console.error);); // Console log removido