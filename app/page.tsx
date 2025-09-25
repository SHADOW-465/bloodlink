import { NeomorphicButton } from "@/components/ui/neomorphic-button"
import { Heart, Users, MapPin, Clock } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="neomorphic w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center bg-primary/10">
            <Heart className="w-12 h-12 text-primary" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Save Lives with
            <span className="text-primary block">LifeConnect</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Connect blood donors with those in need instantly. Join our community-driven platform to make blood donation
            as easy as requesting a ride.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <NeomorphicButton asChild size="lg" className="text-lg px-8">
              <Link href="/auth/register">Start Saving Lives</Link>
            </NeomorphicButton>
            <NeomorphicButton variant="outline" asChild size="lg" className="text-lg px-8">
              <Link href="/auth/login">Sign In</Link>
            </NeomorphicButton>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-balance">How LifeConnect Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="neomorphic w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-primary/10">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Instant Matching</h3>
              <p className="text-muted-foreground text-pretty">
                Our smart algorithm instantly matches blood requests with compatible donors in your area.
              </p>
            </div>

            <div className="text-center">
              <div className="neomorphic w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-primary/10">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Location-Based</h3>
              <p className="text-muted-foreground text-pretty">
                Find the nearest donors and blood banks with real-time location tracking and navigation.
              </p>
            </div>

            <div className="text-center">
              <div className="neomorphic w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-primary/10">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">24/7 Available</h3>
              <p className="text-muted-foreground text-pretty">
                Emergency blood requests can be made anytime, with instant notifications to eligible donors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-balance">Ready to Make a Difference?</h2>
          <p className="text-lg text-muted-foreground mb-8 text-pretty">
            Join thousands of donors and recipients who are already part of the LifeConnect community.
          </p>
          <NeomorphicButton asChild size="lg" className="text-lg px-8">
            <Link href="/auth/register">Get Started Today</Link>
          </NeomorphicButton>
        </div>
      </section>
    </div>
  )
}
