import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { matchDonorsToRequest, type DonorProfile, type BloodRequest } from "@/lib/matching-algorithm"

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

    const { requestId } = await request.json()

    if (!requestId) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 })
    }

    // Get the blood request details
    const { data: bloodRequest, error: requestError } = await supabase
      .from("blood_requests")
      .select("*")
      .eq("id", requestId)
      .eq("status", "active")
      .single()

    if (requestError || !bloodRequest) {
      return NextResponse.json({ error: "Blood request not found" }, { status: 404 })
    }

    // Get eligible donors in the same city or nearby
    const { data: donors, error: donorsError } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "donor")
      .eq("is_verified", true)
      .eq("is_eligible_to_donate", true)
      .or(`city.eq.${bloodRequest.city},city.eq.Chennai,city.eq.Coimbatore,city.eq.Madurai`) // Expand search if needed

    if (donorsError) {
      return NextResponse.json({ error: "Error fetching donors" }, { status: 500 })
    }

    // Run the matching algorithm
    const matches = matchDonorsToRequest(donors as DonorProfile[], bloodRequest as BloodRequest)

    // Return top 10 matches
    const topMatches = matches.slice(0, 10)

    return NextResponse.json({
      success: true,
      matches: topMatches,
      totalDonors: donors?.length || 0,
      compatibleDonors: matches.length,
    })
  } catch (error) {
    console.error("Error in match-donors API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
