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

    const { requestId, message, estimatedArrival } = await request.json()

    if (!requestId) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 })
    }

    // Verify the blood request exists and is active
    const { data: bloodRequest, error: requestError } = await supabase
      .from("blood_requests")
      .select("*")
      .eq("id", requestId)
      .eq("status", "active")
      .single()

    if (requestError || !bloodRequest) {
      return NextResponse.json({ error: "Blood request not found or no longer active" }, { status: 404 })
    }

    // Check if donor has already responded to this request
    const { data: existingDonation } = await supabase
      .from("donations")
      .select("id")
      .eq("donor_id", user.id)
      .eq("request_id", requestId)
      .single()

    if (existingDonation) {
      return NextResponse.json({ error: "You have already responded to this request" }, { status: 400 })
    }

    // Generate OTP for verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Create donation record
    const { data: donation, error: donationError } = await supabase
      .from("donations")
      .insert({
        donor_id: user.id,
        request_id: requestId,
        status: "pending",
        otp_code: otp,
        estimated_arrival: estimatedArrival,
        donor_notes: message,
      })
      .select()
      .single()

    if (donationError) {
      return NextResponse.json({ error: "Error creating donation record" }, { status: 500 })
    }

    // Create notification for the requester
    await supabase.from("notifications").insert({
      user_id: bloodRequest.requester_id,
      title: "New Donor Response",
      message: `A donor has responded to your blood request for ${bloodRequest.patient_name}`,
      type: "donation_update",
      request_id: requestId,
      donation_id: donation.id,
    })

    // Create initial message in the communication system
    await supabase.from("messages").insert({
      sender_id: user.id,
      recipient_id: bloodRequest.requester_id,
      request_id: requestId,
      donation_id: donation.id,
      message_text: message || "I can help with this blood donation request.",
      message_type: "text",
    })

    return NextResponse.json({
      success: true,
      donation: donation,
      otp: otp,
      message: "Successfully responded to blood request",
    })
  } catch (error) {
    console.error("Error in respond-to-request API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
