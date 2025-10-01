# 📊 Dashboard Integration Guide

This guide shows how to replace all mock dashboard data with live backend calls using the new dashboard service and components.

## 🚀 Available Backend Endpoints

### Statistics Endpoints
- `GET /api/stats/dashboard` - General dashboard stats (role-based)
- `GET /api/stats/applications` - Application statistics by status
- `GET /api/stats/interviews` - Interview statistics by status

### Application Endpoints
- `GET /api/applications/stats/company` - Company application stats
- `GET /api/applications/stats/me` - Intern application stats

### Job Endpoints
- `GET /api/jobs/stats/company` - Company job statistics

## 📁 New Files Created

### 1. Dashboard Service (`frontend/src/services/dashboardService.ts`)
Centralized service for all dashboard-related API calls with TypeScript interfaces.

### 2. Dashboard Hooks (`frontend/src/hooks/useDashboardData.ts`)
React Query hooks for fetching and caching dashboard data with automatic refetching.

### 3. Dynamic Chart Components (`frontend/src/components/dashboard/DynamicCharts.tsx`)
Reusable chart components that automatically handle loading states and data transformation.

## 🔧 How to Use

### 1. Import the Hooks and Components

```typescript
import { 
  useCompanyDashboardData, 
  useChartData, 
  useApplicationStatusChart 
} from "@/hooks/useDashboardData"
import { 
  ApplicationStatusChart, 
  WeeklyPerformanceChart, 
  JobTypeDistributionChart, 
  StatCard, 
  RecentActivity 
} from "@/components/dashboard/DynamicCharts"
```

### 2. Fetch Dashboard Data

```typescript
// For Company Dashboard
const { 
  applicationStats, 
  jobStats, 
  recentApplications, 
  companyInterviews,
  isLoading: companyDataLoading 
} = useCompanyDashboardData()

// For Intern Dashboard
const { 
  applicationStats: myAppStats, 
  myRecentApplications, 
  upcomingInterviews,
  isLoading: internDataLoading 
} = useInternDashboardData()

// For Chart Data
const { 
  weeklyPerformanceData, 
  jobTypeDistribution, 
  recentActivity,
  isLoading: chartDataLoading 
} = useChartData({
  dateRange: {
    start: subDays(new Date(), 30).toISOString(),
    end: new Date().toISOString()
  },
  limit: 50
})
```

### 3. Replace Mock Data with Real Components

#### Statistics Cards
```tsx
// Before (Mock)
<Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
  <CardContent className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-blue-100 text-sm font-medium">Active Jobs</p>
        <p className="text-3xl font-bold">{stats.activeJobs}</p>
      </div>
    </div>
  </CardContent>
</Card>

// After (Real Data)
<StatCard
  title="Active Jobs"
  value={stats.activeJobs}
  change={12.5}
  changeType="increase"
  icon={<Briefcase className="h-6 w-6" />}
  isLoading={companyDataLoading}
  className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0"
/>
```

#### Charts
```tsx
// Before (Mock)
<Card>
  <CardHeader>
    <CardTitle>Weekly Performance</CardTitle>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={mockData}>
        {/* Complex chart configuration */}
      </AreaChart>
    </ResponsiveContainer>
  </CardContent>
</Card>

// After (Real Data)
<WeeklyPerformanceChart
  data={weeklyPerformanceData}
  isLoading={chartDataLoading}
  title="Weekly Performance"
/>
```

#### Application Status Chart
```tsx
<ApplicationStatusChart
  data={applicationStatusChart || []}
  isLoading={applicationStatusLoading}
  title="Application Status"
/>
```

#### Recent Activity
```tsx
<RecentActivity
  activities={recentActivity}
  isLoading={chartDataLoading}
  title="Recent Activity"
/>
```

## 📊 Data Transformation

The dashboard service automatically transforms backend data into chart-ready formats:

### Application Stats → Chart Data
```typescript
// Backend Response
{
  success: true,
  data: [
    { status: 'applied', count: 25, avgResponseDays: 3 },
    { status: 'reviewed', count: 15, avgResponseDays: 5 },
    { status: 'accepted', count: 5, avgResponseDays: 7 }
  ]
}

// Transformed for Charts
[
  { status: 'applied', count: 25, percentage: 56 },
  { status: 'reviewed', count: 15, percentage: 33 },
  { status: 'accepted', count: 5, percentage: 11 }
]
```

### Weekly Performance Data
```typescript
// Generated from applications and interviews
[
  { week: 'Jan 1', applications: 12, interviews: 3, hires: 1 },
  { week: 'Jan 8', applications: 18, interviews: 5, hires: 2 },
  // ...
]
```

## 🎯 Key Features

### 1. **Real-time Data**
- All data comes from live backend APIs
- Automatic cache invalidation and refetching
- Optimistic updates for better UX

### 2. **Loading States**
- Skeleton loaders for all components
- Graceful error handling
- Loading indicators during data fetching

### 3. **Responsive Design**
- Charts automatically resize
- Mobile-friendly components
- Consistent styling across all dashboards

### 4. **Type Safety**
- Full TypeScript support
- Proper type definitions for all data structures
- Compile-time error checking

### 5. **Performance**
- React Query caching
- Efficient data transformation
- Minimal re-renders

## 🔄 Data Flow

```
Backend API → Dashboard Service → React Query Hooks → Chart Components → UI
```

1. **Backend API** returns raw data
2. **Dashboard Service** makes API calls and defines types
3. **React Query Hooks** fetch, cache, and manage data
4. **Chart Components** transform data and render charts
5. **UI** displays the final result

## 🛠️ Customization

### Custom Chart Colors
```typescript
const COLORS = {
  primary: ['#3b82f6', '#1d4ed8', '#1e40af'],
  success: ['#10b981', '#059669', '#047857'],
  // Add your own color schemes
}
```

### Custom Data Filters
```typescript
const { weeklyPerformanceData } = useChartData({
  dateRange: {
    start: subDays(new Date(), 7).toISOString(),
    end: new Date().toISOString()
  },
  status: 'published',
  limit: 100
})
```

### Custom Loading States
```typescript
<StatCard
  title="Custom Metric"
  value={customValue}
  isLoading={customLoading}
  className="custom-styling"
/>
```

## 📈 Example: Complete Dashboard Integration

```tsx
export default function MyDashboard() {
  // Fetch all dashboard data
  const { 
    applicationStats, 
    jobStats, 
    recentApplications,
    isLoading: companyDataLoading 
  } = useCompanyDashboardData()
  
  const { 
    weeklyPerformanceData, 
    jobTypeDistribution, 
    recentActivity,
    isLoading: chartDataLoading 
  } = useChartData()
  
  const { data: applicationStatusChart } = useApplicationStatusChart()

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Jobs"
          value={jobStats?.data?.total || 0}
          isLoading={companyDataLoading}
        />
        <StatCard
          title="Applications"
          value={applicationStats?.data?.total || 0}
          isLoading={companyDataLoading}
        />
        {/* More stat cards... */}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyPerformanceChart
          data={weeklyPerformanceData}
          isLoading={chartDataLoading}
        />
        <ApplicationStatusChart
          data={applicationStatusChart || []}
          isLoading={chartDataLoading}
        />
      </div>

      {/* Recent Activity */}
      <RecentActivity
        activities={recentActivity}
        isLoading={chartDataLoading}
      />
    </div>
  )
}
```

## ✅ Benefits

1. **No More Mock Data** - All charts and statistics use real backend data
2. **Consistent UI** - Reusable components ensure consistent design
3. **Better Performance** - React Query caching and optimized rendering
4. **Type Safety** - Full TypeScript support prevents runtime errors
5. **Easy Maintenance** - Centralized data fetching and transformation
6. **Real-time Updates** - Automatic data refresh and cache invalidation

This integration provides a complete, production-ready dashboard system with real-time data from your backend APIs!
