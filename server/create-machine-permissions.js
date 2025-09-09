const { PrismaClient } = require('@prisma/client');
const logger = require('utils/logger');
const prisma = new PrismaClient();

async function createMachinePermissions() {
  try {
    // Buscar todas as máquinas
    const machines = await prisma.machine.findMany();
    
    // Criar permissões para o usuário Lucas (ID: 2) para todas as máquinas
    for (const machine of machines) {
      // Verificar se já existe permissão
      const existingPermission = await prisma.machinePermission.findUnique({
        where: {
          userId_machineId: {
            userId: 2,
            machineId: machine.id
          }
        }
      });
      
      if (!existingPermission) {
        await prisma.machinePermission.create({
          data: {
            userId: 2,
            machineId: machine.id,
            canView: true,
            canOperate: true
          }
        });
        logger.info(`Permissão criada para máquina ${machine.name} (${machine.code})`););
      } else {
        logger.info(`Permissão já existe para máquina ${machine.name} (${machine.code})`););
      }
    }
    
    logger.info('\nPermissões criadas com sucesso!'););
    
  } catch (error) {
    logger.error('Erro:', error););
  } finally {
    await prisma.$disconnect();
  }
}

createMachinePermissions();