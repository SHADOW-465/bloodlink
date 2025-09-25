import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CreateBloodRequestForm } from "@/components/blood-requests/create-blood-request-form"
import {
  NeomorphicCard,
  NeomorphicCardContent,
  NeomorphicCardDescription,
  NeomorphicCardHeader,
  NeomorphicCardTitle,
} from "@/components/ui/neomorphic-card"
import { Heart } from "lucide-react"

export default async function CreateBloodRequestPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="neomorphic w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center bg-primary/10">
            <Heart className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Blood Request</h1>
          <p className="text-muted-foreground">Post an urgent blood requirement to connect with donors</p>
        </div>

        <NeomorphicCard>
          <NeomorphicCardHeader>
            <NeomorphicCardTitle>Blood Request Details</NeomorphicCardTitle>
            <NeomorphicCardDescription>
              Please provide accurate information to help donors respond quickly
            </NeomorphicCardDescription>
          </NeomorphicCardHeader>
          <NeomorphicCardContent>
            <CreateBloodRequestForm userProfile={profile} />
          </NeomorphicCardContent>
        </NeomorphicCard>
      </div>
    </div>
  )
}
