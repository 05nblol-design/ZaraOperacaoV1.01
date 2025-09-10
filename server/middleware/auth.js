const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { captureException } = require('../config/sentry');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
  try {
    console.log('🔍 AUTH DEBUG - Headers:', req.headers);
    logger.info('🔐 AuthenticateToken middleware iniciado');
    logger.info('🔐 URL:', req.method, req.originalUrl);
    
    const authHeader = req.headers['authorization'];
    console.log('🔍 AUTH DEBUG - Auth header:', authHeader);
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    console.log('🔍 AUTH DEBUG - Token:', token ? 'Token presente' : 'Token ausente');
    
    logger.info('🔐 AuthHeader:', authHeader ? 'Presente' : 'Ausente');
    logger.info('🔐 Token:', token ? 'Presente' : 'Ausente');

    if (!token) {
      logger.info('🔐 ❌ Token não fornecido');
      return res.status(401).json({ 
        message: 'Token de acesso requerido',
        code: 'NO_TOKEN'
      });
    }

    // Verificar token
    logger.info('🔐 Verificando token JWT...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logger.info('🔐 Token decodificado:', { id: decoded.id, exp: decoded.exp });
    
    // Verificar se é um dos usuários de teste
    const testUsers = {
      '507f1f77bcf86cd799439011': {
        id: '507f1f77bcf86cd799439011',
        email: 'operador@zara.com',
        name: 'Operador Teste',
        role: 'OPERATOR',
        isActive: true
      },
      '507f1f77bcf86cd799439012': {
        id: '507f1f77bcf86cd799439012',
        email: 'leader@zara.com',
        name: 'Líder Teste',
        role: 'LEADER',
        isActive: true
      },
      '507f1f77bcf86cd799439013': {
        id: '507f1f77bcf86cd799439013',
        email: 'manager@zara.com',
        name: 'Gestor Teste',
        role: 'MANAGER',
        isActive: true
      },
      '507f1f77bcf86cd799439014': {
        id: '507f1f77bcf86cd799439014',
        email: 'admin@zara.com',
        name: 'Admin Teste',
        role: 'ADMIN',
        isActive: true
      }
    };
    
    let user = testUsers[decoded.id];
    
    logger.info('🔐 Usuário de teste encontrado:', user ? 'Sim' : 'Não');
    
    if (!user) {
      // Buscar usuário no banco se não for usuário de teste
      // Converter para número se for string numérica
      const userId = typeof decoded.id === 'string' && !isNaN(decoded.id) 
        ? parseInt(decoded.id) 
        : decoded.id;
        
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          isActive: true
        }
      });
    }

    if (!user) {
      return res.status(401).json({ 
        message: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Usuário inativo',
        code: 'USER_INACTIVE'
      });
    }

    // Adicionar usuário ao request
    req.user = user;
    logger.info('🔐 ✅ Autenticação bem-sucedida para:', user.email);
    next();

  } catch (error) {
    logger.error('🔐 ❌ Erro na autenticação:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }

    captureException(error, { context: 'authenticateToken' });
    return res.status(500).json({ 
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Middleware para verificar permissões por role
const requireRole = (roles) => {
  return (req, res, next) => {
    logger.info('RequireRole middleware - req.user:', req.user);
    logger.info('RequireRole middleware - required roles:', roles);
    
    if (!req.user) {
      logger.info('RequireRole middleware - Usuário não autenticado');
      return res.status(401).json({ 
        message: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    logger.info('RequireRole middleware - userRole:', userRole, 'allowedRoles:', allowedRoles);

    if (!allowedRoles.includes(userRole)) {
      logger.info('RequireRole middleware - Acesso negado');
      return res.status(403).json({ 
        message: 'Acesso negado - permissão insuficiente',
        code: 'INSUFFICIENT_PERMISSION',
        required: allowedRoles,
        current: userRole
      });
    }

    logger.info('RequireRole middleware - Acesso permitido');
    next();
  };
};

// Middleware específicos por role
const requireOperator = requireRole(['OPERATOR', 'LEADER', 'MANAGER', 'ADMIN']);
const requireLeader = requireRole(['LEADER', 'MANAGER', 'ADMIN']);
const requireManager = requireRole(['MANAGER', 'ADMIN']);
const requireAdmin = requireRole(['ADMIN']);

// Função para gerar token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Middleware para verificar permissões específicas de máquina
const requireMachinePermission = (permissionType = 'canView') => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = req.user;

      logger.info('🔐 MACHINE PERMISSION DEBUG - ID:', id, 'User:', user?.email, 'Role:', user?.role, 'Permission:', permissionType);

      if (!user) {
        logger.error('🔐 MACHINE PERMISSION - Usuário não autenticado');
        return res.status(401).json({ 
          message: 'Usuário não autenticado',
          code: 'NOT_AUTHENTICATED'
        });
      }

      // Admins e Managers têm acesso total
      if (['ADMIN', 'MANAGER'].includes(user.role)) {
        logger.info('🔐 MACHINE PERMISSION - Usuário ADMIN/MANAGER, acesso liberado');
        return next();
      }

      // Para operadores e líderes, verificar permissões específicas
      if (user.role === 'OPERATOR') {
        logger.info('🔍 OPERATOR DEBUG - ID original:', id, 'tipo:', typeof id);
        
        const machineId = parseInt(id);
        
        logger.info('🔍 OPERATOR DEBUG - ID convertido:', machineId, 'isNaN:', isNaN(machineId), 'tipo:', typeof machineId);
        
        if (!machineId || isNaN(machineId)) {
          logger.error('🔍 OPERATOR DEBUG - ID inválido detectado:', { 
            idOriginal: id, 
            idConvertido: machineId, 
            isNaN: isNaN(machineId),
            tipoOriginal: typeof id,
            tipoConvertido: typeof machineId
          });
          return res.status(400).json({
            success: false,
            message: 'Dados de entrada inválidos',
            code: 'VALIDATION_ERROR'
          });
        }
        
        logger.info('🔍 OPERATOR DEBUG - ID válido, prosseguindo com verificação da máquina');
        
        // Verificar se a máquina existe
        const machine = await prisma.machine.findUnique({
          where: { id: machineId },
          select: { id: true }
        });
        
        if (!machine) {
          return res.status(404).json({
            success: false,
            message: 'Máquina não encontrada',
            code: 'MACHINE_NOT_FOUND'
          });
        }

        // Verificar se o operador tem permissão para esta máquina
        const permission = await prisma.machinePermission.findUnique({
          where: {
            userId_machineId: {
              userId: user.id,
              machineId: machineId
            }
          }
        });

        if (!permission || !permission[permissionType]) {
          return res.status(403).json({
            success: false,
            message: 'Você não tem permissão para visualizar esta máquina',
            code: 'MACHINE_ACCESS_DENIED'
          });
        }
      }

      next();
    } catch (error) {
      logger.error('Erro no middleware de permissão de máquina:', error);
      captureException(error, { context: 'requireMachinePermission' });
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

// Função para verificar se token é válido (sem middleware)
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireOperator,
  requireLeader,
  requireManager,
  requireAdmin,
  requireMachinePermission,
  generateToken,
  verifyToken
};