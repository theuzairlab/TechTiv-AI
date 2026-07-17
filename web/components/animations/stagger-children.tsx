"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type StaggerChildrenProps = {
  className?: string;
  stagger?: number;
  delayChildren?: number;
  children: React.ReactNode;
};

const containerVariants = {
  hidden: {},
  visible: (custom: { stagger: number; delayChildren: number }) => ({
    transition: {
      staggerChildren: custom.stagger,
      delayChildren: custom.delayChildren,
    },
  }),
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function StaggerChildren({
  className,
  stagger = 0.1,
  delayChildren = 0.1,
  children,
}: StaggerChildrenProps) {
  return (
    <motion.div
      className={cn(className)}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      custom={{ stagger, delayChildren }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div className={cn(className)} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
