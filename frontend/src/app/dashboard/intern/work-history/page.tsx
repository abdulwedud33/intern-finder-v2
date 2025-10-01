"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  Download, 
  Building2,
  Calendar,
  Star,
  Award,
  TrendingUp,
  Briefcase,
  Target
} from 'lucide-react'
import { useInternCompanies, useInternCompanyStats, useWorkHistoryTimeline, useAchievements, useSkillsGained, usePerformanceHistory, useRecommendations } from '@/hooks/useInternCompanies'
import { WorkHistoryStats } from '@/components/intern-companies/WorkHistoryStats'
import { WorkHistoryTimeline } from '@/components/intern-companies/WorkHistoryTimeline'
import { CompanyRelationshipDetails } from '@/components/intern-companies/CompanyRelationshipDetails'
import { LoadingCard } from '@/components/ui/loading-spinner'
import { ErrorDisplay } from '@/components/ui/error-boundary'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'

export default function WorkHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [industryFilter, setIndustryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('startDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)

  // Fetch data
  const { data: companiesData, isLoading: isLoadingCompanies, error: companiesError } = useInternCompanies({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    industry: industryFilter !== 'all' ? industryFilter : undefined,
    search: searchQuery || undefined,
    sortBy,
    sortOrder
  })

  const { data: statsData, isLoading: isLoadingStats, error: statsError } = useInternCompanyStats()
  const { data: timelineData, isLoading: isLoadingTimeline } = useWorkHistoryTimeline()
  const { data: achievementsData, isLoading: isLoadingAchievements } = useAchievements()
  const { data: skillsData, isLoading: isLoadingSkills } = useSkillsGained()
  const { data: performanceData, isLoading: isLoadingPerformance } = usePerformanceHistory()
  const { data: recommendationsData, isLoading: isLoadingRecommendations } = useRecommendations()

  const companies = companiesData?.data || []
  const stats = statsData?.data
  const timeline = timelineData?.data || []
  const achievements = achievementsData?.data || []
  const skills = skillsData?.data || []
  const performance = performanceData?.data || []
  const recommendations = recommendationsData?.data || []

  if (isLoadingCompanies || isLoadingStats) {
    return <LoadingCard />
  }

  if (companiesError || statsError) {
    return <ErrorDisplay error={companiesError || statsError} />
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Work History</h1>
          <p className="text-gray-600 mt-1">Track your professional journey and company relationships.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Resume
          </Button>
        </div>
      </div>

      {/* Stats */}
      <WorkHistoryStats stats={stats} isLoading={isLoadingStats} />

      {/* Main Content */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Work Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WorkHistoryTimeline companies={companies} isLoading={isLoadingCompanies} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search companies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={industryFilter} onValueChange={setIndustryFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companies.map((company) => (
                  <Card 
                    key={company._id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedCompanyId(company.company._id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={company.company.logo} />
                          <AvatarFallback>
                            {company.company.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {company.company.name}
                          </h3>
                          <p className="text-sm text-gray-600">{company.job.title}</p>
                          <p className="text-xs text-gray-500">{company.company.industry}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {company.status}
                            </Badge>
                            {company.performance && (
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-yellow-500" />
                                <span className="text-xs">{company.performance.rating}/5</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAchievements ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : achievements.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
                  <p className="text-gray-500">Your achievements will appear here as you complete projects and milestones.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{achievement.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {achievement.company} • {format(new Date(achievement.date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {achievement.category}
                          </Badge>
                          {achievement.verified && (
                            <Badge variant="default" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Skills Gained
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSkills ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : skills.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No skills yet</h3>
                  <p className="text-gray-500">Skills you gain from your work experience will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {skills.map((skill, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{skill.name}</h3>
                          <p className="text-sm text-gray-600 capitalize">{skill.level}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Last used: {format(new Date(skill.lastUsed), 'MMM yyyy')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {skill.level}
                          </Badge>
                          {skill.verified && (
                            <Badge variant="default" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">
                          Gained from: {skill.companies.join(', ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Performance History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingPerformance ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : performance.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No performance reviews yet</h3>
                  <p className="text-gray-500">Performance reviews from your supervisors will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {performance.map((review, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{review.company}</h3>
                          <p className="text-sm text-gray-600">{review.position}</p>
                          <p className="text-sm text-gray-700 mt-2">{review.feedback}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">{review.rating}/5</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <span>Reviewed by: {review.reviewer}</span>
                        <span>{format(new Date(review.date), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingRecommendations ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : recommendations.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
                  <p className="text-gray-500">Recommendations from your colleagues and supervisors will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{rec.from}</h3>
                          <p className="text-sm text-gray-600">{rec.role} at {rec.company}</p>
                          <p className="text-sm text-gray-700 mt-2">{rec.content}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{rec.rating}/5</span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {format(new Date(rec.date), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Company Details Modal */}
      {selectedCompanyId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Company Details</h2>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedCompanyId(null)}
                >
                  Close
                </Button>
              </div>
              <CompanyRelationshipDetails 
                relationship={undefined} // This would be fetched based on selectedCompanyId
                isLoading={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
