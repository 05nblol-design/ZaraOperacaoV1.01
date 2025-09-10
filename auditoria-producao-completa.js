#!/usr/bin/env node

/**
 * AUDITORIA COMPLETA DE CONFIGURAÇÕES DE PRODUÇÃO
 * Sistema ZARA - Verificação de URLs localhost e configurações incorretas
 */

console.log('🔍 AUDITORIA COMPLETA DE CONFIGURAÇÕES DE PRODUÇÃO');
console.log('=' .repeat(60));

// PROBLEMAS CRÍTICOS IDENTIFICADOS
console.log('\n❌ PROBLEMAS CRÍTICOS ENCONTRADOS:');
console.log('\n1. SOCKET.IO COM LOCALHOST EM PRODUÇÃO:');
console.log('   📁 server/index.js (linha 67-69)');
console.log('   📁 server/api/index.js (linha 63-65)');
console.log('   🚨 Configuração hardcoded: localhost:5173, localhost:5174, 192.168.1.149');
console.log('   ✅ SOLUÇÃO: Usar apenas process.env.CLIENT_URL em produção');

console.log('\n2. CORS DEVELOPMENT EM SECURITY.JS:');
console.log('   📁 server/config/security.js (linhas 15-22)');
console.log('   🚨 URLs localhost hardcoded para desenvolvimento');
console.log('   ✅ SOLUÇÃO: Remover URLs localhost da configuração de produção');

console.log('\n3. URLS INCONSISTENTES NOS ARQUIVOS .ENV:');
console.log('   📁 server/.env.production:');
console.log('      - SERVER_URL: zaraoperacaov101-production.up.railway.app');
console.log('   📁 frontend/.env.production:');
console.log('      - VITE_API_URL: zara-backend-production-aab3.up.railway.app');
console.log('   🚨 URLs diferentes entre frontend e backend!');
console.log('   ✅ SOLUÇÃO: Padronizar URLs em todos os arquivos');

console.log('\n4. CORS_ORIGIN vs CORS_ORIGINS:');
console.log('   📁 server/.env.production usa CORS_ORIGIN');
console.log('   📁 railway-cors-config.env usa CORS_ORIGINS');
console.log('   🚨 Inconsistência na nomenclatura!');
console.log('   ✅ SOLUÇÃO: Padronizar para CORS_ORIGINS');

// CORREÇÕES NECESSÁRIAS
console.log('\n🔧 CORREÇÕES URGENTES NECESSÁRIAS:');
console.log('\n1. CORRIGIR SOCKET.IO (server/index.js e server/api/index.js):');
console.log('   ANTES:');
console.log('   origin: [process.env.CLIENT_URL || \'http://localhost:5173\', \'http://localhost:5173\', ...]');
console.log('   DEPOIS:');
console.log('   origin: process.env.NODE_ENV === \'production\'');
console.log('     ? [process.env.CLIENT_URL]');
console.log('     : [\'http://localhost:5173\', \'http://localhost:5174\']');

console.log('\n2. CORRIGIR SECURITY.JS:');
console.log('   - Remover URLs localhost da configuração de produção');
console.log('   - Usar apenas CORS_ORIGINS em produção');

console.log('\n3. PADRONIZAR URLs:');
console.log('   - Definir URL única do Railway: https://zaraoperacaov101-production.up.railway.app');
console.log('   - Atualizar todos os arquivos .env com a mesma URL');

console.log('\n4. CONFIGURAR RAILWAY DASHBOARD:');
console.log('   CORS_ORIGINS=https://sistema-zara-frontend.vercel.app,https://www.sistema-zara-frontend.vercel.app');
console.log('   CLIENT_URL=https://sistema-zara-frontend.vercel.app');
console.log('   NODE_ENV=production');

// ARQUIVOS QUE PRECISAM SER CORRIGIDOS
console.log('\n📝 ARQUIVOS QUE PRECISAM SER CORRIGIDOS:');
const arquivosParaCorrigir = [
  'server/index.js - Socket.IO CORS',
  'server/api/index.js - Socket.IO CORS',
  'server/config/security.js - CORS development',
  'server/.env.production - URLs inconsistentes',
  'frontend/.env.production - URLs inconsistentes',
  'railway-cors-config.env - Padronização'
];

arquivosParaCorrigir.forEach((arquivo, index) => {
  console.log(`   ${index + 1}. ${arquivo}`);
});

// TESTE DE PRODUÇÃO
console.log('\n🧪 TESTE APÓS CORREÇÕES:');
console.log('curl -X OPTIONS https://zaraoperacaov101-production.up.railway.app/api/auth/login \\');
console.log('  -H "Origin: https://sistema-zara-frontend.vercel.app" \\');
console.log('  -H "Access-Control-Request-Method: POST" \\');
console.log('  -v');

console.log('\n✅ RESULTADO ESPERADO:');
console.log('< HTTP/1.1 200 OK');
console.log('< access-control-allow-origin: https://sistema-zara-frontend.vercel.app');

console.log('\n⏱️  TEMPO ESTIMADO DE CORREÇÃO: 15-20 minutos');
console.log('\n🚀 PRIORIDADE: CRÍTICA - Sistema não funciona em produção!');
console.log('=' .repeat(60));