// Script para verificar URLs corretas do Vercel para configuração CORS
const https = require('https');
const http = require('http');
const logger = require('utils/logger');

logger.info('🔍 VERIFICANDO URLs DO VERCEL PARA CORS'););
logger.info('=' .repeat(50)););

// URLs possíveis do frontend Vercel
const possibleUrls = [
  'https://zara-operacao-v1-01.vercel.app',
  'https://zara-operacao-v1-01-git-main.vercel.app', 
  'https://zara-operacao-v1-01-lojaa.vercel.app',
  'https://zara-versao-atualizada-com-tecnologias.vercel.app',
  'https://zara-versao-atualizada-com-tecnologias-git-main.vercel.app',
  'https://zara-versao-atualizada-com-tecnologias-lojaa.vercel.app'
];

// Função para testar URL
function testUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, (res) => {
      resolve({
        url,
        status: res.statusCode,
        active: res.statusCode < 400
      });
    });
    
    req.on('error', () => {
      resolve({
        url,
        status: 'ERROR',
        active: false
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        active: false
      });
    });
  });
}

async function checkVercelUrls() {
  logger.info('\n📋 TESTANDO URLs DO VERCEL:'););
  logger.info('-'.repeat(40)););
  
  const results = [];
  
  for (const url of possibleUrls) {
    logger.info(`Testando: ${url}`););
    const result = await testUrl(url);
    results.push(result);
    
    if (result.active) {
      logger.info(`✅ ATIVA - Status: ${result.status}`););
    } else {
      logger.info(`❌ INATIVA - Status: ${result.status}`););
    }
  }
  
  logger.info('\n🎯 RESUMO - URLs ATIVAS DO VERCEL:'););
  logger.info('=' .repeat(50)););
  
  const activeUrls = results.filter(r => r.active);
  
  if (activeUrls.length > 0) {
    logger.info('\n✅ URLs FUNCIONAIS ENCONTRADAS:'););
    activeUrls.forEach((result, index) => {
      logger.info(`${index + 1}. ${result.url}`););
    });
    
    logger.info('\n🔧 CONFIGURAÇÃO CORS PARA RAILWAY:'););
    logger.info('-'.repeat(40)););
    
    // Criar string CORS_ORIGIN
    const corsUrls = [
      ...activeUrls.map(r => r.url),
      'http://localhost:3000',
      'http://localhost:5173'
    ];
    
    const corsOrigin = corsUrls.join(',');
    
    logger.info('\n📝 VARIÁVEL CORS_ORIGIN COMPLETA:'););
    logger.info(`CORS_ORIGIN=${corsOrigin}`););
    
    logger.info('\n🚀 PRÓXIMOS PASSOS:'););
    logger.info('1. Acesse o Railway Dashboard'););
    logger.info('2. Vá em Variables'););
    logger.info('3. Atualize CORS_ORIGIN com o valor acima'););
    logger.info('4. Salve as alterações'););
    logger.info('5. Faça redeploy da aplicação'););
    
  } else {
    logger.info('\n❌ NENHUMA URL ATIVA ENCONTRADA'););
    logger.info('\n🔍 POSSÍVEIS CAUSAS:'););
    logger.info('- Frontend não foi deployado no Vercel'););
    logger.info('- URLs mudaram após redeploy'););
    logger.info('- Problemas de conectividade'););
    
    logger.info('\n📋 CONFIGURAÇÃO CORS PADRÃO:'););
    logger.info('CORS_ORIGIN=http://localhost:3000,http://localhost:5173'););
  }
  
  logger.info('\n' + '=' .repeat(50)););
  logger.info('✅ VERIFICAÇÃO CONCLUÍDA'););
}

// Executar verificação
logger.error(checkVercelUrls().catch(console.error););