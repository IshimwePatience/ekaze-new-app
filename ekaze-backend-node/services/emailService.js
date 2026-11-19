const transporter = require('../config/smtp');
const env = require('../config/env');

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      text,
      html
    });
    console.log(`✉️ Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email dispatch failed to ${to}:`, error.message);
    throw error;
  }
};

module.exports = { sendEmail };
