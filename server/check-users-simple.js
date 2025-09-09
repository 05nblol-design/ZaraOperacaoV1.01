const { PrismaClient } = require('@prisma/client');
const logger = require('utils/logger');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        role: true,
        email: true
      }
    });
    
    logger.info('Usuários cadastrados:', users.length);
    users.forEach(u => {
      logger.info(`- ${u.name} (ID: ${u.id}, Role: ${u.role}, Email: ${u.email})`);
    });
    
  } catch (error) {
    logger.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();