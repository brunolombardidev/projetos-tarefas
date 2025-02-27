"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Bem-vindo, {user?.name}!</p>
      <Button onClick={logout} className="mt-4">
        Logout
      </Button>
    </div>
  )
}

