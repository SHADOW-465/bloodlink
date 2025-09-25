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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Eye, EyeOff, Heart, UserPlus } from "lucide-react"

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
const cities = ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Tirunelveli", "Erode", "Vellore"]

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    bloodType: "",
    city: "",
    dateOfBirth: "",
    gender: "",
    role: "donor",
    isRotaractMember: false,
    rotaractClub: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            blood_type: formData.bloodType,
            city: formData.city,
            date_of_birth: formData.dateOfBirth,
            gender: formData.gender,
            role: formData.role,
            is_rotaract_member: formData.isRotaractMember,
            rotaract_club_name: formData.rotaractClub,
          },
        },
      })
      if (error) throw error
      router.push("/auth/verify-email")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="neomorphic w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center bg-primary/10">
            <Heart className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Join LifeConnect</h1>
          <p className="text-muted-foreground">Create your account to start saving lives</p>
        </div>

        <NeomorphicCard>
          <NeomorphicCardHeader className="text-center">
            <div className="neomorphic w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
            <NeomorphicCardTitle>Create Account</NeomorphicCardTitle>
            <NeomorphicCardDescription>
              Fill in your details to register as a donor or recipient
            </NeomorphicCardDescription>
          </NeomorphicCardHeader>
          <NeomorphicCardContent>
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <NeomorphicInput
                    id="fullName"
                    placeholder="Enter your full name"
                    required
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <NeomorphicInput
                    id="phone"
                    type="tel"
                    placeholder="+91 9876543210"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
              </div>

              {/* Email and Password */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <NeomorphicInput
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <NeomorphicInput
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create password"
                        required
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
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
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <NeomorphicInput
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className="pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical and Location Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Select value={formData.bloodType} onValueChange={(value) => handleInputChange("bloodType", value)}>
                    <SelectTrigger className="neomorphic-inset h-12 rounded-xl">
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Select value={formData.city} onValueChange={(value) => handleInputChange("city", value)}>
                    <SelectTrigger className="neomorphic-inset h-12 rounded-xl">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger className="neomorphic-inset h-12 rounded-xl">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <NeomorphicInput
                    id="dateOfBirth"
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">I want to</Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                    <SelectTrigger className="neomorphic-inset h-12 rounded-xl">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="donor">Donate Blood</SelectItem>
                      <SelectItem value="recipient">Request Blood</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Rotaract Membership */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rotaract"
                    checked={formData.isRotaractMember}
                    onCheckedChange={(checked) => handleInputChange("isRotaractMember", checked as boolean)}
                  />
                  <Label htmlFor="rotaract" className="text-sm">
                    I am a Rotaract member
                  </Label>
                </div>

                {formData.isRotaractMember && (
                  <div className="space-y-2">
                    <Label htmlFor="rotaractClub">Rotaract Club Name</Label>
                    <NeomorphicInput
                      id="rotaractClub"
                      placeholder="Enter your Rotaract club name"
                      value={formData.rotaractClub}
                      onChange={(e) => handleInputChange("rotaractClub", e.target.value)}
                    />
                  </div>
                )}
              </div>

              {error && (
                <div className="neomorphic-inset rounded-lg p-3 bg-destructive/10">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <NeomorphicButton type="submit" className="w-full" disabled={isLoading} size="lg">
                {isLoading ? "Creating Account..." : "Create Account"}
              </NeomorphicButton>
            </form>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </NeomorphicCardContent>
        </NeomorphicCard>
      </div>
    </div>
  )
}
