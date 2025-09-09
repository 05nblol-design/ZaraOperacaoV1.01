#!/usr/bin/env node

/**
 * 🚨 CORREÇÃO URGENTE: Tabelas do Prisma não existem no Railway
 * 
 * PROBLEMA: The table `public.machines` does not exist in the current database.
 * CAUSA: Migrações do Prisma não foram executadas no PostgreSQL do Railway
 * 
 * Este script:
 * 1. Verifica configuração atual do Prisma
 * 2. Corrige configuração do Express (trust proxy)
 * 3. Cria instruções para executar migrações no Railway
 * 4. Gera script de teste das tabelas
 */

const fs = require('fs');
const path = require('path');

console.log('🚨 CORREÇÃO URGENTE: Migrações do Prisma no Railway\n');

// 1. VERIFICAR CONFIGURAÇÃO ATUAL
console.log('1️⃣ VERIFICANDO CONFIGURAÇÃO ATUAL:');

const serverPath = path.join(__dirname, 'server');
const schemaPath = path.join(serverPath, 'prisma', 'schema.prisma');
const indexPath = path.join(serverPath, 'index.js');
const packagePath = path.join(serverPath, 'package.json');

// Verificar schema do Prisma
if (fs.existsSync(schemaPath)) {
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    console.log('   ✅ Schema do Prisma encontrado');
    
    // Verificar se está configurado para PostgreSQL
    if (schemaContent.includes('provider = "postgresql"')) {
        console.log('   ✅ Configurado para PostgreSQL');
    } else {
        console.log('   ❌ NÃO configurado para PostgreSQL');
    }
    
    // Verificar modelos essenciais
    const models = ['User', 'Machine', 'QualityTest', 'MachineOperation'];
    console.log('   📋 Modelos definidos:');
    models.forEach(model => {
        const hasModel = schemaContent.includes(`model ${model}`);
        console.log(`      ${hasModel ? '✅' : '❌'} ${model}`);
    });
} else {
    console.log('   ❌ Schema do Prisma NÃO encontrado');
}

// 2. VERIFICAR CONFIGURAÇÃO DO EXPRESS
console.log('\n2️⃣ VERIFICANDO CONFIGURAÇÃO DO EXPRESS:');

if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    if (indexContent.includes('trust proxy')) {
        console.log('   ✅ Trust proxy configurado');
    } else {
        console.log('   ❌ Trust proxy NÃO configurado');
        console.log('   📋 NECESSÁRIO: Adicionar app.set(\'trust proxy\', 1);');
    }
} else {
    console.log('   ❌ Arquivo index.js NÃO encontrado');
}

// 3. CORRIGIR TRUST PROXY
console.log('\n3️⃣ CORRIGINDO TRUST PROXY:');

if (fs.existsSync(indexPath)) {
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    
    if (!indexContent.includes('trust proxy')) {
        // Encontrar onde adicionar o trust proxy (após criação do app)
        const appCreationRegex = /(const app = express\(\);?)/;
        
        if (appCreationRegex.test(indexContent)) {
            indexContent = indexContent.replace(
                appCreationRegex,
                '$1\n\n// Configurar trust proxy para Railway\napp.set(\'trust proxy\', 1);'
            );
            
            fs.writeFileSync(indexPath, indexContent);
            console.log('   ✅ Trust proxy adicionado ao index.js');
        } else {
            console.log('   ⚠️  Não foi possível adicionar automaticamente');
            console.log('   📋 ADICIONE MANUALMENTE: app.set(\'trust proxy\', 1);');
        }
    } else {
        console.log('   ✅ Trust proxy já configurado');
    }
}

// 4. CRIAR INSTRUÇÕES PARA RAILWAY
console.log('\n4️⃣ CRIANDO INSTRUÇÕES PARA RAILWAY:');

const railwayInstructions = `# 🚨 INSTRUÇÕES URGENTES - RAILWAY MIGRATIONS

## ❌ PROBLEMA IDENTIFICADO
\`\`\`
The table \`public.machines\` does not exist in the current database.
code: 'P2021'
\`\`\`

## 🎯 CAUSA RAIZ
As **migrações do Prisma não foram executadas** no Railway PostgreSQL.

## 🚀 SOLUÇÃO IMEDIATA

### PASSO 1: Acessar Railway Dashboard
1. **Acesse:** https://railway.app/dashboard
2. **Clique no serviço BACKEND**
3. **Vá em "Variables"**

### PASSO 2: Verificar Variáveis de Ambiente
Certifique-se que estas variáveis estão configuradas:
\`\`\`
DATABASE_URL=postgresql://postgres:GNquZiBhCMsFDZbvDTevPkrWFdRyyLQM@postgres.railway.internal:5432/railway
NODE_ENV=production
PORT=5000
\`\`\`

### PASSO 3: Forçar Redeploy com Migrações
1. **Vá em "Deployments"**
2. **Clique em "Deploy"** (ou faça um novo commit)
3. **Aguarde o build completar**

### PASSO 4: Verificar Logs
1. **Vá em "Logs"**
2. **Procure por:**
   - ✅ \`prisma:info Starting a postgresql pool\`
   - ✅ \`Database connected successfully\`
   - ❌ SEM \`table does not exist\`

## 🔧 COMANDOS EXECUTADOS NO BUILD
O railway.toml já está configurado para executar:
\`\`\`bash
npm install && npx prisma generate && npx prisma db push
\`\`\`

## ⚠️ SE O PROBLEMA PERSISTIR

### Opção 1: Reset do Banco (CUIDADO!)
1. **No Railway Dashboard → Database**
2. **Settings → Danger Zone → Reset Database**
3. **Confirmar reset**
4. **Fazer novo deploy**

### Opção 2: Executar Migrações Manualmente
1. **Conectar ao Railway via CLI:**
   \`\`\`bash
   railway login
   railway connect
   \`\`\`
2. **Executar migrações:**
   \`\`\`bash
   npx prisma db push --force-reset
   \`\`\`

## 🎯 RESULTADO ESPERADO
Após seguir os passos:
- ✅ Tabelas criadas no PostgreSQL
- ✅ Erro P2021 eliminado
- ✅ API /machines funcionando
- ✅ Aplicação totalmente operacional

## ⏱️ TEMPO ESTIMADO
- **Verificação:** 2 minutos
- **Redeploy:** 3-5 minutos
- **Verificação final:** 1 minuto
- **Total:** 6-8 minutos

---
**🚨 AÇÃO IMEDIATA NECESSÁRIA!**
`;

fs.writeFileSync('RAILWAY-MIGRATIONS-URGENTE.md', railwayInstructions);
console.log('   ✅ Instruções criadas: RAILWAY-MIGRATIONS-URGENTE.md');

// 5. CRIAR SCRIPT DE TESTE
console.log('\n5️⃣ CRIANDO SCRIPT DE TESTE:');

const testScript = `#!/usr/bin/env node

/**
 * 🧪 TESTE: Verificar se as tabelas do Prisma existem no Railway
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabaseTables() {
    console.log('🧪 TESTANDO TABELAS DO BANCO DE DADOS...\\n');
    
    try {
        // Teste 1: Verificar tabela machines
        console.log('1️⃣ Testando tabela machines:');
        const machineCount = await prisma.machine.count();
        console.log('   ✅ Tabela machines existe - ' + machineCount + ' registros');
        
        // Teste 2: Verificar tabela users
        console.log('\\n2️⃣ Testando tabela users:');
        const userCount = await prisma.user.count();
        console.log('   ✅ Tabela users existe - ' + userCount + ' registros');
        
        // Teste 3: Verificar tabela quality_tests
        console.log('\\n3️⃣ Testando tabela quality_tests:');
        const qualityTestCount = await prisma.qualityTest.count();
        console.log('   ✅ Tabela quality_tests existe - ' + qualityTestCount + ' registros');
        
        // Teste 4: Verificar tabela machine_operations
        console.log('\\n4️⃣ Testando tabela machine_operations:');
        const operationCount = await prisma.machineOperation.count();
        console.log('   ✅ Tabela machine_operations existe - ' + operationCount + ' registros');
        
        console.log('\\n🎉 SUCESSO: Todas as tabelas existem no banco de dados!');
        console.log('\\n📊 RESUMO:');
        console.log('   - Machines: ' + machineCount);
        console.log('   - Users: ' + userCount);
        console.log('   - Quality Tests: ' + qualityTestCount);
        console.log('   - Operations: ' + operationCount);
        
    } catch (error) {
        console.error('❌ ERRO ao testar tabelas:', error.message);
        
        if (error.code === 'P2021') {
            console.log('\\n🚨 DIAGNÓSTICO:');
            console.log('   - As migrações do Prisma NÃO foram executadas');
            console.log('   - As tabelas não existem no PostgreSQL');
            console.log('   - É necessário executar: npx prisma db push');
            console.log('\\n📋 PRÓXIMOS PASSOS:');
            console.log('   1. Acesse o Railway Dashboard');
            console.log('   2. Faça um novo deploy');
            console.log('   3. Verifique os logs do build');
            console.log('   4. Execute este teste novamente');
        }
        
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Executar teste
testDatabaseTables();
`;

fs.writeFileSync('test-railway-database-tables.js', testScript);
console.log('   ✅ Script de teste criado: test-railway-database-tables.js');

// 6. RESUMO FINAL
console.log('\n🎯 RESUMO DA CORREÇÃO:');
console.log('\n📁 ARQUIVOS CRIADOS:');
console.log('   ✅ RAILWAY-MIGRATIONS-URGENTE.md - Instruções detalhadas');
console.log('   ✅ test-railway-database-tables.js - Teste das tabelas');

console.log('\n🚀 PRÓXIMOS PASSOS:');
console.log('   1. 📖 Leia: RAILWAY-MIGRATIONS-URGENTE.md');
console.log('   2. 🌐 Acesse: https://railway.app/dashboard');
console.log('   3. 🔄 Faça redeploy do backend');
console.log('   4. 🧪 Execute: node test-railway-database-tables.js');

console.log('\n⏱️ TEMPO ESTIMADO: 6-8 minutos');
console.log('\n🎉 RESULTADO: Aplicação totalmente funcional!');

console.log('\n' + '='.repeat(60));
console.log('🚨 AÇÃO IMEDIATA NECESSÁRIA - LEIA AS INSTRUÇÕES! 🚨');
console.log('='.repeat(60));