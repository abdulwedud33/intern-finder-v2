"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Star, 
  StarHalf, 
  StarIcon, 
  Calendar, 
  Building2, 
  Briefcase,
  TrendingUp,
  MessageSquare,
  Filter,
  Search,
  SortAsc,
  SortDesc
} from "lucide-react"
import { useReviewsAboutMe, useMyReviews, useDeleteReview } from "@/hooks/useReviews"
import { ReviewForm, ReviewCard as ReviewCardComponent, StarRatingDisplay } from "@/components/reviews/ReviewForm"
import { getUserAvatarUrl } from "@/utils/imageUtils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Review } from "@/services/reviewService"
import { LoadingCard } from "@/components/ui/loading-spinner"
import { ErrorDisplay } from "@/components/ui/error-boundary"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"

// Star rating component
const StarRating = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5", 
    lg: "h-6 w-6"
  }
  
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating
              ? "text-yellow-400 fill-yellow-400"
              : star - 0.5 <= rating
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
      <span className="ml-2 text-sm font-medium text-gray-600">{rating.toFixed(1)}</span>
    </div>
  )
}

// Review card component
const ReviewCard = ({ review }: { review: any }) => {
  const reviewer = review.reviewer
  const job = review.job
  const isCompanyReview = review.direction === 'company_to_intern'
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={getUserAvatarUrl(reviewer)} alt={reviewer?.name || 'Unknown'} />
              <AvatarFallback className="bg-teal-500 text-white">
                {reviewer?.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-gray-900">{reviewer?.name || 'Unknown Reviewer'}</h4>
              <p className="text-sm text-gray-500 flex items-center">
                <Building2 className="h-4 w-4 mr-1" />
                {isCompanyReview ? 'Company' : 'Intern'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <StarRating rating={review.rating} size="md" />
            <p className="text-xs text-gray-500 mt-1">
              {format(new Date(review.createdAt), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>

        {job && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm">
              <Briefcase className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-700">{job.title}</span>
              <span className="text-gray-500">at</span>
              <span className="text-gray-700">{job.company}</span>
            </div>
          </div>
        )}

        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed">{review.content}</p>
        </div>

        <div className="flex items-center justify-between">
          <Badge 
            variant={review.status === 'approved' ? 'default' : 'secondary'}
            className={
              review.status === 'approved' 
                ? 'bg-green-100 text-green-700' 
                : review.status === 'pending'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }
          >
            {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
          </Badge>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(review.createdAt), 'MMM dd, yyyy')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [filterBy, setFilterBy] = useState("all")
  const [activeTab, setActiveTab] = useState("received")
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  
  // Real data from API
  const reviewsAboutMe = useReviewsAboutMe()
  const myReviews = useMyReviews()
  const deleteReviewMutation = useDeleteReview()

  const { data: receivedReviewsData, isLoading: receivedLoading, error: receivedError } = reviewsAboutMe
  const { data: myReviewsData, isLoading: myLoading, error: myError } = myReviews

  const receivedReviews = receivedReviewsData?.data || []
  const myReviewsList = myReviewsData?.data || []
  const averageRating = receivedReviewsData?.averageRating || 0
  const totalReviews = receivedReviewsData?.count || 0

  // Get current reviews based on active tab
  const currentReviews = activeTab === 'received' ? receivedReviews : myReviewsList
  const isLoading = activeTab === 'received' ? receivedLoading : myLoading
  const error = activeTab === 'received' ? receivedError : myError

  // Filter and sort reviews
  const filteredReviews = currentReviews.filter((review: any) => {
    const matchesSearch = review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.reviewer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (review.job?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filterBy === 'all' || review.status === filterBy
    
    return matchesSearch && matchesFilter
  })

  const sortedReviews = [...filteredReviews].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'highest':
        return b.rating - a.rating
      case 'lowest':
        return a.rating - b.rating
      default:
        return 0
    }
  })

  if (isLoading) {
    return <LoadingCard />
  }

  if (error) {
    return <ErrorDisplay error={error} title="Failed to load reviews" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Reviews & Feedback</h1>
          <p className="text-gray-600 mt-1">See what companies say about your performance</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <div className="flex items-center space-x-2 mt-2">
                  <StarRating rating={averageRating} size="lg" />
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalReviews}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Reviews</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {receivedReviews.filter((r: any) => r.status === 'approved').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SortAsc className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="highest">Highest Rating</SelectItem>
                  <SelectItem value="lowest">Lowest Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="received">Reviews About Me ({receivedReviews.length})</TabsTrigger>
          <TabsTrigger value="written">My Reviews ({myReviewsList.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="received">
          <div className="space-y-4">
            {sortedReviews.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery || filterBy !== 'all' 
                      ? "No reviews match your current filters." 
                      : "You haven't received any reviews yet. Complete some internships to get feedback from companies."
                    }
                  </p>
                  {searchQuery || filterBy !== 'all' ? (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery("")
                        setFilterBy("all")
                      }}
                    >
                      Clear Filters
                    </Button>
                  ) : (
                    <Button asChild>
                      <a href="/jobs">Browse Jobs</a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              sortedReviews
                .filter((review: any) => review.reviewer) // Only show reviews with reviewer data
                .map((review: any) => (
                  <ReviewCardComponent 
                    key={review._id} 
                    review={review}
                    canEdit={false}
                    canDelete={false}
                  />
                ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="written">
          <div className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Write Review
              </Button>
            </div>
            {sortedReviews.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews written</h3>
                  <p className="text-gray-600 mb-4">
                    You haven't written any reviews yet.
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    Write Your First Review
                  </Button>
                </CardContent>
              </Card>
            ) : (
              sortedReviews
                .filter((review: any) => review.reviewer) // Only show reviews with reviewer data
                .map((review: any) => (
                  <ReviewCardComponent 
                    key={review._id} 
                    review={review}
                    canEdit={true}
                    canDelete={true}
                    onEdit={setEditingReview}
                    onDelete={(reviewId: string) => {
                      if (confirm('Are you sure you want to delete this review?')) {
                        deleteReviewMutation.mutate(reviewId)
                      }
                    }}
                    isLoading={deleteReviewMutation.isPending}
                  />
                ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Review Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>
          <ReviewForm
            targetId=""
            targetName=""
            targetType="Company"
            onSubmit={(data) => {
              // Handle review creation
              console.log('Creating review:', data)
              setIsCreateDialogOpen(false)
            }}
            onCancel={() => setIsCreateDialogOpen(false)}
            mode="create"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Review Dialog */}
      <Dialog open={!!editingReview} onOpenChange={() => setEditingReview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
          </DialogHeader>
          {editingReview && (
            <ReviewForm
              review={editingReview}
              targetId={editingReview.target._id}
              targetName={editingReview.target.name}
              targetType={editingReview.targetModel}
              jobId={editingReview.job?._id}
              jobTitle={editingReview.job?.title}
              onSubmit={(data) => {
                // Handle review update
                console.log('Updating review:', data)
                setEditingReview(null)
              }}
              onCancel={() => setEditingReview(null)}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      {sortedReviews.length > 0 && (
        <div className="flex items-center justify-center space-x-2">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <Button variant="default" size="sm" className="bg-teal-500 hover:bg-teal-600">
            1
          </Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm">
            3
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
