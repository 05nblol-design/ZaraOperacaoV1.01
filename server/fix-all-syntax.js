const fs = require('fs');
const path = require('path');

function getAllJSFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Pular diretórios específicos
      if (!['node_modules', '.git', 'logs', 'uploads', 'prisma/migrations'].includes(file)) {
        getAllJSFiles(filePath, fileList);
      }
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    // Múltiplos padrões de correção
    const patterns = [
      { regex: /logger\.(info|warn|error|debug)\([^;]*\);\);/g, desc: 'logger com ;);' },
      { regex: /console\.(log|warn|error|info)\([^;]*\);\);/g, desc: 'console com ;);' }
    ];
    
    patterns.forEach(pattern => {
      content = content.replace(pattern.regex, (match) => {
        return match.replace(/;\);$/, ';');
      });
    });
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${path.relative('.', filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.log(`❌ Erro em ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 Corrigindo todos os arquivos JS...');

const jsFiles = getAllJSFiles('.');
let fixed = 0;

jsFiles.forEach(file => {
  if (fixFile(file)) {
    fixed++;
  }
});

console.log(`\n✅ Correção concluída! ${fixed} de ${jsFiles.length} arquivos corrigidos.`);