import React from "react";

interface SimpleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "default" | "lg";
}

const SimpleButton = React.forwardRef<HTMLButtonElement, SimpleButtonProps>(({ 
  text = "Button", 
  variant = "primary", 
  size = "default", 
  className = "",
  ...props 
}, ref) => {
  const baseClasses = "relative cursor-pointer rounded-lg font-medium transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-black/20 flex items-center justify-center text-center";
  
  const variantClasses = {
    primary: "bg-black text-white border border-black hover:shadow-lg hover:-translate-y-1",
    secondary: "bg-white text-black border border-black hover:shadow-lg hover:-translate-y-1",
    outline: "bg-transparent text-black border border-black hover:shadow-md hover:-translate-y-0.5"
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm h-9",
    default: "px-6 py-3 text-base h-11",
    lg: "px-8 py-4 text-lg h-12"
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].filter(Boolean).join(" ");

  return (
    <button
      ref={ref}
      className={classes}
      {...props}
    >
      {text}
    </button>
  );
});

SimpleButton.displayName = "SimpleButton";

export { SimpleButton };