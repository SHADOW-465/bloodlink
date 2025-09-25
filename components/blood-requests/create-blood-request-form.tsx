"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { NeomorphicButton } from "@/components/ui/neomorphic-button"
import { NeomorphicInput } from "@/components/ui/neomorphic-input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, MapPin, User, Phone, AlertTriangle } from "lucide-react"

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
const urgencyLevels = [
  { value: "low", label: "Low", description: "Within a week" },
  { value: "medium", label: "Medium", description: "Within 2-3 days" },
  { value: "high", label: "High", description: "Within 24 hours" },
  { value: "critical", label: "Critical", description: "Immediate need" },
]

interface UserProfile {
  id: string
  full_name: string
  phone: string
  city: string
}

interface CreateBloodRequestFormProps {
  userProfile: UserProfile | null
}

export function CreateBloodRequestForm({ userProfile }: CreateBloodRequestFormProps) {
  const [formData, setFormData] = useState({
    bloodType: "",
    unitsNeeded: 1,
    urgencyLevel: "",
    neededBy: "",
    patientName: "",
    patientAge: "",
    patientGender: "",
    medicalCondition: "",
    hospitalName: "",
    hospitalAddress: "",
    city: userProfile?.city || "",
    contactPerson: userProfile?.full_name || "",
    contactPhone: userProfile?.phone || "",
    emergencyContact: "",
    description: "",
    specialRequirements: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error } = await supabase.from("blood_requests").insert({
        requester_id: userProfile?.id,
        blood_type: formData.bloodType,
        units_needed: formData.unitsNeeded,
        urgency_level: formData.urgencyLevel,
        needed_by: formData.neededBy,
        patient_name: formData.patientName,
        patient_age: Number.parseInt(formData.patientAge),
        patient_gender: formData.patientGender,
        medical_condition: formData.medicalCondition,
        hospital_name: formData.hospitalName,
        hospital_address: formData.hospitalAddress,
        city: formData.city,
        contact_person: formData.contactPerson,
        contact_phone: formData.contactPhone,
        emergency_contact: formData.emergencyContact,
        description: formData.description,
        special_requirements: formData.specialRequirements,
      })

      if (error) throw error

      router.push("/requests?created=true")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Blood Type and Urgency */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="bloodType" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-primary" />
            Blood Type Required
          </Label>
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
          <Label htmlFor="unitsNeeded">Units Needed</Label>
          <NeomorphicInput
            id="unitsNeeded"
            type="number"
            min="1"
            max="10"
            value={formData.unitsNeeded}
            onChange={(e) => handleInputChange("unitsNeeded", Number.parseInt(e.target.value))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="urgencyLevel">Urgency Level</Label>
          <Select value={formData.urgencyLevel} onValueChange={(value) => handleInputChange("urgencyLevel", value)}>
            <SelectTrigger className="neomorphic-inset h-12 rounded-xl">
              <SelectValue placeholder="Select urgency" />
            </SelectTrigger>
            <SelectContent>
              {urgencyLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  <div>
                    <div className="font-medium">{level.label}</div>
                    <div className="text-xs text-muted-foreground">{level.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Patient Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Patient Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="patientName">Patient Name</Label>
            <NeomorphicInput
              id="patientName"
              placeholder="Enter patient name"
              value={formData.patientName}
              onChange={(e) => handleInputChange("patientName", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="patientAge">Age</Label>
            <NeomorphicInput
              id="patientAge"
              type="number"
              min="1"
              max="120"
              placeholder="Age"
              value={formData.patientAge}
              onChange={(e) => handleInputChange("patientAge", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="patientGender">Gender</Label>
            <Select value={formData.patientGender} onValueChange={(value) => handleInputChange("patientGender", value)}>
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
            <Label htmlFor="neededBy" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Needed By
            </Label>
            <NeomorphicInput
              id="neededBy"
              type="datetime-local"
              value={formData.neededBy}
              onChange={(e) => handleInputChange("neededBy", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalCondition">Medical Condition</Label>
            <NeomorphicInput
              id="medicalCondition"
              placeholder="e.g., Surgery, Accident, Anemia"
              value={formData.medicalCondition}
              onChange={(e) => handleInputChange("medicalCondition", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Hospital Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Hospital Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hospitalName">Hospital Name</Label>
            <NeomorphicInput
              id="hospitalName"
              placeholder="Enter hospital name"
              value={formData.hospitalName}
              onChange={(e) => handleInputChange("hospitalName", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <NeomorphicInput
              id="city"
              placeholder="Enter city"
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hospitalAddress">Hospital Address</Label>
          <Textarea
            id="hospitalAddress"
            placeholder="Enter complete hospital address"
            value={formData.hospitalAddress}
            onChange={(e) => handleInputChange("hospitalAddress", e.target.value)}
            className="neomorphic-inset rounded-xl min-h-[80px] resize-none"
            required
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Phone className="w-5 h-5 text-primary" />
          Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <NeomorphicInput
              id="contactPerson"
              placeholder="Primary contact name"
              value={formData.contactPerson}
              onChange={(e) => handleInputChange("contactPerson", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">Contact Phone</Label>
            <NeomorphicInput
              id="contactPhone"
              type="tel"
              placeholder="+91 9876543210"
              value={formData.contactPhone}
              onChange={(e) => handleInputChange("contactPhone", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="emergencyContact">Emergency Contact (Optional)</Label>
          <NeomorphicInput
            id="emergencyContact"
            type="tel"
            placeholder="Alternative contact number"
            value={formData.emergencyContact}
            onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
          />
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Provide additional details about the blood requirement..."
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="neomorphic-inset rounded-xl min-h-[100px] resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialRequirements">Special Requirements (Optional)</Label>
          <Textarea
            id="specialRequirements"
            placeholder="Any special requirements or preferences..."
            value={formData.specialRequirements}
            onChange={(e) => handleInputChange("specialRequirements", e.target.value)}
            className="neomorphic-inset rounded-xl min-h-[80px] resize-none"
          />
        </div>
      </div>

      {error && (
        <div className="neomorphic-inset rounded-lg p-4 bg-destructive/10">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="flex gap-4 pt-6">
        <NeomorphicButton type="button" variant="outline" size="lg" className="flex-1" onClick={() => router.back()}>
          Cancel
        </NeomorphicButton>
        <NeomorphicButton type="submit" size="lg" className="flex-1" disabled={isLoading}>
          {isLoading ? "Creating Request..." : "Create Blood Request"}
        </NeomorphicButton>
      </div>
    </form>
  )
}
