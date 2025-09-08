#!/usr/bin/env node

/**
 * Script para converter o schema.prisma de SQLite para MongoDB
 * Atualiza todos os IDs para ObjectId e corrige os relacionamentos
 */

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');

function log(message, color = 'reset') {
  const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function fixSchema() {
  log('🔧 Convertendo schema.prisma para MongoDB...', 'blue');
  
  try {
    let content = fs.readFileSync(schemaPath, 'utf8');
    
    // 1. Atualizar todos os modelos principais para usar ObjectId
    const models = [
      'QualityTest',
      'TeflonChange', 
      'MachineOperation',
      'Notification',
      'UserDevice',
      'MachineStatusHistory',
      'MachinePermission',
      'ShiftData',
      'ProductionArchive'
    ];
    
    models.forEach(model => {
      // Atualizar ID principal do modelo
      const idPattern = new RegExp(`(model ${model} {[\\s\\S]*?)id\\s+Int\\s+@id @default\\(autoincrement\\(\\)\\)`, 'g');
      content = content.replace(idPattern, `$1id          String   @id @default(auto()) @map("_id") @db.ObjectId`);
    });
    
    // 2. Atualizar todos os campos de relacionamento (xxxId Int -> xxxId String @db.ObjectId)
    const relationFields = [
      'machineId',
      'userId', 
      'operatorId',
      'testId',
      'changeId',
      'shiftDataId'
    ];
    
    relationFields.forEach(field => {
      // Campos obrigatórios
      const mandatoryPattern = new RegExp(`${field}\\s+Int(?!\\?)`, 'g');
      content = content.replace(mandatoryPattern, `${field}   String   @db.ObjectId`);
      
      // Campos opcionais
      const optionalPattern = new RegExp(`${field}\\s+Int\\?`, 'g');
      content = content.replace(optionalPattern, `${field}   String?  @db.ObjectId`);
    });
    
    // 3. Corrigir campos únicos específicos
    content = content.replace(
      /machineId Int\s+@unique/g,
      'machineId String   @unique @db.ObjectId'
    );
    
    content = content.replace(
      /shiftDataId Int\s+@unique/g,
      'shiftDataId String   @unique @db.ObjectId'
    );
    
    // 4. Adicionar mapeamento para coleções MongoDB
    const collectionMappings = {
      'QualityTest': 'quality_tests',
      'TeflonChange': 'teflon_changes',
      'MachineOperation': 'machine_operations', 
      'Notification': 'notifications',
      'UserDevice': 'user_devices',
      'MachineStatusHistory': 'machine_status_history',
      'MachinePermission': 'machine_permissions',
      'ShiftData': 'shift_data',
      'ProductionArchive': 'production_archives'
    };
    
    Object.entries(collectionMappings).forEach(([model, collection]) => {
      // Adicionar @@map se não existir
      const mapPattern = new RegExp(`(model ${model} {[\\s\\S]*?})(\\s*(?!@@map))`, 'g');
      content = content.replace(mapPattern, `$1\n\n  @@map("${collection}")\n}`);
    });
    
    // 5. Salvar o arquivo atualizado
    fs.writeFileSync(schemaPath, content, 'utf8');
    
    log('✅ Schema convertido com sucesso!', 'green');
    log('📋 Alterações realizadas:', 'blue');
    log('  • IDs convertidos para ObjectId');
    log('  • Campos de relacionamento atualizados');
    log('  • Mapeamentos de coleção adicionados');
    
    return true;
    
  } catch (error) {
    log(`❌ Erro ao converter schema: ${error.message}`, 'red');
    return false;
  }
}

function generateClient() {
  log('\n🔄 Gerando cliente Prisma...', 'blue');
  
  const { exec } = require('child_process');
  
  return new Promise((resolve) => {
    exec('npx prisma generate', (error, stdout, stderr) => {
      if (error) {
        log(`❌ Erro ao gerar cliente: ${error.message}`, 'red');
        resolve(false);
      } else {
        log('✅ Cliente Prisma gerado!', 'green');
        resolve(true);
      }
    });
  });
}

async function main() {
  log('🚀 Iniciando conversão do schema para MongoDB\n', 'bold');
  
  // Fazer backup do schema original
  const backupPath = schemaPath + '.backup';
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(schemaPath, backupPath);
    log('💾 Backup do schema criado', 'yellow');
  }
  
  // Converter schema
  const schemaFixed = fixSchema();
  
  if (schemaFixed) {
    // Gerar cliente
    const clientGenerated = await generateClient();
    
    if (clientGenerated) {
      log('\n🎉 Conversão concluída com sucesso!', 'green');
      log('\n📋 Próximos passos:', 'blue');
      log('1. Verifique se a string de conexão MongoDB está configurada');
      log('2. Execute: node migrate-to-mongodb.js');
      log('3. Teste a aplicação: npm run dev');
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixSchema, generateClient };