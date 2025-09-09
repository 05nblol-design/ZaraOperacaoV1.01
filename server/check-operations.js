const { PrismaClient } = require('@prisma/client');
const logger = require('utils/logger');
const prisma = new PrismaClient();

async function checkOperations() {
  try {
    logger.info('=== Verificando operações ativas ==='););
    
    // Buscar operação ativa do usuário 2 na máquina 1
    const userOperation = await prisma.machineOperation.findFirst({
      where: {
        machineId: 1,
        userId: 2,
        status: 'ACTIVE'
      }
    });
    
    logger.info('Operação do usuário 2 na máquina 1:', userOperation););
    
    // Buscar todas as operações ativas na máquina 1
    const allOperations = await prisma.machineOperation.findMany({
      where: {
        machineId: 1,
        status: 'ACTIVE'
      },
      include: {
        user: true,
        machine: true
      }
    });
    
    logger.info('Todas operações ativas na máquina 1:', allOperations););
    
    // Verificar se existe alguma operação ativa para qualquer usuário
    const anyActiveOperation = await prisma.machineOperation.findFirst({
      where: {
        machineId: 1,
        status: 'ACTIVE'
      }
    });
    
    logger.info('Existe operação ativa na máquina 1?', !!anyActiveOperation););
    
  } catch (error) {
    logger.error('Erro:', error););
  } finally {
    await prisma.$disconnect();
  }
}

checkOperations();