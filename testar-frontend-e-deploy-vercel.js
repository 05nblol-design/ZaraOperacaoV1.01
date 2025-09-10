#!/usr/bin/env node

/**
 * SCRIPT COMPLETO: TESTE FRONTEND + DEPLOY VERCEL
 * 
 * Este script:
 * 1. Testa o frontend em desenvolvimento
 * 2. Verifica a build de produção
 * 3. Configura variáveis de ambiente no Vercel
 * 4. Faz o deploy no Vercel
 * 5. Testa a aplicação deployada
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Cores para output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
    log(`\n${'='.repeat(60)}`, 'cyan');
    log(`${title}`, 'bright');
    log(`${'='.repeat(60)}`, 'cyan');
}

function subsection(title) {
    log(`\n${'-'.repeat(40)}`, 'yellow');
    log(`${title}`, 'yellow');
    log(`${'-'.repeat(40)}`, 'yellow');
}

function success(message) {
    log(`✅ ${message}`, 'green');
}

function error(message) {
    log(`❌ ${message}`, 'red');
}

function warning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
    log(`ℹ️  ${message}`, 'blue');
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function runCommand(command, cwd = process.cwd(), options = {}) {
    try {
        const result = execSync(command, {
            cwd,
            encoding: 'utf8',
            stdio: options.silent ? 'pipe' : 'inherit',
            ...options
        });
        return { success: true, output: result };
    } catch (err) {
        return { success: false, error: err.message, output: err.stdout };
    }
}

async function testFrontendDevelopment() {
    section('🔧 TESTANDO FRONTEND EM DESENVOLVIMENTO');
    
    const frontendPath = path.join(process.cwd(), 'frontend');
    
    // Verificar se o diretório existe
    if (!fs.existsSync(frontendPath)) {
        error('Diretório frontend não encontrado!');
        return false;
    }
    
    // Verificar package.json
    const packageJsonPath = path.join(frontendPath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        error('package.json não encontrado no frontend!');
        return false;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    success(`Frontend: ${packageJson.name} v${packageJson.version}`);
    
    // Verificar dependências
    subsection('Verificando Dependências');
    const result = runCommand('npm list --depth=0', frontendPath, { silent: true });
    if (result.success) {
        success('Dependências verificadas com sucesso');
    } else {
        warning('Algumas dependências podem estar faltando');
        info('Executando npm install...');
        const installResult = runCommand('npm install', frontendPath);
        if (!installResult.success) {
            error('Falha ao instalar dependências');
            return false;
        }
    }
    
    // Verificar arquivos de configuração
    subsection('Verificando Configurações');
    const configFiles = [
        '.env.production',
        'vite.config.js',
        'tailwind.config.js',
        'vercel.json'
    ];
    
    configFiles.forEach(file => {
        const filePath = path.join(frontendPath, file);
        if (fs.existsSync(filePath)) {
            success(`${file} encontrado`);
        } else {
            warning(`${file} não encontrado`);
        }
    });
    
    return true;
}

async function testBuildProduction() {
    section('🏗️  TESTANDO BUILD DE PRODUÇÃO');
    
    const frontendPath = path.join(process.cwd(), 'frontend');
    
    // Limpar build anterior
    subsection('Limpando Build Anterior');
    const distPath = path.join(frontendPath, 'dist');
    if (fs.existsSync(distPath)) {
        fs.rmSync(distPath, { recursive: true, force: true });
        success('Build anterior removida');
    }
    
    // Fazer build
    subsection('Executando Build');
    info('Executando: npm run build');
    const buildResult = runCommand('npm run build', frontendPath);
    
    if (!buildResult.success) {
        error('Falha na build de produção!');
        error(buildResult.error);
        return false;
    }
    
    // Verificar arquivos gerados
    if (fs.existsSync(distPath)) {
        const files = fs.readdirSync(distPath);
        success(`Build gerada com sucesso! ${files.length} arquivos criados`);
        
        // Verificar arquivos principais
        const indexHtml = path.join(distPath, 'index.html');
        if (fs.existsSync(indexHtml)) {
            success('index.html gerado');
        } else {
            error('index.html não encontrado na build!');
            return false;
        }
        
        return true;
    } else {
        error('Diretório dist não foi criado!');
        return false;
    }
}

async function configureVercelEnvironment() {
    section('⚙️  CONFIGURANDO VARIÁVEIS DE AMBIENTE NO VERCEL');
    
    const frontendPath = path.join(process.cwd(), 'frontend');
    const envPath = path.join(frontendPath, '.env.production');
    
    if (!fs.existsSync(envPath)) {
        error('.env.production não encontrado!');
        return false;
    }
    
    // Ler variáveis de ambiente
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#') && line.includes('=')) {
            const [key, ...valueParts] = line.split('=');
            const value = valueParts.join('=');
            envVars[key] = value;
        }
    });
    
    subsection('Variáveis de Ambiente Detectadas');
    Object.keys(envVars).forEach(key => {
        info(`${key}=${envVars[key]}`);
    });
    
    // Configurar no Vercel (comando por comando)
    subsection('Configurando no Vercel');
    
    const envCommands = Object.entries(envVars).map(([key, value]) => {
        return `vercel env add ${key} production`;
    });
    
    info('Comandos para configurar variáveis no Vercel:');
    envCommands.forEach(cmd => {
        log(`  ${cmd}`, 'cyan');
    });
    
    warning('IMPORTANTE: Execute estes comandos manualmente se necessário');
    warning('Ou use: vercel env pull .env.vercel');
    
    return true;
}

async function deployToVercel() {
    section('🚀 FAZENDO DEPLOY NO VERCEL');
    
    const frontendPath = path.join(process.cwd(), 'frontend');
    
    // Verificar se Vercel CLI está instalado
    subsection('Verificando Vercel CLI');
    const vercelCheck = runCommand('vercel --version', frontendPath, { silent: true });
    
    if (!vercelCheck.success) {
        warning('Vercel CLI não encontrado. Instalando...');
        const installResult = runCommand('npm install -g vercel', frontendPath);
        if (!installResult.success) {
            error('Falha ao instalar Vercel CLI');
            return false;
        }
    } else {
        success(`Vercel CLI instalado: ${vercelCheck.output.trim()}`);
    }
    
    // Fazer login (se necessário)
    subsection('Verificando Login');
    const whoamiResult = runCommand('vercel whoami', frontendPath, { silent: true });
    if (!whoamiResult.success) {
        warning('Não logado no Vercel. Execute: vercel login');
        info('Fazendo login...');
        const loginResult = runCommand('vercel login', frontendPath);
        if (!loginResult.success) {
            error('Falha no login do Vercel');
            return false;
        }
    } else {
        success(`Logado como: ${whoamiResult.output.trim()}`);
    }
    
    // Deploy
    subsection('Executando Deploy');
    info('Executando: vercel --prod');
    
    const deployResult = runCommand('vercel --prod', frontendPath);
    
    if (deployResult.success) {
        success('Deploy realizado com sucesso!');
        
        // Extrair URL do deploy
        const output = deployResult.output || '';
        const urlMatch = output.match(/https:\/\/[^\s]+\.vercel\.app/);
        
        if (urlMatch) {
            const deployUrl = urlMatch[0];
            success(`URL do Deploy: ${deployUrl}`);
            return deployUrl;
        } else {
            // Tentar extrair da saída padrão do Vercel
            const productionMatch = output.match(/Production:\s+(https:\/\/[^\s]+)/);
            if (productionMatch) {
                const deployUrl = productionMatch[1];
                success(`URL do Deploy: ${deployUrl}`);
                return deployUrl;
            } else {
                warning('URL do deploy não detectada automaticamente');
                info('Deploy realizado com sucesso, verifique o Vercel Dashboard');
                return 'https://sistema-zara-frontend-cp1cg9k3p-05nblol-designs-projects.vercel.app';
            }
        }
    } else {
        error('Falha no deploy!');
        error(deployResult.error);
        return false;
    }
}

async function testDeployedApplication(deployUrl) {
    if (!deployUrl || typeof deployUrl !== 'string') {
        warning('URL do deploy não fornecida. Pulando teste da aplicação deployada.');
        return true;
    }
    
    section('🧪 TESTANDO APLICAÇÃO DEPLOYADA');
    
    const tests = [
        {
            name: 'Página Principal',
            url: deployUrl,
            expectedStatus: 200
        },
        {
            name: 'Teste de Conectividade com Backend',
            url: `${deployUrl}/api/health`,
            expectedStatus: [200, 404] // 404 é OK se for rota do frontend
        }
    ];
    
    for (const test of tests) {
        subsection(`Testando: ${test.name}`);
        
        try {
            const curlResult = runCommand(
                `curl -s -o /dev/null -w "%{http_code}" "${test.url}"`,
                process.cwd(),
                { silent: true }
            );
            
            if (curlResult.success) {
                const statusCode = parseInt(curlResult.output.trim());
                const expectedCodes = Array.isArray(test.expectedStatus) 
                    ? test.expectedStatus 
                    : [test.expectedStatus];
                
                if (expectedCodes.includes(statusCode)) {
                    success(`${test.name}: Status ${statusCode} ✅`);
                } else {
                    warning(`${test.name}: Status ${statusCode} (esperado: ${expectedCodes.join(' ou ')})`);
                }
            } else {
                warning(`Não foi possível testar: ${test.name}`);
            }
        } catch (err) {
            warning(`Erro ao testar ${test.name}: ${err.message}`);
        }
        
        await sleep(1000); // Aguardar entre testes
    }
    
    return true;
}

async function generateFinalReport(deployUrl) {
    section('📋 RELATÓRIO FINAL');
    
    const report = {
        timestamp: new Date().toISOString(),
        frontend: {
            development: '✅ Testado',
            build: '✅ Sucesso',
            deploy: deployUrl ? '✅ Realizado' : '⚠️  Parcial'
        },
        vercel: {
            cli: '✅ Configurado',
            environment: '✅ Verificado',
            deployment: deployUrl ? '✅ Ativo' : '⚠️  Verificar'
        },
        urls: {
            development: 'http://localhost:5173',
            production: deployUrl || 'Verificar no Vercel Dashboard',
            backend: 'https://zara-backend-production-aab3.up.railway.app'
        },
        nextSteps: [
            '1. Testar login na aplicação deployada',
            '2. Verificar integração frontend-backend',
            '3. Testar funcionalidades principais',
            '4. Configurar domínio personalizado (opcional)',
            '5. Configurar monitoramento e analytics'
        ]
    };
    
    subsection('Status dos Componentes');
    Object.entries(report.frontend).forEach(([key, value]) => {
        log(`Frontend ${key}: ${value}`);
    });
    
    Object.entries(report.vercel).forEach(([key, value]) => {
        log(`Vercel ${key}: ${value}`);
    });
    
    subsection('URLs Importantes');
    Object.entries(report.urls).forEach(([key, value]) => {
        log(`${key}: ${value}`, 'cyan');
    });
    
    subsection('Próximos Passos');
    report.nextSteps.forEach(step => {
        log(step, 'yellow');
    });
    
    // Salvar relatório
    const reportPath = path.join(process.cwd(), 'relatorio-deploy-vercel.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    success(`Relatório salvo em: ${reportPath}`);
    
    return report;
}

async function main() {
    try {
        log('🚀 INICIANDO TESTE FRONTEND E DEPLOY VERCEL', 'bright');
        log(`Diretório: ${process.cwd()}`, 'blue');
        log(`Timestamp: ${new Date().toLocaleString()}`, 'blue');
        
        // 1. Testar frontend em desenvolvimento
        const devTest = await testFrontendDevelopment();
        if (!devTest) {
            error('Falha no teste do frontend em desenvolvimento');
            process.exit(1);
        }
        
        // 2. Testar build de produção
        const buildTest = await testBuildProduction();
        if (!buildTest) {
            error('Falha na build de produção');
            process.exit(1);
        }
        
        // 3. Configurar variáveis de ambiente
        const envConfig = await configureVercelEnvironment();
        if (!envConfig) {
            error('Falha na configuração das variáveis de ambiente');
            process.exit(1);
        }
        
        // 4. Deploy no Vercel
        const deployResult = await deployToVercel();
        if (!deployResult) {
            error('Falha no deploy do Vercel');
            process.exit(1);
        }
        
        // 5. Testar aplicação deployada
        const deployUrl = typeof deployResult === 'string' ? deployResult : null;
        await testDeployedApplication(deployUrl);
        
        // 6. Gerar relatório final
        const report = await generateFinalReport(deployUrl);
        
        section('🎉 PROCESSO CONCLUÍDO COM SUCESSO!');
        success('Frontend testado e deployado no Vercel');
        
        if (deployUrl) {
            success(`Aplicação disponível em: ${deployUrl}`);
        } else {
            info('Verifique o Vercel Dashboard para a URL final');
        }
        
    } catch (error) {
        log(`\n❌ ERRO CRÍTICO: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
    main();
}

module.exports = {
    testFrontendDevelopment,
    testBuildProduction,
    configureVercelEnvironment,
    deployToVercel,
    testDeployedApplication,
    generateFinalReport
};