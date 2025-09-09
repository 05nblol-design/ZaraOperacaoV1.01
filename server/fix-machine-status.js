const { PrismaClient } = require('@prisma/client');
const logger = require('utils/logger');
const prisma = new PrismaClient();

async function fixMachineStatus() {
  try {
    await prisma.machine.update({
      where: { id: 1 },
      data: { status: 'FUNCIONANDO' }
    });
    
    logger.info('✅ Status da Máquina 01d atualizado para FUNCIONANDO'););
    
    // Verificar o status atualizado
    const machine = await prisma.machine.findUnique({
      where: { id: 1 },
      select: { name: true, status: true }
    });
    
    logger.info(`Status atual: ${machine.name} - ${machine.status}`););
    
  } catch (error) {
    logger.error('Erro:', error););
  } finally {
    await prisma.$disconnect();
  }
}

fixMachineStatus();