import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Removemos a lógica de autenticação daqui
  // Agora, cada rota protegida deve verificar a autenticação individualmente
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
}

