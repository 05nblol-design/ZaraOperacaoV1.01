const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

// URL correta fornecida pelo usuário
const CORRECT_RAILWAY_URL = 'postgresql://postgres:GNquZiBhCMsFDZbvDTevPkrWFdRyyLQM@interchange.proxy.rlwy.net:17733/railway';

async function migrateWithNewURL() {
  console.log('🚀 Executando migrações com a URL correta do Railway...');
  console.log('URL:', CORRECT_RAILWAY_URL.replace(/:[^:@]*@/, ':****@'));
  
  try {
    // Definir a variável de ambiente temporariamente
    process.env.DATABASE_URL = CORRECT_RAILWAY_URL;
    
    console.log('\n📦 Gerando Prisma Client...');
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: CORRECT_RAILWAY_URL }
    });
    console.log('✅ Prisma Client gerado com sucesso!');
    
    console.log('\n🔄 Executando migrações (db push)...');
    execSync('npx prisma db push --accept-data-loss', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: CORRECT_RAILWAY_URL }
    });
    console.log('✅ Migrações executadas com sucesso!');
    
    // Testar conexão e verificar tabelas
    console.log('\n🔍 Verificando tabelas criadas...');
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
    
    console.log(`📋 Tabelas criadas (${tables.length}):`);
    tables.forEach(table => {
      console.log(`  ✅ ${table.table_name}`);
    });
    
    // Verificar especificamente a tabela users
    const usersTable = tables.find(t => t.table_name === 'users');
    if (usersTable) {
      console.log('\n🎉 Tabela "users" criada com sucesso!');
      
      // Tentar criar um usuário admin de teste
      console.log('\n👤 Criando usuário admin de teste...');
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
        
        console.log('✅ Usuário admin criado:', adminUser.email);
      } catch (userError) {
        console.log('⚠️  Erro ao criar usuário admin (pode já existir):', userError.message);
      }
    }
    
    await prisma.$disconnect();
    
    console.log('\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('\n📝 PRÓXIMOS PASSOS URGENTES:');
    console.log('1. ✅ URL do banco testada e funcionando');
    console.log('2. ✅ Tabelas criadas no PostgreSQL');
    console.log('3. 🔄 ATUALIZAR DATABASE_URL no Railway Dashboard');
    console.log('4. 🔄 Fazer redeploy do backend no Railway');
    console.log('5. 🔄 Testar login no frontend');
    
    console.log('\n🔗 URL para configurar no Railway:');
    console.log(CORRECT_RAILWAY_URL);
    
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
    console.error('\n❌ ERRO durante migração:');
    console.error('Tipo:', error.constructor.name);
    console.error('Mensagem:', error.message);
    
    if (error.stdout) {
      console.error('Stdout:', error.stdout.toString());
    }
    if (error.stderr) {
      console.error('Stderr:', error.stderr.toString());
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
    console.log('\n📊 RESULTADO FINAL:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 ERRO CRÍTICO:', error);
    process.exit(1);
  });