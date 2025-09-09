// Script para migrar banco PostgreSQL do Railway
const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

// URL correta do Railway PostgreSQL
const RAILWAY_DATABASE_URL = 'postgresql://postgres:bBBAa*A-4EE*4EcbGEGCfCBdGgBGEGbE@viaduct.proxy.rlwy.net:18006/railway';

async function migrateRailwayDatabase() {
  console.log('🚀 Migrando banco PostgreSQL do Railway...');
  console.log('🔗 URL:', RAILWAY_DATABASE_URL.replace(/:[^:]*@/, ':****@'));
  
  // Configurar variável de ambiente temporariamente
  process.env.DATABASE_URL = RAILWAY_DATABASE_URL;
  
  try {
    // 1. Gerar cliente Prisma
    console.log('📦 Gerando cliente Prisma...');
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: RAILWAY_DATABASE_URL }
    });
    
    // 2. Fazer push do schema (cria tabelas se não existem)
    console.log('🔄 Criando tabelas com db push...');
    execSync('npx prisma db push --accept-data-loss', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: RAILWAY_DATABASE_URL }
    });
    
    // 3. Testar conexão
    console.log('🔍 Testando conexão...');
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: RAILWAY_DATABASE_URL
        }
      }
    });
    
    await prisma.$connect();
    
    // 4. Verificar tabelas criadas
    console.log('📋 Verificando tabelas...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    console.log('✅ Tabelas criadas:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // 5. Verificar tabela users especificamente
    try {
      const userCount = await prisma.user.count();
      console.log(`👥 Tabela 'users': ${userCount} registros`);
    } catch (error) {
      console.log('⚠️ Tabela users ainda não acessível:', error.message);
    }
    
    // 6. Criar usuário admin se não existir
    console.log('👤 Verificando usuário admin...');
    try {
      const adminExists = await prisma.user.findFirst({
        where: { email: 'admin@zara.com' }
      });
      
      if (!adminExists) {
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await prisma.user.create({
          data: {
            email: 'admin@zara.com',
            password: hashedPassword,
            name: 'Administrador',
            role: 'ADMIN',
            badgeNumber: 'ADM001'
          }
        });
        console.log('✅ Usuário admin criado!');
      } else {
        console.log('✅ Usuário admin já existe!');
      }
    } catch (error) {
      console.log('⚠️ Erro ao criar admin:', error.message);
    }
    
    await prisma.$disconnect();
    console.log('🎉 Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    
    if (error.message.includes('P1001')) {
      console.log('\n🔧 Problema de conexão com o banco.');
      console.log('📋 Verifique se:');
      console.log('  1. O serviço PostgreSQL está ativo no Railway');
      console.log('  2. A URL do banco está correta');
      console.log('  3. As credenciais estão válidas');
    }
    
    process.exit(1);
  }
}

// Executar
if (require.main === module) {
  migrateRailwayDatabase();
}

module.exports = { migrateRailwayDatabase };