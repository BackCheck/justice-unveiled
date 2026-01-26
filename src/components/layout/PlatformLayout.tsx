import { ReactNode } from "react";
import { PlatformHeader } from "./PlatformHeader";

interface PlatformLayoutProps {
  children: ReactNode;
}

export const PlatformLayout = ({ children }: PlatformLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <PlatformHeader />
      <main>{children}</main>
    </div>
  );
};
