import { Card, CardContent } from "@/components/ui/card"
import { Users, Target, Award, Globe } from "lucide-react"
import Image from "next/image"

const teamMembers = [
  {
    name: "Sarah Johnson",
    role: "CEO & Founder",
    image: "/placeholder.svg?height=200&width=200&text=SJ",
    bio: "Former VP at Google with 15+ years in tech recruitment",
  },
  {
    name: "Michael Chen",
    role: "CTO",
    image: "/placeholder.svg?height=200&width=200&text=MC",
    bio: "Ex-Facebook engineer passionate about connecting talent",
  },
  {
    name: "Emily Rodriguez",
    role: "Head of Operations",
    image: "/placeholder.svg?height=200&width=200&text=ER",
    bio: "Operations expert with background in scaling startups",
  },
  {
    name: "David Kim",
    role: "Head of Product",
    image: "/placeholder.svg?height=200&width=200&text=DK",
    bio: "Product leader focused on user experience and innovation",
  },
]

const values = [
  {
    icon: Users,
    title: "People First",
    description:
      "We believe in putting people at the center of everything we do, creating meaningful connections between talent and opportunities.",
  },
  {
    icon: Target,
    title: "Excellence",
    description:
      "We strive for excellence in every interaction, ensuring the highest quality matches for both candidates and employers.",
  },
  {
    icon: Award,
    title: "Innovation",
    description:
      "We continuously innovate to improve the job search and hiring experience through technology and data-driven insights.",
  },
  {
    icon: Globe,
    title: "Global Impact",
    description:
      "We aim to make a positive impact on careers worldwide, breaking down barriers and creating opportunities for everyone.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-50 to-blue-50 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 mt-12">
              About <span className="text-teal-600">InternFinder</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              We're on a mission to connect talented professionals with amazing opportunities, making the job search
              process more efficient and meaningful for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                To revolutionize the way people find jobs and companies find talent by creating a platform that
                prioritizes quality matches, transparency, and user experience.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                We believe that finding the right job or the right candidate shouldn't be a frustrating experience.
                That's why we've built tools and features that make the process more efficient, transparent, and
                successful for everyone involved.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                To become the world's most trusted platform for career opportunities, where every professional can find
                their dream job and every company can discover exceptional talent.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                We envision a future where geographical boundaries don't limit career opportunities, where diversity and
                inclusion are at the forefront of hiring, and where technology enhances human connections rather than
                replacing them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-teal-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Our Impact</h2>
            <p className="text-teal-100">
              Numbers that showcase our commitment to connecting talent with opportunities
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">50,000+</div>
              <div className="text-teal-100">Job Seekers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">5,000+</div>
              <div className="text-teal-100">Companies</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">25,000+</div>
              <div className="text-teal-100">Successful Matches</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">95%</div>
              <div className="text-teal-100">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-gray-600">The principles that guide everything we do</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-gray-600">The passionate people behind InternFinder</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    width={200}
                    height={200}
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-teal-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
              <p className="text-gray-600">How InternFinder came to be</p>
            </div>
            <div className="prose prose-lg mx-auto text-gray-600">
              <p>
                InternFinder was born out of frustration with the traditional job search process. Our founders, having
                experienced the challenges of both finding great talent and landing dream jobs, knew there had to be a
                better way.
              </p>
              <p>
                In 2020, we set out to build a platform that would prioritize quality over quantity, transparency over
                mystery, and meaningful connections over mass applications. We wanted to create a space where job
                seekers could showcase their true potential and where companies could find candidates who truly fit
                their culture and needs.
              </p>
              <p>
                Today, we're proud to have helped thousands of professionals find their perfect roles and countless
                companies build amazing teams. But we're just getting started. We continue to innovate and improve,
                always with our users' success at the heart of everything we do.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
