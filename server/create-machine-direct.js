const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const logger = require('utils/logger');

const prisma = new PrismaClient();

async function createMachineDirectly() {
  try {
    logger.info('✅ Conectado ao PostgreSQL');
    
    // Verificar se já existe uma máquina com código MAQ001
    const existingMachine = await prisma.machine.findFirst({ where: { code: 'MAQ001' } });
    
    if (existingMachine) {
      logger.info('⚠️  Máquina MAQ001 já existe:', existingMachine);
      return;
    }
    
    // Criar algumas máquinas de exemplo
    const machines = [
      {
        name: 'Máquina 01',
        code: 'MAQ001',
        description: 'Máquina de embalagem linha 1',
        status: 'RUNNING',
        isActive: true,
        location: 'Setor 1',
        model: 'Modelo A'
      },
      {
        name: 'Máquina 02',
        code: 'MAQ002',
        description: 'Máquina de embalagem linha 2',
        status: 'STOPPED',
        isActive: true,
        location: 'Setor 1',
        model: 'Modelo A'
      },
      {
        name: 'Máquina 03',
        code: 'MAQ003',
        description: 'Máquina de embalagem linha 3',
        status: 'STOPPED',
        isActive: true,
        location: 'Setor 2',
        model: 'Modelo B'
      }
    ];
    
    const result = await prisma.machine.createMany({ data: machines });
    logger.info(`✅ ${result.count} máquinas criadas com sucesso!`);
    
    // Listar as máquinas criadas
    const createdMachines = await prisma.machine.findMany();
    logger.info('\n📋 Máquinas no banco de dados:');
    createdMachines.forEach(machine => {
      logger.info(`- ID: ${machine.id}, Código: ${machine.code}, Nome: ${machine.name}`);
    });
    
  } catch (error) {
    logger.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMachineDirectly();