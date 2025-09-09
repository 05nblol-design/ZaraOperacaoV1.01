const axios = require('axios');
const jwt = require('jsonwebtoken');
const logger = require('utils/logger');

async function debugMachineUndefined() {
  try {
    logger.info('🔍 Debugando problema "Máquina undefined: undefined"\n');
    
    // Gerar token de admin
    const adminToken = jwt.sign(
      { id: 1, role: 'ADMIN' },
      'zara-jwt-secret-key-2024'
    );
    
    logger.info('1. Testando API /api/machines...');
    const machinesResponse = await axios.get('http://localhost:3001/api/machines', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    logger.info('✅ Status:', machinesResponse.status);
    logger.info('📊 Total de máquinas:', machinesResponse.data.data?.length || 0);
    
    if (machinesResponse.data.data && machinesResponse.data.data.length > 0) {
      logger.info('\n📋 Estrutura das máquinas:');
      machinesResponse.data.data.forEach((machine, index) => {
        logger.info(`\n${index + 1}. Máquina ID: ${machine.id}`);
        logger.info(`   - name: ${machine.name || 'UNDEFINED'}`);
        logger.info(`   - code: ${machine.code || 'UNDEFINED'}`);
        logger.info(`   - status: ${machine.status || 'UNDEFINED'}`);
        logger.info(`   - location: ${machine.location || 'UNDEFINED'}`);
        logger.info(`   - isActive: ${machine.isActive}`);
        logger.info(`   - operator: ${machine.operator || 'UNDEFINED'}`);
        
        // Verificar se algum campo essencial está undefined
        if (!machine.name || !machine.code) {
          logger.info('   ⚠️  PROBLEMA ENCONTRADO: name ou code está undefined!');
        }
      });
    }
    
    logger.info('\n2. Testando API /api/machines/1 (máquina específica)...');
    const machine1Response = await axios.get('http://localhost:3001/api/machines/1', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    logger.info('✅ Status:', machine1Response.status);
    const machine1 = machine1Response.data.data;
    
    if (machine1) {
      logger.info('\n📋 Dados da máquina ID 1:');
      logger.info(`   - name: ${machine1.name || 'UNDEFINED'}`);
      logger.info(`   - code: ${machine1.code || 'UNDEFINED'}`);
      logger.info(`   - status: ${machine1.status || 'UNDEFINED'}`);
      logger.info(`   - location: ${machine1.location || 'UNDEFINED'}`);
      logger.info(`   - isActive: ${machine1.isActive}`);
      
      if (!machine1.name || !machine1.code) {
        logger.info('   ⚠️  PROBLEMA ENCONTRADO: name ou code está undefined!');
      }
    }
    
    logger.info('\n3. Verificando banco de dados diretamente...');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const dbMachines = await prisma.machine.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        location: true,
        isActive: true
      },
      take: 5
    });
    
    logger.info('\n📊 Dados diretos do banco:');
    dbMachines.forEach((machine, index) => {
      logger.info(`\n${index + 1}. Máquina ID: ${machine.id}`);
      logger.info(`   - name: ${machine.name || 'NULL/UNDEFINED'}`);
      logger.info(`   - code: ${machine.code || 'NULL/UNDEFINED'}`);
      logger.info(`   - status: ${machine.status || 'NULL/UNDEFINED'}`);
      logger.info(`   - location: ${machine.location || 'NULL/UNDEFINED'}`);
      logger.info(`   - isActive: ${machine.isActive}`);
      
      if (!machine.name || !machine.code) {
        logger.info('   🚨 PROBLEMA NO BANCO: name ou code está null/undefined!');
      }
    });
    
    await prisma.$disconnect();
    
  } catch (error) {
    logger.error('❌ Erro durante o debug:', error.message);
    if (error.response) {
      logger.error('📄 Response data:', error.response.data);
      logger.error('📊 Response status:', error.response.status);
    }
  }
}

debugMachineUndefined();