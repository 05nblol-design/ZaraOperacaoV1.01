#!/usr/bin/env node

/**
 * Script para validar e corrigir DATABASE_URL do PostgreSQL
 * Uso: node validate-database-url.js
 */

const url = require('url');

// Função para escapar caracteres especiais na senha
function escapePassword(password) {
  if (!password) return password;
  
  return password
    .replace(/%/g, '%25')  // % deve ser primeiro
    .replace(/@/g, '%40')
    .replace(/\$/g, '%24')
    .replace(/#/g, '%23')
    .replace(/&/g, '%26')
    .replace(/\+/g, '%2B')
    .replace(/ /g, '%20')
    .replace(/!/g, '%21')
    .replace(/\*/g, '%2A')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/;/g, '%3B')
    .replace(/:/g, '%3A')
    .replace(/=/g, '%3D')
    .replace(/\?/g, '%3F');
}

// Função para validar formato da DATABASE_URL
function validateDatabaseUrl(databaseUrl) {
  console.log('🔍 Validando DATABASE_URL...');
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL não encontrada!');
    return false;
  }
  
  console.log('📝 URL fornecida:', databaseUrl.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@'));
  
  try {
    // Tentar fazer parse da URL
    const parsedUrl = new URL(databaseUrl);
    
    // Validações básicas
    const validations = [
      {
        test: parsedUrl.protocol === 'postgresql:',
        message: 'Protocolo deve ser "postgresql:"',
        current: parsedUrl.protocol
      },
      {
        test: parsedUrl.hostname && parsedUrl.hostname.length > 0,
        message: 'Host não pode estar vazio',
        current: parsedUrl.hostname
      },
      {
        test: parsedUrl.port && !isNaN(parseInt(parsedUrl.port)),
        message: 'Porta deve ser um número válido',
        current: parsedUrl.port
      },
      {
        test: parsedUrl.pathname && parsedUrl.pathname.length > 1,
        message: 'Nome do banco não pode estar vazio',
        current: parsedUrl.pathname
      },
      {
        test: parsedUrl.username && parsedUrl.username.length > 0,
        message: 'Usuário não pode estar vazio',
        current: parsedUrl.username
      },
      {
        test: parsedUrl.password && parsedUrl.password.length > 0,
        message: 'Senha não pode estar vazia',
        current: '***'
      }
    ];
    
    let isValid = true;
    
    console.log('\n📊 Resultados da validação:');
    validations.forEach((validation, index) => {
      const status = validation.test ? '✅' : '❌';
      console.log(`${status} ${validation.message}`);
      if (!validation.test) {
        console.log(`   Atual: ${validation.current || 'vazio'}`);
        isValid = false;
      }
    });
    
    if (isValid) {
      console.log('\n✅ DATABASE_URL está válida!');
      console.log('📋 Detalhes:');
      console.log(`   Host: ${parsedUrl.hostname}`);
      console.log(`   Porta: ${parsedUrl.port}`);
      console.log(`   Banco: ${parsedUrl.pathname.substring(1)}`);
      console.log(`   Usuário: ${parsedUrl.username}`);
      
      return true;
    } else {
      console.log('\n❌ DATABASE_URL contém erros!');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro ao fazer parse da URL:', error.message);
    
    // Tentar identificar problemas comuns
    if (error.message.includes('Invalid URL')) {
      console.log('\n🔍 Problemas comuns:');
      
      if (databaseUrl.includes(':"')) {
        console.log('❌ Porta com aspas: remova as aspas da porta');
      }
      
      if (databaseUrl.includes('@:')) {
        console.log('❌ Porta vazia: adicione um número de porta válido');
      }
      
      if (databaseUrl.includes('@') && !databaseUrl.includes(':5432')) {
        console.log('❌ Porta ausente: adicione :5432 após o host');
      }
      
      // Verificar caracteres especiais na senha
      const passwordMatch = databaseUrl.match(/:\/\/[^:]+:([^@]+)@/);
      if (passwordMatch && passwordMatch[1]) {
        const password = passwordMatch[1];
        const specialChars = password.match(/[@$#%&+!*'();:=?]/g);
        if (specialChars) {
          console.log('❌ Caracteres especiais na senha não escapados:', specialChars.join(', '));
          console.log('💡 Senha corrigida:', escapePassword(password));
        }
      }
    }
    
    return false;
  }
}

// Função para gerar URL corrigida
function generateCorrectUrl(host, port, database, username, password) {
  const escapedPassword = escapePassword(password);
  return `postgresql://${username}:${escapedPassword}@${host}:${port}/${database}`;
}

// Função principal
function main() {
  console.log('🚀 Validador de DATABASE_URL para Railway PostgreSQL\n');
  
  // Tentar ler DATABASE_URL do ambiente
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('⚠️ DATABASE_URL não encontrada no ambiente.');
    console.log('\n📋 Exemplo de URL correta para Railway:');
    console.log('postgresql://postgres:senha@containers-us-west-123.railway.app:5432/railway');
    console.log('\n🔧 Para testar uma URL específica:');
    console.log('DATABASE_URL="sua_url_aqui" node validate-database-url.js');
    return;
  }
  
  const isValid = validateDatabaseUrl(databaseUrl);
  
  if (!isValid) {
    console.log('\n🛠️ Sugestões de correção:');
    console.log('1. Verifique se o serviço PostgreSQL está ativo no Railway');
    console.log('2. Copie a DATABASE_URL correta do serviço PostgreSQL');
    console.log('3. Configure a variável no projeto principal');
    console.log('4. Se a senha tem caracteres especiais, use o escape correto');
    
    console.log('\n📖 Documentação:');
    console.log('https://www.prisma.io/docs/reference/database-reference/connection-urls');
  } else {
    console.log('\n🎉 Tudo certo! A DATABASE_URL está válida.');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  validateDatabaseUrl,
  escapePassword,
  generateCorrectUrl
};