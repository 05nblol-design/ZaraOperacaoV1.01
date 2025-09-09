// Script para executar migrações do Prisma e criar tabelas
const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function runMigrations() {
  console.log('🚀 Iniciando processo de migração do Prisma...');
  
  try {
    // 1. Gerar o cliente Prisma
    console.log('📦 Gerando cliente Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // 2. Executar migrações
    console.log('🔄 Executando migrações...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    // 3. Testar conexão com o banco
    console.log('🔍 Testando conexão com o banco...');
    await prisma.$connect();
    
    // 4. Verificar se as tabelas foram criadas
    console.log('📋 Verificando tabelas criadas...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    console.log('✅ Tabelas encontradas:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // 5. Verificar especificamente a tabela users
    const userCount = await prisma.user.count();
    console.log(`👥 Tabela 'users' criada com sucesso! (${userCount} registros)`);
    
    console.log('🎉 Migrações executadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante as migrações:', error.message);
    
    if (error.message.includes('P2021')) {
      console.log('\n🔧 Tentando criar as tabelas manualmente...');
      try {
        execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
        console.log('✅ Tabelas criadas com db push!');
      } catch (pushError) {
        console.error('❌ Erro no db push:', pushError.message);
      }
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };