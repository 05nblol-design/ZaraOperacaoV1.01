const { PrismaClient } = require('@prisma/client');
const logger = require('utils/logger');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany();
    logger.info('Usuários no banco:'););
    users.forEach(u => {
      logger.info(`ID: ${u.id}, Email: ${u.email}, Role: ${u.role}`););
    });
  } catch (error) {
    logger.error('Erro:', error););
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();