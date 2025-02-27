import mysql from "mysql2"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "tasks",
  connectionLimit: 10,
})

// Função para verificar o usuário e retornar os dados sem a senha
export async function verifyUser(email, password) {
  const promisePool = pool.promise()
  const [rows] = await promisePool.query("SELECT * FROM users WHERE email = ?", [email])
  const users = rows

  if (users.length === 0) {
    return null
  }

  const user = users[0]
  const passwordMatch = await bcrypt.compare(password, user.password)

  if (passwordMatch) {
    return { id: user.id, name: user.name, email: user.email, password: user.password } // Retorna o usuário completo
  } else {
    return null
  }
}

// Função para gerar o token JWT
export function generateToken(userId) {
  const secretKey = process.env.JWT_SECRET || "secret"
  const token = jwt.sign({ userId }, secretKey, { expiresIn: "1h" })
  return token
}

