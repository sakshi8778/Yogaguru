const isProduction = process.env.NODE_ENV === 'production'

let db

if (isProduction) {
  const { Pool } = require('pg')
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // provided by Railway
    ssl: { rejectUnauthorized: false }, // Railway's managed Postgres requires SSL
  })

  db = {
    prepare: (sql) => {
      let paramIndex = 1
      const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`)

      return {
        run: async (...params) => {
          let querySql = pgSql
          if (/^\s*insert\s+into/i.test(querySql) && !/returning/i.test(querySql)) {
            querySql += ' RETURNING id'
          }
          const res = await pool.query(querySql, params)
          const lastInsertRowid = res.rows[0]?.id || null
          return { lastInsertRowid, changes: res.rowCount }
        },
        get: async (...params) => {
          const res = await pool.query(pgSql, params)
          return res.rows[0]
        },
        all: async (...params) => {
          const res = await pool.query(pgSql, params)
          return res.rows
        }
      }
    },
    exec: async (sql) => {
      await pool.query(sql)
    },
    close: async () => {
      await pool.end()
    }
  }
} else {
  const Database = require('better-sqlite3')
  const sqliteDb = new Database('yogaguru.db')

  db = {
    prepare: (sql) => {
      const stmt = sqliteDb.prepare(sql)
      return {
        run: async (...params) => {
          const res = stmt.run(...params)
          return {
            lastInsertRowid: res.lastInsertRowid,
            changes: res.changes
          }
        },
        get: async (...params) => {
          return stmt.get(...params)
        },
        all: async (...params) => {
          return stmt.all(...params)
        }
      }
    },
    exec: async (sql) => {
      return sqliteDb.exec(sql)
    },
    close: async () => {
      return sqliteDb.close()
    }
  }
}

module.exports = db