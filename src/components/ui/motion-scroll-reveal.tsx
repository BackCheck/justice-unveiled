"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface MotionScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "scale";
  once?: boolean;
}

const directionVariants = {
  up: { hidden: { opacity: 0, y: 50, filter: "blur(4px)" }, visible: { opacity: 1, y: 0, filter: "blur(0px)" } },
  down: { hidden: { opacity: 0, y: -50, filter: "blur(4px)" }, visible: { opacity: 1, y: 0, filter: "blur(0px)" } },
  left: { hidden: { opacity: 0, x: 60, filter: "blur(4px)" }, visible: { opacity: 1, x: 0, filter: "blur(0px)" } },
  right: { hidden: { opacity: 0, x: -60, filter: "blur(4px)" }, visible: { opacity: 1, x: 0, filter: "blur(0px)" } },
  scale: { hidden: { opacity: 0, scale: 0.85, filter: "blur(6px)" }, visible: { opacity: 1, scale: 1, filter: "blur(0px)" } },
};

export const MotionScrollReveal = ({
  children,
  className,
  delay = 0,
  direction = "up",
  once = true,
}: MotionScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={directionVariants[direction]}
      transition={{
        duration: 0.6,
        delay: delay / 1000,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      {children}
    </motion.div>
  );
};
