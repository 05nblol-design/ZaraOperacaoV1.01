const fs = require('fs');
const path = require('path');

// Carregar o relatório de diagnóstico
const reportPath = path.join(__dirname, 'diagnostic-report.json');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

console.log('🧹 REMOVENDO CONSOLE LOGS DO SISTEMA ZARA');
console.log('============================================================');
console.log(`📊 Total de console logs encontrados: ${report.consoleLogs.length}`);

// Agrupar logs por arquivo
const logsByFile = {};
report.consoleLogs.forEach(log => {
    if (!logsByFile[log.file]) {
        logsByFile[log.file] = [];
    }
    logsByFile[log.file].push(log);
});

console.log(`📁 Arquivos afetados: ${Object.keys(logsByFile).length}`);

// Processar cada arquivo
let totalRemoved = 0;
let filesProcessed = 0;

Object.entries(logsByFile).forEach(([relativePath, logs]) => {
    const fullPath = path.join(__dirname, relativePath);
    
    try {
        console.log(`\n🔧 Processando: ${relativePath} (${logs.length} logs)`);
        
        // Ler conteúdo do arquivo
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        
        // Ordenar logs por linha (decrescente para não afetar numeração)
        const sortedLogs = logs.sort((a, b) => b.line - a.line);
        
        let removedInFile = 0;
        
        sortedLogs.forEach(log => {
            const lineIndex = log.line - 1; // Converter para índice 0-based
            
            if (lineIndex >= 0 && lineIndex < lines.length) {
                const originalLine = lines[lineIndex];
                
                // Verificar se a linha ainda contém console log
                if (originalLine.includes('console.')) {
                    // Obter indentação da linha original
                    const indentation = originalLine.match(/^\s*/)[0];
                    
                    // Determinar tipo de log para comentário
                    let logType = 'info';
                    if (originalLine.includes('console.error')) logType = 'error';
                    else if (originalLine.includes('console.warn')) logType = 'warn';
                    else if (originalLine.includes('console.debug')) logType = 'debug';
                    
                    // Comentar a linha e adicionar comentário explicativo
                    lines[lineIndex] = `${indentation}// REMOVED: ${originalLine.trim()} // TODO: Replace with proper logging`;
                    removedInFile++;
                }
            }
        });
        
        // Escrever arquivo modificado
        if (removedInFile > 0) {
            fs.writeFileSync(fullPath, lines.join('\n'), 'utf8');
            console.log(`   ✅ Removidos ${removedInFile} console logs`);
            totalRemoved += removedInFile;
            filesProcessed++;
        } else {
            console.log(`   ⚠️  Nenhum console log encontrado (já removidos?)`);
        }
        
    } catch (error) {
        console.log(`   ❌ Erro ao processar ${relativePath}: ${error.message}`);
    }
});

console.log('\n📋 RESUMO DA LIMPEZA:');
console.log('============================================================');
console.log(`📁 Arquivos processados: ${filesProcessed}`);
console.log(`🧹 Console logs removidos: ${totalRemoved}`);
console.log(`📊 Console logs restantes: ${report.consoleLogs.length - totalRemoved}`);

// Criar sistema de logging adequado
console.log('\n🔧 CRIANDO SISTEMA DE LOGGING...');
createLoggingSystem();

function createLoggingSystem() {
    const loggerContent = `const winston = require('winston');
const path = require('path');

// Configuração do Winston Logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'zara-backend' },
    transports: [
        // Arquivo para erros
        new winston.transports.File({ 
            filename: path.join(__dirname, 'logs', 'error.log'), 
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        // Arquivo para todos os logs
        new winston.transports.File({ 
            filename: path.join(__dirname, 'logs', 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

// Em desenvolvimento, também log no console
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

// Criar diretório de logs se não existir
const logsDir = path.join(__dirname, 'logs');
if (!require('fs').existsSync(logsDir)) {
    require('fs').mkdirSync(logsDir, { recursive: true });
}

module.exports = logger;`;
    
    const loggerPath = path.join(__dirname, 'utils', 'logger.js');
    
    // Criar diretório utils se não existir
    const utilsDir = path.dirname(loggerPath);
    if (!fs.existsSync(utilsDir)) {
        fs.mkdirSync(utilsDir, { recursive: true });
    }
    
    fs.writeFileSync(loggerPath, loggerContent, 'utf8');
    console.log(`   ✅ Logger criado: ${path.relative(__dirname, loggerPath)}`);
    
    // Criar exemplo de uso
    const exampleContent = `// EXEMPLO DE USO DO NOVO SISTEMA DE LOGGING
// Substitua os console.log removidos por:

const logger = require('./utils/logger');

// Em vez de: console.log('Informação')
logger.info('Informação');

// Em vez de: console.error('Erro')
logger.error('Erro', { error: errorObject });

// Em vez de: console.warn('Aviso')
logger.warn('Aviso');

// Em vez de: console.debug('Debug')
logger.debug('Debug');

// Logs estruturados com contexto
logger.info('Usuário logado', { 
    userId: user.id, 
    email: user.email, 
    timestamp: new Date().toISOString() 
});

// Logs de erro com stack trace
try {
    // código que pode falhar
} catch (error) {
    logger.error('Erro na operação', { 
        error: error.message, 
        stack: error.stack,
        context: 'authentication'
    });
}`;
    
    const examplePath = path.join(__dirname, 'LOGGING_EXAMPLES.js');
    fs.writeFileSync(examplePath, exampleContent, 'utf8');
    console.log(`   ✅ Exemplos criados: ${path.relative(__dirname, examplePath)}`);
}

console.log('\n🚀 PRÓXIMOS PASSOS:');
console.log('1. Instalar Winston: npm install winston');
console.log('2. Revisar arquivos modificados');
console.log('3. Substituir comentários // REMOVED por logger adequado');
console.log('4. Testar sistema de logging');
console.log('5. Fazer commit das alterações');

console.log('\n✅ LIMPEZA DE CONSOLE LOGS CONCLUÍDA!');