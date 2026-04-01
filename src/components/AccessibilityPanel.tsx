import { useState } from "react";
import { 
  Accessibility, X, Eye, Type, MonitorSmartphone, 
  MousePointer2, Focus, RotateCcw, ChevronDown 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  useAccessibility, 
  type AccessibilityMode 
} from "@/contexts/AccessibilityContext";

const visionModes: { value: AccessibilityMode; label: string; description: string; icon: string }[] = [
  { value: "none", label: "Standard", description: "Default color scheme", icon: "🎨" },
  { value: "high-contrast", label: "High Contrast", description: "Maximum contrast, bold borders, pure B&W", icon: "⬛" },
  { value: "color-blind-deuteranopia", label: "Deuteranopia", description: "Red-green (most common, ~6% males)", icon: "🔵" },
  { value: "color-blind-protanopia", label: "Protanopia", description: "Red-blind, blue/yellow safe palette", icon: "🟡" },
  { value: "color-blind-tritanopia", label: "Tritanopia", description: "Blue-yellow blind, red/cyan palette", icon: "🔴" },
];

export const AccessibilityPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    settings, setMode, toggleLargeText, toggleDyslexiaFont, 
    toggleReducedMotion, setLineSpacing, toggleCursorSize,
    toggleFocusHighlight, resetAll, hasAnyActive,
  } = useAccessibility();

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-[9999] w-12 h-12 rounded-full",
          "flex items-center justify-center",
          "shadow-lg border-2 transition-all duration-200",
          "hover:scale-110 focus:outline-none focus:ring-4 focus:ring-ring",
          "no-print",
          hasAnyActive
            ? "bg-primary text-primary-foreground border-primary animate-pulse"
            : "bg-card text-foreground border-border hover:border-primary"
        )}
        aria-label="Accessibility Settings"
        title="Accessibility Settings"
      >
        <Accessibility className="w-6 h-6" />
        {hasAnyActive && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center font-bold">
            ✓
          </span>
        )}
      </button>

      {/* Panel overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[9998] bg-black/30" onClick={() => setIsOpen(false)} />
      )}

      {/* Settings panel */}
      <div
        className={cn(
          "fixed bottom-20 right-6 z-[9999] w-[340px] max-h-[80vh]",
          "rounded-xl border-2 border-border bg-card shadow-2xl",
          "overflow-y-auto overscroll-contain",
          "transition-all duration-300 no-print",
          isOpen 
            ? "opacity-100 translate-y-0 pointer-events-auto" 
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
        role="dialog"
        aria-label="Accessibility Settings Panel"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card z-10 p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Accessibility className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground text-base">Accessibility</h2>
            {hasAnyActive && (
              <Badge variant="secondary" className="text-xs">Active</Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {hasAnyActive && (
              <Button variant="ghost" size="sm" onClick={resetAll} className="h-7 text-xs gap-1 text-muted-foreground">
                <RotateCcw className="w-3 h-3" /> Reset
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-5">
          {/* === Vision Mode === */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-primary" />
              <h3 className="font-medium text-sm text-foreground">Vision Mode</h3>
            </div>
            <div className="space-y-1.5">
              {visionModes.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setMode(mode.value)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                    "border hover:bg-accent/50",
                    settings.mode === mode.value
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-transparent"
                  )}
                >
                  <span className="text-lg">{mode.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{mode.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{mode.description}</p>
                  </div>
                  {settings.mode === mode.value && (
                    <span className="text-primary text-xs font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
          </section>

          <Separator />

          {/* === Text & Readability === */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-4 h-4 text-primary" />
              <h3 className="font-medium text-sm text-foreground">Text & Readability</h3>
            </div>
            <div className="space-y-3">
              <ToggleRow
                label="Large Text"
                description="Increase base font size to 18px"
                checked={settings.largeText}
                onToggle={toggleLargeText}
              />
              <ToggleRow
                label="Dyslexia-Friendly Font"
                description="OpenDyslexic typeface"
                checked={settings.dyslexiaFont}
                onToggle={toggleDyslexiaFont}
              />
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Line Spacing</Label>
                <div className="flex gap-1.5">
                  {([["normal", "Default"], ["wide", "Wide"], ["extra-wide", "Extra Wide"]] as const).map(([val, lbl]) => (
                    <button
                      key={val}
                      onClick={() => setLineSpacing(val)}
                      className={cn(
                        "flex-1 text-xs py-1.5 rounded-md border transition-colors",
                        settings.lineSpacing === val
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground border-transparent hover:bg-accent"
                      )}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* === Motion & Interaction === */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <MonitorSmartphone className="w-4 h-4 text-primary" />
              <h3 className="font-medium text-sm text-foreground">Motion & Interaction</h3>
            </div>
            <div className="space-y-3">
              <ToggleRow
                label="Reduce Motion"
                description="Disable animations & parallax effects"
                checked={settings.reducedMotion}
                onToggle={toggleReducedMotion}
              />
              <ToggleRow
                label="Large Cursor"
                description="Increase cursor size for precision"
                checked={settings.cursorSize === "large"}
                onToggle={toggleCursorSize}
                icon={<MousePointer2 className="w-3.5 h-3.5" />}
              />
              <ToggleRow
                label="Enhanced Focus"
                description="Strong visible focus outlines on all interactive elements"
                checked={settings.focusHighlight}
                onToggle={toggleFocusHighlight}
                icon={<Focus className="w-3.5 h-3.5" />}
              />
            </div>
          </section>

          {/* Footer info */}
          <div className="pt-2 border-t border-border">
            <p className="text-[10px] text-muted-foreground text-center leading-tight">
              WCAG 2.1 AA compliant • Settings saved locally • Keyboard: Tab to navigate
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

function ToggleRow({ label, description, checked, onToggle, icon }: {
  label: string; description: string; checked: boolean; onToggle: () => void; icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <Label className="text-sm font-medium cursor-pointer text-foreground" onClick={onToggle}>{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onToggle} aria-label={label} />
    </div>
  );
}
