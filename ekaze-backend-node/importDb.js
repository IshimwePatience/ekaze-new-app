const fs = require('fs');
const path = require('path');
const { sequelize } = require('./models');

// Topological table order so parent tables are populated before child tables
const TABLE_ORDER = [
  'users',
  'settings',
  'companies',
  'workers',
  'employers',
  'admins',
  'supervisors',
  'police',
  'police_officers',
  'hiring_requests',
  'employments',
  'incidents',
  'transactions',
  'notifications',
  'sessions',
  'audit_logs',
  'chat_conversations',
  'chat_messages',
  'help_feedbacks'
];

async function importDatabase() {
  try {
    const backupPath = path.join(__dirname, 'db_backup.json');
    if (!fs.existsSync(backupPath)) {
      console.error(`❌ Backup file not found at ${backupPath}. Run "node exportDb.js" first!`);
      process.exit(1);
    }

    await sequelize.authenticate();
    console.log('✓ Connected to target database.');

    // Ensure all tables/columns exist first
    await sequelize.sync({ alter: true }).catch(() => {});

    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    const allBackupTables = Object.keys(backup.tables || {});

    // Sort tables by topological order first, then any remaining tables
    const orderedTables = [
      ...TABLE_ORDER.filter((t) => allBackupTables.includes(t)),
      ...allBackupTables.filter((t) => !TABLE_ORDER.includes(t))
    ];

    const qi = sequelize.getQueryInterface();

    // Truncate existing tables with CASCADE so import is exact
    for (const tableName of [...orderedTables].reverse()) {
      try {
        await sequelize.query(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`);
      } catch {
        // Table might not exist yet
      }
    }

    for (const tableName of orderedTables) {
      const rows = backup.tables[tableName] || [];
      if (rows.length === 0) {
        console.log(`  → Skipping "${tableName}" (0 rows)`);
        continue;
      }

      // Normalize JSON/JSONB object fields for bulkInsert
      const [cols] = await sequelize.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = '${tableName}';
      `);
      const existingColSet = new Set(cols.map((c) => c.column_name));
      const jsonCols = new Set(
        cols.filter((c) => c.data_type === 'json' || c.data_type === 'jsonb').map((c) => c.column_name)
      );
      const arrayCols = new Set(
        cols.filter((c) => c.data_type === 'ARRAY').map((c) => c.column_name)
      );

      const cleanedRows = rows.map((r) => {
        const out = {};
        for (const [k, v] of Object.entries(r)) {
          if (!existingColSet.has(k)) continue;
          if (jsonCols.has(k) && v !== null && typeof v === 'object') {
            out[k] = JSON.stringify(v);
          } else if (arrayCols.has(k) && Array.isArray(v) && v.length === 0) {
            out[k] = '{}';
          } else {
            out[k] = v;
          }
        }
        return out;
      });

      try {
        await qi.bulkInsert(tableName, cleanedRows);
        console.log(`  ✓ Imported ${cleanedRows.length} rows into "${tableName}"`);
      } catch (insertErr) {
        console.warn(`  ⚠️ Bulk insert notice on "${tableName}", trying row-by-row:`, insertErr.message);
        let count = 0;
        for (const singleRow of cleanedRows) {
          try {
            await qi.bulkInsert(tableName, [singleRow]);
            count++;
          } catch (rowErr) {
            console.warn(`    ⚠️ Skipped row in "${tableName}":`, rowErr.message);
          }
        }
        console.log(`  ✓ Imported ${count}/${cleanedRows.length} rows into "${tableName}"`);
      }

      // Reset primary key sequence if table has an 'id' column
      if (existingColSet.has('id')) {
        try {
          await sequelize.query(`
            SELECT setval(
              pg_get_serial_sequence('"${tableName}"', 'id'),
              COALESCE((SELECT MAX(id) FROM "${tableName}"), 1),
              true
            );
          `);
        } catch {
          // ignore if id is not serial
        }
      }
    }

    console.log('\n🎉 All local database tables and records have been imported into production!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Import failed:', err);
    process.exit(1);
  }
}

importDatabase();

