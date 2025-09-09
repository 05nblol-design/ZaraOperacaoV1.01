const { PrismaClient } = require('@prisma/client');
const logger = require('utils/logger');

const prisma = new PrismaClient();

async function createMachine() {
  try {
    logger.info('Criando máquina MAQ001...');
    
    const machine = await prisma.machine.create({
      data: {
        name: 'Máquina 01',
        code: 'MAQ001',
        description: 'Máquina de embalagem linha 1',
        status: 'RUNNING',
        isActive: true,
        location: 'Setor 1',
        model: 'Modelo A'
      }
    });
    
    logger.info('✅ Máquina criada:', machine);
    
  } catch (error) {
    logger.error('❌ Erro ao criar máquina:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMachine();