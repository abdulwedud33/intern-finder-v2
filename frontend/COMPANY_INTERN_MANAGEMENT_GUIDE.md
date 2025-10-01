# Company-Intern & Intern-Company Management Integration Guide

This guide shows how to integrate both company-intern and intern-company management features with comprehensive UI components and API connections.

## Backend Endpoints

### Company-Intern Management
- `GET /api/company-interns` - List all interns in a company
- `GET /api/company-interns/stats` - Show company intern statistics
- `PUT /api/company-interns/:internId/status` - Update intern status
- `PUT /api/company-interns/:internId/terminate` - Terminate intern
- `GET /api/company-interns/:internId/performance` - Get intern performance history
- `POST /api/company-interns/:internId/performance` - Add performance review

### Intern-Company Management
- `GET /api/intern-companies` - List companies an intern worked with
- `GET /api/intern-companies/stats` - Fetch intern work history stats
- `GET /api/intern-companies/:companyId` - Show relationship details
- `GET /api/intern-companies/timeline` - Get work history timeline
- `GET /api/intern-companies/achievements` - Get achievements
- `GET /api/intern-companies/skills` - Get skills gained
- `GET /api/intern-companies/performance` - Get performance history
- `GET /api/intern-companies/recommendations` - Get recommendations

## Frontend Integration

### 1. Company-Intern Management

#### Service Layer
```typescript
// frontend/src/services/companyInternService.ts
import { companyInternService } from '@/services/companyInternService'

// Get company interns with filtering
const interns = await companyInternService.getCompanyInterns({
  page: 1,
  limit: 10,
  status: 'active',
  department: 'engineering',
  search: 'john',
  sortBy: 'name',
  sortOrder: 'asc'
})

// Get company intern statistics
const stats = await companyInternService.getCompanyInternStats()

// Update intern status
await companyInternService.updateInternStatus('intern123', {
  status: 'completed',
  reason: 'Internship completed successfully',
  endDate: '2024-01-15'
})

// Terminate intern
await companyInternService.terminateIntern('intern123', {
  reason: 'Performance issues',
  endDate: '2024-01-15',
  feedback: 'Additional feedback here'
})
```

#### React Query Hooks
```typescript
// frontend/src/hooks/useCompanyInterns.ts
import { 
  useCompanyInterns, 
  useCompanyInternStats, 
  useUpdateInternStatus, 
  useTerminateIntern 
} from '@/hooks/useCompanyInterns'

function CompanyInternsPage() {
  const { data: interns, isLoading } = useCompanyInterns({
    status: 'active',
    department: 'engineering'
  })
  
  const { data: stats } = useCompanyInternStats()
  const updateStatus = useUpdateInternStatus()
  const terminateIntern = useTerminateIntern()
  
  const handleStatusUpdate = (internId: string, status: string) => {
    updateStatus.mutate({ internId, data: { status } })
  }
  
  const handleTerminate = (internId: string) => {
    terminateIntern.mutate({
      internId,
      data: {
        reason: 'Terminated by company',
        endDate: new Date().toISOString()
      }
    })
  }
}
```

#### UI Components
```tsx
// Company Intern Management Dashboard
import { CompanyInternStatsComponent } from '@/components/company-interns/CompanyInternStats'
import { CompanyInternTable } from '@/components/company-interns/CompanyInternTable'

function CompanyInternsPage() {
  return (
    <div className="space-y-6">
      {/* Statistics */}
      <CompanyInternStatsComponent stats={stats} isLoading={isLoadingStats} />
      
      {/* Intern Table */}
      <CompanyInternTable
        interns={interns}
        onStatusUpdate={handleStatusUpdate}
        onTerminate={handleTerminate}
        onPerformanceReview={handlePerformanceReview}
        isLoading={isLoading}
      />
    </div>
  )
}
```

### 2. Intern-Company Management

#### Service Layer
```typescript
// frontend/src/services/internCompanyService.ts
import { internCompanyService } from '@/services/internCompanyService'

// Get intern companies with filtering
const companies = await internCompanyService.getInternCompanies({
  page: 1,
  limit: 10,
  status: 'completed',
  industry: 'technology',
  search: 'google',
  sortBy: 'startDate',
  sortOrder: 'desc'
})

// Get work history statistics
const stats = await internCompanyService.getInternCompanyStats()

// Get detailed company relationship
const relationship = await internCompanyService.getCompanyRelationship('company123')

// Get work timeline
const timeline = await internCompanyService.getWorkHistoryTimeline()

// Get achievements
const achievements = await internCompanyService.getAchievements()

// Get skills gained
const skills = await internCompanyService.getSkillsGained()
```

#### React Query Hooks
```typescript
// frontend/src/hooks/useInternCompanies.ts
import { 
  useInternCompanies, 
  useInternCompanyStats, 
  useCompanyRelationship,
  useWorkHistoryTimeline,
  useAchievements,
  useSkillsGained
} from '@/hooks/useInternCompanies'

function WorkHistoryPage() {
  const { data: companies, isLoading } = useInternCompanies({
    status: 'completed',
    industry: 'technology'
  })
  
  const { data: stats } = useInternCompanyStats()
  const { data: timeline } = useWorkHistoryTimeline()
  const { data: achievements } = useAchievements()
  const { data: skills } = useSkillsGained()
}
```

#### UI Components
```tsx
// Intern Work History Dashboard
import { WorkHistoryStats } from '@/components/intern-companies/WorkHistoryStats'
import { WorkHistoryTimeline } from '@/components/intern-companies/WorkHistoryTimeline'
import { CompanyRelationshipDetails } from '@/components/intern-companies/CompanyRelationshipDetails'

function WorkHistoryPage() {
  return (
    <div className="space-y-6">
      {/* Statistics */}
      <WorkHistoryStats stats={stats} isLoading={isLoadingStats} />
      
      {/* Work Timeline */}
      <WorkHistoryTimeline companies={companies} isLoading={isLoading} />
      
      {/* Company Details Modal */}
      {selectedCompanyId && (
        <CompanyRelationshipDetails 
          relationship={relationship}
          isLoading={isLoadingRelationship}
        />
      )}
    </div>
  )
}
```

## Key Features

### Company-Intern Management Features

1. **Intern Dashboard**
   - List all interns with filtering and search
   - Status management (active, inactive, completed, terminated)
   - Performance tracking and reviews
   - Department-wise distribution
   - Monthly trends and statistics

2. **Status Management**
   - Update intern status with reason
   - Set end dates for completed/terminated interns
   - Bulk status updates

3. **Performance Reviews**
   - Add performance reviews with ratings
   - Track performance history
   - View detailed feedback and improvements

4. **Termination Process**
   - Terminate interns with detailed reasons
   - Set termination dates
   - Add termination feedback

### Intern-Company Management Features

1. **Work History Dashboard**
   - Timeline view of all work experiences
   - Company cards with key information
   - Filter by status, industry, and search

2. **Detailed Company Views**
   - Complete relationship timeline
   - Performance reviews and ratings
   - Projects and achievements
   - Skills gained and verified
   - Recommendations and testimonials

3. **Achievements Tracking**
   - Categorized achievements
   - Verification status
   - Company and date information

4. **Skills Management**
   - Skills gained from each company
   - Skill levels and verification
   - Last used dates and companies

5. **Performance History**
   - All performance reviews
   - Ratings and feedback
   - Reviewer information

6. **Recommendations**
   - Colleague recommendations
   - Supervisor testimonials
   - Rating and content

## Data Flow

### Company-Intern Flow
1. Company views intern dashboard
2. Filters and searches interns
3. Updates status or adds performance reviews
4. Terminates interns when necessary
5. Views detailed statistics and trends

### Intern-Company Flow
1. Intern views work history dashboard
2. Browses timeline and company cards
3. Clicks on company for detailed view
4. Reviews achievements, skills, and performance
5. Exports resume with work history

## Navigation Integration

### Company Dashboard
Add to client sidebar:
```tsx
<SidebarItem
  icon={Users}
  label="Intern Management"
  href="/dashboard/client/interns"
/>
```

### Intern Dashboard
Add to intern sidebar:
```tsx
<SidebarItem
  icon={Briefcase}
  label="Work History"
  href="/dashboard/intern/work-history"
/>
```

## Error Handling

Both systems include comprehensive error handling:

- Loading states for all data fetching
- Error boundaries for component failures
- Toast notifications for user actions
- Retry mechanisms for failed requests
- Fallback UI for empty states

## Responsive Design

All components are fully responsive:

- Mobile-first design approach
- Collapsible tables on small screens
- Touch-friendly interactions
- Optimized layouts for different screen sizes

## Performance Optimizations

- React Query for efficient data caching
- Pagination for large datasets
- Lazy loading for detailed views
- Memoized components to prevent unnecessary re-renders
- Optimized image loading and lazy loading

This integration provides a complete solution for managing company-intern relationships from both perspectives, with rich UI components and comprehensive data management.
