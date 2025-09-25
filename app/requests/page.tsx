import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BloodRequestsList } from "@/components/blood-requests/blood-requests-list"
import { NeomorphicButton } from "@/components/ui/neomorphic-button"
import { Plus, Search } from "lucide-react"
import Link from "next/link"

export default async function BloodRequestsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch active blood requests
  const { data: requests, error } = await supabase
    .from("blood_requests")
    .select(
      `
      *,
      requester:profiles!blood_requests_requester_id_fkey(
        full_name,
        phone,
        is_verified
      )
    `,
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching blood requests:", error)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Blood Requests</h1>
            <p className="text-muted-foreground">Help save lives by responding to urgent blood requests</p>
          </div>
          <div className="flex gap-3">
            <NeomorphicButton variant="outline" size="lg">
              <Search className="w-5 h-5" />
              Filter Requests
            </NeomorphicButton>
            <NeomorphicButton asChild size="lg">
              <Link href="/requests/create">
                <Plus className="w-5 h-5" />
                Create Request
              </Link>
            </NeomorphicButton>
          </div>
        </div>

        {/* Blood Requests List */}
        <BloodRequestsList requests={requests || []} />
      </div>
    </div>
  )
}
