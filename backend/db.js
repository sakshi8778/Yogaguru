const Database = require('better-sqlite3')
const db = new Database('yogaguru.db')
// age_group: 'kid' | 'teen' | 'adult' | 'elderly'
// health_conditions: stored as a JSON string, e.g. '["back_pain","knee_issue"]'
// goals: stored as a JSON string, e.g. '["flexibility","stress_relief"]'
db.exec(`
CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
age_group TEXT NOT NULL,
health_conditions TEXT DEFAULT '[]',
goals TEXT DEFAULT '[]',
created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
 CREATE TABLE IF NOT EXISTS plans ( 
 id INTEGER PRIMARY KEY AUTOINCREMENT, 
 user_id INTEGER NOT NULL, plan_json TEXT NOT NULL, 
 created_at TEXT DEFAULT CURRENT_TIMESTAMP, 
 FOREIGN KEY (user_id) REFERENCES users(id) 
 );
 CREATE TABLE IF NOT EXISTS sessions ( 
 id INTEGER PRIMARY KEY AUTOINCREMENT, 
 user_id INTEGER NOT NULL, 
 average_accuracy REAL, 
 pose_scores_json TEXT NOT NULL, 
 completed_at TEXT DEFAULT CURRENT_TIMESTAMP, 
 FOREIGN KEY (user_id) REFERENCES users(id) 
 ) 
`)
module.exports = db