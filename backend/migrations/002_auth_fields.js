const db = require('../db');

async function runMigration() {
  const isProduction = process.env.NODE_ENV === 'production';
  console.log(`Running auth fields migration (isProduction: ${isProduction})...`);

  try {
    if (isProduction) {
      // Postgres-compatible migration
      await db.exec(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
        
        -- Drop NOT NULL constraint on age_group so users can sign up before onboarding
        ALTER TABLE users ALTER COLUMN age_group DROP NOT NULL;

        -- Create unique indexes if they don't exist
        CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
      `);
      console.log('Postgres migration completed successfully.');
    } else {
      // SQLite-compatible migration
      // First check table columns using PRAGMA
      const columns = await db.prepare("PRAGMA table_info(users)").all();
      const columnNames = columns.map(c => c.name);

      if (!columnNames.includes('email')) {
        await db.exec("ALTER TABLE users ADD COLUMN email TEXT;");
        console.log('Added email column to users table.');
      }
      if (!columnNames.includes('firebase_uid')) {
        await db.exec("ALTER TABLE users ADD COLUMN firebase_uid TEXT;");
        console.log('Added firebase_uid column to users table.');
      }
      if (!columnNames.includes('avatar_url')) {
        await db.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT;");
        console.log('Added avatar_url column to users table.');
      }

      // Drop NOT NULL by default is not directly supported in SQLite, but SQLite doesn't enforce NOT NULL
      // if we insert a placeholder or if we redefine it. But wait, in SQLite, the table info output showed:
      // age_group has notnull: 1 (which is NOT NULL).
      // However, we can simply default new user signups to age_group = 'unonboarded' in the code.
      // This is safe, and does not require recreating the table in SQLite!
      
      // Create unique indexes
      await db.exec(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
      `);
      console.log('SQLite migration completed successfully.');
    }
  } catch (err) {
    console.error('Error running auth fields migration:', err);
    throw err;
  }
}

module.exports = { runMigration };
