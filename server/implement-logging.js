const fs = require('fs');
const path = require('path');

console.log('🔧 IMPLEMENTANDO SISTEMA DE LOGGING WINSTON');
console.log('============================================================');

// Função para processar arquivos e substituir comentários REMOVED
function implementLogging() {
    const serverDir = __dirname;
    const filesToProcess = [];
    
    // Buscar arquivos .js que foram modificados
    function findModifiedFiles(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'logs') {
                findModifiedFiles(fullPath);
            } else if (file.endsWith('.js') && !file.includes('test') && !file.includes('diagnose') && !file.includes('remove-console') && !file.includes('implement-logging')) {
                // Verificar se o arquivo contém comentários REMOVED
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    if (content.includes('// REMOVED:')) {
                        filesToProcess.push(fullPath);
                    }
                } catch (error) {
                    console.log(`❌ Erro ao ler ${fullPath}: ${error.message}`);
                }
            }
        }
    }
    
    findModifiedFiles(serverDir);
    
    console.log(`📁 Arquivos com comentários REMOVED: ${filesToProcess.length}`);
    
    let totalImplemented = 0;
    let filesProcessed = 0;
    
    filesToProcess.forEach(filePath => {
        try {
            const relativePath = path.relative(serverDir, filePath);
            console.log(`\n🔧 Processando: ${relativePath}`);
            
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            
            let hasLoggerImport = false;
            let implementedInFile = 0;
            let needsLogger = false;
            
            // Verificar se já tem import do logger
            for (const line of lines) {
                if (line.includes("require('./utils/logger')") || line.includes("require('../utils/logger')")) {
                    hasLoggerImport = true;
                    break;
                }
            }
            
            // Processar cada linha
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                if (line.includes('// REMOVED:') && line.includes('console.')) {
                    needsLogger = true;
                    const indentation = line.match(/^\s*/)[0];
                    
                    // Extrair o conteúdo original do console
                    const removedMatch = line.match(/\/\/ REMOVED: (.+?) \/\/ TODO/);
                    if (removedMatch) {
                        const originalConsole = removedMatch[1];
                        let loggerCall = '';
                        
                        // Determinar o tipo de log e converter
                        if (originalConsole.includes('console.error')) {
                            const message = extractMessage(originalConsole);
                            loggerCall = `${indentation}logger.error(${message});`;
                        } else if (originalConsole.includes('console.warn')) {
                            const message = extractMessage(originalConsole);
                            loggerCall = `${indentation}logger.warn(${message});`;
                        } else if (originalConsole.includes('console.debug')) {
                            const message = extractMessage(originalConsole);
                            loggerCall = `${indentation}logger.debug(${message});`;
                        } else if (originalConsole.includes('console.log')) {
                            const message = extractMessage(originalConsole);
                            loggerCall = `${indentation}logger.info(${message});`;
                        } else {
                            // Fallback para console.log genérico
                            const message = extractMessage(originalConsole);
                            loggerCall = `${indentation}logger.info(${message});`;
                        }
                        
                        lines[i] = loggerCall;
                        implementedInFile++;
                    }
                }
            }
            
            // Adicionar import do logger se necessário
            if (needsLogger && !hasLoggerImport) {
                // Encontrar onde adicionar o import (após outros requires)
                let insertIndex = 0;
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].includes('require(') || lines[i].includes('import ')) {
                        insertIndex = i + 1;
                    } else if (lines[i].trim() === '' && insertIndex > 0) {
                        break;
                    }
                }
                
                // Determinar o caminho relativo para o logger
                const depth = relativePath.split(path.sep).length - 1;
                const loggerPath = '../'.repeat(depth) + 'utils/logger';
                
                lines.splice(insertIndex, 0, `const logger = require('${loggerPath}');`);
                implementedInFile++;
            }
            
            // Escrever arquivo modificado
            if (implementedInFile > 0) {
                fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
                console.log(`   ✅ Implementados ${implementedInFile} logs`);
                totalImplemented += implementedInFile;
                filesProcessed++;
            } else {
                console.log(`   ⚠️  Nenhuma implementação necessária`);
            }
            
        } catch (error) {
            console.log(`   ❌ Erro ao processar: ${error.message}`);
        }
    });
    
    console.log('\n📋 RESUMO DA IMPLEMENTAÇÃO:');
    console.log('============================================================');
    console.log(`📁 Arquivos processados: ${filesProcessed}`);
    console.log(`🔧 Logs implementados: ${totalImplemented}`);
    
    return { filesProcessed, totalImplemented };
}

// Função para extrair mensagem do console.log
function extractMessage(consoleStatement) {
    // Remover 'console.log(' ou similar do início
    let message = consoleStatement.replace(/console\.(log|error|warn|debug|info)\s*\(/, '');
    
    // Remover ')' do final se existir
    if (message.endsWith(')')) {
        message = message.slice(0, -1);
    }
    
    // Se a mensagem estiver vazia ou só com espaços, usar mensagem padrão
    if (!message.trim()) {
        message = '"Log message"';
    }
    
    return message;
}

// Função para testar o sistema de logging
function testLogging() {
    console.log('\n🧪 TESTANDO SISTEMA DE LOGGING...');
    
    try {
        const logger = require('./utils/logger');
        
        logger.info('Sistema de logging inicializado com sucesso');
        logger.warn('Este é um teste de warning');
        logger.error('Este é um teste de error');
        logger.debug('Este é um teste de debug');
        
        console.log('   ✅ Logger funcionando corretamente');
        
        // Verificar se os arquivos de log foram criados
        const logsDir = path.join(__dirname, 'logs');
        if (fs.existsSync(logsDir)) {
            const logFiles = fs.readdirSync(logsDir);
            console.log(`   📁 Arquivos de log criados: ${logFiles.join(', ')}`);
        }
        
        return true;
    } catch (error) {
        console.log(`   ❌ Erro no teste do logger: ${error.message}`);
        return false;
    }
}

// Executar implementação
const result = implementLogging();

// Testar logging
const testResult = testLogging();

console.log('\n🚀 PRÓXIMOS PASSOS:');
if (result.totalImplemented > 0) {
    console.log('1. Revisar implementações do logger nos arquivos modificados');
    console.log('2. Ajustar mensagens de log conforme necessário');
    console.log('3. Testar aplicação para verificar se não há erros');
}
if (testResult) {
    console.log('4. Sistema de logging está funcionando');
    console.log('5. Fazer commit das alterações');
} else {
    console.log('4. Corrigir problemas no sistema de logging');
}

console.log('\n✅ IMPLEMENTAÇÃO DO SISTEMA DE LOGGING CONCLUÍDA!');
console.log('\n📝 NOTA: Verifique os arquivos modificados e ajuste as mensagens de log conforme necessário.');