#!/usr/bin/env node

/**
 * Script para migrar dados do SQLite (desenvolvimento) para PostgreSQL (produção)
 * 
 * Uso:
 * 1. Configure DATABASE_URL no .env para PostgreSQL
 * 2. Execute: node migrate-to-production.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const logger = require('utils/logger');

// Cliente para SQLite (desenvolvimento)
const sqliteClient = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
});

// Cliente para PostgreSQL (produção)
const postgresClient = new PrismaClient();

async function migrateData() {
  try {
    logger.info('🚀 Iniciando migração de dados...');

    // 1. Migrar usuários
    logger.info('📊 Migrando usuários...');
    const users = await sqliteClient.user.findMany();
    for (const user of users) {
      await postgresClient.user.upsert({
        where: { email: user.email },
        update: user,
        create: user
      });
    }
    logger.info(`✅ ${users.length} usuários migrados`);

    // 2. Migrar máquinas
    logger.info('🏭 Migrando máquinas...');
    const machines = await sqliteClient.machine.findMany();
    for (const machine of machines) {
      await postgresClient.machine.upsert({
        where: { code: machine.code },
        update: machine,
        create: machine
      });
    }
    logger.info(`✅ ${machines.length} máquinas migradas`);

    // 3. Migrar testes de qualidade
    logger.info('🔬 Migrando testes de qualidade...');
    const qualityTests = await sqliteClient.qualityTest.findMany();
    for (const test of qualityTests) {
      await postgresClient.qualityTest.upsert({
        where: { id: test.id },
        update: test,
        create: test
      });
    }
    logger.info(`✅ ${qualityTests.length} testes de qualidade migrados`);

    // 4. Migrar mudanças de teflon
    logger.info('🔄 Migrando mudanças de teflon...');
    const teflonChanges = await sqliteClient.teflonChange.findMany();
    for (const change of teflonChanges) {
      await postgresClient.teflonChange.upsert({
        where: { id: change.id },
        update: change,
        create: change
      });
    }
    logger.info(`✅ ${teflonChanges.length} mudanças de teflon migradas`);

    // 5. Migrar notificações
    logger.info('🔔 Migrando notificações...');
    const notifications = await sqliteClient.notification.findMany();
    for (const notification of notifications) {
      await postgresClient.notification.upsert({
        where: { id: notification.id },
        update: notification,
        create: notification
      });
    }
    logger.info(`✅ ${notifications.length} notificações migradas`);

    logger.info('🎉 Migração concluída com sucesso!');
    
  } catch (error) {
    logger.error('❌ Erro durante a migração:', error);
    process.exit(1);
  } finally {
    await sqliteClient.$disconnect();
    await postgresClient.$disconnect();
  }
}

// Função para backup do banco SQLite
async function backupSqliteDb() {
  const backupPath = path.join(__dirname, 'prisma', `backup-${Date.now()}.db`);
  const originalPath = path.join(__dirname, 'prisma', 'dev.db');
  
  if (fs.existsSync(originalPath)) {
    fs.copyFileSync(originalPath, backupPath);
    logger.info(`💾 Backup criado: ${backupPath}`);
  }
}

// Função principal
async function main() {
  logger.info('🔄 Preparando migração para produção...');
  
  // Verificar se DATABASE_URL está configurada
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('sqlite')) {
    logger.error('❌ Configure DATABASE_URL para PostgreSQL no arquivo .env');
    logger.info('Exemplo: DATABASE_URL="postgresql://user:password@host:port/database"');
    process.exit(1);
  }

  // Fazer backup do SQLite
  await backupSqliteDb();

  // Executar migração
  await migrateData();

  logger.info('\n📋 Próximos passos:');
  logger.info('1. Verifique os dados migrados');
  logger.info('2. Teste a aplicação com PostgreSQL');
  logger.info('3. Configure o deploy em produção');
  logger.info('4. Atualize as variáveis de ambiente');
}

// Executar se chamado diretamente
if (require.main === module) {
  logger.error(main().catch(console.error);
}

module.exports = { migrateData, backupSqliteDb };