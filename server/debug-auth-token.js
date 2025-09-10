const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function debugAuthToken() {
  try {
    console.log('🔍 DEBUG: Testando autenticação completa...');
    
    // 1. Verificar usuário no banco
    const user = await prisma.user.findUnique({
      where: { email: 'admin@zara.com' },
      select: { id: true, email: true, name: true, role: true, password: true }
    });
    
    if (!user) {
      console.log('❌ Usuário não encontrado!');
      return;
    }
    
    console.log('✅ Usuário encontrado:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });
    
    // 2. Verificar senha
    const passwordMatch = await bcrypt.compare('admin123', user.password);
    console.log('🔐 Senha válida:', passwordMatch);
    
    // 3. Gerar token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    console.log('🎫 Token gerado:', token.substring(0, 50) + '...');
    
    // 4. Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('✅ Token decodificado:', decoded);
    
    // 5. Buscar usuário pelo ID do token
    const tokenUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true }
    });
    
    console.log('👤 Usuário do token:', tokenUser);
    
    // 6. Verificar permissões
    const allowedRoles = ['MANAGER', 'ADMIN'];
    const hasPermission = allowedRoles.includes(tokenUser.role);
    
    console.log('🔐 Permissão para endpoints Manager:', hasPermission);
    
    // 7. Testar endpoint diretamente
    console.log('\n🧪 Testando endpoint machine-performance...');
    
    const axios = require('axios');
    
    try {
      const response = await axios.get(
        'https://zara-backend-production-aab3.up.railway.app/api/reports/machine-performance',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Endpoint respondeu:', response.status);
      console.log('📊 Dados:', response.data);
      
    } catch (error) {
      console.log('❌ Erro no endpoint:', error.response?.status, error.response?.statusText);
      console.log('📝 Resposta:', error.response?.data);
      console.log('🔍 Headers enviados:', error.config?.headers);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAuthToken();