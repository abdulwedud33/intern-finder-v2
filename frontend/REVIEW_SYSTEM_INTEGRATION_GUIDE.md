# Review System Integration Guide

This guide explains how the review system has been fully integrated with the backend API endpoints, replacing all mock data with real API calls.

## 🎯 **Backend Endpoints Integrated**

### **Core Review Endpoints**
- `GET /api/reviews` - Get all reviews with pagination and filtering
- `GET /api/reviews/:id` - Get single review by ID
- `POST /api/reviews` - Create new review
- `PUT /api/reviews/:id` - Update existing review
- `DELETE /api/reviews/:id` - Delete review

### **Target-Specific Endpoints**
- `GET /api/reviews/target/:targetId` - Get reviews for specific user/company
- `GET /api/reviews/me/reviews` - Get reviews written by current user
- `GET /api/reviews/about-me` - Get reviews about current user

### **Specialized Review Endpoints**
- `POST /api/reviews/company-reviews/:companyId` - Intern reviewing company
- `POST /api/reviews/intern-reviews/:internId/:jobId` - Company reviewing intern
- `GET /api/reviews/intern-reviews` - Get company's intern reviews

## 🔧 **Frontend Implementation**

### **1. Review Service (`frontend/src/services/reviewService.ts`)**

Complete CRUD operations with TypeScript interfaces:

```typescript
export interface Review {
  _id: string
  rating: number
  content: string
  feedback?: string
  reviewer: {
    _id: string
    name: string
    avatar?: string
    role: string
  }
  target: {
    _id: string
    name: string
    avatar?: string
    role: string
  }
  job?: {
    _id: string
    title: string
    company: string
  }
  direction: 'company_to_intern' | 'intern_to_company'
  targetModel: 'Intern' | 'Company'
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
}

export const reviewService = {
  // Core CRUD operations
  getReviews: async (params?) => { /* ... */ },
  getReview: async (reviewId) => { /* ... */ },
  createReview: async (data) => { /* ... */ },
  updateReview: async (reviewId, data) => { /* ... */ },
  deleteReview: async (reviewId) => { /* ... */ },
  
  // Specialized operations
  getReviewsAboutMe: async () => { /* ... */ },
  getMyReviews: async () => { /* ... */ },
  getReviewsForTarget: async (targetId, type) => { /* ... */ },
  createCompanyReview: async (companyId, data) => { /* ... */ },
  createInternReview: async (internId, jobId, data) => { /* ... */ },
  getCompanyInternReviews: async () => { /* ... */ }
}
```

### **2. React Query Hooks (`frontend/src/hooks/useReviews.ts`)**

Complete set of hooks for data fetching and mutations:

```typescript
// Data fetching hooks
export const useReviews = (params?) => { /* ... */ }
export const useReview = (reviewId) => { /* ... */ }
export const useReviewsAboutMe = () => { /* ... */ }
export const useMyReviews = () => { /* ... */ }
export const useReviewsForTarget = (targetId, type) => { /* ... */ }
export const useCompanyInternReviews = () => { /* ... */ }

// Mutation hooks
export const useCreateReview = () => { /* ... */ }
export const useUpdateReview = () => { /* ... */ }
export const useDeleteReview = () => { /* ... */ }
export const useCreateCompanyReview = () => { /* ... */ }
export const useCreateInternReview = () => { /* ... */ }
```

### **3. Reusable Components (`frontend/src/components/reviews/ReviewForm.tsx`)**

#### **ReviewForm Component**
- **Create Mode**: Write new reviews
- **Edit Mode**: Update existing reviews
- **Star Rating**: Interactive 5-star rating system
- **Content & Feedback**: Rich text areas with character limits
- **Validation**: Required fields and proper form validation

```typescript
interface ReviewFormProps {
  review?: Review
  targetId: string
  targetName: string
  targetType: 'Intern' | 'Company'
  jobId?: string
  jobTitle?: string
  onSubmit: (data) => void
  onCancel: () => void
  isLoading?: boolean
  mode: 'create' | 'edit'
}
```

#### **ReviewCard Component**
- **Display**: Shows review details with rating, content, and metadata
- **Actions**: Edit/delete buttons (when permissions allow)
- **Status**: Visual status indicators (pending, approved, rejected)
- **Responsive**: Mobile-friendly design

#### **StarRatingDisplay Component**
- **Visual**: Consistent star rating display
- **Sizes**: Small, medium, large variants
- **Numbers**: Optional numeric rating display

### **4. Updated Pages**

#### **Intern Reviews Page (`/dashboard/intern/reviews`)**
- **Tabs**: "Reviews About Me" and "My Reviews"
- **Real Data**: Fetches from `useReviewsAboutMe` and `useMyReviews`
- **Management**: Create, edit, and delete own reviews
- **Filtering**: Search, filter by status, sort by date/rating
- **Statistics**: Average rating, total reviews, approved count

#### **Client Applicants Page (`/dashboard/client/applicants/[id]`)**
- **Reviews Tab**: Shows all reviews for specific candidate
- **Write Review**: Modal with ReviewForm component
- **Real Data**: Fetches from `useReviewsForTarget`
- **Integration**: Connected to application data

## 🚀 **Key Features Implemented**

### **1. Complete CRUD Operations**
- ✅ Create reviews (both company-to-intern and intern-to-company)
- ✅ Read reviews (with pagination, filtering, sorting)
- ✅ Update existing reviews
- ✅ Delete reviews (with confirmation)

### **2. Real-Time Data Integration**
- ✅ Replaced all mock data with API calls
- ✅ Automatic cache invalidation on mutations
- ✅ Loading states and error handling
- ✅ Optimistic updates for better UX

### **3. User Experience**
- ✅ Interactive star rating system
- ✅ Form validation with helpful error messages
- ✅ Loading spinners and skeleton states
- ✅ Toast notifications for success/error feedback
- ✅ Confirmation dialogs for destructive actions

### **4. Type Safety**
- ✅ Full TypeScript integration
- ✅ Proper interface definitions
- ✅ Type-safe API calls and responses
- ✅ Compile-time error checking

### **5. Responsive Design**
- ✅ Mobile-friendly components
- ✅ Adaptive layouts for different screen sizes
- ✅ Touch-friendly interactive elements

## 📱 **Usage Examples**

### **Creating a Review**
```typescript
const createReviewMutation = useCreateReview()

const handleCreateReview = (data) => {
  createReviewMutation.mutate({
    target: 'company-id',
    targetModel: 'Company',
    rating: 5,
    content: 'Great company to work with!',
    feedback: 'Excellent team and culture',
    direction: 'intern_to_company'
  })
}
```

### **Fetching Reviews for a Target**
```typescript
const { data, isLoading, error } = useReviewsForTarget('user-id', 'intern')

if (isLoading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} />

return (
  <div>
    {data?.data.map(review => (
      <ReviewCard key={review._id} review={review} />
    ))}
  </div>
)
```

### **Using the Review Form**
```typescript
<ReviewForm
  targetId="company-123"
  targetName="Tech Corp"
  targetType="Company"
  jobId="job-456"
  jobTitle="Software Engineer Intern"
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  mode="create"
  isLoading={isSubmitting}
/>
```

## 🔄 **Data Flow**

1. **User Action** → Component triggers mutation
2. **API Call** → Service sends request to backend
3. **Backend Processing** → Server validates and stores data
4. **Response** → Frontend receives success/error
5. **Cache Update** → React Query invalidates and refetches
6. **UI Update** → Components re-render with new data

## 🛡️ **Error Handling**

- **Network Errors**: Graceful fallback with retry options
- **Validation Errors**: Field-specific error messages
- **Permission Errors**: Clear messaging for unauthorized actions
- **Loading States**: Skeleton screens and spinners
- **Empty States**: Helpful messages when no data exists

## 🎨 **UI Components**

All components follow the design system:
- **Consistent Styling**: Using Tailwind CSS classes
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Animation**: Smooth transitions and hover effects
- **Icons**: Lucide React icons throughout
- **Typography**: Consistent text sizing and spacing

## 📊 **Performance Optimizations**

- **Query Caching**: 5-minute stale time for review data
- **Pagination**: Efficient data loading for large datasets
- **Optimistic Updates**: Immediate UI feedback
- **Lazy Loading**: Components loaded only when needed
- **Memoization**: Prevent unnecessary re-renders

## 🔧 **Configuration**

### **Environment Variables**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### **Query Configuration**
```typescript
// 5-minute cache for review data
staleTime: 5 * 60 * 1000

// Automatic refetch on window focus
refetchOnWindowFocus: true

// Retry failed requests
retry: 3
```

## 🧪 **Testing Considerations**

- **Unit Tests**: Test individual components and hooks
- **Integration Tests**: Test API integration flows
- **E2E Tests**: Test complete user workflows
- **Mock Data**: Use consistent test data structure

## 🚀 **Future Enhancements**

- **Review Analytics**: Charts and insights for review data
- **Review Templates**: Pre-defined review templates
- **Bulk Operations**: Mass review management
- **Review Moderation**: Admin approval workflow
- **Review Notifications**: Real-time updates
- **Review Export**: PDF/CSV export functionality

---

## ✅ **Integration Complete**

The review system is now fully integrated with:
- ✅ All backend endpoints connected
- ✅ Mock data completely replaced
- ✅ Full CRUD functionality
- ✅ Real-time data updates
- ✅ Type-safe implementation
- ✅ Responsive UI components
- ✅ Error handling and loading states
- ✅ User-friendly interactions

The system is ready for production use with a complete review management workflow for both interns and companies.
