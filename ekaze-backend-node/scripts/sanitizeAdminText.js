const { sequelize } = require('../models');

async function updateDb() {
  try {
    await sequelize.authenticate();
    const [fbResult] = await sequelize.query(`
      UPDATE "help_feedbacks"
      SET "admin_notes" = REPLACE(REPLACE("admin_notes", 'by Administrator', 'by Ekaze'), 'Administrator', 'Ekaze')
      WHERE "admin_notes" ILIKE '%admin%';
    `);
    const [notifResult] = await sequelize.query(`
      UPDATE "notifications"
      SET "message" = REPLACE(REPLACE(REPLACE("message", 'by Administrator', 'by Ekaze'), 'Support response:', 'Ekaze Response:'), 'Administrator', 'Ekaze'),
          "title" = REPLACE("title", 'Administrator', 'Ekaze')
      WHERE "message" ILIKE '%admin%' OR "message" ILIKE '%support response%';
    `);
    console.log('✓ Database cleaned up successfully! Rows updated in help_feedbacks and notifications.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating DB:', err.message);
    process.exit(1);
  }
}

updateDb();
