"use client"
import { NeomorphicCard, NeomorphicCardContent } from "@/components/ui/neomorphic-card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageCircle, Clock, Heart } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  request_id?: string
  donation_id?: string
  message_text: string
  is_read: boolean
  created_at: string
  sender: {
    id: string
    full_name: string
    blood_type: string
    is_verified: boolean
  }
  recipient: {
    id: string
    full_name: string
    blood_type: string
    is_verified: boolean
  }
  request?: {
    id: string
    patient_name: string
    blood_type: string
    urgency_level: string
  }
  donation?: {
    id: string
    status: string
  }
}

interface MessagesListProps {
  conversations: Message[]
  currentUserId: string
}

export function MessagesList({ conversations, currentUserId }: MessagesListProps) {
  // Group messages by conversation
  const groupedConversations = conversations.reduce(
    (acc, message) => {
      const otherUserId = message.sender_id === currentUserId ? message.recipient_id : message.sender_id
      const conversationKey = `${currentUserId}-${otherUserId}-${message.request_id || "general"}`

      if (!acc[conversationKey] || new Date(message.created_at) > new Date(acc[conversationKey].created_at)) {
        acc[conversationKey] = message
      }

      return acc
    },
    {} as Record<string, Message>,
  )

  const conversationList = Object.values(groupedConversations).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  if (conversationList.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="neomorphic w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center bg-muted/50">
          <MessageCircle className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Messages Yet</h3>
        <p className="text-muted-foreground">Start helping others by responding to blood requests.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {conversationList.map((message) => {
        const otherUser = message.sender_id === currentUserId ? message.recipient : message.sender
        const isUnread = !message.is_read && message.recipient_id === currentUserId
        const conversationId = `${currentUserId}-${otherUser.id}-${message.request_id || "general"}`

        return (
          <Link key={message.id} href={`/messages/${conversationId}`}>
            <NeomorphicCard className="hover:shadow-lg transition-all duration-300 cursor-pointer">
              <NeomorphicCardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="w-12 h-12 neomorphic">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {otherUser.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {isUnread && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{otherUser.full_name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {otherUser.blood_type}
                        </Badge>
                        {otherUser.is_verified && (
                          <Badge variant="default" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(message.created_at))} ago
                      </span>
                    </div>

                    {message.request && (
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Blood request for {message.request.patient_name} ({message.request.blood_type})
                        </span>
                        <Badge
                          className={
                            message.request.urgency_level === "critical"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                              : "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                          }
                        >
                          {message.request.urgency_level}
                        </Badge>
                      </div>
                    )}

                    <p className="text-sm text-muted-foreground truncate">{message.message_text}</p>

                    {message.donation && (
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Donation status: {message.donation.status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </NeomorphicCardContent>
            </NeomorphicCard>
          </Link>
        )
      })}
    </div>
  )
}
