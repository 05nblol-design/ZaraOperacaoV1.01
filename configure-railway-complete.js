#!/usr/bin/env node

/**
 * CONFIGURAÇÃO COMPLETA RAILWAY
 * Backend + Frontend + PostgreSQL
 */

console.log('🚀 CONFIGURAÇÃO COMPLETA RAILWAY - Backend + Frontend');
console.log('=' .repeat(60));

// Configurações do Backend
const backendConfig = {
    name: 'Backend (Node.js + Prisma)',
    variables: {
        // Database
        'DATABASE_URL': 'postgresql://postgres:senha@host.railway.app:5432/railway',
        
        // Servidor
        'PORT': '5000',
        'NODE_ENV': 'production',
        
        // JWT
        'JWT_SECRET': 'seu_jwt_secret_super_seguro_aqui_' + Math.random().toString(36).substring(7),
        'JWT_EXPIRES_IN': '7d',
        
        // CORS
        'CORS_ORIGIN': 'https://seu-frontend.railway.app',
        
        // Rate Limiting
        'RATE_LIMIT_WINDOW_MS': '900000',
        'RATE_LIMIT_MAX_REQUESTS': '100',
        
        // Upload
        'MAX_FILE_SIZE': '10485760',
        'UPLOAD_PATH': '/tmp/uploads'
    },
    buildCommand: 'npm install && npx prisma generate && npx prisma db push',
    startCommand: 'npm start'
};

// Configurações do Frontend
const frontendConfig = {
    name: 'Frontend (React + Vite)',
    variables: {
        // URLs de Conexão
        'VITE_API_URL': 'https://seu-backend.railway.app',
        'VITE_SOCKET_URL': 'https://seu-backend.railway.app',
        
        // Configurações da Aplicação
        'VITE_APP_NAME': 'Sistema ZARA',
        'VITE_APP_VERSION': '1.0.1',
        'VITE_NODE_ENV': 'production',
        
        // Configurações de Build
        'VITE_BUILD_SOURCEMAP': 'false',
        'VITE_BUILD_MINIFY': 'true',
        
        // URLs Locais (desenvolvimento)
        'VITE_API_URL_LOCAL': 'http://localhost:5000/api',
        'VITE_SOCKET_URL_LOCAL': 'http://localhost:3001'
    },
    buildCommand: 'npm install && npm run build',
    startCommand: 'npm run preview'
};

console.log('\n🔧 CONFIGURAÇÃO DO BACKEND:');
console.log(`   Serviço: ${backendConfig.name}`);
console.log(`   Build: ${backendConfig.buildCommand}`);
console.log(`   Start: ${backendConfig.startCommand}`);
console.log('\n   📋 Variáveis de Ambiente:');
Object.entries(backendConfig.variables).forEach(([key, value]) => {
    const displayValue = key.includes('SECRET') ? '***HIDDEN***' : value;
    console.log(`      ${key}=${displayValue}`);
});

console.log('\n🎨 CONFIGURAÇÃO DO FRONTEND:');
console.log(`   Serviço: ${frontendConfig.name}`);
console.log(`   Build: ${frontendConfig.buildCommand}`);
console.log(`   Start: ${frontendConfig.startCommand}`);
console.log('\n   📋 Variáveis de Ambiente:');
Object.entries(frontendConfig.variables).forEach(([key, value]) => {
    console.log(`      ${key}=${value}`);
});

console.log('\n🚨 CORREÇÃO URGENTE NECESSÁRIA:');
console.log('   ❌ DATABASE_URL atual: host:5432 (INVÁLIDA)');
console.log('   ✅ DATABASE_URL correta: postgresql://postgres:senha@host.railway.app:5432/railway');
console.log('\n   🔧 PASSOS PARA CORREÇÃO:');
console.log('   1. Acesse: https://railway.app');
console.log('   2. Projeto: ZaraOperacaoV1.01');
console.log('   3. PostgreSQL → Connect → Copie Database URL');
console.log('   4. Backend → Variables → Substitua DATABASE_URL');
console.log('   5. Deploy Backend');

console.log('\n📝 SEQUÊNCIA DE DEPLOY:');
console.log('\n   🔄 PASSO 1: Corrigir Backend');
console.log('      → Corrigir DATABASE_URL no Railway Dashboard');
console.log('      → Verificar todas as variáveis de ambiente');
console.log('      → Fazer redeploy do backend');
console.log('      → Testar: https://seu-backend.railway.app/api/health');

console.log('\n   🔄 PASSO 2: Configurar Frontend');
console.log('      → Criar novo serviço no Railway');
console.log('      → Conectar repositório (pasta frontend)');
console.log('      → Configurar variáveis de ambiente');
console.log('      → Fazer deploy');
console.log('      → Testar: https://seu-frontend.railway.app');

console.log('\n   🔄 PASSO 3: Conectar Serviços');
console.log('      → Obter URL real do backend Railway');
console.log('      → Atualizar VITE_API_URL no frontend');
console.log('      → Obter URL real do frontend Railway');
console.log('      → Atualizar CORS_ORIGIN no backend');
console.log('      → Redeploy ambos os serviços');

console.log('\n✅ VERIFICAÇÃO FINAL:');
console.log('   Backend: GET https://seu-backend.railway.app/api/health');
console.log('   Resposta: {"status": "ok", "database": "connected"}');
console.log('   Frontend: https://seu-frontend.railway.app');
console.log('   Login: Deve funcionar e carregar dados');

console.log('\n⏱️  TEMPO ESTIMADO TOTAL: 15-23 minutos');
console.log('   → Correção DATABASE_URL: 2-3 min');
console.log('   → Deploy Backend: 3-5 min');
console.log('   → Configuração Frontend: 5-7 min');
console.log('   → Deploy Frontend: 3-5 min');
console.log('   → Testes finais: 2-3 min');

console.log('\n🎯 PRÓXIMO PASSO CRÍTICO:');
console.log('   🚨 Acesse https://railway.app AGORA!');
console.log('   🔥 Corrija a DATABASE_URL IMEDIATAMENTE!');
console.log('   ✨ Sem isso, nada funcionará!');

console.log('\n' + '=' .repeat(60));
console.log('🚀 Configuração documentada - Pronto para Railway!');