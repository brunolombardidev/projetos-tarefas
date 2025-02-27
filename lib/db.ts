import mysql from "mysql2/promise"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
})

// Função para testar a conexão
export async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection()
    console.log("Conexão com o banco de dados estabelecida com sucesso")
    connection.release()
    return true
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error)
    return false
  }
}

export async function createUser(name: string, email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10)
  const connection = await pool.getConnection()
  try {
    const [result] = await connection.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [
      name,
      email,
      hashedPassword,
    ])
    console.log("Usuário criado com sucesso:", result)
    return { success: true, message: "Usuário criado com sucesso" }
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    if (error.code === "ER_DUP_ENTRY") {
      return { success: false, message: "Email já cadastrado" }
    }
    return { success: false, message: "Erro ao criar usuário" }
  } finally {
    connection.release()
  }
}

export async function getUserByEmail(email: string) {
  const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email])
  return (rows as any[])[0]
}

export async function verifyUser(email: string, password: string) {
  const user = await getUserByEmail(email)
  if (!user) return null

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) return null

  return user
}

export function generateToken(userId: number) {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "1d" })
}

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)
    return decoded
  } catch (error) {
    return null
  }
}

