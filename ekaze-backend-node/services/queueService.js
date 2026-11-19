const { Queue, Worker } = require('bullmq');
const redisClient = require('../config/redis');
const { sendEmail } = require('./emailService');

// Create BullMQ Email Queue
const emailQueue = new Queue('ekaze-emailQueue', {
  connection: redisClient
});

// Suppress unhandled queue connection errors when Redis is not running locally
emailQueue.on('error', () => {});

// Worker to process email jobs in background
const emailWorker = new Worker(
  'ekaze-emailQueue',
  async (job) => {
    console.log(`🚀 Processing background email job #${job.id}: ${job.data.subject}`);
    await sendEmail(job.data);
  },
  { connection: redisClient }
);

// Suppress unhandled worker connection errors when Redis is not running locally
emailWorker.on('error', () => {});

emailWorker.on('completed', (job) => {
  console.log(`✅ Background email job #${job.id} completed!`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`❌ Background email job #${job.id} failed:`, err.message);
});

// Helper to enqueue emails with direct fallback if Redis is offline
const addEmailJob = async (emailData) => {
  try {
    if (redisClient.status === 'ready') {
      return await emailQueue.add('sendEmail', emailData, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      });
    }
  } catch (err) {
    // Redis offline or job add failed, proceed to direct send
  }

  // Resilient fallback: direct dispatch
  return await sendEmail(emailData).catch((err) => {
    console.warn('⚠️ Direct email dispatch notice:', err.message);
  });
};

module.exports = {
  emailQueue,
  addEmailJob
};
