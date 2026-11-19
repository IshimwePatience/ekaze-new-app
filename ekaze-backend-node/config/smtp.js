const nodemailer = require('nodemailer');
const env = require('./env');

const port = parseInt(env.SMTP_PORT, 10) || 465;
const isSecure = port === 465 || String(env.SMTP_SECURE) === 'true';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: port,
  secure: isSecure,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000
});

module.exports = transporter;
