"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeProvider, useTheme } from "../theme-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

// Mock functions (replace with your actual implementation)
async function getUserByEmail(email: string): Promise<{ id: string } | null> {
  // In a real application, you would query your database here
  if (email === "test@example.com") {
    return { id: "user123" }
  }
  return null
}

async function updateUserPassword(userId: string, newPassword: string): Promise<void> {
  // In a real application, you would update the user's password in your database here
  console.log(`Updating password for user ${userId} to ${newPassword}`)
}

async function createUser(
  name: string,
  email: string,
  password: string,
): Promise<{ success: boolean; message: string }> {
  // In a real application, you would create a new user in your database here
  if (email === "existing@example.com") {
    return { success: false, message: "Email já cadastrado." }
  }
  return { success: true, message: "Conta criada com sucesso!" }
}

function LoginPageContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isForgetModalOpen, setIsForgetModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { darkMode } = useTheme()
  const { login } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (data.success) {
        await login(data.token, data.user)
        toast.success("Login bem-sucedido!")
        router.push("/dashboard")
      } else {
        setIsErrorModalOpen(true)
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      toast.error("Ocorreu um erro ao fazer login. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#1F1F1F]" : "bg-gray-100"} flex items-center justify-center`}>
      <Card className={`w-[80%] max-w-[400px] mx-auto ${darkMode ? "bg-black" : "bg-white"}`}>
        <CardHeader>
          <CardTitle className={`text-2xl font-bold text-center ${darkMode ? "text-white" : "text-gray-800"}`}>
            Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                className={`rounded-full ${darkMode ? "bg-gray-800 text-white placeholder-gray-400" : ""}`}
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`rounded-full ${darkMode ? "bg-gray-800 text-white placeholder-gray-400" : ""}`}
              />
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsForgetModalOpen(true)}
                className={`w-1/2 rounded-full ${
                  darkMode
                    ? "bg-black text-white border-gray-600 hover:bg-gray-800"
                    : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                }`}
              >
                Esqueci
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(true)}
                className={`w-1/2 rounded-full ${
                  darkMode
                    ? "bg-black text-white border-gray-600 hover:bg-gray-800"
                    : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                }`}
              >
                Criar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ForgetPasswordModal isOpen={isForgetModalOpen} onClose={() => setIsForgetModalOpen(false)} darkMode={darkMode} />
      <CreateAccountModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} darkMode={darkMode} />
      <ErrorModal isOpen={isErrorModalOpen} onClose={() => setIsErrorModalOpen(false)} darkMode={darkMode} />
      <ToastContainer position="bottom-center" />
    </div>
  )
}

// ... (outros componentes permanecem os mesmos)

function ForgetPasswordModal({ isOpen, onClose, darkMode }) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Verifica se o usuário existe
      const user = await getUserByEmail(email)
      if (!user) {
        toast.error("Usuário não encontrado.")
        return
      }

      // Gera uma nova senha aleatória
      const newPassword = Math.random().toString(36).slice(-8)

      // Atualiza a senha do usuário
      await updateUserPassword(user.id, newPassword)

      // Simula o envio de e-mail
      console.log(`Enviando e-mail para ${email} com a nova senha: ${newPassword}`)

      toast.success("Uma nova senha foi enviada para o seu e-mail.")
      onClose()
    } catch (error) {
      console.error("Erro ao recuperar senha:", error)
      toast.error("Ocorreu um erro ao recuperar a senha. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[15px] w-[70%] max-w-[300px]">
        <DialogHeader>
          <DialogTitle className="mb-5 text-center">Esqueci a Senha</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Seu E-mail Cadastrado"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
            className="rounded-full"
          />
          <Button
            type="submit"
            className="w-full rounded-full bg-black text-white hover:bg-gray-800"
            disabled={isLoading}
          >
            {isLoading ? "Processando..." : "Recuperar no E-mail"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CreateAccountModal({ isOpen, onClose, darkMode }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isFormValid, setIsFormValid] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const isEmailValid = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)
    const isPasswordValid = password.length >= 8
    const doPasswordsMatch = password === confirmPassword
    const areAllFieldsFilled = name && email && password && confirmPassword

    setIsFormValid(isEmailValid && isPasswordValid && doPasswordsMatch && areAllFieldsFilled)
  }, [name, email, password, confirmPassword])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isFormValid) {
      setIsLoading(true)
      try {
        const result = await createUser(name, email, password)
        if (result.success) {
          toast.success(result.message)
          onClose()
        } else {
          toast.error(result.message)
        }
      } catch (error) {
        console.error("Erro ao criar conta:", error)
        toast.error("Ocorreu um erro ao criar a conta. Tente novamente.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[15px] w-[70%] max-w-[300px]">
        <DialogHeader>
          <DialogTitle className="mb-5 text-center">Criar Conta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="rounded-full"
          />
          <Input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
            className="rounded-full"
          />
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="rounded-full"
          />
          <Input
            type="password"
            placeholder="Confirmar Senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="rounded-full"
          />
          <Button
            type="submit"
            className="w-full rounded-full bg-black text-white hover:bg-gray-800"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? "Processando..." : "Cadastrar Conta"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ErrorModal({ isOpen, onClose, darkMode }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[15px] w-[70%] max-w-[300px]">
        <DialogHeader>
          <DialogTitle className="mb-5 text-center flex flex-col items-center">
            <X className="w-16 h-16 text-red-500 mb-4" />
            Usuário não Encontrado
          </DialogTitle>
        </DialogHeader>
        <Button onClick={onClose} className="w-full rounded-full bg-black text-white hover:bg-gray-800">
          Fechar
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default function LoginPage() {
  return (
    <ThemeProvider>
      <LoginPageContent />
    </ThemeProvider>
  )
}

