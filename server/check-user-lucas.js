const { PrismaClient } = require('@prisma/client');
const logger = require('utils/logger');
const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'lucas.salviano@hotmail.com' },
      include: {
        machinePermissions: {
          include: {
            machine: true
          }
        }
      }
    });
    
    logger.info('User found:', JSON.stringify(user, null, 2));
    
    if (user) {
      logger.info('\nUser role:', user.role);
      logger.info('Machine permissions count:', user.machinePermissions.length);
    } else {
      logger.info('User not found!');
    }
  } catch (error) {
    logger.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();