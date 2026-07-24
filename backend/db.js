
const isProduction = process.env.NODE_ENV === 'production'
let db
if (isProduction) {
    const { Pool } = require('pg')
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL, // provided by Railway
        ssl: { rejectUnauthorized: false }, // Railway's managed Postgres requires SSL
    })
    db = pool
} else {
    const Database = require('better-sqlite3')
    db = new Database('yogaguru.db')
}

module.exports = db