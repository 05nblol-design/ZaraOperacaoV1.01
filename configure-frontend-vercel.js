#!/usr/bin/env node

/**
 * 🚀 CONFIGURAÇÃO FRONTEND VERCEL
 * 
 * Configura o frontend para deploy no Vercel com dados do backend Railway
 */

const fs = require('fs');
const path = require('path');

// URLs do backend Railway
const RAILWAY_BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';
const RAILWAY_API_URL = `${RAILWAY_BACKEND_URL}/api`;
const RAILWAY_SOCKET_URL = RAILWAY_BACKEND_URL;

console.log('\n🚀 CONFIGURANDO FRONTEND VERCEL COM DADOS RAILWAY...');
console.log(`🎯 Backend Railway: ${RAILWAY_BACKEND_URL}`);

// 1. Atualizar .env.production
const envProductionPath = path.join(__dirname, 'frontend', '.env.production');
const envProductionContent = `# Configuração da API para Produção - Railway Backend
# Backend Railway: ${RAILWAY_BACKEND_URL}
VITE_API_URL=${RAILWAY_API_URL}
VITE_SOCKET_URL=${RAILWAY_SOCKET_URL}

# Configurações do aplicativo
VITE_APP_NAME=Sistema ZARA
VITE_APP_VERSION=1.0.1
VITE_NODE_ENV=production
VITE_ENVIRONMENT=production

# Configurações de build
VITE_BUILD_SOURCEMAP=false
VITE_BUILD_MINIFY=true

# Configurações de segurança
VITE_SECURE_COOKIES=true
VITE_HTTPS_ONLY=true

# Configurações de API
VITE_API_TIMEOUT=30000
VITE_MAX_RETRIES=3

# URLs específicas do Railway
VITE_BACKEND_URL=${RAILWAY_BACKEND_URL}
VITE_HEALTH_CHECK_URL=${RAILWAY_API_URL}/health
VITE_AUTH_URL=${RAILWAY_API_URL}/auth
VITE_USERS_URL=${RAILWAY_API_URL}/users
VITE_MACHINES_URL=${RAILWAY_API_URL}/machines
VITE_PRODUCTION_URL=${RAILWAY_API_URL}/production
VITE_REPORTS_URL=${RAILWAY_API_URL}/reports
`;

fs.writeFileSync(envProductionPath, envProductionContent);
console.log('✅ .env.production atualizado com dados Railway');

// 2. Criar .env.vercel (para variáveis do Vercel)
const envVercelPath = path.join(__dirname, 'frontend', '.env.vercel');
const envVercelContent = `# Variáveis de ambiente para Vercel
# Estas variáveis devem ser configuradas no Vercel Dashboard

# URLs do Backend Railway
VITE_API_URL=${RAILWAY_API_URL}
VITE_SOCKET_URL=${RAILWAY_SOCKET_URL}
VITE_BACKEND_URL=${RAILWAY_BACKEND_URL}

# Configurações da aplicação
VITE_APP_NAME=Sistema ZARA
VITE_APP_VERSION=1.0.1
VITE_NODE_ENV=production
VITE_ENVIRONMENT=production

# Build settings
VITE_BUILD_SOURCEMAP=false
VITE_BUILD_MINIFY=true

# Security settings
VITE_SECURE_COOKIES=true
VITE_HTTPS_ONLY=true

# API settings
VITE_API_TIMEOUT=30000
VITE_MAX_RETRIES=3
`;

fs.writeFileSync(envVercelPath, envVercelContent);
console.log('✅ .env.vercel criado para configuração no Vercel Dashboard');

// 3. Atualizar vercel.json
const vercelJsonPath = path.join(__dirname, 'frontend', 'vercel.json');
const vercelConfig = {
  "name": "zara-frontend",
  "version": 2,
  "installCommand": "npm install --legacy-peer-deps",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "regions": ["gru1"],
  "env": {
    "VITE_API_URL": RAILWAY_API_URL,
    "VITE_SOCKET_URL": RAILWAY_SOCKET_URL,
    "VITE_BACKEND_URL": RAILWAY_BACKEND_URL,
    "VITE_APP_NAME": "Sistema ZARA",
    "VITE_APP_VERSION": "1.0.1",
    "VITE_NODE_ENV": "production",
    "VITE_ENVIRONMENT": "production",
    "VITE_BUILD_SOURCEMAP": "false",
    "VITE_BUILD_MINIFY": "true",
    "VITE_SECURE_COOKIES": "true",
    "VITE_HTTPS_ONLY": "true",
    "VITE_API_TIMEOUT": "30000",
    "VITE_MAX_RETRIES": "3"
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        },
        {
          "key": "Content-Security-Policy",
          "value": `default-src 'self'; connect-src 'self' ${RAILWAY_BACKEND_URL} ${RAILWAY_API_URL} wss://*.railway.app ws://*.railway.app; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;`
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "functions": {
    "app/api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  }
};

fs.writeFileSync(vercelJsonPath, JSON.stringify(vercelConfig, null, 2));
console.log('✅ vercel.json atualizado com configurações Railway');

// 4. Criar arquivo de configuração do Vite para produção
const viteConfigPath = path.join(__dirname, 'frontend', 'vite.config.js');
if (fs.existsSync(viteConfigPath)) {
  const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf8');
  
  // Verificar se já tem configurações de produção
  if (!viteConfigContent.includes('RAILWAY_BACKEND_URL')) {
    const updatedViteConfig = viteConfigContent.replace(
      'export default defineConfig({',
      `// Railway Backend Configuration
const RAILWAY_BACKEND_URL = '${RAILWAY_BACKEND_URL}';
const RAILWAY_API_URL = '${RAILWAY_API_URL}';

export default defineConfig({`
    );
    
    fs.writeFileSync(viteConfigPath, updatedViteConfig);
    console.log('✅ vite.config.js atualizado com URLs Railway');
  }
}

// 5. Criar script de deploy para Vercel
const deployScriptPath = path.join(__dirname, 'deploy-vercel.js');
const deployScriptContent = `#!/usr/bin/env node

/**
 * 🚀 DEPLOY FRONTEND NO VERCEL
 * 
 * Script para fazer deploy do frontend no Vercel
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('\\n🚀 INICIANDO DEPLOY NO VERCEL...');

// Navegar para o diretório do frontend
process.chdir(path.join(__dirname, 'frontend'));

try {
  // 1. Instalar dependências
  console.log('📦 Instalando dependências...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  
  // 2. Build do projeto
  console.log('🔨 Fazendo build do projeto...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // 3. Deploy no Vercel (se CLI estiver instalada)
  console.log('🚀 Fazendo deploy no Vercel...');
  try {
    execSync('vercel --prod', { stdio: 'inherit' });
    console.log('\\n✅ Deploy realizado com sucesso!');
  } catch (error) {
    console.log('\\n⚠️  Vercel CLI não encontrada. Faça o deploy manual:');
    console.log('1. 🌐 Acesse: https://vercel.com');
    console.log('2. 📁 Conecte o repositório');
    console.log('3. ⚙️  Configure as variáveis de ambiente');
    console.log('4. 🚀 Deploy automático');
  }
  
} catch (error) {
  console.error('❌ Erro durante o deploy:', error.message);
  process.exit(1);
}
`;

fs.writeFileSync(deployScriptPath, deployScriptContent);
console.log('✅ Script de deploy criado: deploy-vercel.js');

// 6. Resumo das configurações
console.log('\n📋 RESUMO DAS CONFIGURAÇÕES:');
console.log('\n🔧 ARQUIVOS ATUALIZADOS:');
console.log('   ✅ frontend/.env.production');
console.log('   ✅ frontend/.env.vercel');
console.log('   ✅ frontend/vercel.json');
console.log('   ✅ frontend/vite.config.js');
console.log('   ✅ deploy-vercel.js');

console.log('\n🌐 URLS CONFIGURADAS:');
console.log(`   🎯 Backend: ${RAILWAY_BACKEND_URL}`);
console.log(`   🔌 API: ${RAILWAY_API_URL}`);
console.log(`   📡 Socket: ${RAILWAY_SOCKET_URL}`);

console.log('\n🚀 PRÓXIMOS PASSOS:');
console.log('1. 🧪 Teste o build: cd frontend && npm run build');
console.log('2. 🌐 Acesse Vercel: https://vercel.com');
console.log('3. 📁 Conecte o repositório GitHub');
console.log('4. ⚙️  Configure variáveis de ambiente (copie de .env.vercel)');
console.log('5. 🚀 Deploy automático será iniciado');

console.log('\n📋 VARIÁVEIS PARA VERCEL DASHBOARD:');
const envVars = [
  `VITE_API_URL=${RAILWAY_API_URL}`,
  `VITE_SOCKET_URL=${RAILWAY_SOCKET_URL}`,
  `VITE_BACKEND_URL=${RAILWAY_BACKEND_URL}`,
  'VITE_APP_NAME=Sistema ZARA',
  'VITE_APP_VERSION=1.0.1',
  'VITE_NODE_ENV=production',
  'VITE_ENVIRONMENT=production'
];

envVars.forEach(envVar => {
  console.log(`   📝 ${envVar}`);
});

console.log('\n============================================================');
console.log('🎉 FRONTEND CONFIGURADO PARA VERCEL COM DADOS RAILWAY!');
console.log('============================================================\n');