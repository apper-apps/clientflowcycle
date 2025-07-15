import React from "react";
import { cn } from "@/utils/cn";

const Card = React.forwardRef(({ 
  className, 
  children, 
  hover = false,
  gradient = false,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
className={cn(
        "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm",
        hover && "transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
        gradient && "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900",
        className
      )}
      {...props}
    >
      {children && children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;