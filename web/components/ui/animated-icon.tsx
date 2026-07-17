"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AnimatedIconProps = {
  icon: LucideIcon;
  className?: string;
  size?: number;
  strokeWidth?: number;
  interactive?: boolean;
};

export function AnimatedIcon({
  icon: Icon,
  className,
  size = 22,
  strokeWidth = 1.75,
  interactive = true,
}: AnimatedIconProps) {
  return (
    <motion.span
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      whileHover={interactive ? { scale: 1.12, rotate: -6 } : undefined}
      whileTap={interactive ? { scale: 0.92 } : undefined}
      transition={{ type: "spring", stiffness: 420, damping: 18 }}
    >
      <Icon size={size} strokeWidth={strokeWidth} aria-hidden />
    </motion.span>
  );
}
