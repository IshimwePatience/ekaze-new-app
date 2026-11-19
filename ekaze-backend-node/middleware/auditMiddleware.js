const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { logAudit } = require('../services/auditService');

/**
 * Audit middleware that tracks system navigation and API actions (POST, PUT, DELETE, GET)
 */
const auditNavigationMiddleware = (req, res, next) => {
  try {
    const originalEnd = res.end;
    const start = Date.now();

    res.end = function (...args) {
      try {
        const result = originalEnd.apply(this, args);

        let targetUserId = req.user?.id;
        if (!targetUserId && req.headers && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
          try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, env.JWT_SECRET);
            targetUserId = decoded?.id;
          } catch (e) {}
        }

        if (targetUserId) {
          const method = req.method;
          const path = req.originalUrl || req.url || '';

          // Skip static uploads, polling, and activity-logs endpoint itself
          if (
            path.startsWith('/uploads') ||
            path.startsWith('/api/v1/notifications/unread-count') ||
            path.includes('/health') ||
            path.includes('/activity-logs')
          ) {
            return result;
          }

          let moduleName = 'system';
          if (path.includes('/auth')) moduleName = 'auth';
          else if (path.includes('/payment') || path.includes('/transaction') || path.includes('/wallet')) moduleName = 'payments';
          else if (path.includes('/user')) moduleName = 'users';
          else if (path.includes('/worker')) moduleName = 'workers';
          else if (path.includes('/employer')) moduleName = 'employers';
          else if (path.includes('/company')) moduleName = 'companies';
          else if (path.includes('/incident')) moduleName = 'incidents';
          else if (path.includes('/help') || path.includes('/feedback')) moduleName = 'help_center';

          setImmediate(() => {
            try {
              logAudit({
                userId: targetUserId,
                action: `${method} ${path.split('?')[0]}`,
                module: moduleName,
                req,
                details: {
                  method,
                  endpoint: path,
                  statusCode: res.statusCode,
                  durationMs: Date.now() - start,
                  query: req.query || {}
                }
              });
            } catch (err) {}
          });
        }

        return result;
      } catch (err) {
        return originalEnd.apply(this, args);
      }
    };
  } catch (outerErr) {}

  next();
};

module.exports = auditNavigationMiddleware;
