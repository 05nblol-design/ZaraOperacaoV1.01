const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const fileUpload = require('express-fileupload');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { createHTTPSServer, httpsRedirect, httpsSecurityHeaders } = require('./config/ssl');
const path = require('path');
require('dotenv').config();
const logger = require('./utils/logger');

// Importar configurações
const { connectDB, prisma } = require('./config/database');
// const { connectRedis } = require('./config/redis'); // Desabilitado para desenvolvimento
const { initSentry } = require('./config/sentry');
const { 
  getCorsConfig, 
  getHelmetConfig, 
  getRateLimitConfig 
} = require('./config/security');

// Importar rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const machineRoutes = require('./routes/machines');
const productionRoutes = require('./routes/production');
const qualityTestRoutes = require('./routes/qualityTests');
const teflonRoutes = require('./routes/teflon');
const notificationRoutes = require('./routes/notifications');
const reportRoutes = require('./routes/reports');
const uploadRoutes = require('./routes/upload');
const permissionRoutes = require('./routes/permissions');

// Importar middlewares
const { authenticateToken } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');
const { 
  validateSecurityHeaders, 
  sanitizeInput, 
  detectSQLInjection, 
  securityLogger, 
  addSecurityHeaders
} = require('./middleware/security');

// Importar socket handlers
const socketHandler = require('./socket/socketHandler');

// Importar serviços de notificação
const NotificationService = require('./services/notificationService');
const SchedulerService = require('./services/schedulerService');
const RealTimeProductionService = require('./services/realTimeProductionService');

const app = express();

// Configurar trust proxy para Railway (corrige ERR_ERL_UNEXPECTED_X_FORWARDED_FOR)
app.set('trust proxy', 1);

// Criar servidor HTTP
const server = createServer(app);

// Criar servidor HTTPS se SSL estiver habilitado
const httpsServer = createHTTPSServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? [process.env.CLIENT_URL || process.env.FRONTEND_URL]
      : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

// Inicializar Sentry
initSentry(app);

// Configurações de segurança
const rateLimitConfig = getRateLimitConfig();
const corsOptions = getCorsConfig();
const helmetOptions = getHelmetConfig();

// Rate limiting - configuração baseada no ambiente
const limiter = rateLimit(rateLimitConfig.general);

// Rate limiters específicos
const authLimiter = rateLimit(rateLimitConfig.auth);
const uploadLimiter = rateLimit(rateLimitConfig.upload);

// Middlewares globais
app.use(helmet());
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(securityLogger);
app.use(addSecurityHeaders);
app.use(httpsRedirect);
app.use(httpsSecurityHeaders);
// app.use(limiter); // RATE LIMITING GERAL DESABILITADO
app.use(cors(corsOptions));
// app.use(validateSecurityHeaders); // DESABILITADO TEMPORARIAMENTE
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// app.use(sanitizeInput); // DESABILITADO TEMPORARIAMENTE PARA TESTAR NOTIFICAÇÕES
// app.use(detectSQLInjection); // DESABILITADO TEMPORARIAMENTE PARA TESTAR NOTIFICAÇÕES
app.use(fileUpload({
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  abortOnLimit: true,
  createParentPath: true
}));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conectar ao banco de dados
connectDB();
// connectRedis(); // Desabilitado para desenvolvimento

// Configurar Socket.IO
socketHandler(io);

// Configurar Socket.IO no NotificationService para notificações em tempo real
NotificationService.setSocketIO(io);

// Inicializar serviços de notificação
if (process.env.NOTIFICATIONS_ENABLED === 'true') {
  logger.info('📧 Serviços de notificação habilitados');
}

// Inicializar agendador de tarefas
if (process.env.SCHEDULER_ENABLED === 'true') {
  logger.info('⏰ Agendador de tarefas habilitado');
}

// Inicializar serviço de produção em tempo real
const productionService = new RealTimeProductionService(io);
productionService.start();
logger.info('🏭 Serviço de produção em tempo real iniciado');

// Disponibilizar io para as rotas
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Rotas públicas - RATE LIMITING REMOVIDO
app.use('/api/auth', authRoutes);

// Rotas protegidas
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/machines', authenticateToken, machineRoutes);
app.use('/api/machines/production', authenticateToken, productionRoutes);
app.use('/api/reports', authenticateToken, productionRoutes);
app.use('/api/quality-tests', authenticateToken, qualityTestRoutes);
app.use('/api/teflon', authenticateToken, teflonRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);
app.use('/api/reports', authenticateToken, reportRoutes);
app.use('/api/upload', authenticateToken, uploadLimiter, uploadRoutes);
app.use('/api/permissions', authenticateToken, permissionRoutes);
app.use('/api/shifts', authenticateToken, require('./routes/shifts'));

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.1',
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    }
  });
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

const PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 443;

// Iniciar servidor HTTP
server.listen(PORT, () => {
  logger.info(`🚀 Servidor ZARA (HTTP) rodando na porta ${PORT}`);
  logger.info(`🌍 Ambiente: ${process.env.NODE_ENV}`);
  logger.info(`📊 Health check: ${process.env.NODE_ENV === 'production' ? process.env.RAILWAY_STATIC_URL || 'https://production-url' : `http://localhost:${PORT}`}/api/health`);
});

// Iniciar servidor HTTPS se disponível (desabilitado no Railway)
if (httpsServer && process.env.SSL_ENABLED === 'true' && process.env.RAILWAY_ENVIRONMENT !== 'production') {
  httpsServer.listen(HTTPS_PORT, () => {
    logger.info(`🔒 Servidor ZARA (HTTPS) rodando na porta ${HTTPS_PORT}`);
    logger.info(`🔐 SSL/TLS habilitado`);
    logger.info(`📊 Health check: https://localhost:${HTTPS_PORT}/api/health`);
  });

  // Configurar Socket.IO para HTTPS também
  const httpsIO = new Server(httpsServer, {
    cors: corsOptions
  });
  
  // Aplicar handlers do socket para HTTPS
  socketHandler(httpsIO);
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('🛑 Recebido SIGTERM, encerrando servidor...');
  server.close(() => {
    logger.info('✅ Servidor encerrado com sucesso');
    process.exit(0);
  });
});

module.exports = { app, server, io };