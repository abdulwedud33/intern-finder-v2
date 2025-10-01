# Interview Management Integration Guide

This guide explains how the interview management system has been fully integrated with the backend API endpoints, providing complete CRUD functionality for both interns and companies.

## 🎯 **Backend Endpoints Integrated**

### **Core Interview Endpoints**
- `GET /api/interviews/me` - Get current user's interviews (intern or company)
- `GET /api/interviews/companies/:companyId/interviews` - Get company interviews
- `GET /api/interviews/:id` - Get single interview by ID
- `POST /api/interviews` - Create new interview
- `PUT /api/interviews/:id` - Update interview details
- `DELETE /api/interviews/:id` - Delete interview

### **Additional Endpoints**
- `PUT /api/interviews/:id/cancel` - Cancel interview
- `PUT /api/interviews/:id/reschedule` - Reschedule interview
- `POST /api/interviews/:id/feedback` - Submit interview feedback

## 🔧 **Frontend Implementation**

### **1. Enhanced Interview Service (`frontend/src/services/interviewService.ts`)**

Complete CRUD operations with TypeScript interfaces:

```typescript
export interface Interview {
  _id: string;
  applicationId: string;
  jobId: string;
  companyId: string;
  internId: string;
  interviewer: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  scheduledDate: string;
  duration: number; // in minutes
  type: 'phone' | 'video' | 'in-person';
  location?: string;
  meetingLink?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  feedback?: {
    rating: number;
    comments: string;
    strengths: string[];
    improvements: string[];
  };
  outcome?: 'passed' | 'failed' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export const interviewService = {
  // Core CRUD operations
  getMyInterviews: async () => { /* ... */ },
  getCompanyInterviews: async (companyId) => { /* ... */ },
  getInterview: async (interviewId) => { /* ... */ },
  createInterview: async (data) => { /* ... */ },
  updateInterview: async (interviewId, data) => { /* ... */ },
  deleteInterview: async (interviewId) => { /* ... */ },
  
  // Additional operations
  cancelInterview: async (interviewId, reason) => { /* ... */ },
  rescheduleInterview: async (interviewId, newDate, reason) => { /* ... */ },
  submitFeedback: async (interviewId, feedback) => { /* ... */ },
  getInterviewStats: async () => { /* ... */ }
}
```

### **2. React Query Hooks (`frontend/src/hooks/useInterviews.ts`)**

Complete set of hooks for data fetching and mutations:

```typescript
// Data fetching hooks
export const useMyInterviews = () => { /* ... */ }
export const useCompanyInterviews = (companyId) => { /* ... */ }
export const useInterview = (interviewId) => { /* ... */ }

// Mutation hooks
export const useCreateInterview = () => { /* ... */ }
export const useUpdateInterview = () => { /* ... */ }
export const useDeleteInterview = () => { /* ... */ }
export const useCancelInterview = () => { /* ... */ }
export const useRescheduleInterview = () => { /* ... */ }
export const useSubmitInterviewFeedback = () => { /* ... */ }
```

### **3. Reusable Components**

#### **InterviewForm Component (`frontend/src/components/interviews/InterviewForm.tsx`)**
- **Create Mode**: Schedule new interviews
- **Edit Mode**: Update existing interviews
- **Validation**: Form validation with error messages
- **Type Support**: Phone, video, and in-person interviews
- **Dynamic Fields**: Location for in-person, meeting link for video

```typescript
interface InterviewFormProps {
  interview?: Interview
  applicationId?: string
  onSubmit: (data) => void
  onCancel: () => void
  isLoading?: boolean
  mode: 'create' | 'edit'
}
```

#### **InterviewCard Component**
- **Display**: Shows interview details with status and actions
- **Actions**: Edit, cancel, reschedule, delete (when permissions allow)
- **Status**: Visual status indicators with color coding
- **Responsive**: Mobile-friendly design

#### **InterviewTable Component (`frontend/src/components/interviews/InterviewTable.tsx`)**
- **Data Display**: Tabular view of interviews
- **Actions**: Dropdown menu with all available actions
- **Filtering**: Built-in search and filter capabilities
- **Responsive**: Horizontal scroll on mobile

#### **InterviewStats Component**
- **Statistics**: Total, upcoming, completed, this week counts
- **Visual**: Color-coded stat cards
- **Real-time**: Updates based on current data

### **4. Updated Pages**

#### **Client Interviews Page (`/dashboard/client/interviews`)**
- **Real Data**: Fetches from `useCompanyInterviews`
- **Management**: Create, edit, delete, cancel, reschedule interviews
- **Views**: Grid and table view options
- **Statistics**: Real-time interview statistics
- **Filtering**: Search, status, and type filters

#### **Intern Interviews Page (`/dashboard/intern/interviews`)**
- **Real Data**: Fetches from `useMyInterviews`
- **View Only**: Interns can view and join interviews
- **Actions**: Cancel or reschedule (when allowed)
- **Statistics**: Personal interview statistics

## 🚀 **Key Features Implemented**

### **1. Complete CRUD Operations**
- ✅ **Create**: Schedule new interviews with full form validation
- ✅ **Read**: View interviews in grid or table format
- ✅ **Update**: Edit interview details (date, time, location, etc.)
- ✅ **Delete**: Remove interviews with confirmation dialog

### **2. Interview Management**
- ✅ **Scheduling**: Schedule interviews with applications
- ✅ **Rescheduling**: Change interview date/time with reason
- ✅ **Cancellation**: Cancel interviews with reason tracking
- ✅ **Status Tracking**: Real-time status updates

### **3. Interview Types Support**
- ✅ **Phone Interviews**: Basic phone call scheduling
- ✅ **Video Interviews**: Meeting link integration
- ✅ **In-Person Interviews**: Location and venue management

### **4. Real-Time Data Integration**
- ✅ **Live Data**: All mock data replaced with API calls
- ✅ **Cache Management**: Automatic cache invalidation
- ✅ **Loading States**: Skeleton screens and spinners
- ✅ **Error Handling**: Comprehensive error states

### **5. User Experience**
- ✅ **Form Validation**: Client-side validation with helpful messages
- ✅ **Confirmation Dialogs**: Safe deletion and cancellation
- ✅ **Toast Notifications**: Success/error feedback
- ✅ **Responsive Design**: Mobile-friendly interface

## 📱 **Usage Examples**

### **Creating an Interview**
```typescript
const createInterviewMutation = useCreateInterview()

const handleCreateInterview = (data) => {
  createInterviewMutation.mutate({
    applicationId: 'app-123',
    scheduledDate: '2024-01-15T14:00:00Z',
    duration: 60,
    type: 'video',
    meetingLink: 'https://zoom.us/j/123456789',
    notes: 'Technical interview for frontend position'
  })
}
```

### **Updating an Interview**
```typescript
const updateInterviewMutation = useUpdateInterview()

const handleUpdateInterview = (interviewId, data) => {
  updateInterviewMutation.mutate({
    interviewId,
    updateData: {
      scheduledDate: '2024-01-16T15:00:00Z',
      duration: 90,
      notes: 'Updated interview details'
    }
  })
}
```

### **Using Interview Components**
```typescript
// Interview Form
<InterviewForm
  applicationId="app-123"
  onSubmit={handleCreateInterview}
  onCancel={handleCancel}
  mode="create"
  isLoading={isLoading}
/>

// Interview Table
<InterviewTable
  interviews={interviews}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onCancel={handleCancel}
  canEdit={true}
  canDelete={true}
  showApplicant={true}
/>

// Interview Statistics
<InterviewStats
  interviews={interviews}
  isLoading={isLoading}
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

- **Query Caching**: 2-minute stale time for interview data
- **Optimistic Updates**: Immediate UI feedback
- **Lazy Loading**: Components loaded only when needed
- **Memoization**: Prevent unnecessary re-renders
- **Efficient Filtering**: Client-side filtering for better performance

## 🔧 **Configuration**

### **Environment Variables**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### **Query Configuration**
```typescript
// 2-minute cache for interview data
staleTime: 2 * 60 * 1000

// Automatic refetch on window focus
refetchOnWindowFocus: true

// Retry failed requests
retry: 3
```

## 🧪 **Testing Considerations**

- **Unit Tests**: Test individual components and hooks
- **Integration Tests**: Test API integration flows
- **E2E Tests**: Test complete interview workflows
- **Mock Data**: Use consistent test data structure

## 🚀 **Future Enhancements**

- **Calendar Integration**: Google Calendar/Outlook sync
- **Email Notifications**: Automated interview reminders
- **Video Recording**: Interview recording capabilities
- **Interview Templates**: Pre-defined interview formats
- **Bulk Operations**: Mass interview management
- **Analytics**: Interview success rate tracking
- **Mobile App**: Native mobile interview management

## 📋 **Interview Management Workflow**

### **For Companies:**
1. **Schedule**: Create interview from application
2. **Manage**: Edit, reschedule, or cancel as needed
3. **Conduct**: Join video calls or meet in person
4. **Feedback**: Submit interview feedback and ratings
5. **Track**: Monitor interview statistics and success rates

### **For Interns:**
1. **View**: See all scheduled interviews
2. **Prepare**: Access interview details and materials
3. **Join**: Connect to video calls or attend in person
4. **Track**: Monitor interview status and outcomes
5. **Reschedule**: Request rescheduling when needed

---

## ✅ **Integration Complete**

The interview management system is now fully integrated with:
- ✅ All backend endpoints connected
- ✅ Complete CRUD functionality
- ✅ Real-time data updates
- ✅ Type-safe implementation
- ✅ Responsive UI components
- ✅ Error handling and loading states
- ✅ User-friendly interactions

The system provides a complete interview management workflow for both interns and companies, with full backend integration and modern UI components.
