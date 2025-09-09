// Script para verificar URLs corretas do Vercel para configuração CORS
const https = require('https');
const http = require('http');

console.log('🔍 VERIFICANDO URLs DO VERCEL PARA CORS');
console.log('=' .repeat(50));

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
  console.log('\n📋 TESTANDO URLs DO VERCEL:');
  console.log('-'.repeat(40));
  
  const results = [];
  
  for (const url of possibleUrls) {
    console.log(`Testando: ${url}`);
    const result = await testUrl(url);
    results.push(result);
    
    if (result.active) {
      console.log(`✅ ATIVA - Status: ${result.status}`);
    } else {
      console.log(`❌ INATIVA - Status: ${result.status}`);
    }
  }
  
  console.log('\n🎯 RESUMO - URLs ATIVAS DO VERCEL:');
  console.log('=' .repeat(50));
  
  const activeUrls = results.filter(r => r.active);
  
  if (activeUrls.length > 0) {
    console.log('\n✅ URLs FUNCIONAIS ENCONTRADAS:');
    activeUrls.forEach((result, index) => {
      console.log(`${index + 1}. ${result.url}`);
    });
    
    console.log('\n🔧 CONFIGURAÇÃO CORS PARA RAILWAY:');
    console.log('-'.repeat(40));
    
    // Criar string CORS_ORIGIN
    const corsUrls = [
      ...activeUrls.map(r => r.url),
      'http://localhost:3000',
      'http://localhost:5173'
    ];
    
    const corsOrigin = corsUrls.join(',');
    
    console.log('\n📝 VARIÁVEL CORS_ORIGIN COMPLETA:');
    console.log(`CORS_ORIGIN=${corsOrigin}`);
    
    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('1. Acesse o Railway Dashboard');
    console.log('2. Vá em Variables');
    console.log('3. Atualize CORS_ORIGIN com o valor acima');
    console.log('4. Salve as alterações');
    console.log('5. Faça redeploy da aplicação');
    
  } else {
    console.log('\n❌ NENHUMA URL ATIVA ENCONTRADA');
    console.log('\n🔍 POSSÍVEIS CAUSAS:');
    console.log('- Frontend não foi deployado no Vercel');
    console.log('- URLs mudaram após redeploy');
    console.log('- Problemas de conectividade');
    
    console.log('\n📋 CONFIGURAÇÃO CORS PADRÃO:');
    console.log('CORS_ORIGIN=http://localhost:3000,http://localhost:5173');
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('✅ VERIFICAÇÃO CONCLUÍDA');
}

// Executar verificação
checkVercelUrls().catch(console.error);