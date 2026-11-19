import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className,
  size = "lg",
  text,
}) => {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-[3.5px]",
    lg: "w-14 h-14 border-[4.5px]",
    xl: "w-20 h-20 border-[5px]",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center p-8 w-full min-h-[260px]", className)}>
      <div
        className={cn(
          "rounded-full border-slate-100 border-t-[#2478b8] animate-spin",
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="mt-3.5 text-xs font-medium text-slate-500 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
