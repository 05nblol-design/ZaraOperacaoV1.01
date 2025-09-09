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

async function createDemoUser() {
  try {
    logger.info('🔗 Conectando ao banco PostgreSQL...');
    
    // Testar conexão
    await prisma.$connect();
    logger.info('✅ Conexão estabelecida com sucesso!');
    
    // Verificar se usuário demo já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'demo@zara.com' }
    });
    
    if (existingUser) {
      logger.info('⚠️  Usuário demo já existe!');
      logger.info('📧 Email:', existingUser.email);
      logger.info('👤 Nome:', existingUser.name);
      logger.info('🔑 Role:', existingUser.role);
      return;
    }
    
    // Criar hash da senha
    const password = 'demo123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    logger.info('🔐 Criando usuário de demonstração...');
    
    // Criar usuário demo
    const demoUser = await prisma.user.create({
      data: {
        email: 'demo@zara.com',
        password: hashedPassword,
        name: 'Usuário Demo',
        role: 'OPERATOR',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    logger.info('✅ Usuário demo criado com sucesso!');
    logger.info('📧 Email: demo@zara.com');
    logger.info('🔑 Senha: demo123');
    logger.info('👤 Nome:', demoUser.name);
    logger.info('🆔 ID:', demoUser.id);
    logger.info('🔑 Role:', demoUser.role);
    
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
      }
    });
    
    logger.info('\n👥 Usuários cadastrados:');
    allUsers.forEach((user, index) => {
      logger.info(`${index + 1}. ${user.name} (${user.email}) - ${user.role} - ${user.isActive ? 'Ativo' : 'Inativo'}`);
    });
    
    logger.info('\n🎯 CREDENCIAIS DE DEMONSTRAÇÃO:');
    logger.info('📧 Email: demo@zara.com');
    logger.info('🔑 Senha: demo123');
    logger.info('\n✅ Usuário pronto para testes no frontend!');
    
  } catch (error) {
    logger.error('❌ Erro ao criar usuário demo:', error.message);
    
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
createDemoUser()
  .then(() => {
    logger.info('\n🏁 Script finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('💥 Erro fatal:', error);
    process.exit(1);
  });