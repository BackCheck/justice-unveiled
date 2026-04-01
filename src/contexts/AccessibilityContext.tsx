import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export type AccessibilityMode = 
  | "none" 
  | "high-contrast" 
  | "color-blind-deuteranopia"
  | "color-blind-protanopia"  
  | "color-blind-tritanopia";

interface AccessibilitySettings {
  mode: AccessibilityMode;
  largeText: boolean;
  dyslexiaFont: boolean;
  reducedMotion: boolean;
  lineSpacing: "normal" | "wide" | "extra-wide";
  cursorSize: "default" | "large";
  focusHighlight: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  setMode: (mode: AccessibilityMode) => void;
  toggleLargeText: () => void;
  toggleDyslexiaFont: () => void;
  toggleReducedMotion: () => void;
  setLineSpacing: (spacing: AccessibilitySettings["lineSpacing"]) => void;
  toggleCursorSize: () => void;
  toggleFocusHighlight: () => void;
  resetAll: () => void;
  hasAnyActive: boolean;
}

const STORAGE_KEY = "hrpm-accessibility";

const defaultSettings: AccessibilitySettings = {
  mode: "none",
  largeText: false,
  dyslexiaFont: false,
  reducedMotion: false,
  lineSpacing: "normal",
  cursorSize: "default",
  focusHighlight: false,
};

const AccessibilityContext = createContext<AccessibilityContextType>({
  settings: defaultSettings,
  setMode: () => {},
  toggleLargeText: () => {},
  toggleDyslexiaFont: () => {},
  toggleReducedMotion: () => {},
  setLineSpacing: () => {},
  toggleCursorSize: () => {},
  toggleFocusHighlight: () => {},
  resetAll: () => {},
  hasAnyActive: false,
});

export const useAccessibility = () => useContext(AccessibilityContext);

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Apply CSS classes to <html> element
  useEffect(() => {
    const html = document.documentElement;
    
    // Remove all accessibility classes
    html.classList.remove(
      "a11y-high-contrast",
      "a11y-deuteranopia", "a11y-protanopia", "a11y-tritanopia",
      "a11y-large-text", "a11y-dyslexia-font",
      "a11y-reduced-motion",
      "a11y-line-wide", "a11y-line-extra-wide",
      "a11y-cursor-large", "a11y-focus-highlight",
    );

    // Apply mode
    if (settings.mode === "high-contrast") html.classList.add("a11y-high-contrast");
    if (settings.mode === "color-blind-deuteranopia") html.classList.add("a11y-deuteranopia");
    if (settings.mode === "color-blind-protanopia") html.classList.add("a11y-protanopia");
    if (settings.mode === "color-blind-tritanopia") html.classList.add("a11y-tritanopia");

    // Apply individual toggles
    if (settings.largeText) html.classList.add("a11y-large-text");
    if (settings.dyslexiaFont) html.classList.add("a11y-dyslexia-font");
    if (settings.reducedMotion) html.classList.add("a11y-reduced-motion");
    if (settings.lineSpacing === "wide") html.classList.add("a11y-line-wide");
    if (settings.lineSpacing === "extra-wide") html.classList.add("a11y-line-extra-wide");
    if (settings.cursorSize === "large") html.classList.add("a11y-cursor-large");
    if (settings.focusHighlight) html.classList.add("a11y-focus-highlight");
  }, [settings]);

  const setMode = useCallback((mode: AccessibilityMode) => {
    setSettings(prev => ({ ...prev, mode }));
  }, []);

  const toggleLargeText = useCallback(() => {
    setSettings(prev => ({ ...prev, largeText: !prev.largeText }));
  }, []);

  const toggleDyslexiaFont = useCallback(() => {
    setSettings(prev => ({ ...prev, dyslexiaFont: !prev.dyslexiaFont }));
  }, []);

  const toggleReducedMotion = useCallback(() => {
    setSettings(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }));
  }, []);

  const setLineSpacing = useCallback((lineSpacing: AccessibilitySettings["lineSpacing"]) => {
    setSettings(prev => ({ ...prev, lineSpacing }));
  }, []);

  const toggleCursorSize = useCallback(() => {
    setSettings(prev => ({ ...prev, cursorSize: prev.cursorSize === "default" ? "large" : "default" }));
  }, []);

  const toggleFocusHighlight = useCallback(() => {
    setSettings(prev => ({ ...prev, focusHighlight: !prev.focusHighlight }));
  }, []);

  const resetAll = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const hasAnyActive = settings.mode !== "none" || settings.largeText || settings.dyslexiaFont || 
    settings.reducedMotion || settings.lineSpacing !== "normal" || settings.cursorSize !== "default" ||
    settings.focusHighlight;

  return (
    <AccessibilityContext.Provider value={{
      settings, setMode, toggleLargeText, toggleDyslexiaFont, toggleReducedMotion,
      setLineSpacing, toggleCursorSize, toggleFocusHighlight, resetAll, hasAnyActive,
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};
