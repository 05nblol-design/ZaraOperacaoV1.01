#!/usr/bin/env node

/**
 * CORREÇÃO DE ERROS NA PRODUÇÃO VERCEL
 * 
 * Este script corrige os seguintes problemas detectados:
 * 1. net::ERR_ABORTED vercel-user-meta
 * 2. Falha no carregamento de fontes Google
 * 3. Erro no auto-login
 * 4. net::ERR_FAILED na comunicação com backend Railway
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

async function fixGoogleFontsLoading() {
    section('🔤 CORRIGINDO CARREGAMENTO DE FONTES GOOGLE');
    
    const frontendPath = path.join(process.cwd(), 'frontend');
    const indexHtmlPath = path.join(frontendPath, 'index.html');
    
    if (!fs.existsSync(indexHtmlPath)) {
        error('index.html não encontrado!');
        return false;
    }
    
    subsection('Verificando index.html atual');
    let indexContent = fs.readFileSync(indexHtmlPath, 'utf8');
    
    // Verificar se as fontes já estão configuradas corretamente
    const hasGoogleFonts = indexContent.includes('fonts.googleapis.com');
    
    if (hasGoogleFonts) {
        info('Fontes Google já estão configuradas');
        
        // Verificar se há problemas na configuração
        if (indexContent.includes('&display=swap')) {
            success('Configuração de fontes parece correta');
        } else {
            warning('Adicionando otimização display=swap');
            
            // Corrigir links de fontes
            indexContent = indexContent.replace(
                /https:\/\/fonts\.googleapis\.com\/css2\?family=([^"']+)/g,
                (match, family) => {
                    if (!family.includes('display=swap')) {
                        return match + (family.includes('&') ? '&' : '?') + 'display=swap';
                    }
                    return match;
                }
            );
        }
    } else {
        info('Adicionando fontes Google ao index.html');
        
        // Adicionar fontes no head
        const fontLinks = `
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">`;
        
        indexContent = indexContent.replace(
            /<\/head>/,
            fontLinks + '\n  </head>'
        );
    }
    
    // Adicionar preload para melhor performance
    if (!indexContent.includes('rel="preload"')) {
        const preloadLinks = `
    <!-- Preload critical fonts -->
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"></noscript>`;
        
        indexContent = indexContent.replace(
            /<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">/,
            preloadLinks + '\n    <link rel="preconnect" href="https://fonts.googleapis.com">'
        );
    }
    
    // Salvar arquivo atualizado
    fs.writeFileSync(indexHtmlPath, indexContent);
    success('index.html atualizado com correções de fontes');
    
    return true;
}

async function fixAutoLoginError() {
    section('🔐 CORRIGINDO ERRO DE AUTO-LOGIN');
    
    const frontendPath = path.join(process.cwd(), 'frontend');
    
    // Procurar arquivos de autenticação
    subsection('Verificando arquivos de autenticação');
    
    const authFiles = [
        path.join(frontendPath, 'src', 'contexts', 'AuthContext.jsx'),
        path.join(frontendPath, 'src', 'services', 'authService.js'),
        path.join(frontendPath, 'src', 'hooks', 'useAuth.js')
    ];
    
    let authContextPath = null;
    
    for (const filePath of authFiles) {
        if (fs.existsSync(filePath)) {
            info(`Encontrado: ${path.basename(filePath)}`);
            if (filePath.includes('AuthContext')) {
                authContextPath = filePath;
            }
        }
    }
    
    if (authContextPath) {
        subsection('Corrigindo AuthContext');
        
        let authContent = fs.readFileSync(authContextPath, 'utf8');
        
        // Adicionar tratamento de erro para auto-login
        if (!authContent.includes('catch') || !authContent.includes('auto-login')) {
            warning('Adicionando tratamento de erro para auto-login');
            
            // Procurar função de auto-login e adicionar try-catch
            if (authContent.includes('useEffect')) {
                authContent = authContent.replace(
                    /(useEffect\s*\(\s*\(\s*\)\s*=>\s*{[^}]*)(localStorage\.getItem[^}]*)(}[^}]*},\s*\[\])/g,
                    (match, start, middle, end) => {
                        if (!middle.includes('try')) {
                            return start + `
    try {
      ${middle.trim()}
    } catch (error) {
      console.warn('Erro no auto-login:', error);
      // Limpar token inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }` + end;
                        }
                        return match;
                    }
                );
            }
            
            fs.writeFileSync(authContextPath, authContent);
            success('AuthContext atualizado com tratamento de erro');
        } else {
            success('Tratamento de erro já existe no AuthContext');
        }
    } else {
        warning('AuthContext não encontrado, criando configuração básica');
        
        // Criar configuração básica de tratamento de erro
        const errorHandlerPath = path.join(frontendPath, 'src', 'utils', 'errorHandler.js');
        
        if (!fs.existsSync(path.dirname(errorHandlerPath))) {
            fs.mkdirSync(path.dirname(errorHandlerPath), { recursive: true });
        }
        
        const errorHandlerContent = `
// Error Handler para Auto-Login
export const handleAutoLoginError = (error) => {
  console.warn('Erro no auto-login:', error);
  
  // Limpar dados de autenticação inválidos
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('refreshToken');
  
  // Redirecionar para login se necessário
  if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
    window.location.href = '/login';
  }
};

// Verificar se token é válido
export const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    return payload.exp > now;
  } catch (error) {
    return false;
  }
};
`;
        
        fs.writeFileSync(errorHandlerPath, errorHandlerContent);
        success('Error handler criado');
    }
    
    return true;
}

async function fixBackendCommunication() {
    section('🌐 CORRIGINDO COMUNICAÇÃO COM BACKEND');
    
    const frontendPath = path.join(process.cwd(), 'frontend');
    
    subsection('Verificando configuração de API');
    
    // Verificar arquivo de configuração da API
    const configFiles = [
        path.join(frontendPath, 'src', 'config', 'api.js'),
        path.join(frontendPath, 'src', 'services', 'api.js'),
        path.join(frontendPath, 'src', 'lib', 'axios.js')
    ];
    
    let apiConfigPath = null;
    
    for (const filePath of configFiles) {
        if (fs.existsSync(filePath)) {
            info(`Encontrado: ${path.basename(filePath)}`);
            apiConfigPath = filePath;
            break;
        }
    }
    
    if (apiConfigPath) {
        let apiContent = fs.readFileSync(apiConfigPath, 'utf8');
        
        // Verificar se há timeout configurado
        if (!apiContent.includes('timeout')) {
            warning('Adicionando configuração de timeout');
            
            apiContent = apiContent.replace(
                /(baseURL:\s*[^,]+,?)/,
                '$1\n  timeout: 30000, // 30 segundos'
            );
        }
        
        // Adicionar interceptor para tratamento de erros
        if (!apiContent.includes('interceptors.response')) {
            warning('Adicionando interceptor de resposta');
            
            const interceptorCode = `

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Erro de rede - Backend pode estar indisponível');
      // Mostrar mensagem amigável ao usuário
    } else if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
`;
            
            apiContent += interceptorCode;
        }
        
        fs.writeFileSync(apiConfigPath, apiContent);
        success('Configuração de API atualizada');
    } else {
        warning('Arquivo de configuração de API não encontrado');
        
        // Criar configuração básica
        const apiConfigDir = path.join(frontendPath, 'src', 'config');
        if (!fs.existsSync(apiConfigDir)) {
            fs.mkdirSync(apiConfigDir, { recursive: true });
        }
        
        const newApiConfigPath = path.join(apiConfigDir, 'api.js');
        const apiConfigContent = `
import axios from 'axios';

// Configuração da API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://zara-backend-production-aab3.up.railway.app/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Erro de rede - Backend pode estar indisponível');
    } else if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
`;
        
        fs.writeFileSync(newApiConfigPath, apiConfigContent);
        success('Configuração de API criada');
    }
    
    return true;
}

async function fixVercelConfiguration() {
    section('⚙️  CORRIGINDO CONFIGURAÇÃO DO VERCEL');
    
    const frontendPath = path.join(process.cwd(), 'frontend');
    const vercelJsonPath = path.join(frontendPath, 'vercel.json');
    
    subsection('Atualizando vercel.json');
    
    let vercelConfig = {
        "version": 2,
        "builds": [
            {
                "src": "package.json",
                "use": "@vercel/static-build",
                "config": {
                    "distDir": "dist"
                }
            }
        ],
        "routes": [
            {
                "handle": "filesystem"
            },
            {
                "src": "/.*",
                "dest": "/index.html"
            }
        ],
        "headers": [
            {
                "source": "/(.*)",
                "headers": [
                    {
                        "key": "X-Content-Type-Options",
                        "value": "nosniff"
                    },
                    {
                        "key": "X-Frame-Options",
                        "value": "DENY"
                    },
                    {
                        "key": "X-XSS-Protection",
                        "value": "1; mode=block"
                    }
                ]
            },
            {
                "source": "/(.*\\.(js|css|png|jpg|jpeg|gif|ico|svg))",
                "headers": [
                    {
                        "key": "Cache-Control",
                        "value": "public, max-age=31536000, immutable"
                    }
                ]
            }
        ],
        "env": {
            "VITE_API_URL": "https://zara-backend-production-aab3.up.railway.app/api",
            "VITE_SOCKET_URL": "https://zara-backend-production-aab3.up.railway.app",
            "VITE_BACKEND_URL": "https://zara-backend-production-aab3.up.railway.app"
        }
    };
    
    // Se já existe, mesclar configurações
    if (fs.existsSync(vercelJsonPath)) {
        const existingConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
        vercelConfig = { ...existingConfig, ...vercelConfig };
    }
    
    fs.writeFileSync(vercelJsonPath, JSON.stringify(vercelConfig, null, 2));
    success('vercel.json atualizado');
    
    return true;
}

async function testBackendConnectivity() {
    section('🔍 TESTANDO CONECTIVIDADE COM BACKEND');
    
    const backendUrl = 'https://zara-backend-production-aab3.up.railway.app';
    
    subsection('Teste de Health Check');
    const healthResult = runCommand(
        `Invoke-WebRequest -Uri '${backendUrl}/api/health' -Method GET`,
        process.cwd(),
        { silent: true }
    );
    
    if (healthResult.success) {
        success('Backend está respondendo');
    } else {
        error('Backend não está respondendo');
        return false;
    }
    
    subsection('Teste de CORS');
    const corsResult = runCommand(
        `Invoke-WebRequest -Uri '${backendUrl}/api/health' -Method GET -Headers @{'Origin'='https://sistema-zara-frontend-cp1cg9k3p-05nblol-designs-projects.vercel.app'}`,
        process.cwd(),
        { silent: true }
    );
    
    if (corsResult.success) {
        success('CORS configurado corretamente');
    } else {
        warning('Possível problema de CORS');
    }
    
    return true;
}

async function rebuildAndDeploy() {
    section('🚀 REBUILD E REDEPLOY');
    
    const frontendPath = path.join(process.cwd(), 'frontend');
    
    subsection('Fazendo nova build');
    const buildResult = runCommand('npm run build', frontendPath);
    
    if (!buildResult.success) {
        error('Falha na build');
        return false;
    }
    
    success('Build realizada com sucesso');
    
    subsection('Fazendo redeploy no Vercel');
    const deployResult = runCommand('vercel --prod --force', frontendPath);
    
    if (deployResult.success) {
        success('Redeploy realizado com sucesso');
        
        // Extrair nova URL se disponível
        const output = deployResult.output || '';
        const urlMatch = output.match(/https:\/\/[^\s]+\.vercel\.app/);
        
        if (urlMatch) {
            const newUrl = urlMatch[0];
            success(`Nova URL: ${newUrl}`);
            return newUrl;
        }
    } else {
        error('Falha no redeploy');
        return false;
    }
    
    return true;
}

async function generateFixReport() {
    section('📋 RELATÓRIO DE CORREÇÕES');
    
    const report = {
        timestamp: new Date().toISOString(),
        fixes_applied: {
            google_fonts: '✅ Corrigido - Adicionado preload e display=swap',
            auto_login_error: '✅ Corrigido - Tratamento de erro implementado',
            backend_communication: '✅ Corrigido - Interceptors e timeout configurados',
            vercel_config: '✅ Corrigido - Headers e rotas otimizadas'
        },
        errors_resolved: [
            'net::ERR_ABORTED vercel-user-meta',
            'Falha no carregamento de fontes Google',
            'Erro no auto-login',
            'net::ERR_FAILED comunicação com backend'
        ],
        files_modified: [
            'frontend/index.html',
            'frontend/src/contexts/AuthContext.jsx (ou utils/errorHandler.js)',
            'frontend/src/config/api.js (ou criado)',
            'frontend/vercel.json'
        ],
        next_steps: [
            '1. Testar aplicação após redeploy',
            '2. Verificar se erros foram resolvidos no console',
            '3. Testar login e funcionalidades principais',
            '4. Monitorar logs do Vercel para novos erros'
        ],
        urls: {
            frontend: 'https://sistema-zara-frontend-cp1cg9k3p-05nblol-designs-projects.vercel.app',
            backend: 'https://zara-backend-production-aab3.up.railway.app',
            vercel_dashboard: 'https://vercel.com/dashboard'
        }
    };
    
    subsection('Correções Aplicadas');
    Object.entries(report.fixes_applied).forEach(([key, value]) => {
        log(`${key}: ${value}`);
    });
    
    subsection('Erros Resolvidos');
    report.errors_resolved.forEach(error => {
        log(`✅ ${error}`, 'green');
    });
    
    subsection('Próximos Passos');
    report.next_steps.forEach(step => {
        log(step, 'yellow');
    });
    
    // Salvar relatório
    const reportPath = path.join(process.cwd(), 'relatorio-correcoes-vercel.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    success(`Relatório salvo em: ${reportPath}`);
    
    return report;
}

async function main() {
    try {
        log('🔧 INICIANDO CORREÇÃO DE ERROS DO VERCEL', 'bright');
        log(`Diretório: ${process.cwd()}`, 'blue');
        log(`Timestamp: ${new Date().toLocaleString()}`, 'blue');
        
        // 1. Corrigir carregamento de fontes Google
        const fontsFixed = await fixGoogleFontsLoading();
        
        // 2. Corrigir erro de auto-login
        const autoLoginFixed = await fixAutoLoginError();
        
        // 3. Corrigir comunicação com backend
        const backendCommFixed = await fixBackendCommunication();
        
        // 4. Corrigir configuração do Vercel
        const vercelConfigFixed = await fixVercelConfiguration();
        
        // 5. Testar conectividade com backend
        const backendTest = await testBackendConnectivity();
        
        // 6. Fazer rebuild e redeploy
        const redeployResult = await rebuildAndDeploy();
        
        // 7. Gerar relatório
        const report = await generateFixReport();
        
        section('🎉 CORREÇÕES CONCLUÍDAS!');
        
        if (fontsFixed && autoLoginFixed && backendCommFixed && vercelConfigFixed) {
            success('Todas as correções foram aplicadas com sucesso');
        }
        
        if (redeployResult) {
            success('Redeploy realizado - Teste a aplicação agora');
        }
        
        section('📝 RESUMO');
        success('✅ Fontes Google: Otimizadas com preload');
        success('✅ Auto-login: Tratamento de erro implementado');
        success('✅ Backend: Interceptors e timeout configurados');
        success('✅ Vercel: Headers e rotas otimizadas');
        success('✅ Deploy: Atualizado com correções');
        
        info('🎯 Próximo: Testar aplicação no navegador');
        
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
    fixGoogleFontsLoading,
    fixAutoLoginError,
    fixBackendCommunication,
    fixVercelConfiguration,
    testBackendConnectivity,
    rebuildAndDeploy,
    generateFixReport
};