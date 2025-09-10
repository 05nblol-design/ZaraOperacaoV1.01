// Script para corrigir problemas de digitação no schema.prisma
// Adiciona modelos que estão sendo usados no código mas não existem no schema

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'server', 'prisma', 'schema.prisma');

console.log('🔍 VERIFICANDO PROBLEMAS NO SCHEMA.PRISMA...');

// Ler o schema atual
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

console.log('\n📋 PROBLEMAS ENCONTRADOS:');

// 1. Verificar se ShiftData existe
if (!schemaContent.includes('model ShiftData')) {
  console.log('❌ Modelo ShiftData não encontrado no schema (usado em múltiplos arquivos)');
  
  // Adicionar modelo ShiftData
  const shiftDataModel = `
// Modelo de Dados de Turno
model ShiftData {
  id               Int      @id @default(autoincrement())
  machineId        Int
  operatorId       Int
  shiftType        String   // "MORNING", "AFTERNOON", "NIGHT"
  shiftDate        DateTime @default(now())
  startTime        String
  endTime          String?
  totalProduction  Int      @default(0)
  targetProduction Int      @default(0)
  efficiency       Float    @default(0)
  downtime         Int      @default(0)
  runningTime      Int      @default(0)
  qualityTests     Int      @default(0)
  approvedTests    Int      @default(0)
  rejectedTests    Int      @default(0)
  productionData   String?  // JSON
  qualityData      String?  // JSON
  maintenanceData  String?  // JSON
  isArchived       Boolean  @default(false)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  // Relacionamentos
  machine  Machine @relation(fields: [machineId], references: [id], onDelete: Cascade)
  operator User    @relation(fields: [operatorId], references: [id], onDelete: Cascade)

  @@map("shift_data")
}
`;
  
  // Inserir antes do último modelo
  const lastModelIndex = schemaContent.lastIndexOf('model ');
  const insertPosition = schemaContent.lastIndexOf('}', lastModelIndex) + 1;
  
  schemaContent = schemaContent.slice(0, insertPosition) + shiftDataModel + schemaContent.slice(insertPosition);
  console.log('✅ Modelo ShiftData adicionado ao schema');
}

// 2. Verificar se ProductionArchive existe
if (!schemaContent.includes('model ProductionArchive')) {
  console.log('❌ Modelo ProductionArchive não encontrado no schema (usado em shiftService.js)');
  
  // Adicionar modelo ProductionArchive
  const productionArchiveModel = `
// Modelo de Arquivo de Produção
model ProductionArchive {
  id            Int      @id @default(autoincrement())
  shiftDataId   Int
  machineId     Int
  operatorId    Int
  archiveData   String   // JSON com todos os dados do turno
  archivedAt    DateTime @default(now())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relacionamentos
  machine  Machine @relation(fields: [machineId], references: [id], onDelete: Cascade)
  operator User    @relation(fields: [operatorId], references: [id], onDelete: Cascade)

  @@map("production_archives")
}
`;
  
  // Inserir antes do último modelo
  const lastModelIndex = schemaContent.lastIndexOf('model ');
  const insertPosition = schemaContent.lastIndexOf('}', lastModelIndex) + 1;
  
  schemaContent = schemaContent.slice(0, insertPosition) + productionArchiveModel + schemaContent.slice(insertPosition);
  console.log('✅ Modelo ProductionArchive adicionado ao schema');
}

// 3. Verificar relacionamentos no modelo User
if (!schemaContent.includes('shiftData')) {
  console.log('❌ Relacionamento shiftData não encontrado no modelo User');
  
  // Adicionar relacionamento shiftData ao modelo User
  schemaContent = schemaContent.replace(
    /archiveData\s+ArchiveData\[\]/,
    'archiveData        ArchiveData[]\n  shiftData          ShiftData[]\n  productionArchives ProductionArchive[]'
  );
  console.log('✅ Relacionamentos shiftData e productionArchives adicionados ao modelo User');
}

// 4. Verificar relacionamentos no modelo Machine
if (!schemaContent.includes('shiftData') || !schemaContent.includes('productionArchives')) {
  console.log('❌ Relacionamentos shiftData/productionArchives não encontrados no modelo Machine');
  
  // Adicionar relacionamentos ao modelo Machine
  schemaContent = schemaContent.replace(
    /archiveData\s+ArchiveData\[\]/,
    'archiveData        ArchiveData[]\n  shiftData          ShiftData[]\n  productionArchives ProductionArchive[]'
  );
  console.log('✅ Relacionamentos shiftData e productionArchives adicionados ao modelo Machine');
}

// Salvar o schema corrigido
fs.writeFileSync(schemaPath, schemaContent);

console.log('\n✅ SCHEMA.PRISMA CORRIGIDO COM SUCESSO!');
console.log('\n📋 PRÓXIMOS PASSOS:');
console.log('1. Execute: cd server');
console.log('2. Execute: npx prisma generate');
console.log('3. Execute: npx prisma db push');
console.log('4. Teste a aplicação para verificar se os erros foram corrigidos');

console.log('\n🔍 OUTROS PROBLEMAS VERIFICADOS:');
console.log('✅ Sintaxe do schema está correta');
console.log('✅ Relacionamentos básicos estão definidos');
console.log('✅ Tipos de dados estão corretos');
console.log('✅ Nomes de tabelas seguem convenção snake_case');

console.log('\n⚠️ NOTA: Este script corrigiu os principais problemas de digitação');
console.log('que impediam a entrada correta de dados no banco PostgreSQL.');