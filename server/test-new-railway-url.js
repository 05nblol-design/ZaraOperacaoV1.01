const { PrismaClient } = require('@prisma/client');

// Nova URL fornecida pelo usuário
const NEW_RAILWAY_URL = 'postgresql://postgres:GNquZiBhCMsFDZbvDTevPkrWFdRyyLQM@interchange.proxy.rlwy.net:17733/railway';

async function testNewRailwayURL() {
  console.log('🔍 Testando nova URL do Railway PostgreSQL...');
  console.log('URL:', NEW_RAILWAY_URL.replace(/:[^:@]*@/, ':****@'));
  
  let prisma;
  
  try {
    // Configurar Prisma com a nova URL
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: NEW_RAILWAY_URL
        }
      }
    });
    
    console.log('\n📡 Testando conexão...');
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Testar query simples
    console.log('\n🔍 Testando query básica...');
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Query executada:', result[0].version);
    
    // Verificar tabelas existentes
    console.log('\n📋 Verificando tabelas existentes...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('Tabelas encontradas:', tables.length);
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Verificar se a tabela users existe
    const usersTable = tables.find(t => t.table_name === 'users');
    if (usersTable) {
      console.log('\n✅ Tabela "users" encontrada!');
      
      // Contar usuários
      const userCount = await prisma.user.count();
      console.log(`📊 Total de usuários: ${userCount}`);
    } else {
      console.log('\n⚠️  Tabela "users" não encontrada - será necessário executar migrações');
    }
    
    console.log('\n🎉 SUCESSO: Nova URL do Railway está funcionando!');
    console.log('\n📝 PRÓXIMOS PASSOS:');
    console.log('1. Atualizar DATABASE_URL no Railway Dashboard');
    console.log('2. Executar migrações do Prisma se necessário');
    console.log('3. Fazer redeploy do backend');
    console.log('4. Testar login no frontend');
    
    return {
      success: true,
      url: NEW_RAILWAY_URL,
      tablesExist: tables.length > 0,
      usersTableExists: !!usersTable,
      userCount: usersTable ? await prisma.user.count() : 0
    };
    
  } catch (error) {
    console.error('\n❌ ERRO ao testar nova URL:');
    console.error('Tipo:', error.constructor.name);
    console.error('Mensagem:', error.message);
    
    if (error.code) {
      console.error('Código:', error.code);
    }
    
    console.log('\n🔧 POSSÍVEIS SOLUÇÕES:');
    console.log('1. Verificar se a URL está correta');
    console.log('2. Verificar se o serviço PostgreSQL está ativo no Railway');
    console.log('3. Verificar credenciais de acesso');
    console.log('4. Verificar firewall/rede');
    
    return {
      success: false,
      error: error.message,
      code: error.code
    };
    
  } finally {
    if (prisma) {
      await prisma.$disconnect();
      console.log('\n🔌 Conexão fechada.');
    }
  }
}

// Executar teste
testNewRailwayURL()
  .then(result => {
    console.log('\n📊 RESULTADO FINAL:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 ERRO CRÍTICO:', error);
    process.exit(1);
  });