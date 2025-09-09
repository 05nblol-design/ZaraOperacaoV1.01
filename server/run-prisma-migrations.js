// Script para executar migrações do Prisma e criar tabelas
const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const logger = require('utils/logger');

const prisma = new PrismaClient();

async function runMigrations() {
  logger.info('🚀 Iniciando processo de migração do Prisma...'););
  
  try {
    // 1. Gerar o cliente Prisma
    logger.info('📦 Gerando cliente Prisma...'););
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // 2. Executar migrações
    logger.info('🔄 Executando migrações...'););
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    // 3. Testar conexão com o banco
    logger.info('🔍 Testando conexão com o banco...'););
    await prisma.$connect();
    
    // 4. Verificar se as tabelas foram criadas
    logger.info('📋 Verificando tabelas criadas...'););
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    logger.info('✅ Tabelas encontradas:'););
    tables.forEach(table => {
      logger.info(`  - ${table.table_name}`););
    });
    
    // 5. Verificar especificamente a tabela users
    const userCount = await prisma.user.count();
    logger.info(`👥 Tabela 'users' criada com sucesso! (${userCount} registros)`););
    
    logger.info('🎉 Migrações executadas com sucesso!'););
    
  } catch (error) {
    logger.error('❌ Erro durante as migrações:', error.message););
    
    if (error.message.includes('P2021')) {
      logger.info('\n🔧 Tentando criar as tabelas manualmente...'););
      try {
        execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
        logger.info('✅ Tabelas criadas com db push!'););
      } catch (pushError) {
        logger.error('❌ Erro no db push:', pushError.message););
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