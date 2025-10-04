import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const HeroSkeleton = () => (
  <div className="min-h-screen bg-muted flex items-center justify-center px-4">
    <div className="max-w-7xl mx-auto text-center">
      <Skeleton className="h-16 w-3/4 mx-auto mb-6" />
      <Skeleton className="h-6 w-2/3 mx-auto mb-8" />
      <div className="flex gap-4 justify-center">
        <Skeleton className="h-12 w-32" />
        <Skeleton className="h-12 w-32" />
      </div>
    </div>
  </div>
);

export const ServicesSkeleton = () => (
  <section className="py-20 bg-background">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <Skeleton className="h-12 w-64 mx-auto mb-4" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-6 bg-card rounded-lg border">
            <Skeleton className="h-12 w-12 mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const TeamSkeleton = () => (
  <section className="py-20 bg-muted/50">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <Skeleton className="h-12 w-48 mx-auto mb-4" />
        <Skeleton className="h-6 w-80 mx-auto" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="text-center">
            <Skeleton className="w-48 h-48 rounded-full mx-auto mb-6" />
            <Skeleton className="h-6 w-32 mx-auto mb-2" />
            <Skeleton className="h-4 w-40 mx-auto mb-2" />
            <Skeleton className="h-4 w-24 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const BlogSkeleton = () => (
  <section className="py-20 bg-background">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <Skeleton className="h-12 w-56 mx-auto mb-4" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
          <article key={i} className="bg-card rounded-lg border overflow-hidden">
            <Skeleton className="w-full h-48" />
            <div className="p-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-full mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export const ContactSkeleton = () => (
  <section className="py-20 bg-muted/50">
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                  <Skeleton className="w-6 h-6 mt-1" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-20 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card p-8 rounded-lg border">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Loading genérico mejorado
export const PageLoadingSkeleton = () => (
  <div className="min-h-screen bg-background animate-fade-in">
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Skeleton className="h-12 w-3/4 mx-auto" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="admin-card animate-scale-in" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-8 w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Blog loading específico
export const BlogLoadingSkeleton = () => (
  <div className="container mx-auto px-4 py-8 space-y-8">
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(9)].map((_, i) => (
        <div key={i} className="admin-card overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <div className="p-6">
            <div className="space-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Admin dashboard loading
export const AdminLoadingSkeleton = () => (
  <div className="p-6 space-y-6">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="admin-card">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-4" />
          </div>
          <div>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-3 w-3/4 mt-2" />
          </div>
        </div>
      ))}
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      <div className="admin-card">
        <Skeleton className="h-6 w-1/3 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="admin-card">
        <Skeleton className="h-6 w-1/3 mb-4" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Loading mejorado para páginas completas
export const FullPageLoadingSkeleton = () => (
  <div className="min-h-screen">
    <HeroSkeleton />
    <ServicesSkeleton />
    <TeamSkeleton />
    <BlogSkeleton />
    <ContactSkeleton />
  </div>
);