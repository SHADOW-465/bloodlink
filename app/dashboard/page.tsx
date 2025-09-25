import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import {
  NeomorphicCard,
  NeomorphicCardContent,
  NeomorphicCardHeader,
  NeomorphicCardTitle,
} from "@/components/ui/neomorphic-card"
import { NeomorphicButton } from "@/components/ui/neomorphic-button"
import { Badge } from "@/components/ui/badge"
import { Heart, Plus, Clock, MapPin, Users, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get user's blood requests
  const { data: userRequests } = await supabase
    .from("blood_requests")
    .select("*")
    .eq("requester_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Get recent blood requests in user's city
  const { data: nearbyRequests } = await supabase
    .from("blood_requests")
    .select(`
      *,
      requester:profiles!blood_requests_requester_id_fkey(full_name, is_verified)
    `)
    .eq("status", "active")
    .eq("city", profile?.city || "")
    .neq("requester_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="neomorphic w-16 h-16 rounded-full flex items-center justify-center bg-primary/10">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Welcome back, {profile?.full_name}!</h1>
              <p className="text-muted-foreground">Ready to save lives today?</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <NeomorphicCard className="hover:shadow-lg transition-all duration-300">
            <NeomorphicCardContent className="p-6 text-center">
              <div className="neomorphic w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center bg-primary/10">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Create Request</h3>
              <p className="text-sm text-muted-foreground mb-4">Post urgent blood requirement</p>
              <NeomorphicButton asChild size="sm" className="w-full">
                <Link href="/requests/create">Create</Link>
              </NeomorphicButton>
            </NeomorphicCardContent>
          </NeomorphicCard>

          <NeomorphicCard className="hover:shadow-lg transition-all duration-300">
            <NeomorphicCardContent className="p-6 text-center">
              <div className="neomorphic w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center bg-primary/10">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Find Requests</h3>
              <p className="text-sm text-muted-foreground mb-4">Help others in need</p>
              <NeomorphicButton asChild variant="outline" size="sm" className="w-full">
                <Link href="/requests">Browse</Link>
              </NeomorphicButton>
            </NeomorphicCardContent>
          </NeomorphicCard>

          <NeomorphicCard className="hover:shadow-lg transition-all duration-300">
            <NeomorphicCardContent className="p-6 text-center">
              <div className="neomorphic w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Blood Drives</h3>
              <p className="text-sm text-muted-foreground mb-4">Join community events</p>
              <NeomorphicButton asChild variant="outline" size="sm" className="w-full">
                <Link href="/drives">View Events</Link>
              </NeomorphicButton>
            </NeomorphicCardContent>
          </NeomorphicCard>

          <NeomorphicCard className="hover:shadow-lg transition-all duration-300">
            <NeomorphicCardContent className="p-6 text-center">
              <div className="neomorphic w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center bg-primary/10">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Nearby</h3>
              <p className="text-sm text-muted-foreground mb-4">Find local donors</p>
              <NeomorphicButton asChild variant="outline" size="sm" className="w-full">
                <Link href="/map">View Map</Link>
              </NeomorphicButton>
            </NeomorphicCardContent>
          </NeomorphicCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Your Blood Requests */}
          <NeomorphicCard>
            <NeomorphicCardHeader>
              <NeomorphicCardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Your Blood Requests
              </NeomorphicCardTitle>
            </NeomorphicCardHeader>
            <NeomorphicCardContent>
              {userRequests && userRequests.length > 0 ? (
                <div className="space-y-4">
                  {userRequests.map((request) => (
                    <div key={request.id} className="neomorphic-inset rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{request.patient_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {request.blood_type} • {request.units_needed} units
                          </p>
                        </div>
                        <Badge variant={request.status === "active" ? "default" : "secondary"} className="capitalize">
                          {request.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {request.hospital_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(request.needed_by).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  <NeomorphicButton asChild variant="outline" size="sm" className="w-full">
                    <Link href="/profile/requests">View All</Link>
                  </NeomorphicButton>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">You haven't created any blood requests yet.</p>
                  <NeomorphicButton asChild size="sm">
                    <Link href="/requests/create">Create Your First Request</Link>
                  </NeomorphicButton>
                </div>
              )}
            </NeomorphicCardContent>
          </NeomorphicCard>

          {/* Nearby Requests */}
          <NeomorphicCard>
            <NeomorphicCardHeader>
              <NeomorphicCardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                Urgent Requests in {profile?.city}
              </NeomorphicCardTitle>
            </NeomorphicCardHeader>
            <NeomorphicCardContent>
              {nearbyRequests && nearbyRequests.length > 0 ? (
                <div className="space-y-4">
                  {nearbyRequests.map((request) => (
                    <div key={request.id} className="neomorphic-inset rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{request.patient_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {request.blood_type} • {request.units_needed} units
                          </p>
                        </div>
                        <Badge
                          className={
                            request.urgency_level === "critical"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                              : "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                          }
                        >
                          {request.urgency_level}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {request.hospital_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(request.needed_by).toLocaleDateString()}
                        </span>
                      </div>
                      <NeomorphicButton size="sm" className="w-full">
                        <Heart className="w-4 h-4" />I Can Help
                      </NeomorphicButton>
                    </div>
                  ))}
                  <NeomorphicButton asChild variant="outline" size="sm" className="w-full">
                    <Link href="/requests">View All Requests</Link>
                  </NeomorphicButton>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No urgent requests in your area right now.</p>
                </div>
              )}
            </NeomorphicCardContent>
          </NeomorphicCard>
        </div>
      </div>
    </div>
  )
}
