"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getUserAvatarUrl } from '@/utils/imageUtils'
import { 
  Calendar, 
  MapPin, 
  Star, 
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { InternCompany } from '@/services/internCompanyService'
import { format, formatDistanceToNow } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'

interface WorkHistoryTimelineProps {
  companies: InternCompany[]
  isLoading: boolean
}

export function WorkHistoryTimeline({ companies, isLoading }: WorkHistoryTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No work history</h3>
        <p className="text-gray-500">You haven't worked with any companies yet.</p>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      case 'terminated':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'inactive':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'terminated':
        return 'bg-red-100 text-red-800'
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateDuration = (startDate: string, endDate?: string) => {
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : new Date()
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const months = Math.floor(diffDays / 30)
    const days = diffDays % 30
    
    if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''}${days > 0 ? ` ${days} day${days > 1 ? 's' : ''}` : ''}`
    }
    return `${days} day${days > 1 ? 's' : ''}`
  }

  return (
    <div className="space-y-6">
      {companies.map((company, index) => (
        <Card key={company._id} className="relative">
          {/* Timeline connector */}
          {index < companies.length - 1 && (
            <div className="absolute left-8 top-16 w-0.5 h-full bg-gray-200" />
          )}
          
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              {/* Timeline dot */}
              <div className="flex-shrink-0 relative">
                <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-sm" />
                {getStatusIcon(company.status)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={getUserAvatarUrl({...company.company, role: 'company'})} />
                      <AvatarFallback>
                        {company.company.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {company.job.title}
                      </h3>
                      <p className="text-sm text-gray-600">{company.company.name}</p>
                      <p className="text-xs text-gray-500">{company.job.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(company.status)}>
                      {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                    </Badge>
                    {company.performance && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{company.performance.rating}/5</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(company.startDate), 'MMM yyyy')} - {' '}
                      {company.endDate 
                        ? format(new Date(company.endDate), 'MMM yyyy')
                        : 'Present'
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{calculateDuration(company.startDate, company.endDate)}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{company.company.location}</span>
                  </div>
                </div>

                {company.job.description && (
                  <p className="mt-3 text-sm text-gray-700 line-clamp-2">
                    {company.job.description}
                  </p>
                )}

                {company.achievements && company.achievements.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Key Achievements</h4>
                    <div className="space-y-1">
                      {company.achievements.slice(0, 2).map((achievement, idx) => (
                        <div key={idx} className="text-sm text-gray-600">
                          • {achievement.title}
                        </div>
                      ))}
                      {company.achievements.length > 2 && (
                        <div className="text-sm text-gray-500">
                          +{company.achievements.length - 2} more achievements
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {company.skills && company.skills.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {company.skills.slice(0, 5).map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {company.skills.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{company.skills.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
