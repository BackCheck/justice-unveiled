import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface TimeContext {
  greeting: string;
  icon: "sunrise" | "sun" | "sunset" | "moon";
  period: "morning" | "afternoon" | "evening" | "night";
  hour: number;
  isDaytime: boolean;
}

export function useTimeBasedTheme(enableAutoTheme: boolean = true) {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [timeContext, setTimeContext] = useState<TimeContext>(getTimeContext());
  const [autoThemeEnabled, setAutoThemeEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("auto-theme-enabled");
      return stored !== null ? stored === "true" : enableAutoTheme;
    }
    return enableAutoTheme;
  });

  function getTimeContext(): TimeContext {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 5 && hour < 12) {
      return {
        greeting: "Good Morning",
        icon: "sunrise",
        period: "morning",
        hour,
        isDaytime: true,
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        greeting: "Good Afternoon",
        icon: "sun",
        period: "afternoon",
        hour,
        isDaytime: true,
      };
    } else if (hour >= 17 && hour < 21) {
      return {
        greeting: "Good Evening",
        icon: "sunset",
        period: "evening",
        hour,
        isDaytime: false,
      };
    } else {
      return {
        greeting: "Good Night",
        icon: "moon",
        period: "night",
        hour,
        isDaytime: false,
      };
    }
  }

  // Update time context and theme periodically
  useEffect(() => {
    const updateTimeContext = () => {
      const newContext = getTimeContext();
      setTimeContext(newContext);

      // Auto-switch theme based on time if enabled
      if (autoThemeEnabled) {
        const targetTheme = newContext.isDaytime ? "light" : "dark";
        if (resolvedTheme !== targetTheme) {
          setTheme(targetTheme);
        }
      }
    };

    // Initial update
    updateTimeContext();

    // Update every minute
    const interval = setInterval(updateTimeContext, 60000);

    return () => clearInterval(interval);
  }, [autoThemeEnabled, resolvedTheme, setTheme]);

  // Persist auto theme preference
  const toggleAutoTheme = (enabled: boolean) => {
    setAutoThemeEnabled(enabled);
    localStorage.setItem("auto-theme-enabled", String(enabled));
    
    if (enabled) {
      const context = getTimeContext();
      setTheme(context.isDaytime ? "light" : "dark");
    }
  };

  return {
    ...timeContext,
    autoThemeEnabled,
    toggleAutoTheme,
    currentTheme: resolvedTheme,
  };
}
