const mysql = require('mysql2'); // ya 'mysql'

// Apne database ki details yahan dalein
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'YOUR_MYSQL_PASSWORD', // <-- Yahan apna MySQL password likhein
  database: 'medisync'             // <-- Yahan apna database name likhein
});

const sqlQuery = `
CREATE TABLE IF NOT EXISTS shared_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_email VARCHAR(255) NOT NULL,
  report_id INT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

db.query(sqlQuery, (err, result) => {
  if (err) {
    console.error('❌ Table banane me error aaya:', err.message);
  } else {
    console.log('✅ Table "shared_reports" successfully ban gayi hai!');
  }
  db.end();
});