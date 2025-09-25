import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MessagesList } from "@/components/messages/messages-list"
import { NeomorphicCard, NeomorphicCardHeader, NeomorphicCardTitle } from "@/components/ui/neomorphic-card"
import { MessageCircle } from "lucide-react"

export default async function MessagesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get conversations (unique combinations of sender/recipient)
  const { data: conversations, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      sender:profiles!messages_sender_id_fkey(id, full_name, blood_type, is_verified),
      recipient:profiles!messages_recipient_id_fkey(id, full_name, blood_type, is_verified),
      request:blood_requests(id, patient_name, blood_type, urgency_level),
      donation:donations(id, status)
    `,
    )
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching conversations:", error)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <NeomorphicCard className="mb-8">
          <NeomorphicCardHeader>
            <NeomorphicCardTitle className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-primary" />
              Messages
            </NeomorphicCardTitle>
          </NeomorphicCardHeader>
        </NeomorphicCard>

        <MessagesList conversations={conversations || []} currentUserId={user.id} />
      </div>
    </div>
  )
}
