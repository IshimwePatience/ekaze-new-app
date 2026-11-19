const { AuditLog } = require('../models');
const { getIO } = require('./socketService');

const logAudit = async ({ userId, action, module: moduleName, req, details }) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress) : null;
    const userAgent = req ? req.headers['user-agent'] : null;
    const targetUserId = userId || (req && req.user ? req.user.id : null);

    const log = await AuditLog.create({
      user_id: targetUserId,
      action,
      module: moduleName,
      ip_address: ipAddress,
      user_agent: userAgent,
      details: details || {}
    });

    // Broadcast Real-Time Audit Log via Socket.io
    try {
      const io = getIO();
      if (io) {
        const payload = {
          id: log.id,
          user_id: targetUserId,
          action: log.action,
          module: log.module,
          ip_address: log.ip_address,
          user_agent: log.user_agent,
          details: log.details,
          created_at: log.created_at || new Date().toISOString()
        };
        io.to('role_admin').emit('audit_log', payload);
        if (targetUserId) {
          io.to(`user_${targetUserId}`).emit('audit_log', payload);
        }
      }
    } catch (sErr) {
      // Socket not yet initialized or ready
    }

    return log;
  } catch (error) {
    console.error('⚠️ Failed to record audit log:', error.message);
  }
};

module.exports = { logAudit };
