const { PrismaClient } = require('@prisma/client');
const logger = require('utils/logger');
const prisma = new PrismaClient();

async function checkMachine2() {
  try {
    logger.info('🔍 Verificando Máquina 02...'););
    
    // Verificar operação ativa na Máquina 02
    const activeOp = await prisma.machineOperation.findFirst({
      where: {
        machineId: 2,
        status: 'ACTIVE'
      },
      include: {
        user: true,
        machine: true
      }
    });
    
    logger.info('\n📊 Operação ativa na Máquina 02:'););
    if (activeOp) {
      const duration = Math.floor((new Date() - new Date(activeOp.startTime)) / (1000 * 60));
      logger.info(`   ID: ${activeOp.id}`););
      logger.info(`   Usuário: ${activeOp.user.name} (${activeOp.user.email})`););
      logger.info(`   Início: ${activeOp.startTime}`););
      logger.info(`   Duração: ${duration} minutos`););
      logger.info(`   Status: ${activeOp.status}`););
    } else {
      logger.info('   ❌ Nenhuma operação ativa encontrada'););
    }
    
    // Verificar status da máquina
    const machine = await prisma.machine.findUnique({
      where: { id: 2 }
    });
    
    logger.info('\n🏭 Status da Máquina 02:'););
    if (machine) {
      logger.info(`   ID: ${machine.id}`););
      logger.info(`   Nome: ${machine.name}`););
      logger.info(`   Status: ${machine.status}`););
      logger.info(`   Velocidade: ${machine.productionSpeed} pcs/min`););
      logger.info(`   Ativa: ${machine.isActive}`););
    } else {
      logger.info('   ❌ Máquina não encontrada'););
    }
    
  } catch (error) {
    logger.error('❌ Erro:', error););
  } finally {
    await prisma.$disconnect();
  }
}

checkMachine2();