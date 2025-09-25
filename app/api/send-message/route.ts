import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { recipientId, requestId, donationId, message, messageType = "text" } = await request.json()

    if (!recipientId || !message) {
      return NextResponse.json({ error: "Recipient ID and message are required" }, { status: 400 })
    }

    // Insert message
    const { data: messageData, error: messageError } = await supabase
      .from("messages")
      .insert({
        sender_id: user.id,
        recipient_id: recipientId,
        request_id: requestId,
        donation_id: donationId,
        message_text: message,
        message_type: messageType,
      })
      .select()
      .single()

    if (messageError) {
      return NextResponse.json({ error: "Error sending message" }, { status: 500 })
    }

    // Create notification for recipient
    await supabase.from("notifications").insert({
      user_id: recipientId,
      title: "New Message",
      message: `You have a new message regarding your blood request`,
      type: "donation_update",
      request_id: requestId,
      donation_id: donationId,
    })

    return NextResponse.json({
      success: true,
      message: messageData,
    })
  } catch (error) {
    console.error("Error in send-message API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
