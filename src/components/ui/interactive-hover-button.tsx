
import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  variant?: "default" | "outline" | "secondary" | "large";
  size?: "default" | "sm" | "lg";
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", variant = "default", size = "default", className, ...props }, ref) => {
  const baseClasses = "group relative cursor-pointer overflow-hidden rounded-lg font-medium transition-all duration-300 ease-out";
  
  const variantClasses = {
    default: "bg-white text-black border-0.5 border-black hover:shadow-lg",
    outline: "bg-transparent border-0.5 border-black text-black hover:shadow-lg",
    secondary: "bg-gray-100 text-gray-900 border-0.5 border-border hover:shadow-lg",
    large: "bg-black text-white border-0.5 border-black hover:shadow-lg"
  };

  const sizeClasses = {
    default: "w-32 h-10 px-4 py-2 text-sm",
    sm: "w-28 h-9 px-3 py-2 text-sm",
    lg: "w-40 h-11 px-8 py-3 text-base"
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
      <span className="inline-block translate-x-1 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
        {text}
      </span>
      <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100">
        <span>{text}</span>
        <ArrowRight className="h-4 w-4" />
      </div>
      <div className={cn(
        "absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-lg transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8]",
        variant === "default" && "bg-black group-hover:bg-black",
        variant === "outline" && "bg-black group-hover:bg-black",
        variant === "secondary" && "bg-gray-600 group-hover:bg-gray-600",
        variant === "large" && "bg-white group-hover:bg-white"
      )}></div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
