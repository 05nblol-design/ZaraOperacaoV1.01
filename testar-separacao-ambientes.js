#!/usr/bin/env node

/**
 * TESTE DE SEPARAÇÃO DE AMBIENTES
 * Sistema ZARA - Verificação de configurações localhost vs produção
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 TESTE DE SEPARAÇÃO DE AMBIENTES');
console.log('=' .repeat(60));

// Função para ler arquivo .env
function readEnvFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return { exists: false, content: null, vars: {} };
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const vars = {};
    
    content.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#') && line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        vars[key.trim()] = valueParts.join('=').replace(/"/g, '').trim();
      }
    });
    
    return { exists: true, content, vars };
  } catch (error) {
    return { exists: false, error: error.message, vars: {} };
  }
}

// Verificar arquivos de ambiente
const envFiles = {
  local: path.join('frontend', '.env.local'),
  production: path.join('frontend', '.env.production'),
  vercel: path.join('frontend', '.env.vercel') // Deve ter sido removido
};

console.log('\n📁 VERIFICAÇÃO DE ARQUIVOS:');
Object.entries(envFiles).forEach(([env, filePath]) => {
  const result = readEnvFile(filePath);
  if (result.exists) {
    console.log(`✅ ${env.toUpperCase()}: ${filePath} - EXISTE`);
  } else {
    console.log(`❌ ${env.toUpperCase()}: ${filePath} - NÃO EXISTE`);
  }
});

// Analisar configurações
console.log('\n🔍 ANÁLISE DE CONFIGURAÇÕES:');

const localEnv = readEnvFile(envFiles.local);
const prodEnv = readEnvFile(envFiles.production);
const vercelEnv = readEnvFile(envFiles.vercel);

// Verificar ambiente local
if (localEnv.exists) {
  console.log('\n🏠 AMBIENTE LOCAL (.env.local):');
  const apiUrl = localEnv.vars.VITE_API_URL;
  const socketUrl = localEnv.vars.VITE_SOCKET_URL;
  const backendUrl = localEnv.vars.VITE_BACKEND_URL;
  
  console.log(`   🔗 API: ${apiUrl}`);
  console.log(`   📡 Socket: ${socketUrl}`);
  console.log(`   🖥️  Backend: ${backendUrl}`);
  
  // Verificar se são URLs localhost
  const isLocalhost = (url) => url && (url.includes('localhost') || url.includes('127.0.0.1'));
  
  if (isLocalhost(apiUrl) && isLocalhost(socketUrl) && isLocalhost(backendUrl)) {
    console.log('   ✅ Todas as URLs são localhost - CORRETO');
  } else {
    console.log('   ❌ Algumas URLs não são localhost - INCORRETO');
  }
} else {
  console.log('\n❌ AMBIENTE LOCAL: Arquivo não encontrado');
}

// Verificar ambiente produção
if (prodEnv.exists) {
  console.log('\n🌐 AMBIENTE PRODUÇÃO (.env.production):');
  const apiUrl = prodEnv.vars.VITE_API_URL;
  const socketUrl = prodEnv.vars.VITE_SOCKET_URL;
  const backendUrl = prodEnv.vars.VITE_BACKEND_URL;
  
  console.log(`   🔗 API: ${apiUrl}`);
  console.log(`   📡 Socket: ${socketUrl}`);
  console.log(`   🖥️  Backend: ${backendUrl}`);
  
  // Verificar se são URLs de produção
  const isProduction = (url) => url && url.includes('railway.app');
  const isCorrectRailway = (url) => url && url.includes('zara-backend-production-aab3.up.railway.app');
  
  if (isProduction(apiUrl) && isProduction(socketUrl) && isProduction(backendUrl)) {
    console.log('   ✅ Todas as URLs são de produção - CORRETO');
    
    if (isCorrectRailway(apiUrl) && isCorrectRailway(socketUrl) && isCorrectRailway(backendUrl)) {
      console.log('   ✅ URLs Railway corretas - CORRETO');
    } else {
      console.log('   ⚠️  URLs Railway podem estar desatualizadas');
    }
  } else {
    console.log('   ❌ Algumas URLs não são de produção - INCORRETO');
  }
} else {
  console.log('\n❌ AMBIENTE PRODUÇÃO: Arquivo não encontrado');
}

// Verificar se .env.vercel foi removido
if (vercelEnv.exists) {
  console.log('\n⚠️  ARQUIVO .env.vercel AINDA EXISTE:');
  console.log('   ❌ Este arquivo deveria ter sido removido para evitar confusão');
  console.log('   🗑️  Recomendação: Remover arquivo .env.vercel');
} else {
  console.log('\n✅ ARQUIVO .env.vercel REMOVIDO CORRETAMENTE');
}

// Verificar api.js
console.log('\n🔧 VERIFICAÇÃO DO API.JS:');
const apiJsPath = path.join('frontend', 'src', 'services', 'api.js');

if (fs.existsSync(apiJsPath)) {
  const apiJsContent = fs.readFileSync(apiJsPath, 'utf8');
  
  console.log('✅ Arquivo api.js encontrado');
  
  // Verificar se contém detecção de ambiente
  if (apiJsContent.includes('isDevelopment')) {
    console.log('✅ Detecção de ambiente implementada');
  } else {
    console.log('❌ Detecção de ambiente não encontrada');
  }
  
  // Verificar se não tem URLs hardcoded de produção
  if (apiJsContent.includes('zara-backend-production-aab3.up.railway.app')) {
    console.log('⚠️  Ainda contém URLs hardcoded de produção');
  } else {
    console.log('✅ Sem URLs hardcoded de produção');
  }
  
  // Verificar se tem tratamento de erro para produção
  if (apiJsContent.includes('throw new Error')) {
    console.log('✅ Tratamento de erro para configuração ausente');
  } else {
    console.log('❌ Sem tratamento de erro para configuração ausente');
  }
} else {
  console.log('❌ Arquivo api.js não encontrado');
}

// Resumo final
console.log('\n📊 RESUMO DA SEPARAÇÃO:');

const checks = {
  localExists: localEnv.exists,
  prodExists: prodEnv.exists,
  vercelRemoved: !vercelEnv.exists,
  localCorrect: localEnv.exists && localEnv.vars.VITE_API_URL?.includes('localhost'),
  prodCorrect: prodEnv.exists && prodEnv.vars.VITE_API_URL?.includes('railway.app'),
  apiJsUpdated: fs.existsSync(apiJsPath) && fs.readFileSync(apiJsPath, 'utf8').includes('isDevelopment')
};

const passedChecks = Object.values(checks).filter(Boolean).length;
const totalChecks = Object.keys(checks).length;
const percentage = Math.round((passedChecks / totalChecks) * 100);

console.log(`\n🎯 RESULTADO: ${passedChecks}/${totalChecks} verificações passaram (${percentage}%)`);

if (percentage === 100) {
  console.log('\n🎉 SEPARAÇÃO DE AMBIENTES CONCLUÍDA COM SUCESSO!');
  console.log('✅ Desenvolvimento: localhost');
  console.log('✅ Produção: Railway');
  console.log('✅ Sem conflitos entre ambientes');
} else if (percentage >= 80) {
  console.log('\n⚠️  SEPARAÇÃO QUASE COMPLETA - Pequenos ajustes necessários');
} else {
  console.log('\n❌ SEPARAÇÃO INCOMPLETA - Correções necessárias');
}

// Próximos passos
console.log('\n🚀 PRÓXIMOS PASSOS:');
if (percentage === 100) {
  console.log('1. 🧪 Testar desenvolvimento: cd frontend && npm run dev');
  console.log('2. 🏗️  Testar build: cd frontend && npm run build');
  console.log('3. 🌐 Deploy no Vercel com variáveis de .env.production');
  console.log('4. ✅ Verificar funcionamento em ambos os ambientes');
} else {
  console.log('1. 🔧 Corrigir problemas identificados acima');
  console.log('2. 🔄 Executar este teste novamente');
  console.log('3. 🧪 Testar após correções');
}

console.log('\n============================================================');
console.log('🎯 TESTE DE SEPARAÇÃO DE AMBIENTES CONCLUÍDO!');
console.log('============================================================\n');