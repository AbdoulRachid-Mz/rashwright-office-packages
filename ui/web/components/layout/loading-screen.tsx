// components/layout/loading-screen.tsx
"use client";

import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import { Typography } from "../ui/typography";

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
          <Building2 className="h-8 w-8 text-primary-foreground" />
        </div>
        <Typography variant="h4" weight="bold">
          Immo360
        </Typography>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
        />
      </motion.div>
    </div>
  );
}
