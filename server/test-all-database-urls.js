// Script para testar todas as URLs de banco PostgreSQL encontradas
const { PrismaClient } = require('@prisma/client');

// URLs encontradas nos arquivos de configuração
const DATABASE_URLS = [
  'postgresql://postgres:bBBAa*A-4EE*4EcbGEGCfCBdGgBGEGbE@viaduct.proxy.rlwy.net:18006/railway',
  'postgresql://postgres:RgrXNUzOdLMvOLyEkrDEjcevlHoHqUqV@zara-postgres.railway.internal:5432/railway',
  'postgresql://postgres:GNquZiBhCMsFDZbvDTevPkrWFdRyyLQM@postgres.railway.internal:5432/railway'
];

async function testDatabaseUrl(url, index) {
  console.log(`\n🔍 Testando URL ${index + 1}:`);
  console.log(`📍 ${url.replace(/:[^:]*@/, ':****@')}`);
  
  const prisma = new PrismaClient({
    datasources: {
      db: { url }
    },
    log: ['error']
  });
  
  try {
    // Teste de conexão
    console.log('⏳ Conectando...');
    await prisma.$connect();
    console.log('✅ Conexão estabelecida!');
    
    // Teste de query simples
    console.log('⏳ Testando query...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query executada:', result);
    
    // Verificar se tabelas existem
    console.log('⏳ Verificando tabelas...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    if (tables.length > 0) {
      console.log('📋 Tabelas encontradas:');
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    } else {
      console.log('⚠️ Nenhuma tabela encontrada - banco vazio');
    }
    
    // Tentar acessar tabela users
    try {
      const userCount = await prisma.user.count();
      console.log(`👥 Tabela 'users': ${userCount} registros`);
    } catch (userError) {
      console.log('⚠️ Tabela users não existe ou não acessível');
    }
    
    console.log('🎉 URL FUNCIONAL!');
    return { url, working: true, tables: tables.length };
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
    
    if (error.message.includes('P1001')) {
      console.log('🔌 Problema de conexão - servidor não alcançável');
    } else if (error.message.includes('P1000')) {
      console.log('🔐 Problema de autenticação - credenciais inválidas');
    } else if (error.message.includes('P2021')) {
      console.log('📋 Tabelas não existem - banco conectado mas vazio');
    }
    
    return { url, working: false, error: error.message };
    
  } finally {
    await prisma.$disconnect();
  }
}

async function testAllUrls() {
  console.log('🚀 Testando todas as URLs de banco PostgreSQL...');
  console.log(`📊 Total de URLs: ${DATABASE_URLS.length}`);
  
  const results = [];
  
  for (let i = 0; i < DATABASE_URLS.length; i++) {
    const result = await testDatabaseUrl(DATABASE_URLS[i], i);
    results.push(result);
  }
  
  console.log('\n📋 RESUMO DOS TESTES:');
  console.log('=' .repeat(50));
  
  const workingUrls = results.filter(r => r.working);
  const failedUrls = results.filter(r => !r.working);
  
  if (workingUrls.length > 0) {
    console.log('\n✅ URLs FUNCIONAIS:');
    workingUrls.forEach((result, index) => {
      console.log(`${index + 1}. ${result.url.replace(/:[^:]*@/, ':****@')}`);
      console.log(`   Tabelas: ${result.tables || 0}`);
    });
    
    console.log('\n🎯 RECOMENDAÇÃO:');
    const bestUrl = workingUrls[0];
    console.log(`Use esta URL no Railway:`);
    console.log(`DATABASE_URL=${bestUrl.url}`);
    
  } else {
    console.log('\n❌ NENHUMA URL FUNCIONAL ENCONTRADA');
    console.log('\n🔧 POSSÍVEIS SOLUÇÕES:');
    console.log('1. Verificar se o serviço PostgreSQL está ativo no Railway');
    console.log('2. Obter a URL correta do Railway Dashboard');
    console.log('3. Verificar se as credenciais estão válidas');
  }
  
  if (failedUrls.length > 0) {
    console.log('\n❌ URLs COM FALHA:');
    failedUrls.forEach((result, index) => {
      console.log(`${index + 1}. ${result.url.replace(/:[^:]*@/, ':****@')}`);
      console.log(`   Erro: ${result.error}`);
    });
  }
}

// Executar
if (require.main === module) {
  testAllUrls().catch(console.error);
}

module.exports = { testAllUrls };