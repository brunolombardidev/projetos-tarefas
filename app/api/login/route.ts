import { NextResponse } from "next/server"
import { verifyUser } from "@/lib/db"

export async function POST(request: Request) {
  const { email, password } = await request.json()

  try {
    const user = await verifyUser(email, password)
    if (user) {
      // Não retorne a senha no objeto de resposta
      const { password: _, ...userWithoutPassword } = user
      return NextResponse.json({ success: true, user: userWithoutPassword })
    } else {
      return NextResponse.json({ success: false, message: "Usuário não encontrado" }, { status: 401 })
    }
  } catch (error) {
    console.error("Erro ao verificar usuário:", error)
    return NextResponse.json({ success: false, message: "Erro ao processar o login" }, { status: 500 })
  }
}

