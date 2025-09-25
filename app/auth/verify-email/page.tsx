import {
  NeomorphicCard,
  NeomorphicCardContent,
  NeomorphicCardDescription,
  NeomorphicCardHeader,
  NeomorphicCardTitle,
} from "@/components/ui/neomorphic-card"
import { NeomorphicButton } from "@/components/ui/neomorphic-button"
import { Heart, Mail } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="neomorphic w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center bg-primary/10">
            <Heart className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">LifeConnect</h1>
        </div>

        <NeomorphicCard>
          <NeomorphicCardHeader className="text-center">
            <div className="neomorphic w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-green-100 dark:bg-green-900/20">
              <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <NeomorphicCardTitle>Check Your Email</NeomorphicCardTitle>
            <NeomorphicCardDescription>
              We've sent you a verification link to confirm your account
            </NeomorphicCardDescription>
          </NeomorphicCardHeader>
          <NeomorphicCardContent className="text-center space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Please check your email and click the verification link to activate your account.
              </p>
              <p className="text-sm text-muted-foreground">
                Don't forget to check your spam folder if you don't see the email.
              </p>
            </div>

            <div className="space-y-3">
              <NeomorphicButton asChild className="w-full" size="lg">
                <Link href="/auth/login">Back to Sign In</Link>
              </NeomorphicButton>

              <NeomorphicButton variant="outline" asChild className="w-full">
                <Link href="/auth/register">Try Different Email</Link>
              </NeomorphicButton>
            </div>
          </NeomorphicCardContent>
        </NeomorphicCard>
      </div>
    </div>
  )
}
