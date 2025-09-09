const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const logger = require('utils/logger');

// URL correta do PostgreSQL no Railway
const DATABASE_URL = 'postgresql://postgres:GNquZiBhCMsFDZbvDTevPkrWFdRyyLQM@interchange.proxy.rlwy.net:17733/railway';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

async function createAdminUser() {
  try {
    logger.info('🔗 Conectando ao banco PostgreSQL...');
    
    // Testar conexão
    await prisma.$connect();
    logger.info('✅ Conexão estabelecida com sucesso!');
    
    // Verificar se usuário admin já existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@zara.com' }
    });
    
    if (existingAdmin) {
      logger.info('⚠️  Usuário admin já existe!');
      logger.info('📧 Email:', existingAdmin.email);
      logger.info('👤 Nome:', existingAdmin.name);
      logger.info('🔑 Role:', existingAdmin.role);
      return;
    }
    
    // Criar hash da senha
    const password = 'admin123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    logger.info('🔐 Criando usuário administrador...');
    
    // Criar usuário admin
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@zara.com',
        password: hashedPassword,
        name: 'Administrador',
        role: 'ADMIN',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    logger.info('✅ Usuário administrador criado com sucesso!');
    logger.info('📧 Email: admin@zara.com');
    logger.info('🔑 Senha: admin123');
    logger.info('👤 Nome:', adminUser.name);
    logger.info('🆔 ID:', adminUser.id);
    logger.info('🔑 Role:', adminUser.role);
    
    // Verificar total de usuários
    const totalUsers = await prisma.user.count();
    logger.info(`\n📊 Total de usuários no banco: ${totalUsers}`);
    
    // Listar todos os usuários
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    logger.info('\n👥 Todos os usuários cadastrados:');
    allUsers.forEach((user, index) => {
      const roleIcon = user.role === 'ADMIN' ? '👑' : '👤';
      logger.info(`${index + 1}. ${roleIcon} ${user.name} (${user.email}) - ${user.role} - ${user.isActive ? 'Ativo' : 'Inativo'}`);
    });
    
    logger.info('\n🎯 CREDENCIAIS DISPONÍVEIS PARA TESTE:');
    logger.info('\n👑 ADMINISTRADOR:');
    logger.info('📧 Email: admin@zara.com');
    logger.info('🔑 Senha: admin123');
    logger.info('\n👤 OPERADOR:');
    logger.info('📧 Email: demo@zara.com');
    logger.info('🔑 Senha: demo123');
    logger.info('\n✅ Usuários prontos para testes no frontend!');
    
  } catch (error) {
    logger.error('❌ Erro ao criar usuário admin:', error.message);
    
    if (error.code === 'P2002') {
      logger.info('⚠️  Usuário com este email já existe!');
    } else if (error.code === 'P2025') {
      logger.info('⚠️  Tabela users não encontrada. Execute as migrações primeiro.');
    } else {
      logger.error('Detalhes do erro:', error);
    }
  } finally {
    await prisma.$disconnect();
    logger.info('🔌 Conexão fechada.');
  }
}

// Executar
createAdminUser()
  .then(() => {
    logger.info('\n🏁 Script finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('💥 Erro fatal:', error);
    process.exit(1);
  });