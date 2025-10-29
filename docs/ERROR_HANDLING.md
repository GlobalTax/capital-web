# Error Handling Architecture

## 📋 Overview

Capittal uses a hierarchical error boundary system to gracefully handle errors at different levels of the application, providing appropriate fallback UIs and logging.

## 🏗️ Error Boundary Hierarchy

### 1. **Global Error Boundary** (`src/components/ErrorBoundary.tsx`)
- **Scope**: Entire application
- **Purpose**: Catch critical application-wide errors
- **Features**:
  - Smart error categorization (module-loading, network, syntax)
  - User-friendly error messages
  - Retry mechanism
  - "Go Home" navigation
  - Development mode: Shows detailed error stack traces
  - Production mode: Hides technical details

**Usage:**
```tsx
import ErrorBoundary from '@/components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### 2. **Global Error Boundary Provider** (`src/components/ErrorBoundaryProvider.tsx`)
- **Scope**: Wraps the entire app in `App.tsx`
- **Purpose**: Global error handling with toast notifications
- **Features**:
  - Integrates with toast system for user feedback
  - Structured console logging
  - Automatic error reporting

**Usage:**
```tsx
import ErrorBoundaryProvider from '@/components/ErrorBoundaryProvider';

<ErrorBoundaryProvider>
  <App />
</ErrorBoundaryProvider>
```

### 3. **Admin Error Boundary** (`src/features/admin/components/AdminErrorBoundary.tsx`)
- **Scope**: Admin panel (`/admin/*`)
- **Purpose**: Handle errors specific to admin functionality
- **Features**:
  - Admin-specific error UI
  - Development mode error details
  - Reset functionality to attempt recovery
  - Custom fallback UI support

**Usage:**
```tsx
import { AdminErrorBoundary } from '@/features/admin/components/AdminErrorBoundary';

<AdminErrorBoundary>
  <AdminComponent />
</AdminErrorBoundary>
```

### 4. **Feature-Specific Error Boundaries**

#### Blog Error Boundary (`src/features/blog/components/BlogErrorBoundary.tsx`)
- **Scope**: Blog functionality
- **Purpose**: Handle blog content loading errors
- **Icon**: FileText
- **Message**: "Error al cargar el contenido del blog"

#### Jobs Error Boundary (`src/features/jobs/components/JobsErrorBoundary.tsx`)
- **Scope**: Job postings
- **Purpose**: Handle job listing errors
- **Icon**: Briefcase
- **Message**: "Error al cargar ofertas de empleo"

#### Dashboard Error Boundary (`src/features/dashboard/components/DashboardErrorBoundary.tsx`)
- **Scope**: Dashboard components
- **Purpose**: Handle dashboard data loading errors

#### Contacts Error Boundary (`src/features/contacts/components/ContactsErrorBoundary.tsx`)
- **Scope**: Contact management
- **Purpose**: Handle contact-related errors

### 5. **Specialized Error Boundaries**

#### Chart Error Boundary (`src/components/shared/LazyChart.tsx`)
- **Scope**: Chart rendering (Recharts)
- **Purpose**: Prevent chart rendering errors from breaking the page
- **Fallback**: "Error cargando gráfico"

#### PDF Error Boundary (`src/components/shared/LazyPDF.tsx`)
- **Scope**: PDF generation
- **Purpose**: Handle PDF rendering errors
- **Fallback**: "Error cargando PDF"

## 🎨 Error State Components

### ErrorFallback (`src/shared/components/ErrorFallback.tsx`)
- **Type**: Reusable UI component (not an error boundary)
- **Purpose**: Consistent error state presentation
- **Features**:
  - Customizable title and message
  - Optional retry button
  - AlertTriangle icon
  - Card-based layout

**Usage:**
```tsx
import { ErrorFallback } from '@/shared/components/ErrorFallback';

<ErrorFallback
  title="Error al cargar"
  message="No se pudieron cargar los datos"
  onRetry={() => refetch()}
  showRetry={true}
/>
```

### EmptyStates (`src/components/EmptyStates.tsx`)
- **Type**: Utility component
- **Purpose**: Handles empty states and error states
- **Includes**: `ErrorState` component for non-boundary error displays

### AdminErrorState (`src/components/admin/states/AdminErrorState.tsx`)
- **Type**: Admin-specific error UI
- **Purpose**: Display permission errors in admin panel
- **Features**:
  - Retry button
  - Logout button
  - Debug information display

## 🔧 Custom Error Types (`src/types/errorTypes.ts`)

### BaseAppError
Base class for all application errors with structured context.

### Specific Error Types:
- **ValidationError**: Form and data validation errors
- **NetworkError**: API and network request failures
- **DatabaseError**: Supabase/database operation errors
- **AuthenticationError**: Authentication failures
- **RateLimitError**: API rate limiting errors
- **CacheError**: Cache operation errors

### Type Guards:
```tsx
import { isNetworkError, isValidationError } from '@/types/errorTypes';

try {
  // operation
} catch (error) {
  if (isNetworkError(error)) {
    // Handle network error
  } else if (isValidationError(error)) {
    // Handle validation error
  }
}
```

## 📝 Best Practices

### 1. **Choose the Right Error Boundary**
- **Global errors**: Use `ErrorBoundary` or `ErrorBoundaryProvider`
- **Admin panel**: Use `AdminErrorBoundary`
- **Feature-specific**: Use feature error boundaries (Blog, Jobs, etc.)
- **Component-specific**: Use specialized boundaries (Chart, PDF)

### 2. **Error Boundary Placement**
```tsx
// ✅ Good: Wrap at feature level
<BlogErrorBoundary>
  <BlogPost />
  <BlogComments />
  <BlogSidebar />
</BlogErrorBoundary>

// ❌ Bad: Wrapping individual components unnecessarily
<BlogErrorBoundary>
  <BlogPost />
</BlogErrorBoundary>
<BlogErrorBoundary>
  <BlogComments />
</BlogErrorBoundary>
```

### 3. **Use ErrorFallback for Non-Boundary Error States**
```tsx
// ✅ Good: Use ErrorFallback for query errors
const { data, error, refetch } = useQuery(...);

if (error) {
  return (
    <ErrorFallback
      message={error.message}
      onRetry={refetch}
    />
  );
}
```

### 4. **Provide Contextual Error Messages**
```tsx
// ✅ Good: Specific error context
<AdminErrorBoundary
  fallback={
    <ErrorFallback
      title="Error en el panel de leads"
      message="No se pudieron cargar los leads. Verifica tu conexión."
    />
  }
>
  <LeadManager />
</AdminErrorBoundary>
```

### 5. **Log Errors Appropriately**
```tsx
import { logger } from '@/utils/logger';

componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  logger.error('Component error', {
    error,
    errorInfo,
    component: 'MyComponent'
  });
}
```

## 🚨 Error Handling Flow

```
1. Error occurs in component
   ↓
2. Nearest Error Boundary catches it
   ↓
3. Error is logged (console + structured logging)
   ↓
4. Error type is determined
   ↓
5. Appropriate fallback UI is shown
   ↓
6. User can retry or navigate away
```

## 🔄 Recovery Strategies

### 1. **Retry Mechanism**
Most error boundaries support retry via state reset:
```tsx
handleReset = () => {
  this.setState({ hasError: false, error: null });
};
```

### 2. **Navigation**
Global error boundary offers "Go Home" navigation:
```tsx
handleGoHome = () => {
  window.location.href = '/';
};
```

### 3. **Reload**
For critical errors (module loading), full page reload:
```tsx
window.location.reload();
```

## 📊 Error Monitoring

### Console Logging
All error boundaries log to console with structured format:
```javascript
console.group('🚨 Error Boundary - Error Details');
console.error('Error:', error);
console.error('Error Info:', errorInfo);
console.error('Timestamp:', new Date().toISOString());
console.error('URL:', window.location.href);
console.groupEnd();
```

### Toast Notifications
`ErrorBoundaryProvider` shows toast notifications for errors:
```tsx
toast({
  title: "Error en la aplicación",
  description: error.message,
  variant: "destructive",
});
```

## 🛠️ Troubleshooting

### Error Boundary Not Catching Error
- ✅ Error boundaries only catch errors in child components
- ✅ They don't catch errors in event handlers (use try-catch)
- ✅ They don't catch errors in async code (use .catch())
- ✅ They don't catch errors in the error boundary itself

### Infinite Error Loop
- Check if error occurs in fallback UI
- Verify error boundary is not wrapped in another that has issues
- Check for state updates causing re-renders

### Error Not Showing User-Friendly Message
- Verify error type categorization
- Check if custom fallback is provided
- Ensure error boundary is properly placed in component tree

## 📚 Related Files

- `src/components/ErrorBoundary.tsx` - Global error boundary
- `src/components/ErrorBoundaryProvider.tsx` - Provider with toasts
- `src/features/admin/components/AdminErrorBoundary.tsx` - Admin boundary
- `src/shared/components/ErrorFallback.tsx` - Reusable error UI
- `src/types/errorTypes.ts` - Custom error types
- `src/utils/logger.ts` - Structured logging utility

## 🎯 Quick Reference

| Error Type | Boundary to Use | Scope |
|------------|----------------|-------|
| Global app error | `ErrorBoundary` | Entire app |
| Admin panel error | `AdminErrorBoundary` | `/admin/*` |
| Blog error | `BlogErrorBoundary` | Blog features |
| Jobs error | `JobsErrorBoundary` | Job postings |
| Chart error | `ChartErrorBoundary` | Chart components |
| PDF error | `PDFErrorBoundary` | PDF generation |
| Query error | `ErrorFallback` | React Query errors |

---

**Last Updated**: 2025-10-29  
**Maintained By**: Capittal Development Team
