"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  NeomorphicCard,
  NeomorphicCardContent,
  NeomorphicCardHeader,
  NeomorphicCardTitle,
} from "@/components/ui/neomorphic-card"
import { NeomorphicButton } from "@/components/ui/neomorphic-button"
import { NeomorphicInput } from "@/components/ui/neomorphic-input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, MapPin, Phone, Heart, Clock, ArrowLeft, Shield } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { OTPVerificationModal } from "./otp-verification-modal"

interface ChatMessage {
  id: string
  sender_id: string
  recipient_id: string
  message_text: string
  message_type: string
  is_read: boolean
  created_at: string
}

interface UserProfile {
  id: string
  full_name: string
  blood_type: string
  phone: string
  city: string
  is_verified: boolean
}

interface BloodRequest {
  id: string
  patient_name: string
  blood_type: string
  urgency_level: string
  hospital_name: string
  contact_phone: string
  needed_by: string
}

interface Donation {
  id: string
  status: string
  otp_code?: string
  estimated_arrival?: string
  donation_date?: string
}

interface ChatInterfaceProps {
  currentUserId: string
  otherUser: UserProfile
  bloodRequest?: BloodRequest
  donation?: Donation
  requestId: string
}

export function ChatInterface({ currentUserId, otherUser, bloodRequest, donation, requestId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchMessages()
    markMessagesAsRead()

    // Set up real-time subscription
    const channel = supabase
      .channel(`messages-${requestId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `request_id=eq.${requestId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [requestId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("request_id", requestId)
      .or(`sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching messages:", error)
    } else {
      setMessages(data || [])
    }
  }

  const markMessagesAsRead = async () => {
    await supabase
      .from("messages")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("request_id", requestId)
      .eq("recipient_id", currentUserId)
      .eq("is_read", false)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isLoading) return

    setIsLoading(true)
    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: currentUserId,
        recipient_id: otherUser.id,
        request_id: requestId,
        donation_id: donation?.id,
        message_text: newMessage.trim(),
        message_type: "text",
      })

      if (error) throw error
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleOTPVerification = () => {
    setShowOTPModal(true)
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <NeomorphicCard className="rounded-none border-b">
        <NeomorphicCardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <NeomorphicButton variant="ghost" size="icon" asChild>
                <Link href="/messages">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </NeomorphicButton>

              <Avatar className="w-12 h-12 neomorphic">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {otherUser.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div>
                <div className="flex items-center gap-2">
                  <NeomorphicCardTitle className="text-lg">{otherUser.full_name}</NeomorphicCardTitle>
                  <Badge variant="secondary">{otherUser.blood_type}</Badge>
                  {otherUser.is_verified && (
                    <Badge variant="default" className="text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{otherUser.city}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <NeomorphicButton variant="outline" size="sm">
                <Phone className="w-4 h-4" />
                Call
              </NeomorphicButton>
              <NeomorphicButton variant="outline" size="sm">
                <MapPin className="w-4 h-4" />
                Location
              </NeomorphicButton>
            </div>
          </div>

          {/* Blood Request Info */}
          {bloodRequest && (
            <div className="neomorphic-inset rounded-lg p-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary" />
                    Blood Request: {bloodRequest.patient_name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {bloodRequest.blood_type} • {bloodRequest.hospital_name}
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    className={
                      bloodRequest.urgency_level === "critical"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        : "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                    }
                  >
                    {bloodRequest.urgency_level}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Needed by {new Date(bloodRequest.needed_by).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Donation Status */}
              {donation && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Donation Status: {donation.status}</span>
                  </div>
                  {donation.status === "pending" && donation.otp_code && (
                    <NeomorphicButton size="sm" onClick={handleOTPVerification}>
                      Verify Donation
                    </NeomorphicButton>
                  )}
                </div>
              )}
            </div>
          )}
        </NeomorphicCardHeader>
      </NeomorphicCard>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.sender_id === currentUserId
          return (
            <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  isOwnMessage
                    ? "bg-primary text-primary-foreground neomorphic"
                    : "bg-muted text-muted-foreground neomorphic-inset"
                }`}
              >
                <p className="text-sm">{message.message_text}</p>
                <p className={`text-xs mt-1 ${isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {formatDistanceToNow(new Date(message.created_at))} ago
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <NeomorphicCard className="rounded-none border-t">
        <NeomorphicCardContent className="p-4">
          <form onSubmit={sendMessage} className="flex gap-3">
            <NeomorphicInput
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
              disabled={isLoading}
            />
            <NeomorphicButton type="submit" disabled={isLoading || !newMessage.trim()}>
              <Send className="w-4 h-4" />
            </NeomorphicButton>
          </form>
        </NeomorphicCardContent>
      </NeomorphicCard>

      {/* OTP Verification Modal */}
      {donation && (
        <OTPVerificationModal
          isOpen={showOTPModal}
          onClose={() => setShowOTPModal(false)}
          donation={donation}
          bloodRequest={bloodRequest}
        />
      )}
    </div>
  )
}
