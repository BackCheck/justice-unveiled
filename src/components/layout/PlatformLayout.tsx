import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface PlatformLayoutProps {
  children: ReactNode;
}

export const PlatformLayout = ({ children }: PlatformLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background relative">
        {/* Ambient background glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
        </div>
        
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          {/* Top bar with sidebar trigger - glass effect */}
          <header className="sticky top-0 z-40 glass-header px-4 py-3">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="h-8 w-8 hover-glow-primary rounded-lg" />
              <div className="flex-1" />
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};
