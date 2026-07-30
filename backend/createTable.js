const db = require('./db')

db.exec(`
  CREATE TABLE IF NOT EXISTS pose_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pose_name TEXT NOT NULL,
    pose_name_slug TEXT UNIQUE NOT NULL,
    image_url TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`).then(() => console.log('Table created!'))