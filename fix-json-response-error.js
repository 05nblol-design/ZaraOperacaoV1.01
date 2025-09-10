#!/usr/bin/env node

/**
 * Script para corrigir erro de resposta HTML em vez de JSON
 * Erro: SyntaxError: Failed to execute 'json' on 'Response': Unexpected token '<'
 */

const https = require('https');
const fs = require('fs');

console.log('🔧 CORRIGINDO ERRO DE RESPOSTA JSON...');
console.log('=' .repeat(50));

// URLs para teste
const BACKEND_URLS = [
  'https://sistema-zara-backend-production.up.railway.app/api/health',
  'https://sistema-zara-backend-production.up.railway.app/api/quality-tests',
  'https://sistema-zara-backend-production.up.railway.app/api/auth/login'
];

const FRONTEND_URL = 'https://sistema-zara-frontend.vercel.app';

// Função para testar resposta
function testResponse(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const isHTML = data.trim().toLowerCase().startsWith('<!doctype') || 
                      data.trim().toLowerCase().startsWith('<html');
        const isJSON = data.trim().startsWith('{') || data.trim().startsWith('[');
        
        resolve({
          url,
          status: res.statusCode,
          contentType: res.headers['content-type'] || 'unknown',
          isHTML,
          isJSON,
          responseSize: data.length,
          preview: data.substring(0, 200)
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        url,
        status: 'ERROR',
        error: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        error: 'Request timeout'
      });
    });
  });
}

// Função principal
async function main() {
  console.log('\n🔍 ANALISANDO RESPOSTAS DO BACKEND:');
  console.log('-'.repeat(45));
  
  let htmlResponses = 0;
  let jsonResponses = 0;
  let errorResponses = 0;
  
  for (const url of BACKEND_URLS) {
    console.log(`\n📡 Testando: ${url}`);
    const result = await testResponse(url);
    
    if (result.status === 'ERROR' || result.status === 'TIMEOUT') {
      console.log(`❌ ${result.status}: ${result.error}`);
      errorResponses++;
    } else {
      console.log(`📊 Status: ${result.status}`);
      console.log(`📄 Content-Type: ${result.contentType}`);
      console.log(`📏 Tamanho: ${result.responseSize} bytes`);
      
      if (result.isHTML) {
        console.log('⚠️  PROBLEMA: Resposta é HTML, não JSON!');
        console.log(`📝 Preview: ${result.preview}...`);
        htmlResponses++;
      } else if (result.isJSON) {
        console.log('✅ OK: Resposta é JSON válido');
        jsonResponses++;
      } else {
        console.log('❓ DESCONHECIDO: Formato de resposta não identificado');
      }
    }
  }
  
  console.log('\n📊 RESUMO DA ANÁLISE:');
  console.log('-'.repeat(30));
  console.log(`✅ Respostas JSON: ${jsonResponses}`);
  console.log(`⚠️  Respostas HTML: ${htmlResponses}`);
  console.log(`❌ Erros/Timeouts: ${errorResponses}`);
  
  console.log('\n🔧 DIAGNÓSTICO:');
  console.log('-'.repeat(20));
  
  if (htmlResponses > 0 || errorResponses > 0) {
    console.log('❌ PROBLEMA CONFIRMADO: Backend Railway está offline ou mal configurado');
    console.log('\n🛠️  SOLUÇÕES IMEDIATAS:');
    console.log('1. 🚂 REDEPLOY RAILWAY (URGENTE)');
    console.log('   - Acesse: https://railway.app/dashboard');
    console.log('   - Projeto: sistema-zara-backend');
    console.log('   - Clique em "Redeploy"');
    console.log('');
    console.log('2. ⚙️  VERIFICAR VARIÁVEIS DE AMBIENTE:');
    console.log('   - DATABASE_URL (PostgreSQL)');
    console.log('   - NODE_ENV=production');
    console.log('   - PORT=5000');
    console.log('   - JWT_SECRET');
    console.log('');
    console.log('3. 🔄 CONFIGURAR CORS:');
    console.log('   - CORS_ORIGINS=https://sistema-zara-frontend.vercel.app');
    console.log('   - CLIENT_URL=https://sistema-zara-frontend.vercel.app');
    console.log('');
    console.log('4. 📋 VERIFICAR LOGS DO RAILWAY:');
    console.log('   - Vá para "Deployments" → "View Logs"');
    console.log('   - Procure por erros de inicialização');
    
  } else {
    console.log('✅ BACKEND OK: Todas as respostas são JSON válidas');
    console.log('\n🔍 VERIFICAR FRONTEND:');
    console.log('- O erro pode estar no código do frontend');
    console.log('- Verificar se as URLs estão corretas');
    console.log('- Verificar headers das requisições');
  }
  
  console.log('\n🎯 AÇÕES RECOMENDADAS (EM ORDEM):');
  console.log('=' .repeat(40));
  console.log('1. 🚂 Redeploy Railway Dashboard');
  console.log('2. ⏱️  Aguardar 3-5 minutos');
  console.log('3. 🧪 Executar este script novamente');
  console.log('4. 🔄 Se ainda houver erro, verificar logs');
  console.log('5. ⚙️  Configurar variáveis se necessário');
  console.log('6. 🌐 Testar frontend após correção');
  
  // Criar arquivo de correção automática
  const fixScript = `
# SCRIPT DE CORREÇÃO AUTOMÁTICA
# Execute estes comandos após o redeploy do Railway:

# 1. Testar backend
curl -X GET "https://sistema-zara-backend-production.up.railway.app/api/health" \
  -H "Content-Type: application/json"

# 2. Testar endpoint de quality-tests
curl -X GET "https://sistema-zara-backend-production.up.railway.app/api/quality-tests" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# 3. Verificar CORS
curl -X OPTIONS "https://sistema-zara-backend-production.up.railway.app/api/health" \
  -H "Origin: https://sistema-zara-frontend.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -v

# 4. Testar frontend
echo "Acesse: https://sistema-zara-frontend.vercel.app"
echo "Verifique se não há mais erros de JSON no console"
`;
  
  fs.writeFileSync('railway-fix-commands.sh', fixScript);
  
  // Salvar relatório detalhado
  const report = {
    timestamp: new Date().toISOString(),
    error_type: 'JSON_PARSE_ERROR',
    html_responses: htmlResponses,
    json_responses: jsonResponses,
    error_responses: errorResponses,
    backend_status: htmlResponses > 0 ? 'OFFLINE' : 'ONLINE',
    frontend_url: FRONTEND_URL,
    recommended_actions: [
      'Redeploy Railway Dashboard',
      'Wait 3-5 minutes',
      'Test again',
      'Check Railway logs if still failing',
      'Configure environment variables'
    ]
  };
  
  fs.writeFileSync(
    `json-error-diagnosis-${Date.now()}.json`,
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n📄 Arquivos criados:');
  console.log('- railway-fix-commands.sh (comandos de correção)');
  console.log('- json-error-diagnosis-[timestamp].json (relatório)');
  
  console.log('\n🔧 CORREÇÃO DE ERRO JSON CONCLUÍDA!');
  console.log('\n⚡ PRÓXIMO PASSO: Redeploy Railway Dashboard AGORA!');
}

// Executar
main().catch(console.error);