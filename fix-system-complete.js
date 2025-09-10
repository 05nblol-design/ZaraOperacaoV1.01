#!/usr/bin/env node

/**
 * Script completo para corrigir todos os problemas do sistema:
 * 1. Atualizar URLs do Railway
 * 2. Corrigir erro 'acc is not defined' no Vercel
 * 3. Testar todos os endpoints
 * 4. Forçar redeploy do Vercel
 */

const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');

const CORRECT_RAILWAY_URL = 'https://zara-backend-production-aab3.up.railway.app';
const WRONG_RAILWAY_URL = 'https://zaraoperacaov101-production.up.railway.app';
const VERCEL_URL = 'https://zara-operacao-v1-01.vercel.app';

function updateEnvironmentFiles() {
  console.log('🔧 ATUALIZANDO ARQUIVOS DE AMBIENTE');
  console.log('=' .repeat(50));
  
  const envFiles = [
    './frontend/.env.production',
    './frontend/.env.local',
    './frontend/.env'
  ];
  
  envFiles.forEach(envFile => {
    if (fs.existsSync(envFile)) {
      console.log(`📝 Atualizando ${envFile}`);
      
      let content = fs.readFileSync(envFile, 'utf8');
      
      // Substituir URL incorreta pela correta
      const originalContent = content;
      content = content.replace(
        new RegExp(WRONG_RAILWAY_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        CORRECT_RAILWAY_URL
      );
      
      // Garantir que a URL correta está presente
      if (!content.includes(CORRECT_RAILWAY_URL)) {
        if (content.includes('VITE_API_URL=')) {
          content = content.replace(
            /VITE_API_URL=.*/g,
            `VITE_API_URL=${CORRECT_RAILWAY_URL}/api`
          );
        } else {
          content += `\nVITE_API_URL=${CORRECT_RAILWAY_URL}/api\n`;
        }
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(envFile, content);
        console.log(`   ✅ ${envFile} atualizado`);
      } else {
        console.log(`   ℹ️ ${envFile} já estava correto`);
      }
    }
  });
}

function fixAccUndefinedError() {
  console.log('\n🐛 CORRIGINDO ERRO "acc is not defined"');
  console.log('=' .repeat(50));
  
  const filesToCheck = [
    './frontend/src/hooks/useMachineStatus.jsx',
    './frontend/src/components/Dashboard/MachineStatus.jsx',
    './frontend/src/utils/calculations.js'
  ];
  
  filesToCheck.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      console.log(`🔍 Verificando ${filePath}`);
      
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Padrões problemáticos para corrigir
      const fixes = [
        {
          pattern: /\.reduce\(\s*\(\s*([^,\s]+)\s*,/g,
          replacement: '.reduce((acc,',
          description: 'Padronizar parâmetro accumulator para "acc"'
        },
        {
          pattern: /\.reduce\(\s*\(\s*total\s*,/g,
          replacement: '.reduce((acc,',
          description: 'Substituir "total" por "acc"'
        },
        {
          pattern: /\.reduce\(\s*\(\s*sum\s*,/g,
          replacement: '.reduce((acc,',
          description: 'Substituir "sum" por "acc"'
        },
        {
          pattern: /\.reduce\(\s*\(\s*count\s*,/g,
          replacement: '.reduce((acc,',
          description: 'Substituir "count" por "acc"'
        },
        {
          pattern: /return\s+total\s*\+/g,
          replacement: 'return acc +',
          description: 'Corrigir return com "total"'
        },
        {
          pattern: /return\s+sum\s*\+/g,
          replacement: 'return acc +',
          description: 'Corrigir return com "sum"'
        },
        {
          pattern: /return\s+count\s*\+/g,
          replacement: 'return acc +',
          description: 'Corrigir return com "count"'
        }
      ];
      
      let hasChanges = false;
      fixes.forEach(fix => {
        if (fix.pattern.test(content)) {
          content = content.replace(fix.pattern, fix.replacement);
          console.log(`   ✅ ${fix.description}`);
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        fs.writeFileSync(filePath, content);
        console.log(`   💾 Arquivo salvo: ${filePath}`);
      } else {
        console.log(`   ℹ️ Nenhuma correção necessária em ${filePath}`);
      }
    } else {
      console.log(`   ⚠️ Arquivo não encontrado: ${filePath}`);
    }
  });
}

function testAllEndpoints() {
  console.log('\n🧪 TESTANDO TODOS OS ENDPOINTS');
  console.log('=' .repeat(50));
  
  const endpoints = [
    { url: `${CORRECT_RAILWAY_URL}/api/health`, name: 'Health Check' },
    { url: `${CORRECT_RAILWAY_URL}/api/auth/login`, name: 'Auth Login', method: 'POST' },
    { url: `${CORRECT_RAILWAY_URL}/api/machines`, name: 'Machines List' },
    { url: `${CORRECT_RAILWAY_URL}/api/users`, name: 'Users List' },
    { url: `${CORRECT_RAILWAY_URL}/api/production`, name: 'Production Data' },
    { url: `${CORRECT_RAILWAY_URL}/api/reports`, name: 'Reports' }
  ];
  
  return Promise.all(endpoints.map(endpoint => {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const req = https.request(endpoint.url, {
        method: endpoint.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'System-Health-Check/1.0'
        }
      }, (res) => {
        const responseTime = Date.now() - startTime;
        let data = '';
        
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const status = res.statusCode;
          const isOk = status >= 200 && status < 400;
          
          console.log(`${isOk ? '✅' : '❌'} ${endpoint.name}: ${status} (${responseTime}ms)`);
          
          resolve({
            name: endpoint.name,
            url: endpoint.url,
            status,
            responseTime,
            isOk,
            data: data.substring(0, 200)
          });
        });
      });
      
      req.on('error', (err) => {
        console.log(`❌ ${endpoint.name}: ERRO - ${err.message}`);
        resolve({
          name: endpoint.name,
          url: endpoint.url,
          status: 0,
          error: err.message,
          isOk: false
        });
      });
      
      req.setTimeout(10000, () => {
        req.destroy();
        console.log(`⏰ ${endpoint.name}: TIMEOUT`);
        resolve({
          name: endpoint.name,
          url: endpoint.url,
          status: 0,
          error: 'Timeout',
          isOk: false
        });
      });
      
      if (endpoint.method === 'POST') {
        req.write(JSON.stringify({
          email: 'test@example.com',
          password: 'test123'
        }));
      }
      
      req.end();
    });
  }));
}

function generateVercelRedeployInstructions() {
  console.log('\n🚀 INSTRUÇÕES PARA REDEPLOY DO VERCEL');
  console.log('=' .repeat(50));
  
  console.log('\n1. 🔄 REDEPLOY AUTOMÁTICO (Git):');
  console.log('   git add .');
  console.log('   git commit -m "fix: corrigir URLs Railway e erro acc is not defined"');
  console.log('   git push origin main');
  console.log('   (Vercel fará redeploy automático)');
  
  console.log('\n2. 🎯 REDEPLOY MANUAL (Dashboard):');
  console.log('   a) Acesse: https://vercel.com/dashboard');
  console.log('   b) Encontre o projeto "zara-operacao-v1-01"');
  console.log('   c) Vá em "Deployments"');
  console.log('   d) Clique "Redeploy" na última deployment');
  
  console.log('\n3. 🔧 FORÇAR REBUILD (CLI):');
  console.log('   npx vercel --prod --force');
  
  console.log('\n4. 🧪 TESTAR APÓS DEPLOY:');
  console.log(`   a) Acesse: ${VERCEL_URL}`);
  console.log('   b) Verifique se não há mais erros "acc is not defined"');
  console.log('   c) Teste login e carregamento de dados das máquinas');
}

function createGitCommitScript() {
  console.log('\n📝 CRIANDO SCRIPT DE COMMIT AUTOMÁTICO');
  console.log('-' .repeat(40));
  
  const commitScript = `@echo off
echo 🚀 Fazendo commit das correções...
git add .
git status
echo.
echo Commit message: "fix: corrigir URLs Railway e erro acc is not defined"
git commit -m "fix: corrigir URLs Railway e erro acc is not defined"
echo.
echo 📤 Fazendo push...
git push origin main
echo.
echo ✅ Deploy automático iniciado no Vercel!
echo 🔗 Verifique: https://vercel.com/dashboard
pause
`;
  
  fs.writeFileSync('commit-fixes.bat', commitScript);
  console.log('✅ Script criado: commit-fixes.bat');
  console.log('   Execute: .\\commit-fixes.bat');
}

async function main() {
  console.log('🔧 CORREÇÃO COMPLETA DO SISTEMA ZARA');
  console.log('=' .repeat(60));
  console.log('Corrigindo Railway URLs e erro "acc is not defined"...');
  
  try {
    // 1. Atualizar arquivos de ambiente
    updateEnvironmentFiles();
    
    // 2. Corrigir erro "acc is not defined"
    fixAccUndefinedError();
    
    // 3. Testar endpoints do Railway
    console.log('\n⏳ Testando endpoints (aguarde...)\n');
    const testResults = await testAllEndpoints();
    
    // 4. Análise dos resultados
    console.log('\n📊 RESUMO DOS TESTES:');
    console.log('-' .repeat(30));
    
    const workingEndpoints = testResults.filter(r => r.isOk).length;
    const totalEndpoints = testResults.length;
    
    console.log(`✅ Funcionando: ${workingEndpoints}/${totalEndpoints}`);
    console.log(`❌ Com problemas: ${totalEndpoints - workingEndpoints}/${totalEndpoints}`);
    
    if (workingEndpoints === totalEndpoints) {
      console.log('🎉 Todos os endpoints estão funcionando!');
    } else {
      console.log('⚠️ Alguns endpoints ainda têm problemas');
    }
    
    // 5. Gerar instruções de redeploy
    generateVercelRedeployInstructions();
    
    // 6. Criar script de commit
    createGitCommitScript();
    
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('1. Execute: .\\commit-fixes.bat (para commit automático)');
    console.log('2. Aguarde o redeploy do Vercel (2-3 minutos)');
    console.log(`3. Teste: ${VERCEL_URL}`);
    console.log('4. Verifique se os erros foram corrigidos');
    
  } catch (error) {
    console.error('❌ Erro durante correção:', error.message);
  }
}

// Executar correção completa
main().catch(console.error);