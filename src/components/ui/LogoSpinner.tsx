import { cn } from "@/lib/utils";
import hrpmLogo from "@/assets/human-rights-logo.svg";

interface LogoSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-10 h-10",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

const textSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
};

export function LogoSpinner({ size = "md", className, showText = false }: LogoSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div className="relative">
        {/* Pulsing ring background */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full bg-primary/20 animate-ping",
            sizeClasses[size]
          )} 
          style={{ animationDuration: "1.5s" }}
        />
        
        {/* Rotating glow ring */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r from-primary/40 via-transparent to-primary/40",
            "animate-spin-slow",
            sizeClasses[size]
          )} 
        />
        
        {/* Logo container with pulse */}
        <div 
          className={cn(
            "relative flex items-center justify-center rounded-full",
            "bg-background/80 backdrop-blur-sm",
            "shadow-lg shadow-primary/20",
            "animate-pulse",
            sizeClasses[size]
          )}
          style={{ animationDuration: "2s" }}
        >
          <img 
            src={hrpmLogo} 
            alt="Loading..." 
            className={cn(
              "object-contain",
              size === "sm" && "w-4 h-4",
              size === "md" && "w-7 h-7",
              size === "lg" && "w-12 h-12",
              size === "xl" && "w-18 h-18"
            )}
          />
        </div>
      </div>
      
      {showText && (
        <span 
          className={cn(
            "font-medium text-muted-foreground animate-pulse",
            textSizeClasses[size]
          )}
        >
          Loading...
        </span>
      )}
    </div>
  );
}

// Full page loading overlay
export function LoadingOverlay({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <LogoSpinner size="xl" />
        <p className="text-lg font-medium text-muted-foreground animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}

// Inline loading state for components
export function InlineLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-8", className)}>
      <LogoSpinner size="lg" showText />
    </div>
  );
}
