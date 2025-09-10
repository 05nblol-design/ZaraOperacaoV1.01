const fs = require('fs');
const path = require('path');

console.log('🚂 CORREÇÃO RAILWAY - Diagnóstico e Soluções');
console.log('=' .repeat(60));

// Verificar arquivos de configuração
const configFiles = [
  { path: '../Dockerfile', name: 'Dockerfile' },
  { path: '../railway.toml', name: 'railway.toml' },
  { path: './railway.json', name: 'railway.json' },
  { path: './package.json', name: 'package.json' },
  { path: './prisma/schema.prisma', name: 'schema.prisma' }
];

console.log('\n📁 VERIFICANDO ARQUIVOS DE CONFIGURAÇÃO:');
configFiles.forEach(file => {
  if (fs.existsSync(file.path)) {
    console.log(`✅ ${file.name}`);
  } else {
    console.log(`❌ ${file.name} - FALTANDO!`);
  }
});

// Verificar package.json
console.log('\n📦 VERIFICANDO PACKAGE.JSON:');
try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  
  console.log(`✅ Nome: ${packageJson.name}`);
  console.log(`✅ Versão: ${packageJson.version}`);
  
  // Verificar scripts essenciais
  const requiredScripts = ['start', 'dev'];
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`✅ Script '${script}': ${packageJson.scripts[script]}`);
    } else {
      console.log(`❌ Script '${script}' não encontrado!`);
    }
  });
  
  // Verificar dependências críticas
  const criticalDeps = ['express', 'prisma', '@prisma/client'];
  criticalDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`✅ Dependência '${dep}': ${packageJson.dependencies[dep]}`);
    } else if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      console.log(`✅ DevDependência '${dep}': ${packageJson.devDependencies[dep]}`);
    } else {
      console.log(`❌ Dependência '${dep}' não encontrada!`);
    }
  });
  
} catch (error) {
  console.log(`❌ Erro ao ler package.json: ${error.message}`);
}

// Verificar Prisma Schema
console.log('\n🗄️ VERIFICANDO PRISMA SCHEMA:');
try {
  const schemaContent = fs.readFileSync('./prisma/schema.prisma', 'utf8');
  
  if (schemaContent.includes('provider = "postgresql"')) {
    console.log('✅ Provider PostgreSQL configurado');
  } else {
    console.log('❌ Provider PostgreSQL não encontrado!');
  }
  
  if (schemaContent.includes('env("DATABASE_URL")')) {
    console.log('✅ DATABASE_URL configurada no schema');
  } else {
    console.log('❌ DATABASE_URL não configurada no schema!');
  }
  
} catch (error) {
  console.log(`❌ Erro ao ler schema.prisma: ${error.message}`);
}

// Verificar railway.toml
console.log('\n🚂 VERIFICANDO RAILWAY.TOML:');
try {
  const railwayToml = fs.readFileSync('../railway.toml', 'utf8');
  
  if (railwayToml.includes('buildContext = "server"')) {
    console.log('✅ Build context configurado para "server"');
  } else {
    console.log('❌ Build context não configurado!');
  }
  
  if (railwayToml.includes('startCommand = "npm start"')) {
    console.log('✅ Start command configurado');
  } else {
    console.log('❌ Start command não configurado!');
  }
  
  if (railwayToml.includes('healthcheckPath = "/api/health"')) {
    console.log('✅ Health check configurado');
  } else {
    console.log('❌ Health check não configurado!');
  }
  
} catch (error) {
  console.log(`❌ Erro ao ler railway.toml: ${error.message}`);
}

// Soluções recomendadas
console.log('\n🔧 SOLUÇÕES RECOMENDADAS:');
console.log('=' .repeat(50));

console.log('\n1. 🌐 CONFIGURAR VARIÁVEIS DE AMBIENTE NO RAILWAY:');
console.log('   Acesse o Railway Dashboard → Variables e adicione:');
console.log('');
console.log('   DATABASE_URL=postgresql://postgres:senha@host:5432/railway');
console.log('   NODE_ENV=production');
console.log('   PORT=5000');
console.log('   JWT_SECRET=seu-jwt-secret-super-seguro');
console.log('   CORS_ORIGINS=https://sistema-zara-frontend.vercel.app');
console.log('   CLIENT_URL=https://sistema-zara-frontend.vercel.app');
console.log('');

console.log('2. 🔄 REDEPLOYAR O SERVIÇO:');
console.log('   - No Railway Dashboard, clique em "Deploy"');
console.log('   - Ou faça um novo commit e push para trigger o deploy');
console.log('');

console.log('3. 🗄️ VERIFICAR POSTGRESQL:');
console.log('   - Certifique-se que o PostgreSQL está rodando no Railway');
console.log('   - Verifique se a DATABASE_URL está correta');
console.log('   - Execute as migrações: npx prisma migrate deploy');
console.log('');

console.log('4. 🧪 TESTAR ENDPOINTS:');
console.log('   Após o deploy, teste:');
console.log('   - https://seu-app.railway.app/api/health');
console.log('   - https://seu-app.railway.app/api/quality-tests');
console.log('   - https://seu-app.railway.app/api/reports');
console.log('');

console.log('5. 🔍 VERIFICAR LOGS:');
console.log('   - No Railway Dashboard, vá em "Deployments"');
console.log('   - Clique no último deploy e verifique os logs');
console.log('   - Procure por erros de build ou runtime');
console.log('');

// Criar arquivo de exemplo de variáveis
const envExample = `# VARIÁVEIS DE AMBIENTE PARA RAILWAY
# Copie estas variáveis para o Railway Dashboard → Variables

# Database
DATABASE_URL=postgresql://postgres:senha@host.railway.app:5432/railway

# Servidor
NODE_ENV=production
PORT=5000

# JWT
JWT_SECRET=seu-jwt-secret-super-seguro-aqui
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGINS=https://sistema-zara-frontend.vercel.app
CLIENT_URL=https://sistema-zara-frontend.vercel.app

# Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/tmp/uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session
SESSION_SECRET=seu-session-secret-super-seguro
TRUST_PROXY=true
SECURE_COOKIES=true

# App Info
APP_NAME=Sistema ZARA
APP_VERSION=1.0.1
`;

fs.writeFileSync('.env.railway.example', envExample);
console.log('📝 Arquivo .env.railway.example criado com as variáveis necessárias!');

console.log('\n✅ DIAGNÓSTICO CONCLUÍDO!');
console.log('\n🎯 PRÓXIMOS PASSOS:');
console.log('1. Configure as variáveis de ambiente no Railway Dashboard');
console.log('2. Faça um redeploy do serviço');
console.log('3. Aguarde o build completar');
console.log('4. Teste os endpoints da API');
console.log('5. Verifique se o frontend consegue conectar');

console.log('\n🔗 LINKS ÚTEIS:');
console.log('- Railway Dashboard: https://railway.app/dashboard');
console.log('- Documentação Railway: https://docs.railway.app');
console.log('- Prisma Railway Guide: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-railway');