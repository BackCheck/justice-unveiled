 import { Link } from "react-router-dom";
 import { Button } from "@/components/ui/button";
 import { Lock, Sparkles, Shield, Eye } from "lucide-react";
 import { useTranslation } from "react-i18next";
 import { useAuth } from "@/contexts/AuthContext";
 
 interface TeaserOverlayProps {
   variant?: "blur" | "partial" | "locked";
   title?: string;
   description?: string;
 }
 
 export function TeaserOverlay({ 
   variant = "blur",
   title,
   description 
 }: TeaserOverlayProps) {
   const { t } = useTranslation();
   const { user } = useAuth();
 
   // Don't show overlay for authenticated users
   if (user) return null;
 
   return (
     <div className="absolute inset-0 z-50 flex items-center justify-center">
       {/* Blur/gradient overlay */}
       <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-background/60 backdrop-blur-sm" />
       
       {/* Content */}
       <div className="relative z-10 text-center px-6 py-10 max-w-lg mx-auto">
         {/* Animated icon */}
         <div className="mb-6 relative">
           <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse-glow">
             {variant === "locked" ? (
               <Lock className="w-10 h-10 text-primary" />
             ) : (
               <Eye className="w-10 h-10 text-primary" />
             )}
           </div>
           <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-chart-4 animate-bounce" />
         </div>
 
         {/* Title */}
         <h3 className="text-2xl md:text-3xl font-bold mb-3 font-serif">
           {title || t('teaser.title', 'Unlock Full Intelligence Access')}
         </h3>
 
         {/* Description */}
         <p className="text-muted-foreground mb-6 leading-relaxed">
           {description || t('teaser.description', 'Sign up for free to access complete case data, AI-powered analysis, and detailed evidence documentation.')}
         </p>
 
         {/* Benefits list */}
         <div className="grid grid-cols-2 gap-3 mb-8 text-sm">
           <div className="flex items-center gap-2 text-left p-2 rounded-lg bg-card/50">
             <Shield className="w-4 h-4 text-primary shrink-0" />
             <span>{t('teaser.benefit1', 'Full case timelines')}</span>
           </div>
           <div className="flex items-center gap-2 text-left p-2 rounded-lg bg-card/50">
            <Sparkles className="w-4 h-4 text-chart-4 shrink-0" />
             <span>{t('teaser.benefit2', 'AI analysis tools')}</span>
           </div>
           <div className="flex items-center gap-2 text-left p-2 rounded-lg bg-card/50">
             <Eye className="w-4 h-4 text-primary shrink-0" />
             <span>{t('teaser.benefit3', 'Evidence matrix')}</span>
           </div>
           <div className="flex items-center gap-2 text-left p-2 rounded-lg bg-card/50">
             <Lock className="w-4 h-4 text-primary shrink-0" />
             <span>{t('teaser.benefit4', 'Entity networks')}</span>
           </div>
         </div>
 
         {/* CTAs */}
         <div className="flex flex-col sm:flex-row gap-3 justify-center">
           <Button size="lg" asChild className="gap-2 glow-primary">
             <Link to="/auth">
               <Sparkles className="w-4 h-4" />
               {t('teaser.signupFree', 'Sign Up Free')}
             </Link>
           </Button>
           <Button size="lg" variant="outline" asChild>
             <Link to="/auth?mode=signin">
               {t('teaser.login', 'Already have an account?')}
             </Link>
           </Button>
         </div>
 
         {/* Trust signal */}
         <p className="mt-6 text-xs text-muted-foreground">
           {t('teaser.trust', '✓ Free forever • No credit card required • Join 1,000+ investigators')}
         </p>
       </div>
     </div>
   );
 }