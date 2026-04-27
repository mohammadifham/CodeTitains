import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"article"> {
  children: React.ReactNode;
  className?: string;
}

function Card({ children, className = '', ...props }: CardProps) {
  return (
    <motion.article 
      className={`neon-card ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.article>
  );
}

export default React.memo(Card);
