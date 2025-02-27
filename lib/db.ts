import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
})

export async function getUserByEmail(email: string) {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email])
  return rows[0]
}

export async function verifyUser(email: string, password: string) {
  // Nota: Em produção, você deve usar hash de senha e comparação segura
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ? AND password = ?", [email, password])
  return rows[0]
}

