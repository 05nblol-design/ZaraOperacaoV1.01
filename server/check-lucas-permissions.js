const { PrismaClient } = require('@prisma/client');
const logger = require('utils/logger');
const prisma = new PrismaClient();

async function checkPermissions() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: 'lucas.salviano@hotmail.com' }
    });
    logger.info('Usuário Lucas:', user););
    
    if (user) {
      const permissions = await prisma.machinePermission.findMany({
        where: { userId: user.id },
        include: { machine: true }
      });
      logger.info('Permissões do Lucas:', permissions););
      logger.info('Total de permissões:', permissions.length););
    }
  } catch (error) {
    logger.error('Erro:', error););
  } finally {
    await prisma.$disconnect();
  }
}

checkPermissions();