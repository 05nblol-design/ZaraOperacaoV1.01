const { MongoClient } = require('mongodb');
require('dotenv').config();
const logger = require('utils/logger');

async function createMachineDirectly() {
  const client = new MongoClient(process.env.DATABASE_URL);
  
  try {
    await client.connect();
    logger.info('✅ Conectado ao MongoDB');
    
    const db = client.db();
    const machinesCollection = db.collection('machines');
    
    // Verificar se já existe uma máquina com código MAQ001
    const existingMachine = await machinesCollection.findOne({ code: 'MAQ001' });
    
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
        model: 'Modelo A',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Máquina 02',
        code: 'MAQ002',
        description: 'Máquina de embalagem linha 2',
        status: 'STOPPED',
        isActive: true,
        location: 'Setor 1',
        model: 'Modelo A',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Máquina 03',
        code: 'MAQ003',
        description: 'Máquina de embalagem linha 3',
        status: 'STOPPED',
        isActive: true,
        location: 'Setor 2',
        model: 'Modelo B',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const result = await machinesCollection.insertMany(machines);
    logger.info(`✅ ${result.insertedCount} máquinas criadas com sucesso!`);
    
    // Listar as máquinas criadas
    const createdMachines = await machinesCollection.find({}).toArray();
    logger.info('\n📋 Máquinas no banco de dados:');
    createdMachines.forEach(machine => {
      logger.info(`- ID: ${machine._id}, Código: ${machine.code}, Nome: ${machine.name}`);
    });
    
  } catch (error) {
    logger.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

createMachineDirectly();