import mysql from "mysql2/promise"
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
})

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
  console.log("Iniciando criação de usuário")
  try {
    const hashedPassword = await bcryptjs.hash(password, 10)
    console.log("Senha hash gerada")

    const connection = await pool.getConnection()
    console.log("Conexão com o banco de dados obtida")

    try {
      console.log("Tentando inserir usuário no banco de dados")
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
      return { success: false, message: "Erro ao criar usuário", error: error.message }
    } finally {
      connection.release()
      console.log("Conexão com o banco de dados liberada")
    }
  } catch (error) {
    console.error("Erro geral ao criar usuário:", error)
    return { success: false, message: "Erro interno do servidor", error: error.message }
  }
}

export async function verifyUser(email: string, password: string) {
  try {
    const connection = await pool.getConnection()
    try {
      const [rows]: any = await connection.execute("SELECT * FROM users WHERE email = ?", [email])

      if (rows.length === 0) {
        return null
      }

      const user = rows[0]
      const passwordMatch = await bcryptjs.compare(password, user.password)

      if (passwordMatch) {
        return user
      } else {
        return null
      }
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Erro ao verificar usuário:", error)
    return null
  }
}

export function generateToken(userId: number) {
  const secretKey = process.env.JWT_SECRET || "defaultSecret"
  const token = jwt.sign({ userId }, secretKey, { expiresIn: "1h" })
  return token
}

export { pool }

