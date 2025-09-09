const fs = require('fs');
const path = require('path');

console.log('🧹 LIMPEZA FINAL DOS CONSOLE LOGS RESTANTES');
console.log('============================================================');

// Arquivos que devem ser limpos (excluindo arquivos de teste/diagnóstico)
const filesToClean = [
    'update-cors-final.js',
    'update-cors-railway-final.js'
];

let totalCleaned = 0;

filesToClean.forEach(fileName => {
    const filePath = path.join(__dirname, fileName);
    
    if (fs.existsSync(filePath)) {
        try {
            console.log(`\n🔧 Limpando: ${fileName}`);
            
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            
            let cleanedInFile = 0;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                if (line.includes('console.') && 
                    !line.trim().startsWith('//') && 
                    !line.includes('// REMOVED')) {
                    
                    const indentation = line.match(/^\s*/)[0];
                    lines[i] = `${indentation}// REMOVED: ${line.trim()} // Console log removido`;
                    cleanedInFile++;
                }
            }
            
            if (cleanedInFile > 0) {
                fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
                console.log(`   ✅ Removidos ${cleanedInFile} console logs`);
                totalCleaned += cleanedInFile;
            } else {
                console.log(`   ✅ Nenhum console log encontrado`);
            }
            
        } catch (error) {
            console.log(`   ❌ Erro ao processar ${fileName}: ${error.message}`);
        }
    } else {
        console.log(`   ⚠️  Arquivo não encontrado: ${fileName}`);
    }
});

// Verificar se ainda há console logs nos arquivos principais
console.log('\n🔍 VERIFICAÇÃO FINAL DOS ARQUIVOS PRINCIPAIS...');

const mainDirectories = ['api', 'routes', 'services', 'middleware', 'controllers', 'models', 'utils', 'socket'];
let remainingLogs = 0;

mainDirectories.forEach(dirName => {
    const dirPath = path.join(__dirname, dirName);
    
    if (fs.existsSync(dirPath)) {
        console.log(`\n📁 Verificando diretório: ${dirName}`);
        
        function checkDirectory(dir) {
            const files = fs.readdirSync(dir);
            
            files.forEach(file => {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    checkDirectory(fullPath);
                } else if (file.endsWith('.js')) {
                    try {
                        const content = fs.readFileSync(fullPath, 'utf8');
                        const lines = content.split('\n');
                        
                        lines.forEach((line, index) => {
                            const trimmedLine = line.trim();
                            if ((trimmedLine.includes('console.log') || 
                                 trimmedLine.includes('console.error') || 
                                 trimmedLine.includes('console.warn') || 
                                 trimmedLine.includes('console.info') ||
                                 trimmedLine.includes('console.debug')) &&
                                !trimmedLine.startsWith('//') &&
                                !trimmedLine.includes('// REMOVED')) {
                                
                                remainingLogs++;
                                console.log(`   ⚠️  ${path.relative(__dirname, fullPath)}:${index + 1} - ${trimmedLine}`);
                            }
                        });
                    } catch (error) {
                        // Ignorar erros de leitura
                    }
                }
            });
        }
        
        checkDirectory(dirPath);
    }
});

console.log('\n📋 RESUMO DA LIMPEZA FINAL:');
console.log('============================================================');
console.log(`🧹 Console logs removidos nesta execução: ${totalCleaned}`);
console.log(`📊 Console logs restantes nos arquivos principais: ${remainingLogs}`);

if (remainingLogs === 0) {
    console.log('\n🎉 PERFEITO! Todos os console logs foram removidos dos arquivos principais!');
    console.log('✅ Sistema limpo e pronto para produção');
} else {
    console.log('\n⚠️  Ainda há alguns console logs nos arquivos principais que precisam ser revisados');
}

// Criar relatório de status
const statusReport = {
    timestamp: new Date().toISOString(),
    totalConsoleLogs: {
        previouslyRemoved: 1433,
        removedNow: totalCleaned,
        remainingInMainFiles: remainingLogs
    },
    status: remainingLogs === 0 ? 'CLEAN' : 'NEEDS_REVIEW',
    mainDirectoriesChecked: mainDirectories,
    recommendation: remainingLogs === 0 ? 
        'Sistema pronto para produção' : 
        'Revisar console logs restantes nos arquivos principais'
};

fs.writeFileSync(
    path.join(__dirname, 'console-logs-status.json'), 
    JSON.stringify(statusReport, null, 2)
);

console.log('\n💾 Status salvo em: console-logs-status.json');
console.log('\n✅ LIMPEZA FINAL CONCLUÍDA!');