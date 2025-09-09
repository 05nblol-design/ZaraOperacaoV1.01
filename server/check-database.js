const { PrismaClient } = require('@prisma/client');
const logger = require('utils/logger');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    logger.info('🔍 Verificando dados no banco de dados...'););
    
    // Verificar máquinas
    const machineCount = await prisma.machine.count();
    logger.info(`📱 Máquinas cadastradas: ${machineCount}`););
    
    if (machineCount > 0) {
      const machines = await prisma.machine.findMany({
        select: { id: true, name: true, status: true }
      });
      logger.info('Máquinas:', machines););
    }
    
    // Verificar testes de qualidade
    const testCount = await prisma.qualityTest.count();
    logger.info(`🧪 Testes de qualidade: ${testCount}`););
    
    if (testCount > 0) {
      const recentTests = await prisma.qualityTest.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          approved: true,
          createdAt: true,
          machine: { select: { name: true } }
        }
      });
      logger.info('Testes recentes:', recentTests););
    }
    
    // Verificar operações de máquina
    const operationCount = await prisma.machineOperation.count();
    logger.info(`⚙️ Operações de máquina: ${operationCount}`););
    
    // Verificar usuários
    const userCount = await prisma.user.count();
    logger.info(`👥 Usuários cadastrados: ${userCount}`););
    
    // Verificar notificações
    const notificationCount = await prisma.notification.count();
    logger.info(`🔔 Notificações: ${notificationCount}`););
    
  } catch (error) {
    logger.error('❌ Erro ao verificar banco de dados:', error););
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();