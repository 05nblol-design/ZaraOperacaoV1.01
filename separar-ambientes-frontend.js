#!/usr/bin/env node

/**
 * SEPARAÇÃO DE AMBIENTES FRONTEND
 * Sistema ZARA - Correção de configurações localhost vs produção
 */

console.log('🔧 SEPARAÇÃO DE AMBIENTES FRONTEND');
console.log('=' .repeat(60));

// PROBLEMAS IDENTIFICADOS
console.log('\n❌ PROBLEMAS ENCONTRADOS:');
console.log('\n1. URLS INCONSISTENTES ENTRE ARQUIVOS:');
console.log('   📁 .env.production: zaraoperacaov101-production.up.railway.app');
console.log('   📁 .env.vercel: zara-backend-production-aab3.up.railway.app');
console.log('   🚨 URLs diferentes causam confusão!');

console.log('\n2. MISTURA DE CONFIGURAÇÕES:');
console.log('   📁 api.js: Detecta automaticamente localhost vs produção');
console.log('   🚨 Mas usa URLs hardcoded como fallback');

console.log('\n3. ARQUIVOS .ENV DUPLICADOS:');
console.log('   📁 .env.production (URLs antigas)');
console.log('   📁 .env.vercel (URLs corretas)');
console.log('   🚨 Confusão sobre qual usar!');

// SOLUÇÃO PROPOSTA
console.log('\n✅ SOLUÇÃO PROPOSTA:');
console.log('\n🎯 AMBIENTE DE DESENVOLVIMENTO (LOCAL):');
console.log('   📍 Hostname: localhost, 127.0.0.1');
console.log('   🔗 API: http://localhost:5000/api');
console.log('   📡 Socket: http://localhost:3001');
console.log('   📁 Arquivo: .env.local (novo)');

console.log('\n🌐 AMBIENTE DE PRODUÇÃO (VERCEL):');
console.log('   📍 Hostname: sistema-zara-frontend.vercel.app');
console.log('   🔗 API: https://zara-backend-production-aab3.up.railway.app/api');
console.log('   📡 Socket: https://zara-backend-production-aab3.up.railway.app');
console.log('   📁 Arquivo: .env.production (atualizado)');

// CONFIGURAÇÕES CORRETAS
console.log('\n📋 CONFIGURAÇÕES CORRETAS:');

const environments = {
  development: {
    name: 'Desenvolvimento Local',
    hostname: ['localhost', '127.0.0.1'],
    api: 'http://localhost:5000/api',
    socket: 'http://localhost:3001',
    backend: 'http://localhost:5000',
    file: '.env.local'
  },
  production: {
    name: 'Produção Vercel',
    hostname: ['sistema-zara-frontend.vercel.app', 'vercel.app'],
    api: 'https://zara-backend-production-aab3.up.railway.app/api',
    socket: 'https://zara-backend-production-aab3.up.railway.app',
    backend: 'https://zara-backend-production-aab3.up.railway.app',
    file: '.env.production'
  }
};

Object.entries(environments).forEach(([env, config]) => {
  console.log(`\n🔧 ${config.name.toUpperCase()}:`);
  console.log(`   📁 Arquivo: ${config.file}`);
  console.log(`   🌐 Hostnames: ${config.hostname.join(', ')}`);
  console.log(`   🔗 API: ${config.api}`);
  console.log(`   📡 Socket: ${config.socket}`);
  console.log(`   🖥️  Backend: ${config.backend}`);
});

// ARQUIVOS A SEREM CRIADOS/ATUALIZADOS
console.log('\n📝 ARQUIVOS A SEREM ATUALIZADOS:');
console.log('\n1. 📁 frontend/.env.local (NOVO):');
console.log('   # Desenvolvimento Local');
console.log('   VITE_API_URL=http://localhost:5000/api');
console.log('   VITE_SOCKET_URL=http://localhost:3001');
console.log('   VITE_BACKEND_URL=http://localhost:5000');
console.log('   VITE_NODE_ENV=development');

console.log('\n2. 📁 frontend/.env.production (ATUALIZADO):');
console.log('   # Produção Vercel');
console.log('   VITE_API_URL=https://zara-backend-production-aab3.up.railway.app/api');
console.log('   VITE_SOCKET_URL=https://zara-backend-production-aab3.up.railway.app');
console.log('   VITE_BACKEND_URL=https://zara-backend-production-aab3.up.railway.app');
console.log('   VITE_NODE_ENV=production');

console.log('\n3. 📁 frontend/src/services/api.js (ATUALIZADO):');
console.log('   // Detecção mais robusta de ambiente');
console.log('   const getApiBaseUrl = () => {');
console.log('     const hostname = window.location.hostname;');
console.log('     const isDevelopment = hostname === "localhost" || hostname === "127.0.0.1";');
console.log('     ');
console.log('     if (isDevelopment) {');
console.log('       return import.meta.env.VITE_API_URL || "http://localhost:5000/api";');
console.log('     } else {');
console.log('       return import.meta.env.VITE_API_URL || "https://zara-backend-production-aab3.up.railway.app/api";');
console.log('     }');
console.log('   };');

// PRÓXIMOS PASSOS
console.log('\n🚀 PRÓXIMOS PASSOS:');
console.log('\n1. 🗑️  Remover arquivo .env.vercel (duplicado)');
console.log('2. 📝 Criar .env.local para desenvolvimento');
console.log('3. ✏️  Atualizar .env.production com URLs corretas');
console.log('4. 🔧 Atualizar api.js para detecção mais robusta');
console.log('5. 🧪 Testar ambos os ambientes');
console.log('6. 🚀 Deploy no Vercel com variáveis corretas');

// COMANDOS DE TESTE
console.log('\n🧪 COMANDOS DE TESTE:');
console.log('\n# Desenvolvimento Local:');
console.log('cd frontend && npm run dev');
console.log('# Acesse: http://localhost:5173');

console.log('\n# Build de Produção:');
console.log('cd frontend && npm run build');
console.log('cd frontend && npm run preview');
console.log('# Acesse: http://localhost:4173');

console.log('\n# Verificar Variáveis:');
console.log('node -e "console.log(process.env)" | grep VITE');

// RESUMO EXECUTIVO
console.log('\n📊 RESUMO EXECUTIVO:');
console.log('\n🎯 OBJETIVO: Separar claramente desenvolvimento de produção');
console.log('🔧 AÇÃO: Criar arquivos .env específicos para cada ambiente');
console.log('✅ RESULTADO: Frontend funcionará corretamente em ambos os ambientes');
console.log('🚀 IMPACTO: Eliminação de erros de configuração e URLs incorretas');

console.log('\n============================================================');
console.log('🎉 PLANO DE SEPARAÇÃO DE AMBIENTES CRIADO!');
console.log('============================================================\n');