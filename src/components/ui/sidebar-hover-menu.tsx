import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export interface SidebarMenuNavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarHoverMenuProps {
  groupLabel: string;
  groupIcon: React.ComponentType<{ className?: string }>;
  items: SidebarMenuNavItem[];
  collapsed: boolean;
}

export const SidebarHoverMenu: React.FC<SidebarHoverMenuProps> = ({
  groupLabel,
  groupIcon: GroupIcon,
  items,
  collapsed,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const groupHasActive = items.some((item) => isActive(item.path));

  const openMenu = useCallback(() => {
    if (!collapsed) return;
    clearTimeout(timeoutRef.current);
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({ top: rect.top });
    }
    setIsOpen(true);
  }, [collapsed]);

  const closeMenu = useCallback(() => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  }, []);

  const keepOpen = useCallback(() => {
    clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  // Clamp menu position so it doesn't overflow viewport
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      if (menuRect.bottom > viewportHeight - 8) {
        setPosition((p) => ({
          top: p.top - (menuRect.bottom - viewportHeight + 8),
        }));
      }
    }
  }, [isOpen]);

  return (
    <div className="relative" onMouseLeave={closeMenu}>
      {/* Trigger icon */}
      <div
        ref={triggerRef}
        onMouseEnter={openMenu}
        className={cn(
          "flex items-center justify-center w-full rounded-lg cursor-pointer transition-all duration-200",
          collapsed ? "p-2.5 mx-auto" : "hidden",
          groupHasActive
            ? "text-primary bg-primary/10"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
        )}
      >
        <GroupIcon className={cn("h-4 w-4 shrink-0", groupHasActive && "text-primary")} />
      </div>

      {/* Glassmorphic floating menu */}
      {isOpen && collapsed && (
        <div
          ref={menuRef}
          onMouseEnter={keepOpen}
          onMouseLeave={closeMenu}
          className="fixed z-[100] ml-1"
          style={{
            top: position.top,
            left: "var(--sidebar-width-icon, 3rem)",
          }}
        >
          <div
            className={cn(
              "min-w-[200px] rounded-xl overflow-hidden",
              "glass-popover",
              "shadow-xl shadow-black/10 dark:shadow-black/30",
              "border border-border/20",
              "animate-in fade-in-0 zoom-in-95 slide-in-from-left-2 duration-200"
            )}
          >
            {/* Group header */}
            <div className="px-3 py-2 border-b border-border/20">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {groupLabel}
              </span>
            </div>

            {/* Menu items */}
            <div className="py-1">
              {items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 mx-1 rounded-lg text-sm transition-all duration-150",
                      "hover:bg-primary/10 hover:text-primary",
                      active
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground/80"
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5 shrink-0", active && "text-primary")} />
                    <span className="flex-1">{item.label}</span>
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    )}
                    <ChevronRight className="h-3 w-3 text-muted-foreground/50 ml-1" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
