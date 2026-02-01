import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, Home, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingZoomControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onReset: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const FloatingZoomControls = ({ 
  zoom, 
  onZoomChange,
  onReset,
  isFullscreen,
  onToggleFullscreen
}: FloatingZoomControlsProps) => {
  const handleZoomIn = () => onZoomChange(Math.min(2, zoom + 0.1));
  const handleZoomOut = () => onZoomChange(Math.max(0.5, zoom - 0.1));

  return (
    <div className="flex items-center gap-2 bg-card/90 backdrop-blur-xl border border-border/50 rounded-full px-2 py-1 shadow-lg">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-7 w-7 rounded-full"
        onClick={handleZoomOut}
        disabled={zoom <= 0.5}
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </Button>
      
      <div className="w-20 px-1">
        <Slider
          value={[zoom]}
          onValueChange={([v]) => onZoomChange(v)}
          min={0.5}
          max={2}
          step={0.1}
          className="cursor-pointer"
        />
      </div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-7 w-7 rounded-full"
        onClick={handleZoomIn}
        disabled={zoom >= 2}
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </Button>

      <div className="w-px h-4 bg-border mx-1" />

      <Button 
        variant="ghost" 
        size="icon" 
        className="h-7 w-7 rounded-full"
        onClick={onReset}
        title="Reset View"
      >
        <Home className="w-3.5 h-3.5" />
      </Button>

      {onToggleFullscreen && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 rounded-full"
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </Button>
      )}
      
      <span className="text-[10px] text-muted-foreground font-medium min-w-[32px] text-center">
        {Math.round(zoom * 100)}%
      </span>
    </div>
  );
};
