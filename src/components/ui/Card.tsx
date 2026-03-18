'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type BaseCardProps = {
  variant?: 'default' | 'elevated' | 'bordered' | 'current' | 'future' | 'savings';
  animate?: boolean;
  children?: React.ReactNode;
};

type CardProps = BaseCardProps & (
  | (HTMLAttributes<HTMLDivElement> & { animate?: false })
  | (Omit<HTMLMotionProps<'div'>, 'children'> & { animate: true })
);

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', animate = false, className = '', ...props }, ref) => {
    const baseStyles = 'rounded-xl p-6';

    const variants = {
      default: 'bg-white shadow-md',
      elevated: 'bg-white shadow-xl',
      bordered: 'bg-white border-2 border-gray-200',
      current: 'bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200',
      future: 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200',
      savings: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-xl',
    };

    if (animate) {
      return (
        <motion.div
          ref={ref}
          className={`${baseStyles} ${variants[variant]} ${className}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          {...(props as Omit<HTMLMotionProps<'div'>, 'children'>)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...(props as HTMLAttributes<HTMLDivElement>)}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
