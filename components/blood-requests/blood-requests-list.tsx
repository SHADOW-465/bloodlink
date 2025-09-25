"use client"
import { useState } from "react"
import { NeomorphicCard, NeomorphicCardContent } from "@/components/ui/neomorphic-card"
import { NeomorphicButton } from "@/components/ui/neomorphic-button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Phone, User, AlertTriangle, Heart } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { DonorMatchingModal } from "./donor-matching-modal"

interface BloodRequest {
  id: string
  blood_type: string
  units_needed: number
  urgency_level: string
  needed_by: string
  patient_name: string
  patient_age: number
  patient_gender: string
  medical_condition: string
  hospital_name: string
  hospital_address: string
  city: string
  contact_person: string
  contact_phone: string
  description: string
  created_at: string
  requester: {
    full_name: string
    phone: string
    is_verified: boolean
  }
}

interface BloodRequestsListProps {
  requests: BloodRequest[]
}

const urgencyColors = {
  low: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  critical: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
}

export function BloodRequestsList({ requests }: BloodRequestsListProps) {
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleRespond = (request: BloodRequest) => {
    setSelectedRequest(request)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedRequest(null)
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="neomorphic w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center bg-muted/50">
          <Heart className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Active Requests</h3>
        <p className="text-muted-foreground">There are currently no active blood requests in your area.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-6">
        {requests.map((request) => (
          <NeomorphicCard key={request.id} className="hover:shadow-lg transition-all duration-300">
            <NeomorphicCardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left side - Blood type and urgency */}
                <div className="flex-shrink-0">
                  <div className="neomorphic w-20 h-20 rounded-full flex items-center justify-center bg-primary/10 mb-4">
                    <span className="text-2xl font-bold text-primary">{request.blood_type}</span>
                  </div>
                  <Badge className={`${urgencyColors[request.urgency_level as keyof typeof urgencyColors]} capitalize`}>
                    {request.urgency_level === "critical" && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {request.urgency_level}
                  </Badge>
                </div>

                {/* Middle - Request details */}
                <div className="flex-grow space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {request.units_needed} {request.units_needed === 1 ? "Unit" : "Units"} Needed for{" "}
                      {request.patient_name}
                    </h3>
                    <p className="text-muted-foreground">{request.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {request.patient_gender}, {request.patient_age} years
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{request.hospital_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Needed by {new Date(request.needed_by).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{request.contact_person}</span>
                    </div>
                  </div>

                  {request.medical_condition && (
                    <div className="neomorphic-inset rounded-lg p-3 bg-muted/50">
                      <p className="text-sm">
                        <strong>Medical Condition:</strong> {request.medical_condition}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Posted {formatDistanceToNow(new Date(request.created_at))} ago by {request.requester.full_name}
                    {request.requester.is_verified && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Right side - Actions */}
                <div className="flex-shrink-0 flex flex-col gap-3">
                  <NeomorphicButton onClick={() => handleRespond(request)} size="lg" className="w-full lg:w-auto">
                    <Heart className="w-4 h-4" />I Can Help
                  </NeomorphicButton>
                  <NeomorphicButton variant="outline" size="sm" className="w-full lg:w-auto">
                    <MapPin className="w-4 h-4" />
                    View Location
                  </NeomorphicButton>
                  <NeomorphicButton variant="outline" size="sm" className="w-full lg:w-auto">
                    <Phone className="w-4 h-4" />
                    Contact
                  </NeomorphicButton>
                </div>
              </div>
            </NeomorphicCardContent>
          </NeomorphicCard>
        ))}
      </div>

      {/* Donor Matching Modal */}
      {selectedRequest && (
        <DonorMatchingModal
          isOpen={isModalOpen}
          onClose={closeModal}
          requestId={selectedRequest.id}
          bloodType={selectedRequest.blood_type}
          patientName={selectedRequest.patient_name}
        />
      )}
    </>
  )
}
