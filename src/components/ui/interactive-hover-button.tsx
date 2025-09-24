import React, { Suspense, lazy } from "react";
import { Button } from '@/components/ui/button';

// Original InteractiveHoverButton component
const InteractiveHoverButtonOriginal = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    text?: string;
    variant?: "primary" | "secondary" | "outline";
    size?: "sm" | "default" | "lg";
  }
>(({ text = "Button", variant = "primary", size = "default", className, ...props }, ref) => {
  const baseClasses = "relative cursor-pointer rounded-lg font-medium transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-black/20 flex items-center justify-center text-center";
  
  const variantClasses = {
    primary: "bg-black text-white border-0.5 border-black hover:shadow-lg hover:-translate-y-1",
    secondary: "bg-white text-black border-0.5 border-black hover:shadow-lg hover:-translate-y-1",
    outline: "bg-transparent text-black border-0.5 border-black hover:shadow-md hover:-translate-y-0.5"
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm h-9",
    default: "px-6 py-3 text-base h-11",
    lg: "px-8 py-4 text-lg h-12"
  };

  return (
    <button
      ref={ref}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className || ''}`}
      {...props}
    >
      {text}
    </button>
  );
});

InteractiveHoverButtonOriginal.displayName = "InteractiveHoverButtonOriginal";

// Fallback button component
const FallbackButton: React.FC<any> = ({ text = "Button", variant = "primary", size = "default", className, ...props }) => {
  const variantClass = variant === "primary" ? "bg-black text-white hover:bg-gray-800" : 
                      variant === "secondary" ? "bg-white text-black border border-black hover:bg-gray-50" :
                      "bg-transparent text-black border border-black hover:bg-gray-50";
  
  return (
    <Button 
      className={`${variantClass} transition-all duration-300 ${className || ''}`}
      {...props}
    >
      {text}
    </Button>
  );
};

// Loading fallback
const ButtonLoading = () => (
  <div className="h-11 w-24 bg-gray-200 animate-pulse rounded-lg" />
);

// Error boundary for the button
class ButtonErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ComponentType<any>; fallbackProps: any },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('InteractiveHoverButton failed to load, using fallback:', error);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      return <FallbackComponent {...this.props.fallbackProps} />;
    }

    return this.props.children;
  }
}

// Main export - safe lazy-loaded version with error handling
export const InteractiveHoverButton: React.FC<any> = (props) => {
  return (
    <ButtonErrorBoundary fallback={FallbackButton} fallbackProps={props}>
      <Suspense fallback={<ButtonLoading />}>
        <InteractiveHoverButtonOriginal {...props} />
      </Suspense>
    </ButtonErrorBoundary>
  );
};