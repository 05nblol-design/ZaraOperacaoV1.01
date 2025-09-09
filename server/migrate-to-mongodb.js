#!/usr/bin/env node

/**
 * Script para migrar o sistema ZARA de SQLite para MongoDB Atlas
 * 
 * Este script:
 * 1. Verifica a conexão com MongoDB
 * 2. Gera o cliente Prisma atualizado
 * 3. Executa a migração dos dados (se necessário)
 * 4. Testa a conectividade
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const logger = require('utils/logger');
const execAsync = promisify(exec);

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  logger.info(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.bold}[${step}]${colors.reset} ${colors.blue}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function checkEnvironment() {
  logStep('1', 'Verificando variáveis de ambiente...');
  
  const requiredVars = ['DATABASE_URL', 'MONGODB_URI'];
  const missing = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  if (missing.length > 0) {
    logError(`Variáveis de ambiente faltando: ${missing.join(', ')}`);
    logWarning('Certifique-se de configurar o arquivo .env com a string de conexão MongoDB');
    return false;
  }
  
  logSuccess('Variáveis de ambiente configuradas');
  return true;
}

async function generatePrismaClient() {
  logStep('2', 'Gerando cliente Prisma para MongoDB...');
  
  try {
    const { stdout, stderr } = await execAsync('npx prisma generate');
    
    if (stderr && !stderr.includes('warn')) {
      logWarning(`Avisos do Prisma: ${stderr}`);
    }
    
    logSuccess('Cliente Prisma gerado com sucesso');
    return true;
  } catch (error) {
    logError(`Erro ao gerar cliente Prisma: ${error.message}`);
    return false;
  }
}

async function testConnection() {
  logStep('3', 'Testando conexão com MongoDB...');
  
  try {
    // Importa o Prisma Client
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Testa a conexão
    await prisma.$connect();
    logSuccess('Conexão com MongoDB estabelecida');
    
    // Testa uma query simples
    const userCount = await prisma.user.count();
    log(`📊 Usuários no banco: ${userCount}`);
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    logError(`Erro na conexão: ${error.message}`);
    
    if (error.message.includes('Authentication failed')) {
      logWarning('Verifique se a senha do MongoDB está correta');
    } else if (error.message.includes('timeout')) {
      logWarning('Verifique se o IP está liberado no MongoDB Atlas');
    }
    
    return false;
  }
}

async function createInitialData() {
  logStep('4', 'Verificando dados iniciais...');
  
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    
    // Verifica se já existem usuários
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      log('📝 Criando usuário administrador padrão...');
      
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await prisma.user.create({
        data: {
          email: 'admin@zara.com',
          password: hashedPassword,
          name: 'Administrador',
          role: 'ADMIN',
          badgeNumber: 'ADM001'
        }
      });
      
      logSuccess('Usuário administrador criado');
      log('📧 Email: admin@zara.com');
      log('🔑 Senha: admin123');
    } else {
      logSuccess(`${userCount} usuários já existem no banco`);
    }
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    logError(`Erro ao criar dados iniciais: ${error.message}`);
    return false;
  }
}

async function main() {
  log(`${colors.bold}🚀 Migração ZARA para MongoDB Atlas${colors.reset}`);
  log('=' .repeat(50));
  
  try {
    // Carrega variáveis de ambiente
    require('dotenv').config();
    
    // Executa os passos da migração
    const steps = [
      checkEnvironment,
      generatePrismaClient,
      testConnection,
      createInitialData
    ];
    
    for (const step of steps) {
      const success = await step();
      if (!success) {
        logError('Migração interrompida devido a erro');
        process.exit(1);
      }
    }
    
    log('\n' + '=' .repeat(50));
    logSuccess('🎉 Migração concluída com sucesso!');
    log('\n📋 Próximos passos:');
    log('1. Teste o sistema localmente: npm run dev');
    log('2. Faça o deploy no Vercel');
    log('3. Configure as variáveis de ambiente no Vercel');
    log('4. Teste o sistema em produção');
    
  } catch (error) {
    logError(`Erro inesperado: ${error.message}`);
    process.exit(1);
  }
}

// Executa o script
if (require.main === module) {
  main();
}

module.exports = { main };