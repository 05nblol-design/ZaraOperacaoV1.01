#!/usr/bin/env node

/**
 * 🔧 CORREÇÃO DE AUTENTICAÇÃO FRONTEND LOCAL
 * 
 * Este script corrige o problema de login no frontend local
 * configurando um token válido no localStorage
 */

const https = require('https');

console.log('🔧 CORRIGINDO AUTENTICAÇÃO DO FRONTEND LOCAL...');
console.log('=' .repeat(60));

// Configurações
const BACKEND_URL = 'http://localhost:5000';
const CREDENTIALS = {
  email: 'admin@zara.com',
  password: '123456'
};

// Função para fazer login e obter token
const getAuthToken = async () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(CREDENTIALS);
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = require('http').request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200 && response.token) {
            resolve(response);
          } else {
            reject(new Error(`Login falhou: ${response.message || 'Erro desconhecido'}`));
          }
        } catch (error) {
          reject(new Error(`Erro ao parsear resposta: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Erro de conexão: ${error.message}`));
    });

    req.write(postData);
    req.end();
  });
};

// Função principal
const main = async () => {
  try {
    console.log('🔐 Fazendo login no backend local...');
    console.log(`📧 Email: ${CREDENTIALS.email}`);
    console.log(`🌐 Backend: ${BACKEND_URL}`);
    
    const authResponse = await getAuthToken();
    
    console.log('\n✅ Login realizado com sucesso!');
    console.log(`👤 Usuário: ${authResponse.user.name}`);
    console.log(`🎭 Role: ${authResponse.user.role}`);
    console.log(`🔑 Token: ${authResponse.token.substring(0, 20)}...`);
    
    // Gerar script HTML para configurar localStorage
    const htmlScript = `
<!DOCTYPE html>
<html>
<head>
    <title>Configuração de Token - Sistema ZARA</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .success { color: #28a745; }
        .info { color: #007bff; }
        .warning { color: #ffc107; }
        .code { background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
        button:hover { background: #0056b3; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Configuração de Token - Sistema ZARA</h1>
        
        <div class="success">
            <h3>✅ Token obtido com sucesso!</h3>
            <p><strong>Usuário:</strong> ${authResponse.user.name}</p>
            <p><strong>Role:</strong> ${authResponse.user.role}</p>
            <p><strong>Email:</strong> ${authResponse.user.email}</p>
        </div>
        
        <div class="info">
            <h3>🔑 Configurando localStorage...</h3>
            <p>Clique no botão abaixo para configurar automaticamente o token no seu navegador:</p>
        </div>
        
        <button onclick="configureToken()">🚀 Configurar Token</button>
        
        <div id="result" style="margin-top: 20px;"></div>
        
        <div class="warning" style="margin-top: 20px;">
            <h4>⚠️ Instruções:</h4>
            <ol>
                <li>Clique no botão "Configurar Token"</li>
                <li>Abra o frontend em <a href="http://localhost:5173" target="_blank">http://localhost:5173</a></li>
                <li>Faça refresh da página (F5)</li>
                <li>O login deve funcionar automaticamente</li>
            </ol>
        </div>
    </div>
    
    <script>
        const token = '${authResponse.token}';
        const user = ${JSON.stringify(authResponse.user)};
        
        function configureToken() {
            try {
                // Configurar token
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('isAuthenticated', 'true');
                
                // Mostrar resultado
                document.getElementById('result').innerHTML = \`
                    <div class="success">
                        <h4>✅ Token configurado com sucesso!</h4>
                        <p>Agora você pode acessar o frontend em <a href="http://localhost:5173" target="_blank">http://localhost:5173</a></p>
                        <div class="code">
                            <strong>Token:</strong> ${token.substring(0, 30)}...<br>
                            <strong>Usuário:</strong> ${authResponse.user.name}<br>
                            <strong>Role:</strong> ${authResponse.user.role}
                        </div>
                    </div>
                \`;
            } catch (error) {
                document.getElementById('result').innerHTML = \`
                    <div style="color: red;">
                        <h4>❌ Erro ao configurar token:</h4>
                        <p>\${error.message}</p>
                    </div>
                \`;
            }
        }
        
        // Auto-configurar se estiver no localhost
        if (window.location.hostname === 'localhost') {
            console.log('🔧 Auto-configurando token para localhost...');
            configureToken();
        }
    </script>
</body>
</html>
`;
    
    // Salvar arquivo HTML
    const fs = require('fs');
    const htmlPath = './fix-token-local.html';
    fs.writeFileSync(htmlPath, htmlScript);
    
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('1. Abra o arquivo: fix-token-local.html');
    console.log('2. Clique em "Configurar Token"');
    console.log('3. Acesse http://localhost:5173');
    console.log('4. Faça refresh da página (F5)');
    console.log('\n✅ O login deve funcionar automaticamente!');
    
  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.log('\n🔍 VERIFICAÇÕES:');
    console.log('- Backend local está rodando? (http://localhost:5000)');
    console.log('- Credenciais estão corretas?');
    console.log('- Banco de dados está acessível?');
    process.exit(1);
  }
};

// Executar
main();