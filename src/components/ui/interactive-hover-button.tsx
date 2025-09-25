import React from "react";
import { SimpleButton } from "./simple-button";

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
  return (
    <SimpleButton
      ref={ref}
      text={text}
      variant={variant}
      size={size}
      className={className}
      {...props}
    />
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };