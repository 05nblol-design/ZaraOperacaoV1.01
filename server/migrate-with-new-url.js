const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const logger = require('utils/logger');

// URL correta fornecida pelo usuário
const CORRECT_RAILWAY_URL = 'postgresql://postgres:GNquZiBhCMsFDZbvDTevPkrWFdRyyLQM@interchange.proxy.rlwy.net:17733/railway';

async function migrateWithNewURL() {
  logger.info('🚀 Executando migrações com a URL correta do Railway...');
  logger.info('URL:', CORRECT_RAILWAY_URL.replace(/:[^:@]*@/, ':****@'));
  
  try {
    // Definir a variável de ambiente temporariamente
    process.env.DATABASE_URL = CORRECT_RAILWAY_URL;
    
    logger.info('\n📦 Gerando Prisma Client...');
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: CORRECT_RAILWAY_URL }
    });
    logger.info('✅ Prisma Client gerado com sucesso!');
    
    logger.info('\n🔄 Executando migrações (db push)...');
    execSync('npx prisma db push --accept-data-loss', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: CORRECT_RAILWAY_URL }
    });
    logger.info('✅ Migrações executadas com sucesso!');
    
    // Testar conexão e verificar tabelas
    logger.info('\n🔍 Verificando tabelas criadas...');
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: CORRECT_RAILWAY_URL
        }
      }
    });
    
    await prisma.$connect();
    
    // Verificar tabelas
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    logger.info(`📋 Tabelas criadas (${tables.length}):`);
    tables.forEach(table => {
      logger.info(`  ✅ ${table.table_name}`);
    });
    
    // Verificar especificamente a tabela users
    const usersTable = tables.find(t => t.table_name === 'users');
    if (usersTable) {
      logger.info('\n🎉 Tabela "users" criada com sucesso!');
      
      // Tentar criar um usuário admin de teste
      logger.info('\n👤 Criando usuário admin de teste...');
      try {
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        const adminUser = await prisma.user.create({
          data: {
            email: 'admin@zara.com',
            password: hashedPassword,
            name: 'Administrador',
            role: 'ADMIN'
          }
        });
        
        logger.info('✅ Usuário admin criado:', adminUser.email);
      } catch (userError) {
        logger.info('⚠️  Erro ao criar usuário admin (pode já existir):', userError.message);
      }
    }
    
    await prisma.$disconnect();
    
    logger.info('\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    logger.info('\n📝 PRÓXIMOS PASSOS URGENTES:');
    logger.info('1. ✅ URL do banco testada e funcionando');
    logger.info('2. ✅ Tabelas criadas no PostgreSQL');
    logger.info('3. 🔄 ATUALIZAR DATABASE_URL no Railway Dashboard');
    logger.info('4. 🔄 Fazer redeploy do backend no Railway');
    logger.info('5. 🔄 Testar login no frontend');
    
    logger.info('\n🔗 URL para configurar no Railway:');
    logger.info(CORRECT_RAILWAY_URL);
    
    return {
      success: true,
      tablesCreated: tables.length,
      usersTableExists: !!usersTable,
      nextSteps: [
        'Atualizar DATABASE_URL no Railway Dashboard',
        'Fazer redeploy do backend',
        'Testar login no frontend'
      ]
    };
    
  } catch (error) {
    logger.error('\n❌ ERRO durante migração:');
    logger.error('Tipo:', error.constructor.name);
    logger.error('Mensagem:', error.message);
    
    if (error.stdout) {
      logger.error('Stdout:', error.stdout.toString());
    }
    if (error.stderr) {
      logger.error('Stderr:', error.stderr.toString());
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Executar migração
migrateWithNewURL()
  .then(result => {
    logger.info('\n📊 RESULTADO FINAL:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    logger.error('\n💥 ERRO CRÍTICO:', error);
    process.exit(1);
  });