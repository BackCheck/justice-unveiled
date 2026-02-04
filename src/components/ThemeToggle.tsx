import { Moon, Sun, Clock } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTimeBasedTheme } from "@/hooks/useTimeBasedTheme";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const { autoThemeEnabled, toggleAutoTheme, isDaytime, period } = useTimeBasedTheme();
  const isDark = theme === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          {autoThemeEnabled ? (
            <Clock className="h-4 w-4 text-primary" />
          ) : isDark ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={() => {
            toggleAutoTheme(false);
            setTheme("light");
          }}
          className="flex items-center gap-2"
        >
          <Sun className="h-4 w-4" />
          <span>Light</span>
          {!autoThemeEnabled && theme === "light" && (
            <span className="ml-auto text-primary">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => {
            toggleAutoTheme(false);
            setTheme("dark");
          }}
          className="flex items-center gap-2"
        >
          <Moon className="h-4 w-4" />
          <span>Dark</span>
          {!autoThemeEnabled && theme === "dark" && (
            <span className="ml-auto text-primary">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => toggleAutoTheme(true)}
          className="flex items-center gap-2"
        >
          <Clock className="h-4 w-4" />
          <span>Auto (Time-based)</span>
          {autoThemeEnabled && (
            <span className="ml-auto text-primary">✓</span>
          )}
        </DropdownMenuItem>
        {autoThemeEnabled && (
          <p className="px-2 py-1.5 text-xs text-muted-foreground">
            {isDaytime ? "☀️ Daytime mode" : "🌙 Nighttime mode"}
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
