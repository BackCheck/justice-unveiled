import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Home, Maximize2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface GraphControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFullscreen?: () => void;
  onSettings?: () => void;
}

export const GraphControls = ({ 
  zoom, 
  onZoomIn, 
  onZoomOut, 
  onReset, 
  onFullscreen,
  onSettings 
}: GraphControlsProps) => {
  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-1 bg-card/90 backdrop-blur-sm border rounded-lg p-1">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        onClick={onZoomIn}
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        onClick={onZoomOut}
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </Button>
      <div className="border-t my-1" />
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        onClick={onReset}
        title="Reset View"
      >
        <Home className="w-4 h-4" />
      </Button>
      {onFullscreen && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={onFullscreen}
          title="Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      )}
      {onSettings && (
        <>
          <div className="border-t my-1" />
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={onSettings}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </>
      )}
    </div>
  );
};
