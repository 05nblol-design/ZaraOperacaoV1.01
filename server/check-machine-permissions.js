const { PrismaClient } = require('@prisma/client');
const logger = require('utils/logger');
const prisma = new PrismaClient();

async function checkMachinePermissions() {
  try {
    // Verificar permissões do usuário Lucas (ID: 2)
    const permissions = await prisma.machinePermission.findMany({
      where: {
        userId: 2
      },
      include: {
        machine: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });
    
    logger.info('Permissões do usuário Lucas (ID: 2):', permissions.length););
    permissions.forEach(p => {
      logger.info(`- Máquina: ${p.machine.name} (${p.machine.code}) - canView: ${p.canView}, canOperate: ${p.canOperate}`););
    });
    
    // Verificar todas as máquinas disponíveis
    const allMachines = await prisma.machine.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        isActive: true
      }
    });
    
    logger.info('\nTodas as máquinas:', allMachines.length););
    allMachines.forEach(m => {
      logger.info(`- ${m.name} (${m.code}) - Ativa: ${m.isActive}`););
    });
    
  } catch (error) {
    logger.error('Erro:', error););
  } finally {
    await prisma.$disconnect();
  }
}

checkMachinePermissions();