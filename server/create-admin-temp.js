const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const logger = require('utils/logger');

const prisma = new PrismaClient();

async function createTempAdmin() {
  try {
    // Verificar se já existe um admin temporário
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'temp.admin@zara.com' }
    });

    if (existingAdmin) {
      logger.info('✅ Admin temporário já existe');
      logger.info('Email: temp.admin@zara.com');
      logger.info('Senha: 123456');
      return;
    }

    // Criar hash da senha
    const hashedPassword = await bcrypt.hash('123456', 12);

    // Criar usuário admin temporário
    const admin = await prisma.user.create({
      data: {
        name: 'Admin Temporário',
        email: 'temp.admin@zara.com',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true
      }
    });

    logger.info('✅ Admin temporário criado com sucesso!');
    logger.info('ID:', admin.id);
    logger.info('Email: temp.admin@zara.com');
    logger.info('Senha: 123456');
    logger.info('Role:', admin.role);

  } catch (error) {
    logger.error('❌ Erro ao criar admin temporário:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTempAdmin();