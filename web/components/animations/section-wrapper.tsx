"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type SectionWrapperProps = {
  id?: string;
  className?: string;
  containerClassName?: string;
  delay?: number;
  children: React.ReactNode;
};

export function SectionWrapper({
  id,
  className,
  containerClassName,
  delay = 0,
  children,
}: SectionWrapperProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn("relative w-full py-20 md:py-28", className)}
    >
      <div
        className={cn(
          "mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8",
          containerClassName,
        )}
      >
        {children}
      </div>
    </motion.section>
  );
}
