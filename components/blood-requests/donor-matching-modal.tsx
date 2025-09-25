"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NeomorphicButton } from "@/components/ui/neomorphic-button"
import { NeomorphicInput } from "@/components/ui/neomorphic-input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MapPin, User, Phone, Star, Loader2 } from "lucide-react"
import type { MatchScore } from "@/lib/matching-algorithm"

interface DonorMatchingModalProps {
  isOpen: boolean
  onClose: () => void
  requestId: string
  bloodType: string
  patientName: string
}

export function DonorMatchingModal({ isOpen, onClose, requestId, bloodType, patientName }: DonorMatchingModalProps) {
  const [matches, setMatches] = useState<MatchScore[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isResponding, setIsResponding] = useState(false)
  const [selectedDonor, setSelectedDonor] = useState<MatchScore | null>(null)
  const [message, setMessage] = useState("")
  const [estimatedArrival, setEstimatedArrival] = useState("")

  useEffect(() => {
    if (isOpen && requestId) {
      fetchMatches()
    }
  }, [isOpen, requestId])

  const fetchMatches = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/match-donors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      })

      if (response.ok) {
        const data = await response.json()
        setMatches(data.matches || [])
      }
    } catch (error) {
      console.error("Error fetching matches:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRespond = async () => {
    if (!selectedDonor) return

    setIsResponding(true)
    try {
      const response = await fetch("/api/respond-to-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          message,
          estimatedArrival,
        }),
      })

      if (response.ok) {
        onClose()
        // Show success message or redirect
      }
    } catch (error) {
      console.error("Error responding to request:", error)
    } finally {
      setIsResponding(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Available Donors for {patientName} ({bloodType})
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2">Finding compatible donors...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {matches.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No compatible donors found at this time.</p>
              </div>
            ) : (
              <>
                <div className="grid gap-4">
                  {matches.slice(0, 5).map((match) => (
                    <div
                      key={match.donor.id}
                      className={`neomorphic rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                        selectedDonor?.donor.id === match.donor.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedDonor(match)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-grow">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="neomorphic w-12 h-12 rounded-full flex items-center justify-center bg-primary/10">
                              <User className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{match.donor.full_name}</h4>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">{match.donor.blood_type}</Badge>
                                {match.donor.is_verified && (
                                  <Badge variant="default" className="text-xs">
                                    Verified
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{match.donor.city}</span>
                              {match.distance && <span>({match.distance.toFixed(1)}km)</span>}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              <span>{match.donor.phone}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-2">
                            {match.reasons.slice(0, 3).map((reason, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {reason}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="font-semibold">{match.score}</span>
                          </div>
                          <Badge
                            className={
                              match.score >= 200
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                : match.score >= 150
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                            }
                          >
                            {match.score >= 200 ? "Excellent" : match.score >= 150 ? "Good" : "Fair"} Match
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedDonor && (
                  <div className="neomorphic-inset rounded-lg p-6 space-y-4">
                    <h3 className="text-lg font-semibold">Contact {selectedDonor.donor.full_name}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="message">Message to Donor</Label>
                        <Textarea
                          id="message"
                          placeholder="Hi! We urgently need blood donation for our patient..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="neomorphic-inset rounded-xl min-h-[100px] resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="estimatedArrival">When do you need them?</Label>
                        <NeomorphicInput
                          id="estimatedArrival"
                          type="datetime-local"
                          value={estimatedArrival}
                          onChange={(e) => setEstimatedArrival(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <NeomorphicButton onClick={onClose} variant="outline" className="flex-1">
                        Cancel
                      </NeomorphicButton>
                      <NeomorphicButton onClick={handleRespond} disabled={isResponding} className="flex-1">
                        {isResponding ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Contacting...
                          </>
                        ) : (
                          <>
                            <Heart className="w-4 h-4" />
                            Contact Donor
                          </>
                        )}
                      </NeomorphicButton>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
