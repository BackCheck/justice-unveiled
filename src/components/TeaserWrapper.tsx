 import { ReactNode } from "react";
 import { useAuth } from "@/contexts/AuthContext";
 import { TeaserOverlay } from "./TeaserOverlay";
 import { cn } from "@/lib/utils";
 
 interface TeaserWrapperProps {
   children: ReactNode;
   variant?: "blur" | "partial" | "locked";
   title?: string;
   description?: string;
   /** Height of visible preview before overlay */
   previewHeight?: string;
   className?: string;
 }
 
 export function TeaserWrapper({ 
   children, 
   variant = "blur",
   title,
   description,
   previewHeight = "70vh",
   className
 }: TeaserWrapperProps) {
   const { user } = useAuth();
 
   // Authenticated users see full content
   if (user) {
     return <>{children}</>;
   }
 
   return (
     <div className={cn("relative", className)}>
       {/* Content with blur effect for non-authenticated */}
       <div 
         className="relative overflow-hidden"
         style={{ maxHeight: previewHeight }}
       >
         <div className={cn(
           "select-none pointer-events-none",
           variant === "blur" && "blur-sm opacity-70"
         )}>
           {children}
         </div>
       </div>
       
       {/* Overlay with CTA */}
       <TeaserOverlay 
         variant={variant}
         title={title}
         description={description}
       />
     </div>
   );
 }