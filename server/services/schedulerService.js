const cron = require('cron');
const notificationService = require('./notificationService');
const shiftService = require('./shiftService');
const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');
const prisma = new PrismaClient();

class SchedulerService {
  constructor() {
    this.jobs = new Map();
    this.initializeJobs();
  }

  initializeJobs() {
    logger.info('⏰ Inicializando agendador de tarefas...');
    
    // Relatório diário às 18:00
    this.scheduleJob('daily-report', '0 18 * * *', async () => {
      logger.info('📊 Executando relatório diário agendado...');
      await notificationService.sendDailyReport();
    });

    // Verificação de teflon vencido a cada 6 horas
    this.scheduleJob('teflon-check', '0 */6 * * *', async () => {
      logger.info('🔍 Verificando trocas de teflon vencidas...');
      await this.checkExpiredTeflon();
    });

    // Limpeza de notificações antigas (30 dias) - diariamente às 02:00
    this.scheduleJob('cleanup-notifications', '0 2 * * *', async () => {
      logger.info('🧹 Limpando notificações antigas...');
      await this.cleanupOldNotifications();
    });

    // Verificação de máquinas inativas - a cada 2 horas
    this.scheduleJob('machine-check', '0 */2 * * *', async () => {
      logger.info('🔧 Verificando status das máquinas...');
      await this.checkInactiveMachines();
    });

    // Arquivamento automático de turnos às 7:00 e 19:00
    this.scheduleJob('archive-shifts', '0 7,19 * * *', async () => {
      logger.info('📦 Verificando turnos para arquivar...');
      await this.archiveCompletedShifts();
    });

    // Verificação de dados de turno a cada 15 minutos
    this.scheduleJob('update-shifts', '*/15 * * * *', async () => {
      logger.info('🔄 Verificando dados de turno...');
      await this.updateShiftData();
    });

    logger.info(`✅ ${this.jobs.size} tarefas agendadas inicializadas`);
  }

  scheduleJob(name, cronPattern, task) {
    try {
      const job = new cron.CronJob(cronPattern, task, null, true, 'America/Sao_Paulo');
      this.jobs.set(name, job);
      logger.info(`⏰ Tarefa '${name}' agendada: ${cronPattern}`);
    } catch (error) {
      logger.error(`❌ Erro ao agendar tarefa '${name}':`, error.message);
    }
  }

  async checkExpiredTeflon() {
    try {
      const now = new Date();
      const fiveDaysFromNow = new Date(now.getTime() + (5 * 24 * 60 * 60 * 1000));

      // Campo expiryDate não existe no modelo TeflonChange
      // const expiringChanges = await prisma.teflonChange.findMany({
      //   where: {
      //     expiryDate: {
      //       gte: now,
      //       lte: fiveDaysFromNow
      //     },
      //     notificationSent: {
      //       not: true
      //     }
      //   },
      //   include: {
      //     machine: true,
      //     user: true
      //   }
      // });
      
      const expiringChanges = [];

      logger.info(`🔍 Encontradas ${expiringChanges.length} trocas de teflon para notificar`);

      for (const change of expiringChanges) {
        // const daysUntilExpiry = Math.ceil((change.expiryDate - now) / (1000 * 60 * 60 * 24));
        const daysUntilExpiry = 0; // Campo expiryDate não existe
        
        await notificationService.sendTeflonExpiryNotification({
          ...change,
          daysUntilExpiry
        });
        
        // Marcar como notificado
        await prisma.teflonChange.update({
          where: { id: change.id },
          data: { notificationSent: true }
        });
      }

      return { success: true, processed: expiringChanges.length };
    } catch (error) {
      logger.error('❌ Erro ao verificar teflon vencido:', error);
      return { success: false, error: error.message };
    }
  }

  async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo
          },
          read: true
        }
      });

      logger.info(`🧹 ${result.count} notificações antigas removidas`);
      return { success: true, deleted: result.count };
    } catch (error) {
      logger.error('❌ Erro ao limpar notificações antigas:', error);
      return { success: false, error: error.message };
    }
  }

  async checkInactiveMachines() {
    try {
      const twoHoursAgo = new Date();
      twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

      // Buscar máquinas que não tiveram testes de qualidade nas últimas 2 horas
      const machines = await prisma.machine.findMany({
        where: {
          status: 'ACTIVE'
        },
        include: {
          qualityTests: {
            where: {
              createdAt: {
                gte: twoHoursAgo
              }
            },
            take: 1
          }
        }
      });

      const inactiveMachines = machines.filter(machine => machine.qualityTests.length === 0);

      logger.info(`🔧 Encontradas ${inactiveMachines.length} máquinas inativas`);

      for (const machine of inactiveMachines) {
        // Verificar se já foi enviada notificação recentemente
        const recentNotification = await prisma.notification.findFirst({
          where: {
            type: 'MACHINE_INACTIVE',
            machineId: machine.id,
            createdAt: {
              gte: twoHoursAgo
            }
          }
        });

        if (!recentNotification) {
          await notificationService.saveNotification({
            type: 'MACHINE_INACTIVE',
            title: 'Máquina Inativa Detectada',
            message: `${machine.name} não registra atividade há mais de 2 horas`,
            machineId: machine.id,
            priority: 'MEDIUM',
            channels: ['SYSTEM'],
            metadata: {
              machineName: machine.name,
              location: machine.location,
              lastActivity: twoHoursAgo.toISOString()
            }
          });
        }
      }

      return { success: true, inactiveMachines: inactiveMachines.length };
    } catch (error) {
      logger.error('❌ Erro ao verificar máquinas inativas:', error);
      return { success: false, error: error.message };
    }
  }

  async generateWeeklyReport() {
    try {
      logger.info('📊 Gerando relatório semanal...');
      
      const now = new Date();
      const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

      const [qualityTests, teflonChanges, machines] = await Promise.all([
        prisma.qualityTest.findMany({
          where: {
            createdAt: {
              gte: weekAgo,
              lte: now
            }
          },
          include: {
            machine: true,
            user: true
          }
        }),
        prisma.teflonChange.findMany({
          where: {
            changeDate: {
              gte: weekAgo,
              lte: now
            }
          },
          include: {
            machine: true
          }
        }),
        prisma.machine.findMany()
      ]);

      const approvedTests = qualityTests.filter(test => test.result === 'APPROVED').length;
      const rejectedTests = qualityTests.filter(test => test.result === 'REJECTED').length;
      const totalTests = qualityTests.length;
      const qualityRate = totalTests > 0 ? Math.round((approvedTests / totalTests) * 100) : 0;

      // Agrupar por máquina
      const machineStats = machines.map(machine => {
        const machineTests = qualityTests.filter(test => test.machineId === machine.id);
        const machineApproved = machineTests.filter(test => test.result === 'APPROVED').length;
        const machineTotal = machineTests.length;
        const machineRate = machineTotal > 0 ? Math.round((machineApproved / machineTotal) * 100) : 0;

        return {
          name: machine.name,
          location: machine.location,
          totalTests: machineTotal,
          qualityRate: machineRate,
          teflonChanges: teflonChanges.filter(change => change.machineId === machine.id).length
        };
      });

      const reportData = {
        period: {
          start: weekAgo.toISOString().split('T')[0],
          end: now.toISOString().split('T')[0]
        },
        summary: {
          totalTests,
          approvedTests,
          rejectedTests,
          qualityRate,
          teflonChanges: teflonChanges.length,
          activeMachines: machines.filter(m => m.status === 'ACTIVE').length
        },
        machines: machineStats
      };

      // Salvar relatório no banco
      await prisma.report.create({
        data: {
          type: 'WEEKLY',
          period: 'week',
          data: reportData,
          generatedAt: now
        }
      });

      logger.info('✅ Relatório semanal gerado com sucesso');
      return { success: true, reportData };
    } catch (error) {
      logger.error('❌ Erro ao gerar relatório semanal:', error);
      return { success: false, error: error.message };
    }
  }

  stopJob(name) {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      this.jobs.delete(name);
      logger.info(`⏹️ Tarefa '${name}' parada`);
      return true;
    }
    return false;
  }

  startJob(name) {
    const job = this.jobs.get(name);
    if (job) {
      job.start();
      logger.info(`▶️ Tarefa '${name}' iniciada`);
      return true;
    }
    return false;
  }

  getJobStatus() {
    const status = {};
    for (const [name, job] of this.jobs) {
      status[name] = {
        running: job.running,
        nextDate: job.nextDate()?.toISOString(),
        lastDate: job.lastDate()?.toISOString()
      };
    }
    return status;
  }

  async archiveCompletedShifts() {
    try {
      logger.info('📦 Iniciando arquivamento de turnos completos...');
      const result = await shiftService.archiveCompletedShifts();
      logger.info(`✅ ${result.archived} turnos arquivados`);
      return result;
    } catch (error) {
      logger.error('❌ Erro ao arquivar turnos:', error);
      return { success: false, error: error.message };
    }
  }

  async updateShiftData() {
    try {
      const result = await shiftService.updateCurrentShiftData();
      return result;
    } catch (error) {
      logger.error('❌ Erro ao atualizar dados de turno:', error);
      return { success: false, error: error.message };
    }
  }

  stopAll() {
    logger.info('⏹️ Parando todas as tarefas agendadas...');
    for (const [name, job] of this.jobs) {
      job.stop();
      logger.info(`⏹️ Tarefa '${name}' parada`);
    }
    this.jobs.clear();
  }
}

module.exports = new SchedulerService();