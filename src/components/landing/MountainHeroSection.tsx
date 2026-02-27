import { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const GenerativeMountainScene = lazy(() => import("@/components/ui/mountain-scene"));

const MountainHeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* 3D Mountain Background */}
      <Suspense fallback={<div className="absolute inset-0 bg-background" />}>
        <GenerativeMountainScene />
      </Suspense>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Badge
            variant="outline"
            className={cn(
              "px-4 py-2 bg-primary/10 text-primary border-primary/30",
              "backdrop-blur-sm"
            )}
          >
            <Shield className="w-3.5 h-3.5 mr-2" />
            Open-Source · Non-Profit · Verified
          </Badge>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
        >
          <span className="text-foreground block">Documenting</span>
          <span className="text-foreground block">Injustice.</span>
          <span className="text-primary block mt-2">Demanding</span>
          <span className="text-primary block">Accountability.</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          An investigative intelligence platform exposing human rights violations
          through verified evidence and AI-powered analysis.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.1 }}
        >
          <Button size="lg" className="group text-base px-8 py-6" asChild>
            <Link to="/cases">
              Explore Cases
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary hover:text-primary-foreground text-base px-8 py-6" asChild>
            <Link to="/auth">
              Start Investigation
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <span className="text-xs text-muted-foreground uppercase tracking-widest">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-primary" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default MountainHeroSection;
