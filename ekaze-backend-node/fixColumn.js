const { sequelize } = require('./models');

async function fixProfilePhotoColumn() {
  try {
    await sequelize.authenticate();
    await sequelize.query('ALTER TABLE "users" ALTER COLUMN "profile_photo" TYPE TEXT;');
    console.log('✓ SUCCESS: PostgreSQL "users" table "profile_photo" column altered to TEXT!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error altering column:', err.message);
    process.exit(1);
  }
}

fixProfilePhotoColumn();
