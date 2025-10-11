"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getUserAvatarUrl } from '@/utils/imageUtils'
import { 
  Building2, 
  Calendar, 
  Star, 
  Award,
  MapPin,
  Globe,
  Users,
  Briefcase,
  Target,
  CheckCircle,
  ExternalLink,
  Clock,
  User
} from 'lucide-react'
import type { CompanyRelationshipDetails as CompanyRelationshipDetailsType } from '@/services/internCompanyService'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'

interface CompanyRelationshipDetailsProps {
  relationship: CompanyRelationshipDetailsType | undefined
  isLoading: boolean
}

export function CompanyRelationshipDetails({ 
  relationship, 
  isLoading 
}: CompanyRelationshipDetailsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!relationship) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Company not found</h3>
        <p className="text-gray-500">The company relationship details could not be loaded.</p>
      </div>
    )
  }

  const { company, relationship: rel, timeline, performance, projects, achievements, skills, recommendations } = relationship

  return (
    <div className="space-y-6">
      {/* Company Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={getUserAvatarUrl(company)} />
              <AvatarFallback>
                {company.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                  <p className="text-gray-600">{company.industry}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{company.location}</span>
                    </div>
                    {company.website && (
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                      >
                        <Globe className="h-4 w-4" />
                        <span>Website</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="text-sm">
                  {rel.status.charAt(0).toUpperCase() + rel.status.slice(1)}
                </Badge>
              </div>
              {company.description && (
                <p className="mt-3 text-gray-700">{company.description}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relationship Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Your Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900">{rel.job.title}</h3>
              <p className="text-gray-600">{rel.job.department}</p>
              <p className="text-sm text-gray-500 mt-2">{rel.job.description}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>
                  {format(new Date(rel.startDate), 'MMM yyyy')} - {' '}
                  {rel.endDate 
                    ? format(new Date(rel.endDate), 'MMM yyyy')
                    : 'Present'
                  }
                </span>
              </div>
              {rel.supervisor && (
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>Supervisor: {rel.supervisor.name}</span>
                </div>
              )}
              {rel.salary && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-400">$</span>
                  <span>{rel.salary.toLocaleString()}/year</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{event.event}</span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(event.date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performance.map((review, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{review.rating}/5</span>
                        <Badge variant="outline" className="text-xs">
                          {review.category}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {format(new Date(review.date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{review.feedback}</p>
                    <p className="text-xs text-gray-500">Reviewed by: {review.reviewer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map((project, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium">{project.name}</h3>
                      <Badge variant="outline">
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {project.technologies.map((tech, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(project.startDate), 'MMM yyyy')} - {' '}
                      {project.endDate 
                        ? format(new Date(project.endDate), 'MMM yyyy')
                        : 'Present'
                      }
                    </div>
                    {project.impact && (
                      <p className="text-sm text-gray-700 mt-2">
                        <strong>Impact:</strong> {project.impact}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium">{achievement.title}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {achievement.category}
                        </Badge>
                        {achievement.verified && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(achievement.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skills Gained</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skills.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{skill.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{skill.level}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {skill.level}
                      </Badge>
                      {skill.verified && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{rec.from}</h3>
                        <p className="text-sm text-gray-600">{rec.role}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{rec.rating}/5</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{rec.content}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(rec.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
