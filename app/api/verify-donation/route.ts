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

    const { donationId, otpCode } = await request.json()

    if (!donationId || !otpCode) {
      return NextResponse.json({ error: "Donation ID and OTP code are required" }, { status: 400 })
    }

    // Get donation details
    const { data: donation, error: donationError } = await supabase
      .from("donations")
      .select("*, request:blood_requests(*)")
      .eq("id", donationId)
      .single()

    if (donationError || !donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 })
    }

    // Verify OTP
    if (donation.otp_code !== otpCode) {
      return NextResponse.json({ error: "Invalid OTP code" }, { status: 400 })
    }

    // Update donation status
    const { error: updateError } = await supabase
      .from("donations")
      .update({
        status: "confirmed",
        otp_verified_at: new Date().toISOString(),
        verification_method: "otp",
      })
      .eq("id", donationId)

    if (updateError) {
      return NextResponse.json({ error: "Error updating donation status" }, { status: 500 })
    }

    // Update donor's last donation date and eligibility
    await supabase
      .from("profiles")
      .update({
        last_donation_date: new Date().toISOString(),
        next_eligible_date: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000).toISOString(), // 56 days from now
      })
      .eq("id", donation.donor_id)

    // Create notifications
    await supabase.from("notifications").insert([
      {
        user_id: donation.donor_id,
        title: "Donation Verified",
        message: "Your blood donation has been successfully verified. Thank you for saving a life!",
        type: "donation_update",
        donation_id: donationId,
      },
      {
        user_id: donation.request.requester_id,
        title: "Donation Confirmed",
        message: `Blood donation for ${donation.request.patient_name} has been confirmed`,
        type: "donation_update",
        donation_id: donationId,
      },
    ])

    return NextResponse.json({
      success: true,
      message: "Donation verified successfully",
    })
  } catch (error) {
    console.error("Error in verify-donation API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
