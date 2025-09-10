const fs = require('fs');
const path = require('path');

console.log('🌐 CORREÇÃO FRONTEND - Erros de Conexão com API');
console.log('=' .repeat(60));

// URLs corretas
const RAILWAY_BACKEND_URL = 'https://sistema-zara-backend-production.up.railway.app';
const VERCEL_FRONTEND_URL = 'https://sistema-zara-frontend.vercel.app';

// Verificar arquivos de configuração do frontend
const frontendFiles = [
  { path: './package.json', name: 'package.json' },
  { path: './vercel.json', name: 'vercel.json' },
  { path: './src/services/api.js', name: 'api.js' },
  { path: './vite.config.js', name: 'vite.config.js' },
  { path: './.env.example', name: '.env.example' }
];

console.log('\n📁 VERIFICANDO ARQUIVOS DO FRONTEND:');
frontendFiles.forEach(file => {
  if (fs.existsSync(file.path)) {
    console.log(`✅ ${file.name}`);
  } else {
    console.log(`❌ ${file.name} - FALTANDO!`);
  }
});

// Verificar configuração da API
console.log('\n🔌 VERIFICANDO CONFIGURAÇÃO DA API:');
try {
  const apiContent = fs.readFileSync('./src/services/api.js', 'utf8');
  
  if (apiContent.includes('localhost')) {
    console.log('⚠️  Detectado localhost na configuração da API');
  }
  
  if (apiContent.includes('railway.app')) {
    console.log('✅ URL do Railway encontrada na configuração');
  } else {
    console.log('❌ URL do Railway não encontrada!');
  }
  
  if (apiContent.includes('VITE_API_URL')) {
    console.log('✅ Variável VITE_API_URL configurada');
  } else {
    console.log('❌ Variável VITE_API_URL não encontrada!');
  }
  
} catch (error) {
  console.log(`❌ Erro ao ler api.js: ${error.message}`);
}

// Verificar vercel.json
console.log('\n🚀 VERIFICANDO VERCEL.JSON:');
try {
  const vercelConfig = JSON.parse(fs.readFileSync('./vercel.json', 'utf8'));
  
  if (vercelConfig.env) {
    console.log('✅ Variáveis de ambiente configuradas no Vercel');
    Object.keys(vercelConfig.env).forEach(key => {
      console.log(`   - ${key}: ${vercelConfig.env[key]}`);
    });
  } else {
    console.log('❌ Variáveis de ambiente não configuradas no Vercel!');
  }
  
  if (vercelConfig.headers) {
    console.log('✅ Headers configurados (incluindo CSP)');
  }
  
} catch (error) {
  console.log(`❌ Erro ao ler vercel.json: ${error.message}`);
}

// Criar configuração corrigida para o Vercel
const vercelConfigFixed = {
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "env": {
    "VITE_API_URL": RAILWAY_BACKEND_URL,
    "VITE_SOCKET_URL": RAILWAY_BACKEND_URL,
    "VITE_BACKEND_URL": RAILWAY_BACKEND_URL,
    "VITE_APP_NAME": "Sistema ZARA",
    "VITE_APP_VERSION": "1.0.1"
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
          "key": "Content-Security-Policy",
          "value": `default-src 'self'; connect-src 'self' ${RAILWAY_BACKEND_URL} ${RAILWAY_BACKEND_URL}/api wss://*.railway.app ws://*.railway.app; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;`
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
  ]
};

// Salvar configuração corrigida
fs.writeFileSync('./vercel.json.fixed', JSON.stringify(vercelConfigFixed, null, 2));
console.log('\n📝 Arquivo vercel.json.fixed criado com configurações corretas!');

// Criar arquivo .env.production
const envProduction = `# VARIÁVEIS DE AMBIENTE PARA PRODUÇÃO (VERCEL)
# Estas variáveis devem ser configuradas no Vercel Dashboard

# URLs da API
VITE_API_URL=${RAILWAY_BACKEND_URL}
VITE_SOCKET_URL=${RAILWAY_BACKEND_URL}
VITE_BACKEND_URL=${RAILWAY_BACKEND_URL}

# Informações da Aplicação
VITE_APP_NAME=Sistema ZARA
VITE_APP_VERSION=1.0.1

# Configurações de Desenvolvimento (apenas para referência)
# VITE_API_URL=http://localhost:5000
# VITE_SOCKET_URL=http://localhost:5000
`;

fs.writeFileSync('./.env.production', envProduction);
console.log('📝 Arquivo .env.production criado!');

// Verificar se precisa atualizar api.js
console.log('\n🔧 SOLUÇÕES PARA CORRIGIR OS ERROS:');
console.log('=' .repeat(50));

console.log('\n1. 🌐 ATUALIZAR VERCEL.JSON:');
console.log('   - Substitua o vercel.json atual pelo vercel.json.fixed');
console.log('   - Ou copie as configurações do arquivo .fixed');
console.log('');

console.log('2. 🔧 CONFIGURAR VARIÁVEIS NO VERCEL:');
console.log('   Acesse Vercel Dashboard → Settings → Environment Variables:');
console.log(`   - VITE_API_URL = ${RAILWAY_BACKEND_URL}`);
console.log(`   - VITE_SOCKET_URL = ${RAILWAY_BACKEND_URL}`);
console.log(`   - VITE_BACKEND_URL = ${RAILWAY_BACKEND_URL}`);
console.log('');

console.log('3. 🚂 VERIFICAR RAILWAY BACKEND:');
console.log('   - Certifique-se que o Railway está online');
console.log('   - Configure CORS_ORIGINS no Railway:');
console.log(`     CORS_ORIGINS=${VERCEL_FRONTEND_URL}`);
console.log(`     CLIENT_URL=${VERCEL_FRONTEND_URL}`);
console.log('');

console.log('4. 🔄 REDEPLOYAR AMBOS:');
console.log('   - Faça commit das alterações');
console.log('   - Push para o repositório');
console.log('   - Aguarde redeploy automático no Vercel');
console.log('   - Redeploy manual no Railway se necessário');
console.log('');

console.log('5. 🧪 TESTAR CONEXÃO:');
console.log('   Após os deploys, teste:');
console.log(`   - Frontend: ${VERCEL_FRONTEND_URL}`);
console.log(`   - Backend Health: ${RAILWAY_BACKEND_URL}/api/health`);
console.log(`   - API Quality: ${RAILWAY_BACKEND_URL}/api/quality-tests`);
console.log('');

// Comandos para execução
console.log('📋 COMANDOS PARA EXECUÇÃO:');
console.log('=' .repeat(30));
console.log('');
console.log('# 1. Atualizar configuração do Vercel');
console.log('cp vercel.json.fixed vercel.json');
console.log('');
console.log('# 2. Fazer commit das alterações');
console.log('git add .');
console.log('git commit -m "fix: update frontend configuration for Railway backend"');
console.log('git push origin main');
console.log('');
console.log('# 3. Aguardar redeploy automático');
console.log('# Vercel: automático via GitHub');
console.log('# Railway: automático via GitHub');
console.log('');

console.log('✅ CORREÇÃO DO FRONTEND CONCLUÍDA!');
console.log('');
console.log('🎯 PRÓXIMOS PASSOS:');
console.log('1. Substitua vercel.json pelo vercel.json.fixed');
console.log('2. Configure as variáveis de ambiente no Vercel Dashboard');
console.log('3. Configure CORS no Railway Dashboard');
console.log('4. Faça commit e push das alterações');
console.log('5. Aguarde os redeploys automáticos');
console.log('6. Teste a aplicação em produção');

console.log('\n🔗 LINKS ÚTEIS:');
console.log('- Vercel Dashboard: https://vercel.com/dashboard');
console.log('- Railway Dashboard: https://railway.app/dashboard');
console.log(`- Frontend: ${VERCEL_FRONTEND_URL}`);
console.log(`- Backend: ${RAILWAY_BACKEND_URL}`);