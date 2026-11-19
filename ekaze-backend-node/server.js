const http = require('http');
const app = require('./app');
const env = require('./config/env');
const { sequelize } = require('./models');
const { initSocket } = require('./services/socketService');
const redisClient = require('./config/redis');

const PORT = env.PORT || 5000;

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Start Server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ PostgreSQL database connected successfully via Sequelize.');

    // Auto-migrate & add missing columns for Worker table
    try {
      await sequelize.query(`
        ALTER TABLE "users" ALTER COLUMN "profile_photo" TYPE TEXT;
        ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "preferred_language" varchar(10);
        ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "ussd_pin" varchar(255);
        ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" boolean DEFAULT false;
        ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone_verified" boolean DEFAULT false;
        ALTER TABLE "workers" ADD COLUMN IF NOT EXISTS "professions" text[] DEFAULT '{}';
        ALTER TABLE "workers" ADD COLUMN IF NOT EXISTS "experience_level" varchar(50);
        ALTER TABLE "workers" ADD COLUMN IF NOT EXISTS "languages_spoken" text[] DEFAULT '{}';
        ALTER TABLE "workers" ADD COLUMN IF NOT EXISTS "work_type_preferences" text[] DEFAULT '{}';
        ALTER TABLE "workers" ADD COLUMN IF NOT EXISTS "preferred_districts" text[] DEFAULT '{}';
        ALTER TABLE "workers" ADD COLUMN IF NOT EXISTS "min_salary" numeric(15, 2);
        ALTER TABLE "workers" ADD COLUMN IF NOT EXISTS "max_salary" numeric(15, 2);
        ALTER TABLE "workers" ADD COLUMN IF NOT EXISTS "has_insurance" boolean DEFAULT false;
        ALTER TABLE "workers" ADD COLUMN IF NOT EXISTS "insurance_type" varchar(100);
        ALTER TABLE "workers" ADD COLUMN IF NOT EXISTS "insurance_provider" varchar(255);
        ALTER TABLE "workers" ADD COLUMN IF NOT EXISTS "insurance_number" varchar(255);
        ALTER TABLE "workers" ADD COLUMN IF NOT EXISTS "wallet_balance" numeric(15, 2) DEFAULT 0.00;
        ALTER TABLE "workers" ADD COLUMN IF NOT EXISTS "savings_balance" numeric(15, 2) DEFAULT 0.00;
        ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "billing_plan" varchar(20);
        ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "trial_ends_at" TIMESTAMP WITH TIME ZONE;
        ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "subscription_amount" numeric(15, 2);
        ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "subscription_cycle" varchar(20);
        ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "subscription_period_days" integer;
        ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "subscription_paid_until" TIMESTAMP WITH TIME ZONE;

        CREATE TABLE IF NOT EXISTS "help_feedbacks" (
          "id" BIGSERIAL PRIMARY KEY,
          "ticket_number" VARCHAR(50) UNIQUE NOT NULL,
          "user_id" BIGINT,
          "name" VARCHAR(255),
          "email" VARCHAR(255),
          "phone" VARCHAR(50),
          "role" VARCHAR(50) DEFAULT 'guest',
          "type" VARCHAR(50) DEFAULT 'feedback',
          "category" VARCHAR(100) DEFAULT 'General Feedback',
          "subject" VARCHAR(255),
          "message" TEXT NOT NULL,
          "page_url" VARCHAR(500),
          "screenshot" TEXT,
          "browser_info" TEXT,
          "status" VARCHAR(50) DEFAULT 'pending',
          "admin_notes" TEXT,
          "resolved_at" TIMESTAMP WITH TIME ZONE,
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `);
      console.log('✓ Users, Worker, and HelpFeedbacks tables verified successfully.');
    } catch (colErr) {
      console.warn('⚠️ Column alteration notice:', colErr.message);
    }

    // Auto-sync all models if schema changed
    await sequelize.sync({ alter: true }).catch((err) => {
      console.warn('⚠️ Sync alter warning (non-fatal):', err.message);
    });

    server.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(`🚀 EKAZE Node.js Server running on port ${PORT}`);
      console.log(`🌐 API Endpoint: http://localhost:${PORT}/api/v1`);
      console.log(`🔒 Environment: ${env.NODE_ENV}`);
      console.log(`===================================================`);

      // Trigger automatic salary payment checks (5-day upcoming reminders, overdue worker/employer/agency/admin notifications)
      try {
        const { checkAndProcessSalaryNotifications } = require('./services/salaryPaymentNotificationService');
        setTimeout(() => {
          checkAndProcessSalaryNotifications().catch(err => console.error('Salary notification check error:', err.message));
        }, 3000);
        // Periodic check every 1 hour
        setInterval(() => {
          checkAndProcessSalaryNotifications().catch(err => console.error('Salary notification check error:', err.message));
        }, 60 * 60 * 1000);
      } catch (cronErr) {
        console.warn('Salary notification background scheduler warning:', cronErr.message);
      }
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    process.exit(1);
  }
};

startServer();

// Graceful Shutdown Handler
const gracefulShutdown = (signal) => {
  console.log(`\n⚠️ ${signal} received. Initiating graceful shutdown...`);

  server.close(async () => {
    console.log('✓ Closed HTTP server connections.');

    try {
      await sequelize.close();
      console.log('✓ Closed PostgreSQL database connection.');

      if (redisClient && redisClient.status === 'ready') {
        await redisClient.quit().catch(() => { });
        console.log('✓ Closed Redis connection.');
      }

      console.log('👋 Graceful shutdown complete. Exiting.');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error during graceful shutdown:', err.message);
      process.exit(1);
    }
  });

  // Force close after 10s if hanging
  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
