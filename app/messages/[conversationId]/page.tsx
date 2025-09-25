import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ChatInterface } from "@/components/messages/chat-interface"

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Parse conversation ID (format: userId1-userId2-requestId)
  const [otherUserId, requestId] = conversationId.split("-").slice(1)

  // Get the other user's profile
  const { data: otherUser } = await supabase.from("profiles").select("*").eq("id", otherUserId).single()

  // Get blood request details if available
  const { data: bloodRequest } = await supabase.from("blood_requests").select("*").eq("id", requestId).single()

  // Get donation details if available
  const { data: donation } = await supabase
    .from("donations")
    .select("*")
    .eq("request_id", requestId)
    .or(`donor_id.eq.${user.id},donor_id.eq.${otherUserId}`)
    .single()

  if (!otherUser) {
    redirect("/messages")
  }

  return (
    <div className="min-h-screen bg-background">
      <ChatInterface
        currentUserId={user.id}
        otherUser={otherUser}
        bloodRequest={bloodRequest}
        donation={donation}
        requestId={requestId}
      />
    </div>
  )
}
