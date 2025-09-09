// Script para obter URL real do deployment Vercel
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('utils/logger');

logger.info('🔍 OBTENDO URL REAL DO VERCEL DEPLOYMENT');
logger.info('=' .repeat(50));

// Função para executar comando e capturar saída
function runCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      ...options 
    });
    return { success: true, output: result.trim() };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout || '' };
  }
}

// Verificar se Vercel CLI está instalado
function checkVercelCli() {
  logger.info('\n📋 VERIFICANDO VERCEL CLI:');
  logger.info('-'.repeat(30));
  
  const result = runCommand('vercel --version');
  if (result.success) {
    logger.info(`✅ Vercel CLI instalado: ${result.output}`);
    return true;
  } else {
    logger.info('❌ Vercel CLI não encontrado');
    logger.info('💡 Instale com: npm i -g vercel');
    return false;
  }
}

// Obter deployments do Vercel
function getVercelDeployments() {
  logger.info('\n📋 OBTENDO DEPLOYMENTS DO VERCEL:');
  logger.info('-'.repeat(40));
  
  // Tentar obter lista de deployments
  const listResult = runCommand('vercel ls', { cwd: path.join(__dirname, '..', 'frontend') });
  
  if (listResult.success) {
    logger.info('✅ Deployments encontrados:');
    logger.info(listResult.output);
    
    // Extrair URLs dos deployments
    const lines = listResult.output.split('\n');
    const urls = [];
    
    lines.forEach(line => {
      // Procurar por URLs do Vercel
      const urlMatch = line.match(/https:\/\/[\w-]+\.vercel\.app/);
      if (urlMatch) {
        urls.push(urlMatch[0]);
      }
    });
    
    return urls;
  } else {
    logger.info('❌ Erro ao obter deployments:');
    logger.info(listResult.error);
    return [];
  }
}

// Verificar status do projeto Vercel
function checkVercelProject() {
  logger.info('\n📋 VERIFICANDO PROJETO VERCEL:');
  logger.info('-'.repeat(35));
  
  const frontendPath = path.join(__dirname, '..', 'frontend');
  
  // Verificar se existe .vercel/project.json
  const vercelConfigPath = path.join(frontendPath, '.vercel', 'project.json');
  
  if (fs.existsSync(vercelConfigPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
      logger.info('✅ Projeto Vercel configurado:');
      logger.info(`   Org ID: ${config.orgId}`);
      logger.info(`   Project ID: ${config.projectId}`);
      
      // Tentar obter URL do projeto
      const inspectResult = runCommand(`vercel inspect`, { cwd: frontendPath });
      if (inspectResult.success) {
        logger.info('\n📋 INFORMAÇÕES DO DEPLOYMENT:');
        logger.info(inspectResult.output);
      }
      
      return config;
    } catch (error) {
      logger.info('❌ Erro ao ler configuração Vercel:', error.message);
    }
  } else {
    logger.info('❌ Projeto não está linkado ao Vercel');
    logger.info('💡 Execute: vercel --prod no diretório frontend');
  }
  
  return null;
}

// URLs comuns baseadas no nome do projeto
function generatePossibleUrls() {
  const projectNames = [
    'zara-frontend',
    'zara-operacao',
    'zara-sistema',
    'sistema-zara',
    'frontend-zara'
  ];
  
  const urls = [];
  
  projectNames.forEach(name => {
    urls.push(`https://${name}.vercel.app`);
    urls.push(`https://${name}-git-main.vercel.app`);
    urls.push(`https://${name}-lojaa.vercel.app`);
  });
  
  return urls;
}

// Função principal
async function main() {
  // 1. Verificar Vercel CLI
  const hasVercelCli = checkVercelCli();
  
  let deploymentUrls = [];
  
  if (hasVercelCli) {
    // 2. Verificar projeto Vercel
    checkVercelProject();
    
    // 3. Obter deployments
    deploymentUrls = getVercelDeployments();
  }
  
  // 4. Se não encontrou URLs, usar URLs possíveis
  if (deploymentUrls.length === 0) {
    logger.info('\n📋 GERANDO URLs POSSÍVEIS:');
    logger.info('-'.repeat(30));
    deploymentUrls = generatePossibleUrls();
    logger.info('⚠️  URLs baseadas em nomes comuns (podem não existir)');
  }
  
  // 5. Mostrar configuração CORS final
  logger.info('\n🎯 CONFIGURAÇÃO CORS RECOMENDADA:');
  logger.info('=' .repeat(50));
  
  const corsUrls = [
    ...deploymentUrls.slice(0, 3), // Primeiras 3 URLs
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  
  const corsOrigin = corsUrls.join(',');
  
  logger.info('\n📝 VARIÁVEL CORS_ORIGIN:');
  logger.info(`CORS_ORIGIN=${corsOrigin}`);
  
  logger.info('\n🚀 PRÓXIMOS PASSOS:');
  logger.info('1. Acesse Railway Dashboard');
  logger.info('2. Vá em Variables');
  logger.info('3. Atualize CORS_ORIGIN com o valor acima');
  logger.info('4. Salve e faça redeploy');
  
  if (!hasVercelCli || deploymentUrls.length === 0) {
    logger.info('\n💡 RECOMENDAÇÕES:');
    logger.info('- Instale Vercel CLI: npm i -g vercel');
    logger.info('- Faça deploy do frontend: cd frontend && vercel --prod');
    logger.info('- Verifique URLs reais no Vercel Dashboard');
  }
  
  logger.info('\n' + '=' .repeat(50));
  logger.info('✅ ANÁLISE CONCLUÍDA');
}

// Executar
logger.error(main().catch(console.error);