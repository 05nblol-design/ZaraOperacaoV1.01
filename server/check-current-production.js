const { PrismaClient } = require('@prisma/client');
const logger = require('utils/logger');
const prisma = new PrismaClient();

async function checkCurrentProduction() {
  try {
    logger.info('📊 Verificando dados de produção atuais...'););
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const shiftData = await prisma.shiftData.findMany({
      where: {
        shiftDate: {
          gte: today
        }
      },
      include: {
        machine: true,
        operator: true
      }
    });
    
    logger.info(`\n📈 Dados de produção de hoje (${today.toLocaleDateString()}):`););
    
    if (shiftData.length === 0) {
      logger.info('❌ Nenhum dado de produção encontrado para hoje'););
    } else {
      shiftData.forEach(shift => {
        logger.info(`- ${shift.machine.name}: ${shift.totalProduction} peças (Operador: ${shift.operator.name})`););
        logger.info(`  Turno: ${shift.shiftType} | Atualizado: ${shift.updatedAt.toLocaleString()}`););
      });
    }
    
    // Verificar máquinas funcionando
    const runningMachines = await prisma.machine.findMany({
      where: {
        status: 'FUNCIONANDO'
      }
    });
    
    logger.info(`\n🏭 Máquinas funcionando: ${runningMachines.length}`););
    runningMachines.forEach(machine => {
      logger.info(`- ${machine.name} (Velocidade: ${machine.productionSpeed} peças/min)`););
    });
    
  } catch (error) {
    logger.error('❌ Erro ao verificar produção:', error.message););
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentProduction();