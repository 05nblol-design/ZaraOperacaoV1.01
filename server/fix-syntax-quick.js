const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    // Corrigir padrões específicos de erro
    content = content.replace(/logger\.(info|warn|error|debug)\([^;]*\);\);/g, (match) => {
      return match.replace(/;\);$/, ';');
    });
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Corrigido: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.log(`❌ Erro em ${filePath}:`, error.message);
    return false;
  }
}

// Arquivos específicos que sabemos que têm erros
const filesToFix = [
  './config/ssl.js',
  './index.js'
];

console.log('🔧 Corrigindo arquivos específicos...');
let fixed = 0;

filesToFix.forEach(file => {
  if (fs.existsSync(file)) {
    if (fixFile(file)) {
      fixed++;
    }
  }
});

console.log(`\n✅ Correção concluída! ${fixed} arquivos corrigidos.`);