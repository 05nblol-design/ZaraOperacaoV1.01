const fs = require('fs');
const path = require('path');

// Função para corrigir erros de sintaxe nos logger.info
function fixLoggerSyntax(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Padrões para encontrar diferentes tipos de erros de sintaxe
    const patterns = [
      /logger\.(info|warn|error|debug)\(([^)]+|\([^)]*\))*\);\);/g,  // logger.method(...););
      /logger\.(info|warn|error|debug)\([^;]*\);\);/g,                // Padrão mais simples
      /logger\.(info|warn|error|debug)\([^;]*[^;]\);\);/g             // Padrão alternativo
    ];
    
    // Aplicar todas as correções
    patterns.forEach(pattern => {
      content = content.replace(pattern, (match, method) => {
        // Extrair o conteúdo entre parênteses e remover o ;); extra
        const cleanMatch = match.replace(/;\);$/, ';');
        return cleanMatch;
      });
    });
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Erro ao processar ${filePath}:`, error.message);
    return false;
  }
}

// Função para encontrar todos os arquivos .js recursivamente
function findJSFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Pular node_modules e outras pastas desnecessárias
      if (!['node_modules', '.git', 'logs', 'uploads'].includes(file)) {
        findJSFiles(filePath, fileList);
      }
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

async function main() {
  console.log('🔧 Iniciando correção de erros de sintaxe nos logger.info...');
  
  const serverDir = __dirname;
  const jsFiles = findJSFiles(serverDir);
  
  console.log(`📁 Encontrados ${jsFiles.length} arquivos .js`);
  
  let fixedFiles = 0;
  let totalFixes = 0;
  
  for (const filePath of jsFiles) {
    const relativePath = path.relative(serverDir, filePath);
    
    if (fixLoggerSyntax(filePath)) {
      fixedFiles++;
      console.log(`✅ Corrigido: ${relativePath}`);
    }
  }
  
  console.log(`\n📊 Resumo da correção:`);
  console.log(`📁 Arquivos verificados: ${jsFiles.length}`);
  console.log(`✅ Arquivos corrigidos: ${fixedFiles}`);
  
  if (fixedFiles > 0) {
    console.log('\n🎉 Correções aplicadas com sucesso!');
    console.log('💡 Agora você pode executar o servidor sem erros de sintaxe');
  } else {
    console.log('\n✅ Nenhum erro de sintaxe encontrado!');
  }
}

main().catch(error => {
  console.error('❌ Erro durante a correção:', error);
  process.exit(1);
});