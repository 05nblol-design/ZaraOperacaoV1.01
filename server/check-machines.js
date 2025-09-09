const { PrismaClient } = require('@prisma/client');
const logger = require('utils/logger');
const prisma = new PrismaClient();

async function checkMachines() {
  try {
    const machines = await prisma.machine.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        productionSpeed: true
      }
    });
    
    logger.info('Máquinas no sistema:');
    machines.forEach(m => {
      logger.info(`- ${m.name} (ID: ${m.id}): ${m.status} - ${m.productionSpeed}pcs/min`);
    });
    
    const operations = await prisma.machineOperation.findMany({
      where: {
        status: 'ACTIVE',
        endTime: null
      },
      include: {
        user: true,
        machine: true
      }
    });
    
    logger.info('\nOperações ativas:');
    operations.forEach(op => {
      const duration = Math.floor((new Date() - new Date(op.startTime)) / (1000 * 60));
      logger.info(`- ${op.machine.name}: ${op.user.name} (${duration} min)`);
    });
    
  } catch (error) {
    logger.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMachines();