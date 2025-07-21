
import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "default" | "lg";
}

const InteractiveHoverButton = React.memo(React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", variant = "primary", size = "default", className, ...props }, ref) => {
  const baseClasses = "relative cursor-pointer rounded-lg font-medium transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-black/20 flex items-center justify-center text-center";
  
  const variantClasses = useMemo(() => ({
    primary: "bg-black text-white border-0.5 border-black hover:shadow-lg hover:-translate-y-1",
    secondary: "bg-white text-black border-0.5 border-black hover:shadow-lg hover:-translate-y-1 hover:bg-gray-50",
    outline: "bg-transparent text-black border-0.5 border-black hover:shadow-md hover:-translate-y-0.5 hover:bg-gray-50"
  }), []);

  const sizeClasses = useMemo(() => ({
    sm: "px-4 py-2 text-sm h-9",
    default: "px-6 py-3 text-base h-11",
    lg: "px-8 py-4 text-lg h-12"
  }), []);

  const computedClassName = useMemo(() => cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className,
  ), [baseClasses, variantClasses, variant, sizeClasses, size, className]);

  return (
    <button
      ref={ref}
      className={computedClassName}
      {...props}
    >
      {text}
    </button>
  );
}));

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
