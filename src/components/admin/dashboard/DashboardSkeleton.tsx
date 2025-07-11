import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface DashboardSkeletonProps {
  variant?: 'dashboard' | 'kpis' | 'chart' | 'table';
}

const DashboardSkeleton = ({ variant = 'dashboard' }: DashboardSkeletonProps) => {
  switch (variant) {
    case 'kpis':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-5 w-5 bg-muted rounded"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-8 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );

    case 'chart':
      return (
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded"></div>
          </CardContent>
        </Card>
      );

    case 'table':
      return (
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/4"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-4 bg-muted rounded w-1/5"></div>
                  <div className="h-4 bg-muted rounded w-1/6"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );

    default:
      return (
        <div className="space-y-8 animate-pulse">
          {/* Header Skeleton */}
          <div className="space-y-3">
            <div className="h-10 bg-muted rounded w-96"></div>
            <div className="h-5 bg-muted rounded w-[500px]"></div>
          </div>
          
          {/* Controls Skeleton */}
          <div className="flex justify-between items-center">
            <div className="h-8 bg-muted rounded w-32"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-muted rounded w-24"></div>
              <div className="h-8 bg-muted rounded w-20"></div>
              <div className="h-8 bg-muted rounded w-20"></div>
            </div>
          </div>
          
          {/* KPIs Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="w-8 h-8 bg-muted rounded"></div>
                    <div className="w-12 h-5 bg-muted rounded"></div>
                  </div>
                  <div className="h-8 bg-muted rounded w-12"></div>
                  <div className="h-4 bg-muted rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs Skeleton */}
          <div className="space-y-4">
            <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 bg-background rounded w-20"></div>
              ))}
            </div>
            
            {/* Tab Content Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div className="w-8 h-8 bg-muted rounded"></div>
                      <div className="w-4 h-4 bg-muted rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-8 bg-muted rounded w-16"></div>
                      <div className="h-4 bg-muted rounded w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
  }
};

export default DashboardSkeleton;