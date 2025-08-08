
import React from "react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "default" | "lg";
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", variant = "primary", size = "default", className, ...props }, ref) => {
  const baseClasses = "relative cursor-pointer rounded-md font-medium transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-ring flex items-center justify-center text-center";
  
  const variantClasses = {
    primary: "bg-cta-accent text-cta-accent-foreground hover:bg-cta-accent/90",
    secondary: "text-foreground underline-offset-4 hover:underline bg-transparent border-0",
    outline: "bg-transparent text-foreground border border-border hover:bg-accent"
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-base h-10",
    default: "px-6 py-3 text-lg h-12",
    lg: "px-8 py-4 text-xl h-14"
  };

  return (
    <button
      ref={ref}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {text}
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
