const { PrismaClient } = require('@prisma/client');
const shiftService = require('./services/shiftService');
const logger = require('utils/logger');

const prisma = new PrismaClient();

async function fixProductionReset() {
  try {
    logger.info('🔧 Iniciando correção do reset de produção...');
    
    // 1. Verificar configuração atual de turnos
    logger.info('📋 Configuração atual de turnos:');
    logger.info('Backend - Manhã: 7h-19h, Noite: 19h-7h');
    logger.info('Frontend - Manhã: 6h-14h, Tarde: 14h-22h, Noite: 22h-6h');
    
    // 2. Verificar turnos ativos
    const activeShifts = await prisma.shiftData.findMany({
      where: {
        isActive: true,
        isArchived: false
      },
      include: {
        machine: true,
        operator: true
      }
    });
    
    logger.info(`\n🔍 Encontrados ${activeShifts.length} turnos ativos:`);
    activeShifts.forEach(shift => {
      logger.info(`- Turno ${shift.id}: Máquina ${shift.machine.name}, Operador ${shift.operator.name}`);
      logger.info(`  Tipo: ${shift.shiftType}, Início: ${shift.startTime}, Fim: ${shift.endTime}`);
      logger.info(`  Produção: ${shift.totalProduction}, Ativo: ${shift.isActive}`);
    });
    
    // 3. Verificar horário atual e determinar ação
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    logger.info(`\n⏰ Horário atual: ${currentHour}:${currentMinute.toString().padStart(2, '0')}`);
    
    // 4. Verificar se é horário de mudança de turno (19:00)
    if (currentHour === 19 && currentMinute >= 0 && currentMinute <= 5) {
      logger.info('🔄 Horário de mudança de turno detectado (19:00)!');
      
      // Arquivar turnos do período da manhã
      for (const shift of activeShifts) {
        if (shift.shiftType === 'MORNING') {
          logger.info(`📦 Arquivando turno da manhã: ${shift.id}`);
          try {
            await shiftService.archiveShiftData(shift.id);
            logger.info(`✅ Turno ${shift.id} arquivado com sucesso`);
          } catch (error) {
            logger.error(`❌ Erro ao arquivar turno ${shift.id}:`, error.message);
          }
        }
      }
      
      // Criar novos turnos da noite
      const machines = await prisma.machine.findMany({
        where: {
          status: { not: 'INACTIVE' }
        }
      });
      
      for (const machine of machines) {
        // Buscar operador mais recente da máquina
        const recentOperation = await prisma.machineOperation.findFirst({
          where: { machineId: machine.id },
          orderBy: { startTime: 'desc' },
          include: { operator: true }
        });
        
        if (recentOperation && recentOperation.operator) {
          logger.info(`🌙 Criando turno da noite para máquina ${machine.name}`);
          try {
            await shiftService.createOrUpdateShiftData(machine.id, recentOperation.operator.id, {
              totalProduction: 0,
              efficiency: 0,
              downtime: 0,
              qualityTests: 0,
              approvedTests: 0,
              rejectedTests: 0
            });
            logger.info(`✅ Turno da noite criado para máquina ${machine.name}`);
          } catch (error) {
            logger.error(`❌ Erro ao criar turno da noite para máquina ${machine.name}:`, error.message);
          }
        }
      }
    } else {
      logger.info('ℹ️ Não é horário de mudança de turno (19:00)');
    }
    
    // 5. Verificar se é horário de mudança de turno (7:00)
    if (currentHour === 7 && currentMinute >= 0 && currentMinute <= 5) {
      logger.info('🔄 Horário de mudança de turno detectado (7:00)!');
      
      // Arquivar turnos da noite
      for (const shift of activeShifts) {
        if (shift.shiftType === 'NIGHT') {
          logger.info(`📦 Arquivando turno da noite: ${shift.id}`);
          try {
            await shiftService.archiveShiftData(shift.id);
            logger.info(`✅ Turno ${shift.id} arquivado com sucesso`);
          } catch (error) {
            logger.error(`❌ Erro ao arquivar turno ${shift.id}:`, error.message);
          }
        }
      }
      
      // Criar novos turnos da manhã
      const machines = await prisma.machine.findMany({
        where: {
          status: { not: 'INACTIVE' }
        }
      });
      
      for (const machine of machines) {
        const recentOperation = await prisma.machineOperation.findFirst({
          where: { machineId: machine.id },
          orderBy: { startTime: 'desc' },
          include: { operator: true }
        });
        
        if (recentOperation && recentOperation.operator) {
          logger.info(`🌅 Criando turno da manhã para máquina ${machine.name}`);
          try {
            await shiftService.createOrUpdateShiftData(machine.id, recentOperation.operator.id, {
              totalProduction: 0,
              efficiency: 0,
              downtime: 0,
              qualityTests: 0,
              approvedTests: 0,
              rejectedTests: 0
            });
            logger.info(`✅ Turno da manhã criado para máquina ${machine.name}`);
          } catch (error) {
            logger.error(`❌ Erro ao criar turno da manhã para máquina ${machine.name}:`, error.message);
          }
        }
      }
    }
    
    // 6. Mostrar status final
    const finalActiveShifts = await prisma.shiftData.findMany({
      where: {
        isActive: true,
        isArchived: false
      },
      include: {
        machine: true,
        operator: true
      }
    });
    
    logger.info(`\n📊 Status final - ${finalActiveShifts.length} turnos ativos:`);
    finalActiveShifts.forEach(shift => {
      logger.info(`- Turno ${shift.id}: ${shift.machine.name} (${shift.shiftType}) - Produção: ${shift.totalProduction}`);
    });
    
    logger.info('\n✅ Correção do reset de produção concluída!');
    
  } catch (error) {
    logger.error('❌ Erro ao corrigir reset de produção:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  fixProductionReset();
}

module.exports = { fixProductionReset };