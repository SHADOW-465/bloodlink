"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { NeomorphicButton } from "@/components/ui/neomorphic-button"
import {
  NeomorphicCard,
  NeomorphicCardContent,
  NeomorphicCardDescription,
  NeomorphicCardHeader,
  NeomorphicCardTitle,
} from "@/components/ui/neomorphic-card"
import { NeomorphicInput } from "@/components/ui/neomorphic-input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Eye, EyeOff, Heart, User } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header with logo */}
        <div className="text-center mb-8">
          <div className="neomorphic w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center bg-primary/10">
            <Heart className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">LifeConnect</h1>
          <p className="text-muted-foreground">Blood Donation Platform</p>
        </div>

        <NeomorphicCard>
          <NeomorphicCardHeader className="text-center">
            <div className="neomorphic w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <NeomorphicCardTitle>Sign In</NeomorphicCardTitle>
            <NeomorphicCardDescription>Enter your credentials to access your account</NeomorphicCardDescription>
          </NeomorphicCardHeader>
          <NeomorphicCardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <NeomorphicInput
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <NeomorphicInput
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="neomorphic-inset rounded-lg p-3 bg-destructive/10">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <NeomorphicButton type="submit" className="w-full" disabled={isLoading} size="lg">
                {isLoading ? "Signing in..." : "Sign In"}
              </NeomorphicButton>

              <div className="text-center">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  href="/auth/register"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </NeomorphicCardContent>
        </NeomorphicCard>
      </div>
    </div>
  )
}
