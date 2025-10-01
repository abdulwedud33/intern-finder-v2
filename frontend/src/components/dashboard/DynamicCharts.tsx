"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  Area,
  AreaChart,
  Tooltip,
  Legend
} from 'recharts';

// Color palettes for charts
const COLORS = {
  primary: ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a'],
  success: ['#10b981', '#059669', '#047857', '#065f46'],
  warning: ['#f59e0b', '#d97706', '#b45309', '#92400e'],
  danger: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b'],
  neutral: ['#6b7280', '#4b5563', '#374151', '#1f2937'],
  rainbow: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444']
};

// Application Status Chart Component
interface ApplicationStatusChartProps {
  data: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  isLoading?: boolean;
  title?: string;
  className?: string;
}

export const ApplicationStatusChart: React.FC<ApplicationStatusChartProps> = ({
  data,
  isLoading = false,
  title = "Application Status",
  className = ""
}) => {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const statusColors: Record<string, string> = {
    'applied': COLORS.primary[0],
    'pending': COLORS.warning[0],
    'reviewed': COLORS.neutral[0],
    'shortlisted': COLORS.success[0],
    'accepted': COLORS.success[1],
    'hired': COLORS.success[2],
    'rejected': COLORS.danger[0],
    'withdrawn': COLORS.neutral[1]
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ status, percentage }) => `${status} (${percentage}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={statusColors[entry.status] || COLORS.rainbow[index % COLORS.rainbow.length]} 
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Weekly Performance Chart Component
interface WeeklyPerformanceChartProps {
  data: Array<{
    week: string;
    applications: number;
    interviews: number;
    hires: number;
  }>;
  isLoading?: boolean;
  title?: string;
  className?: string;
}

export const WeeklyPerformanceChart: React.FC<WeeklyPerformanceChartProps> = ({
  data,
  isLoading = false,
  title = "Weekly Performance",
  className = ""
}) => {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data}>
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="applications"
              stackId="1"
              stroke={COLORS.primary[0]}
              fill={COLORS.primary[0]}
              name="Applications"
            />
            <Area
              type="monotone"
              dataKey="interviews"
              stackId="1"
              stroke={COLORS.success[0]}
              fill={COLORS.success[0]}
              name="Interviews"
            />
            <Area
              type="monotone"
              dataKey="hires"
              stackId="1"
              stroke={COLORS.warning[0]}
              fill={COLORS.warning[0]}
              name="Hires"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Job Type Distribution Chart Component
interface JobTypeDistributionChartProps {
  data: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  isLoading?: boolean;
  title?: string;
  className?: string;
}

export const JobTypeDistributionChart: React.FC<JobTypeDistributionChartProps> = ({
  data,
  isLoading = false,
  title = "Job Type Distribution",
  className = ""
}) => {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill={COLORS.primary[0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Interview Status Chart Component
interface InterviewStatusChartProps {
  data: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  isLoading?: boolean;
  title?: string;
  className?: string;
}

export const InterviewStatusChart: React.FC<InterviewStatusChartProps> = ({
  data,
  isLoading = false,
  title = "Interview Status",
  className = ""
}) => {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const statusColors: Record<string, string> = {
    'scheduled': COLORS.primary[0],
    'completed': COLORS.success[0],
    'cancelled': COLORS.danger[0],
    'rescheduled': COLORS.warning[0]
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill={COLORS.primary[0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Statistics Cards Component
interface StatCardProps {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  isLoading = false,
  className = ""
}) => {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase':
        return '↗';
      case 'decrease':
        return '↘';
      default:
        return '→';
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change !== undefined && (
              <p className={`text-xs ${getChangeColor()}`}>
                {getChangeIcon()} {Math.abs(change)}% from last month
              </p>
            )}
          </div>
          {icon && (
            <div className="h-8 w-8 text-gray-400">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Recent Activity Component
interface RecentActivityProps {
  activities: Array<{
    id: string;
    type: 'application' | 'interview' | 'job' | 'review';
    title: string;
    description: string;
    timestamp: string;
    status?: string;
  }>;
  isLoading?: boolean;
  title?: string;
  className?: string;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  isLoading = false,
  title = "Recent Activity",
  className = ""
}) => {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application':
        return '📝';
      case 'interview':
        return '🎯';
      case 'job':
        return '💼';
      case 'review':
        return '⭐';
      default:
        return '📄';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'accepted':
      case 'hired':
      case 'completed':
        return 'text-green-600';
      case 'rejected':
      case 'cancelled':
        return 'text-red-600';
      case 'pending':
      case 'scheduled':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="text-lg">{getActivityIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {activity.description}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-xs text-gray-400">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                  {activity.status && (
                    <span className={`text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
