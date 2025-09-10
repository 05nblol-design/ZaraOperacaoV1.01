const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const logger = require('utils/logger');

async function createMachineConfig() {
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    logger.info('✅ Conectado ao PostgreSQL');
    
    // Buscar todas as máquinas
    const machines = await prisma.machine.findMany();
    
    for (const machine of machines) {
      // Verificar se já existe configuração para esta máquina
      const existingConfig = await prisma.machineConfig.findFirst({ 
        where: { machineId: machine.id } 
      });
      
      if (existingConfig) {
        logger.info(`⚠️  Configuração já existe para máquina ${machine.name}`);
        continue;
      }
      
      // Criar configuração padrão
      const config = {
        machineId: machine.id,
        general: {
          name: machine.name,
          model: machine.model || '',
          location: machine.location || '',
          capacity: '',
          description: machine.description || ''
        },
        operational: {
          maxTemperature: 200,
          minTemperature: 150,
          maxPressure: 10,
          minPressure: 5,
          cycleTime: 30,
          maintenanceInterval: 168,
          qualityCheckInterval: 50
        },
        alerts: {
          temperatureAlert: true,
          pressureAlert: true,
          maintenanceAlert: true,
          qualityAlert: true,
          teflonAlert: true,
          emailNotifications: true,
          smsNotifications: false
        },
        quality: {
          defectThreshold: 5,
          autoReject: true,
          requirePhotos: true,
          minSampleSize: 10
        },
        maintenance: {
          preventiveEnabled: true,
          predictiveEnabled: false,
          autoSchedule: true,
          reminderDays: 7
        }
      };
      
      const result = await prisma.machineConfig.create({ data: config });
      logger.info(`✅ Configuração criada para máquina ${machine.name} - ID: ${result.id}`);
    }
    
    logger.info('\n📋 Configurações criadas com sucesso!');
    
  } catch (error) {
    logger.error('❌ Erro ao criar configurações:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMachineConfig();