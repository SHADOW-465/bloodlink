"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NeomorphicButton } from "@/components/ui/neomorphic-button"
import { NeomorphicInput } from "@/components/ui/neomorphic-input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Shield, CheckCircle, Loader2 } from "lucide-react"

interface Donation {
  id: string
  status: string
  otp_code?: string
}

interface BloodRequest {
  id: string
  patient_name: string
  blood_type: string
}

interface OTPVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  donation: Donation
  bloodRequest?: BloodRequest
}

export function OTPVerificationModal({ isOpen, onClose, donation, bloodRequest }: OTPVerificationModalProps) {
  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleVerifyOTP = async () => {
    if (!otp.trim()) return

    setIsVerifying(true)
    setError(null)

    try {
      const supabase = createClient()

      // Verify OTP
      if (otp !== donation.otp_code) {
        throw new Error("Invalid OTP code")
      }

      // Update donation status
      const { error: updateError } = await supabase
        .from("donations")
        .update({
          status: "confirmed",
          otp_verified_at: new Date().toISOString(),
          verification_method: "otp",
        })
        .eq("id", donation.id)

      if (updateError) throw updateError

      setIsVerified(true)
      setTimeout(() => {
        onClose()
        setIsVerified(false)
        setOtp("")
      }, 2000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Verification failed")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleClose = () => {
    onClose()
    setOtp("")
    setError(null)
    setIsVerified(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Verify Donation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {bloodRequest && (
            <div className="neomorphic-inset rounded-lg p-4">
              <h4 className="font-semibold mb-2">Donation Details</h4>
              <p className="text-sm text-muted-foreground">
                Patient: {bloodRequest.patient_name}
                <br />
                Blood Type: {bloodRequest.blood_type}
              </p>
            </div>
          )}

          {isVerified ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-600 mb-2">Donation Verified!</h3>
              <p className="text-sm text-muted-foreground">Thank you for saving a life.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="otp">Enter 6-digit OTP</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Please enter the OTP provided by the hospital staff or recipient.
                  </p>
                  <NeomorphicInput
                    id="otp"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                  />
                </div>

                {error && (
                  <div className="neomorphic-inset rounded-lg p-3 bg-destructive/10">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <NeomorphicButton variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </NeomorphicButton>
                <NeomorphicButton
                  onClick={handleVerifyOTP}
                  disabled={isVerifying || otp.length !== 6}
                  className="flex-1"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </NeomorphicButton>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
