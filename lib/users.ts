import fs from "fs/promises"
import path from "path"
import bcryptjs from "bcryptjs"

const USERS_FILE = path.join(process.cwd(), "data", "users.json")

interface User {
  id: string
  name: string
  email: string
  password: string
}

async function ensureUsersFile() {
  try {
    await fs.access(USERS_FILE)
  } catch (error) {
    await fs.mkdir(path.dirname(USERS_FILE), { recursive: true })
    await fs.writeFile(USERS_FILE, "[]")
  }
}

async function readUsers(): Promise<User[]> {
  await ensureUsersFile()
  const data = await fs.readFile(USERS_FILE, "utf-8")
  return JSON.parse(data)
}

async function writeUsers(users: User[]) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2))
}

export async function createUser(name: string, email: string, password: string) {
  const users = await readUsers()
  const existingUser = users.find((user) => user.email === email)
  if (existingUser) {
    return { success: false, message: "Email já cadastrado" }
  }

  const hashedPassword = await bcryptjs.hash(password, 10)
  const newUser: User = {
    id: Date.now().toString(),
    name,
    email,
    password: hashedPassword,
  }

  users.push(newUser)
  await writeUsers(users)

  return { success: true, message: "Usuário criado com sucesso" }
}

export async function verifyUser(email: string, password: string) {
  const users = await readUsers()
  const user = users.find((user) => user.email === email)
  if (!user) {
    return null
  }

  const passwordMatch = await bcryptjs.compare(password, user.password)
  if (passwordMatch) {
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  return null
}

// Nova função para adicionar usuários de exemplo
export async function addExampleUsers() {
  const exampleUsers = [
    { name: "João Silva", email: "joao@example.com", password: "senha123" },
    { name: "Maria Santos", email: "maria@example.com", password: "senha456" },
    { name: "Carlos Oliveira", email: "carlos@example.com", password: "senha789" },
  ]

  for (const user of exampleUsers) {
    await createUser(user.name, user.email, user.password)
  }

  console.log("Usuários de exemplo adicionados com sucesso")
}

