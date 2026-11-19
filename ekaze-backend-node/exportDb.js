const fs = require('fs');
const path = require('path');
const { sequelize } = require('./models');

async function exportDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✓ Connected to local database:', process.env.DB_NAME || 'ihirwe_db');

    const [tables] = await sequelize.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name != 'SequelizeMeta'
      ORDER BY table_name;
    `);

    const backup = {
      exported_at: new Date().toISOString(),
      tables: {}
    };

    for (const row of tables) {
      const tableName = row.table_name;
      const [records] = await sequelize.query(`SELECT * FROM "${tableName}"`);
      backup.tables[tableName] = records;
      console.log(`  → Exported ${records.length} rows from "${tableName}"`);
    }

    const outPath = path.join(__dirname, 'db_backup.json');
    fs.writeFileSync(outPath, JSON.stringify(backup, null, 2), 'utf8');
    console.log(`\n✅ Full database backup saved to: ${outPath}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Export failed:', err);
    process.exit(1);
  }
}

exportDatabase();

