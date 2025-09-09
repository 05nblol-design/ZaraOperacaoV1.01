// Script para obter URL real do deployment Vercel
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 OBTENDO URL REAL DO VERCEL DEPLOYMENT');
console.log('=' .repeat(50));

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
  console.log('\n📋 VERIFICANDO VERCEL CLI:');
  console.log('-'.repeat(30));
  
  const result = runCommand('vercel --version');
  if (result.success) {
    console.log(`✅ Vercel CLI instalado: ${result.output}`);
    return true;
  } else {
    console.log('❌ Vercel CLI não encontrado');
    console.log('💡 Instale com: npm i -g vercel');
    return false;
  }
}

// Obter deployments do Vercel
function getVercelDeployments() {
  console.log('\n📋 OBTENDO DEPLOYMENTS DO VERCEL:');
  console.log('-'.repeat(40));
  
  // Tentar obter lista de deployments
  const listResult = runCommand('vercel ls', { cwd: path.join(__dirname, '..', 'frontend') });
  
  if (listResult.success) {
    console.log('✅ Deployments encontrados:');
    console.log(listResult.output);
    
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
    console.log('❌ Erro ao obter deployments:');
    console.log(listResult.error);
    return [];
  }
}

// Verificar status do projeto Vercel
function checkVercelProject() {
  console.log('\n📋 VERIFICANDO PROJETO VERCEL:');
  console.log('-'.repeat(35));
  
  const frontendPath = path.join(__dirname, '..', 'frontend');
  
  // Verificar se existe .vercel/project.json
  const vercelConfigPath = path.join(frontendPath, '.vercel', 'project.json');
  
  if (fs.existsSync(vercelConfigPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
      console.log('✅ Projeto Vercel configurado:');
      console.log(`   Org ID: ${config.orgId}`);
      console.log(`   Project ID: ${config.projectId}`);
      
      // Tentar obter URL do projeto
      const inspectResult = runCommand(`vercel inspect`, { cwd: frontendPath });
      if (inspectResult.success) {
        console.log('\n📋 INFORMAÇÕES DO DEPLOYMENT:');
        console.log(inspectResult.output);
      }
      
      return config;
    } catch (error) {
      console.log('❌ Erro ao ler configuração Vercel:', error.message);
    }
  } else {
    console.log('❌ Projeto não está linkado ao Vercel');
    console.log('💡 Execute: vercel --prod no diretório frontend');
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
    console.log('\n📋 GERANDO URLs POSSÍVEIS:');
    console.log('-'.repeat(30));
    deploymentUrls = generatePossibleUrls();
    console.log('⚠️  URLs baseadas em nomes comuns (podem não existir)');
  }
  
  // 5. Mostrar configuração CORS final
  console.log('\n🎯 CONFIGURAÇÃO CORS RECOMENDADA:');
  console.log('=' .repeat(50));
  
  const corsUrls = [
    ...deploymentUrls.slice(0, 3), // Primeiras 3 URLs
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  
  const corsOrigin = corsUrls.join(',');
  
  console.log('\n📝 VARIÁVEL CORS_ORIGIN:');
  console.log(`CORS_ORIGIN=${corsOrigin}`);
  
  console.log('\n🚀 PRÓXIMOS PASSOS:');
  console.log('1. Acesse Railway Dashboard');
  console.log('2. Vá em Variables');
  console.log('3. Atualize CORS_ORIGIN com o valor acima');
  console.log('4. Salve e faça redeploy');
  
  if (!hasVercelCli || deploymentUrls.length === 0) {
    console.log('\n💡 RECOMENDAÇÕES:');
    console.log('- Instale Vercel CLI: npm i -g vercel');
    console.log('- Faça deploy do frontend: cd frontend && vercel --prod');
    console.log('- Verifique URLs reais no Vercel Dashboard');
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('✅ ANÁLISE CONCLUÍDA');
}

// Executar
main().catch(console.error);