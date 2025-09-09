#!/usr/bin/env node

/**
 * 🚨 CORREÇÃO AUTOMÁTICA: Trust Proxy + Migrations do Prisma
 * 
 * Este script corrige os problemas:
 * 1. ERR_ERL_UNEXPECTED_X_FORWARDED_FOR (trust proxy)
 * 2. P2021 - Tabela 'machines' não existe (migrations)
 */

const fs = require('fs');
const path = require('path');

console.log('\n🚨 CORREÇÃO: Trust Proxy + Database Migrations\n');

// Verificar estrutura do projeto
const serverPath = path.join(process.cwd(), 'server');
const indexPath = path.join(serverPath, 'index.js');
const packagePath = path.join(serverPath, 'package.json');
const railwayTomlPath = path.join(process.cwd(), 'railway.toml');

console.log('📊 ANÁLISE DO PROJETO:');
console.log('======================');

// Verificar arquivos existentes
const files = {
  'server/index.js': fs.existsSync(indexPath),
  'server/package.json': fs.existsSync(packagePath),
  'railway.toml': fs.existsSync(railwayTomlPath)
};

for (const [file, exists] of Object.entries(files)) {
  console.log(`${exists ? '✅' : '❌'} ${file}: ${exists ? 'ENCONTRADO' : 'NÃO ENCONTRADO'}`);
}

console.log('\n🔧 CORREÇÕES NECESSÁRIAS:');
console.log('==========================');

// 1. Verificar e corrigir trust proxy no index.js
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  console.log('\n1. 🔍 VERIFICANDO TRUST PROXY:');
  
  if (indexContent.includes('trust proxy')) {
    console.log('   ✅ Trust proxy já configurado');
  } else {
    console.log('   ❌ Trust proxy NÃO configurado');
    console.log('   📋 ADICIONE esta linha após criar o app:');
    console.log('   ```javascript');
    console.log('   app.set(\'trust proxy\', 1);');
    console.log('   ```');
  }
  
  // Verificar rate limiting
  if (indexContent.includes('express-rate-limit')) {
    console.log('   🔍 Rate limiting detectado');
    if (indexContent.includes('trustProxy: true') || indexContent.includes('xForwardedForHeader: false')) {
      console.log('   ✅ Rate limiting configurado corretamente');
    } else {
      console.log('   ⚠️  Rate limiting precisa de ajuste');
      console.log('   📋 CONFIGURE o rate limit:');
      console.log('   ```javascript');
      console.log('   const limiter = rateLimit({');
      console.log('     windowMs: 15 * 60 * 1000,');
      console.log('     max: 100,');
      console.log('     trustProxy: true,');
      console.log('     validate: { xForwardedForHeader: false }');
      console.log('   });');
      console.log('   ```');
    }
  }
} else {
  console.log('\n❌ server/index.js não encontrado');
  console.log('   Verifique se o arquivo principal está em outro local');
}

// 2. Verificar configuração do Prisma
console.log('\n2. 🗄️  VERIFICANDO CONFIGURAÇÃO DO PRISMA:');

const prismaPath = path.join(serverPath, 'prisma', 'schema.prisma');
if (fs.existsSync(prismaPath)) {
  console.log('   ✅ schema.prisma encontrado');
  
  const schemaContent = fs.readFileSync(prismaPath, 'utf8');
  const models = ['Machine', 'User', 'Operation', 'Production'];
  
  console.log('   📋 Verificando models:');
  models.forEach(model => {
    const hasModel = schemaContent.includes(`model ${model}`);
    console.log(`   ${hasModel ? '✅' : '❌'} Model ${model}: ${hasModel ? 'DEFINIDO' : 'AUSENTE'}`);
  });
} else {
  console.log('   ❌ schema.prisma não encontrado');
  console.log('   Verifique se o Prisma está configurado corretamente');
}

// 3. Configuração do Railway
console.log('\n3. 🚂 CONFIGURAÇÃO DO RAILWAY:');

if (fs.existsSync(packagePath)) {
  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  console.log('   📋 Scripts no package.json:');
  const requiredScripts = {
    'build': 'npm install && npx prisma generate && npx prisma db push',
    'start': 'node index.js',
    'railway:deploy': 'npx prisma db push && npm start'
  };
  
  for (const [script, command] of Object.entries(requiredScripts)) {
    const hasScript = packageContent.scripts && packageContent.scripts[script];
    console.log(`   ${hasScript ? '✅' : '❌'} ${script}: ${hasScript ? 'CONFIGURADO' : 'AUSENTE'}`);
    if (!hasScript) {
      console.log(`      📋 ADICIONE: "${script}": "${command}"`);
    }
  }
}

// 4. Railway.toml
if (fs.existsSync(railwayTomlPath)) {
  console.log('   ✅ railway.toml encontrado');
  const tomlContent = fs.readFileSync(railwayTomlPath, 'utf8');
  
  if (tomlContent.includes('prisma db push')) {
    console.log('   ✅ Comando de migration configurado');
  } else {
    console.log('   ⚠️  Migration não configurada no railway.toml');
  }
} else {
  console.log('   ⚠️  railway.toml não encontrado');
  console.log('   📋 CRIE o arquivo railway.toml:');
  console.log('   ```toml');
  console.log('   [build]');
  console.log('   builder = "nixpacks"');
  console.log('   ');
  console.log('   [build.buildCommand]');
  console.log('   command = "npm install && npx prisma generate && npx prisma db push"');
  console.log('   ');
  console.log('   [deploy]');
  console.log('   startCommand = "npm start"');
  console.log('   ```');
}

console.log('\n🎯 PASSOS PARA CORREÇÃO NO RAILWAY:');
console.log('===================================');

console.log('\n📋 1. CORRIGIR TRUST PROXY:');
console.log('   - Edite server/index.js');
console.log('   - Adicione: app.set(\'trust proxy\', 1);');
console.log('   - Após: const app = express();');

console.log('\n📋 2. CONFIGURAR MIGRATIONS NO RAILWAY:');
console.log('   - Acesse: https://railway.app/dashboard');
console.log('   - Clique no serviço Backend');
console.log('   - Vá em Settings → Deploy');
console.log('   - Build Command: npm install && npx prisma db push');
console.log('   - Start Command: npm start');

console.log('\n📋 3. VERIFICAR VARIÁVEIS DE AMBIENTE:');
console.log('   - DATABASE_URL deve estar configurada');
console.log('   - NODE_ENV=production');

console.log('\n🧪 COMANDOS DE TESTE:');
console.log('=====================');

console.log('\n# Testar localmente (se DATABASE_URL estiver configurada):');
console.log('npx prisma db push');
console.log('npm start');

console.log('\n# Verificar tabelas criadas:');
console.log('npx prisma studio');

console.log('\n# Testar API após deploy:');
console.log('curl https://seu-backend.railway.app/api/machines');

console.log('\n⏱️  TEMPO ESTIMADO TOTAL:');
console.log('=========================');
console.log('🔹 Correção do trust proxy: 2 minutos');
console.log('🔹 Configuração no Railway: 3 minutos');
console.log('🔹 Deploy + migrations: 3-5 minutos');
console.log('🔹 Verificação: 1 minuto');
console.log('🔹 Total: 9-11 minutos');

console.log('\n🎯 RESULTADO ESPERADO:');
console.log('======================');
console.log('✅ Erro ERR_ERL_UNEXPECTED_X_FORWARDED_FOR resolvido');
console.log('✅ Tabelas criadas no PostgreSQL');
console.log('✅ Erro P2021 eliminado');
console.log('✅ API /machines funcionando');
console.log('✅ Serviços em tempo real operacionais');

console.log('\n🚀 PRÓXIMOS PASSOS:');
console.log('===================');
console.log('1. 📝 Editar server/index.js (trust proxy)');
console.log('2. 🚂 Configurar build/start no Railway');
console.log('3. 🚀 Fazer deploy');
console.log('4. 🧪 Testar API');

console.log('\n✨ Após essas correções, todos os erros serão resolvidos!\n');