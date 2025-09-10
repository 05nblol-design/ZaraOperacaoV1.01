#!/usr/bin/env node

/**
 * Script para corrigir erro "Application not found" no Railway
 * - Verifica configuração do Railway
 * - Tenta reativar o serviço
 * - Fornece instruções para redeploy manual
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RAILWAY_URL = 'https://zaraoperacaov101-production.up.railway.app';
const BACKUP_RAILWAY_URL = 'https://zara-backend-production-aab3.up.railway.app';

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${description}: ${exists ? 'ENCONTRADO' : 'NÃO ENCONTRADO'}`);
  return exists;
}

function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

function checkRailwayConfig() {
  console.log('🔍 VERIFICANDO CONFIGURAÇÃO DO RAILWAY');
  console.log('=' .repeat(50));
  
  // Verificar arquivos de configuração
  const configFiles = [
    { path: './railway.toml', desc: 'Railway Config (railway.toml)' },
    { path: './server/.env.production', desc: 'Env Production' },
    { path: './server/.env.railway.example', desc: 'Env Railway Example' },
    { path: './server/Dockerfile', desc: 'Dockerfile do Server' },
    { path: './server/package.json', desc: 'Package.json do Server' }
  ];
  
  const foundFiles = [];
  configFiles.forEach(file => {
    if (checkFile(file.path, file.desc)) {
      foundFiles.push(file.path);
    }
  });
  
  return foundFiles;
}

function analyzeRailwayToml() {
  console.log('\n📋 ANÁLISE DO RAILWAY.TOML');
  console.log('-' .repeat(30));
  
  const tomlPath = './railway.toml';
  const content = readFileContent(tomlPath);
  
  if (!content) {
    console.log('❌ railway.toml não encontrado');
    return null;
  }
  
  console.log('✅ railway.toml encontrado');
  console.log('Conteúdo:');
  console.log(content);
  
  // Verificar configurações importantes
  const hasBuilder = content.includes('[build]');
  const hasStart = content.includes('start');
  const hasRoot = content.includes('root');
  
  console.log('\n📊 Análise:');
  console.log(`   Build config: ${hasBuilder ? '✅' : '❌'}`);
  console.log(`   Start command: ${hasStart ? '✅' : '❌'}`);
  console.log(`   Root directory: ${hasRoot ? '✅' : '❌'}`);
  
  return { hasBuilder, hasStart, hasRoot, content };
}

function checkServerDirectory() {
  console.log('\n🔍 VERIFICANDO DIRETÓRIO SERVER');
  console.log('-' .repeat(30));
  
  const serverPath = './server';
  if (!fs.existsSync(serverPath)) {
    console.log('❌ Diretório server não encontrado');
    return false;
  }
  
  console.log('✅ Diretório server encontrado');
  
  // Verificar arquivos essenciais
  const essentialFiles = [
    'index.js',
    'package.json',
    'Dockerfile'
  ];
  
  essentialFiles.forEach(file => {
    const filePath = path.join(serverPath, file);
    checkFile(filePath, `Server ${file}`);
  });
  
  // Verificar package.json
  const packagePath = path.join(serverPath, 'package.json');
  const packageContent = readFileContent(packagePath);
  
  if (packageContent) {
    try {
      const pkg = JSON.parse(packageContent);
      console.log('\n📦 Package.json info:');
      console.log(`   Nome: ${pkg.name || 'N/A'}`);
      console.log(`   Versão: ${pkg.version || 'N/A'}`);
      console.log(`   Start script: ${pkg.scripts?.start || 'N/A'}`);
      console.log(`   Main: ${pkg.main || 'N/A'}`);
    } catch (e) {
      console.log('⚠️ Erro ao ler package.json');
    }
  }
  
  return true;
}

function generateFixInstructions() {
  console.log('\n🛠️ INSTRUÇÕES PARA CORRIGIR RAILWAY');
  console.log('=' .repeat(50));
  
  console.log('\n1. 🔍 VERIFICAR STATUS NO DASHBOARD:');
  console.log('   a) Acesse: https://railway.app/dashboard');
  console.log('   b) Procure pelo projeto "ZaraOperacaoV1.01" ou similar');
  console.log('   c) Verifique se o serviço está ativo ou pausado');
  
  console.log('\n2. 🚀 REATIVAR SERVIÇO (se pausado):');
  console.log('   a) No dashboard, clique no projeto');
  console.log('   b) Clique em "Resume" ou "Deploy"');
  console.log('   c) Aguarde o deploy completar');
  
  console.log('\n3. 🔄 REDEPLOY COMPLETO (se necessário):');
  console.log('   a) No dashboard, vá em "Deployments"');
  console.log('   b) Clique em "Redeploy" na última deployment');
  console.log('   c) Ou clique em "Deploy" para novo deploy');
  
  console.log('\n4. 🔧 VERIFICAR CONFIGURAÇÕES:');
  console.log('   a) Variáveis de ambiente (DATABASE_URL, JWT_SECRET, etc.)');
  console.log('   b) Domínio personalizado (se configurado)');
  console.log('   c) Build e start commands');
  
  console.log('\n5. 📋 COMANDOS RAILWAY CLI (se instalado):');
  console.log('   railway login');
  console.log('   railway status');
  console.log('   railway deploy');
  
  console.log('\n6. 🆘 CRIAR NOVO SERVIÇO (último recurso):');
  console.log('   a) No dashboard, clique "New Project"');
  console.log('   b) Conecte ao repositório GitHub');
  console.log('   c) Configure variáveis de ambiente');
  console.log('   d) Atualize URLs no frontend');
}

function checkAlternativeURLs() {
  console.log('\n🔍 VERIFICANDO URLs ALTERNATIVAS');
  console.log('-' .repeat(30));
  
  // Verificar se há URLs alternativas no código
  const frontendEnvPath = './frontend/.env.production';
  const frontendEnvContent = readFileContent(frontendEnvPath);
  
  if (frontendEnvContent) {
    console.log('✅ Frontend .env.production encontrado');
    const urls = frontendEnvContent.match(/https:\/\/[^\s"']+/g) || [];
    console.log('URLs encontradas:');
    urls.forEach(url => console.log(`   - ${url}`));
  }
  
  // Verificar no HTML do Vercel (do relatório)
  console.log('\n📊 URL no Vercel CSP:');
  console.log('   - https://zara-backend-production-aab3.up.railway.app');
  console.log('   (Esta pode ser a URL correta do Railway)');
}

function createFixScript() {
  console.log('\n🔧 CRIANDO SCRIPT DE CORREÇÃO AUTOMÁTICA');
  console.log('-' .repeat(40));
  
  const fixScript = `#!/usr/bin/env node

// Script de correção automática do Railway
const https = require('https');

const CORRECT_RAILWAY_URL = 'https://zara-backend-production-aab3.up.railway.app';

function testCorrectURL() {
  console.log('🔍 Testando URL correta do Railway...');
  
  https.get(CORRECT_RAILWAY_URL + '/api/health', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(\`✅ Status: \${res.statusCode}\`);
      if (res.statusCode === 200) {
        console.log('🎉 Railway está funcionando na URL correta!');
        console.log('📝 Atualize as configurações para usar:');
        console.log('   ' + CORRECT_RAILWAY_URL);
      } else {
        console.log('❌ Railway ainda não está funcionando');
      }
    });
  }).on('error', (err) => {
    console.log('❌ Erro:', err.message);
  });
}

testCorrectURL();
`;
  
  fs.writeFileSync('test-correct-railway-url.js', fixScript);
  console.log('✅ Script criado: test-correct-railway-url.js');
}

async function main() {
  console.log('🚀 DIAGNÓSTICO E CORREÇÃO DO RAILWAY');
  console.log('=' .repeat(60));
  console.log('Analisando erro "Application not found"...');
  
  try {
    // 1. Verificar configuração
    const configFiles = checkRailwayConfig();
    
    // 2. Analisar railway.toml
    const tomlAnalysis = analyzeRailwayToml();
    
    // 3. Verificar diretório server
    const serverOk = checkServerDirectory();
    
    // 4. Verificar URLs alternativas
    checkAlternativeURLs();
    
    // 5. Gerar instruções
    generateFixInstructions();
    
    // 6. Criar script de teste
    createFixScript();
    
    console.log('\n🎯 RESUMO:');
    console.log('   - Railway retorna 404 "Application not found"');
    console.log('   - Possível URL correta: https://zara-backend-production-aab3.up.railway.app');
    console.log('   - Execute: node test-correct-railway-url.js');
    console.log('   - Verifique o dashboard do Railway');
    
  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error.message);
  }
}

// Executar diagnóstico
main().catch(console.error);