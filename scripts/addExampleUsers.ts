import { addExampleUsers } from "../lib/users"

async function run() {
  try {
    await addExampleUsers()
    console.log("Usuários de exemplo adicionados com sucesso")
  } catch (error) {
    console.error("Erro ao adicionar usuários de exemplo:", error)
  }
}

run()

