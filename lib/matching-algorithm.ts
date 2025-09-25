// Blood donation matching algorithm
// Matches donors with blood requests based on compatibility, location, and availability

interface BloodCompatibility {
  [key: string]: string[]
}

// Blood type compatibility matrix - who can donate to whom
const BLOOD_COMPATIBILITY: BloodCompatibility = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"], // Universal donor
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"], // Can only donate to AB+
}

// Who can receive from whom (reverse compatibility)
const BLOOD_RECIPIENTS: BloodCompatibility = {
  "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"], // Universal recipient
  "AB-": ["O-", "A-", "B-", "AB-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "A-": ["O-", "A-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "B-": ["O-", "B-"],
  "O+": ["O-", "O+"],
  "O-": ["O-"], // Can only receive from O-
}

export interface DonorProfile {
  id: string
  full_name: string
  blood_type: string
  city: string
  latitude?: number
  longitude?: number
  is_eligible_to_donate: boolean
  last_donation_date?: string
  next_eligible_date?: string
  phone: string
  is_verified: boolean
  role: string
}

export interface BloodRequest {
  id: string
  blood_type: string
  units_needed: number
  urgency_level: string
  needed_by: string
  city: string
  latitude?: number
  longitude?: number
  hospital_name: string
  patient_name: string
  max_distance_km?: number
  preferred_donor_gender?: string
  created_at: string
}

export interface MatchScore {
  donor: DonorProfile
  score: number
  reasons: string[]
  distance?: number
  compatibility: boolean
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Check if donor blood type is compatible with request
export function isBloodCompatible(donorBloodType: string, requestBloodType: string): boolean {
  const compatibleTypes = BLOOD_COMPATIBILITY[donorBloodType] || []
  return compatibleTypes.includes(requestBloodType)
}

// Calculate days since last donation
function daysSinceLastDonation(lastDonationDate: string): number {
  const lastDate = new Date(lastDonationDate)
  const today = new Date()
  const diffTime = Math.abs(today.getTime() - lastDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Check if donor is eligible based on last donation date
function isDonorEligible(donor: DonorProfile): boolean {
  if (!donor.is_eligible_to_donate) return false

  // If no last donation date, assume eligible
  if (!donor.last_donation_date) return true

  // Check if enough time has passed (56 days minimum between donations)
  const daysSince = daysSinceLastDonation(donor.last_donation_date)
  return daysSince >= 56
}

// Calculate urgency multiplier based on request urgency and time remaining
function getUrgencyMultiplier(request: BloodRequest): number {
  const now = new Date()
  const neededBy = new Date(request.needed_by)
  const hoursRemaining = (neededBy.getTime() - now.getTime()) / (1000 * 60 * 60)

  let urgencyScore = 1

  // Base urgency level multiplier
  switch (request.urgency_level) {
    case "critical":
      urgencyScore = 3
      break
    case "high":
      urgencyScore = 2.5
      break
    case "medium":
      urgencyScore = 2
      break
    case "low":
      urgencyScore = 1.5
      break
  }

  // Time-based urgency multiplier
  if (hoursRemaining <= 6)
    urgencyScore *= 2 // Very urgent
  else if (hoursRemaining <= 24)
    urgencyScore *= 1.5 // Urgent
  else if (hoursRemaining <= 72) urgencyScore *= 1.2 // Moderately urgent

  return urgencyScore
}

// Main matching algorithm
export function matchDonorsToRequest(donors: DonorProfile[], request: BloodRequest): MatchScore[] {
  const matches: MatchScore[] = []

  for (const donor of donors) {
    const reasons: string[] = []
    let score = 0

    // 1. Blood compatibility check (mandatory)
    const isCompatible = isBloodCompatible(donor.blood_type, request.blood_type)
    if (!isCompatible) continue // Skip incompatible donors

    reasons.push(`Compatible blood type (${donor.blood_type} → ${request.blood_type})`)
    score += 100 // Base compatibility score

    // 2. Eligibility check
    const isEligible = isDonorEligible(donor)
    if (!isEligible) {
      reasons.push("Not currently eligible to donate")
      score -= 50
    } else {
      reasons.push("Eligible to donate")
      score += 20
    }

    // 3. Verification status
    if (donor.is_verified) {
      reasons.push("Verified donor")
      score += 15
    }

    // 4. Location-based scoring
    let distance: number | undefined
    if (request.latitude && request.longitude && donor.latitude && donor.longitude) {
      distance = calculateDistance(donor.latitude, donor.longitude, request.latitude, request.longitude)

      if (distance <= 5) {
        reasons.push("Very close (within 5km)")
        score += 30
      } else if (distance <= 15) {
        reasons.push("Close (within 15km)")
        score += 20
      } else if (distance <= 30) {
        reasons.push("Nearby (within 30km)")
        score += 10
      } else if (distance <= (request.max_distance_km || 50)) {
        reasons.push(`Within acceptable range (${distance.toFixed(1)}km)`)
        score += 5
      } else {
        reasons.push(`Outside preferred range (${distance.toFixed(1)}km)`)
        score -= 10
      }
    } else if (donor.city.toLowerCase() === request.city.toLowerCase()) {
      reasons.push("Same city")
      score += 15
    }

    // 5. Donation history bonus
    if (donor.last_donation_date) {
      const daysSince = daysSinceLastDonation(donor.last_donation_date)
      if (daysSince >= 56 && daysSince <= 120) {
        reasons.push("Recent donation experience")
        score += 10
      }
    }

    // 6. Exact blood type match bonus
    if (donor.blood_type === request.blood_type) {
      reasons.push("Exact blood type match")
      score += 10
    }

    // 7. Universal donor bonus
    if (donor.blood_type === "O-") {
      reasons.push("Universal donor")
      score += 5
    }

    // 8. Apply urgency multiplier
    const urgencyMultiplier = getUrgencyMultiplier(request)
    score *= urgencyMultiplier

    if (urgencyMultiplier > 2) {
      reasons.push("Critical urgency - high priority")
    } else if (urgencyMultiplier > 1.5) {
      reasons.push("High urgency")
    }

    matches.push({
      donor,
      score: Math.round(score),
      reasons,
      distance,
      compatibility: isCompatible,
    })
  }

  // Sort by score (highest first) and return
  return matches.sort((a, b) => b.score - a.score)
}

// Find best donors for multiple requests (batch processing)
export function batchMatchRequests(donors: DonorProfile[], requests: BloodRequest[]): Map<string, MatchScore[]> {
  const results = new Map<string, MatchScore[]>()

  // Sort requests by urgency first
  const sortedRequests = requests.sort((a, b) => {
    const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    const aUrgency = urgencyOrder[a.urgency_level as keyof typeof urgencyOrder] || 1
    const bUrgency = urgencyOrder[b.urgency_level as keyof typeof urgencyOrder] || 1

    if (aUrgency !== bUrgency) return bUrgency - aUrgency

    // If same urgency, sort by needed_by date
    return new Date(a.needed_by).getTime() - new Date(b.needed_by).getTime()
  })

  for (const request of sortedRequests) {
    const matches = matchDonorsToRequest(donors, request)
    results.set(request.id, matches)
  }

  return results
}

// Get compatible blood types for a given blood type
export function getCompatibleBloodTypes(bloodType: string): string[] {
  return BLOOD_RECIPIENTS[bloodType] || []
}

// Get donation eligibility info
export function getDonationEligibilityInfo(donor: DonorProfile): {
  isEligible: boolean
  reason: string
  nextEligibleDate?: string
} {
  if (!donor.is_eligible_to_donate) {
    return {
      isEligible: false,
      reason: "Marked as ineligible to donate",
    }
  }

  if (!donor.last_donation_date) {
    return {
      isEligible: true,
      reason: "No previous donation record",
    }
  }

  const daysSince = daysSinceLastDonation(donor.last_donation_date)
  const minDaysBetween = 56

  if (daysSince >= minDaysBetween) {
    return {
      isEligible: true,
      reason: `Last donated ${daysSince} days ago`,
    }
  }

  const nextEligibleDate = new Date(donor.last_donation_date)
  nextEligibleDate.setDate(nextEligibleDate.getDate() + minDaysBetween)

  return {
    isEligible: false,
    reason: `Must wait ${minDaysBetween - daysSince} more days`,
    nextEligibleDate: nextEligibleDate.toISOString(),
  }
}
