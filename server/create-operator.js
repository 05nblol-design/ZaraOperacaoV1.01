const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const logger = require('utils/logger');
const prisma = new PrismaClient();

async function createOperator() {
  try {
    // Verificar se já existe
    const existing = await prisma.user.findUnique({
      where: { email: 'operador@zara.com' }
    });
    
    if (existing) {
      logger.info('Usuário operador já existe');
      return;
    }
    
    // Criar hash da senha
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Criar usuário operador
    const operator = await prisma.user.create({
      data: {
        email: 'operador@zara.com',
        password: hashedPassword,
        name: 'Operador Teste',
        role: 'OPERATOR',
        isActive: true
      }
    });
    
    logger.info('Usuário operador criado:', operator.email);
  } catch (error) {
    logger.error('Erro ao criar operador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createOperator();