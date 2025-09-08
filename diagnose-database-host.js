#!/usr/bin/env node

/**
 * 🔍 Diagnóstico de HOST inválido na DATABASE_URL
 * Detecta problemas comuns com hostname na conexão PostgreSQL
 */

const { URL } = require('url');

// Hostnames inválidos comuns
const INVALID_HOSTS = [
  'host',
  'localhost', 
  'db',
  'database',
  'postgres',
  'postgresql',
  '127.0.0.1',
  '0.0.0.0'
];

// Padrões válidos do Railway
const RAILWAY_HOST_PATTERNS = [
  /^containers-us-west-\d+\.railway\.app$/,
  /^containers-us-east-\d+\.railway\.app$/,
  /^containers-eu-west-\d+\.railway\.app$/,
  /^[a-z0-9-]+\.railway\.app$/
];

function diagnoseHost(databaseUrl) {
  console.log('🔍 Diagnóstico de HOST na DATABASE_URL\n');
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL não encontrada');
    console.log('\n📋 Variáveis de ambiente disponíveis:');
    Object.keys(process.env)
      .filter(key => key.includes('DATABASE') || key.includes('POSTGRES'))
      .forEach(key => {
        const value = process.env[key];
        const masked = value ? value.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@') : 'undefined';
        console.log(`   ${key}: ${masked}`);
      });
    return false;
  }

  try {
    const url = new URL(databaseUrl);
    const host = url.hostname;
    const port = url.port || '5432';
    
    console.log('📊 Análise da URL:');
    console.log(`   Protocol: ${url.protocol}`);
    console.log(`   Host: ${host}`);
    console.log(`   Port: ${port}`);
    console.log(`   Database: ${url.pathname.slice(1)}`);
    console.log(`   Username: ${url.username}`);
    console.log(`   Password: ${url.password ? '***' : 'não definida'}`);
    
    // Verificar host inválido
    if (INVALID_HOSTS.includes(host.toLowerCase())) {
      console.log('\n🚨 PROBLEMA IDENTIFICADO:');
      console.log(`❌ Host inválido: "${host}"`);
      console.log('\n💡 SOLUÇÃO:');
      console.log('1. Acesse Railway Dashboard');
      console.log('2. Vá no serviço PostgreSQL');
      console.log('3. Copie a DATABASE_URL correta');
      console.log('4. Configure no serviço Backend');
      
      console.log('\n✅ Exemplo de host válido do Railway:');
      console.log('   containers-us-west-123.railway.app');
      return false;
    }
    
    // Verificar se é host do Railway
    const isRailwayHost = RAILWAY_HOST_PATTERNS.some(pattern => pattern.test(host));
    
    if (isRailwayHost) {
      console.log('\n✅ Host do Railway detectado');
      console.log(`✅ Formato válido: ${host}`);
    } else {
      console.log('\n⚠️ Host não reconhecido como Railway');
      console.log(`⚠️ Host atual: ${host}`);
      console.log('\n🔍 Verificações:');
      console.log('- Se for Railway, deve terminar com .railway.app');
      console.log('- Se for outro provedor, verifique se está correto');
    }
    
    // Verificar porta
    if (port !== '5432') {
      console.log(`\n⚠️ Porta não padrão: ${port} (padrão: 5432)`);
    }
    
    return true;
    
  } catch (error) {
    console.log('\n❌ Erro ao analisar DATABASE_URL:');
    console.log(`   ${error.message}`);
    console.log('\n🔧 Verifique se a URL está no formato:');
    console.log('   postgresql://usuario:senha@host:porta/database');
    return false;
  }
}

function showRailwayInstructions() {
  console.log('\n📋 INSTRUÇÕES PARA RAILWAY:');
  console.log('\n1. 🔗 Acesse: https://railway.app');
  console.log('2. 📁 Entre no projeto ZaraOperacaoV1.01');
  console.log('3. 🗄️ Clique no serviço PostgreSQL');
  console.log('4. ⚙️ Vá na aba "Variables" ou "Connect"');
  console.log('5. 📋 Copie a DATABASE_URL completa');
  console.log('6. 🔄 Vá no serviço Backend (Node.js)');
  console.log('7. ⚙️ Vá na aba "Variables"');
  console.log('8. ✏️ Edite/Adicione DATABASE_URL');
  console.log('9. 💾 Cole a URL copiada');
  console.log('10. 🚀 Salve (redeploy automático)');
}

function main() {
  console.log('🚀 Diagnóstico de HOST na DATABASE_URL\n');
  
  const databaseUrl = process.env.DATABASE_URL;
  
  const isValid = diagnoseHost(databaseUrl);
  
  if (!isValid) {
    showRailwayInstructions();
  }
  
  console.log('\n🔍 Para testar uma URL específica:');
  console.log('DATABASE_URL="sua_url" node diagnose-database-host.js');
  
  console.log('\n📞 Status:', isValid ? '✅ OK' : '❌ REQUER CORREÇÃO');
}

if (require.main === module) {
  main();
}

module.exports = { diagnoseHost };