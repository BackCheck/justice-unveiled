import { cn } from "@/lib/utils";

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

const videoSizeClasses = {
  sm: "w-8 h-8",
  md: "w-14 h-14",
  lg: "w-20 h-20",
  xl: "w-32 h-32",
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
            "absolute inset-[-4px] rounded-full bg-primary/10 animate-ping",
            sizeClasses[size]
          )} 
          style={{ animationDuration: "2s" }}
        />
        
        {/* Animated logo video */}
        <div 
          className={cn(
            "relative flex items-center justify-center rounded-full overflow-hidden",
            videoSizeClasses[size]
          )}
        >
          <video 
            src="/loading-animation.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover rounded-full"
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
