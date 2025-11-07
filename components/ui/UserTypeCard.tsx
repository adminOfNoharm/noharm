import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface UserTypeCardProps {
  title: string;
  description: string;
  color: 'green' | 'blue' | 'purple';
  delay?: number;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const UserTypeCard: React.FC<UserTypeCardProps> = ({
  title,
  description,
  color,
  delay = 0,
  className,
  onMouseEnter,
  onMouseLeave
}) => {
  // Color definitions using standard Tailwind colors for consistency
  const colorStyles = {
    green: {
      border: 'border-green-500',
      header: 'text-green-700',
      bg: 'bg-white',
      shadow: 'shadow-[0_4px_12px_rgba(34,197,94,0.15)]',
      hoverShadow: 'hover:shadow-[0_8px_20px_rgba(34,197,94,0.25)]',
      hoverBg: 'hover:bg-green-50'
    },
    blue: {
      border: 'border-blue-500',
      header: 'text-blue-700',
      bg: 'bg-white',
      shadow: 'shadow-[0_4px_12px_rgba(59,130,246,0.15)]',
      hoverShadow: 'hover:shadow-[0_8px_20px_rgba(59,130,246,0.25)]',
      hoverBg: 'hover:bg-blue-50'
    },
    purple: {
      border: 'border-purple-500',
      header: 'text-purple-700',
      bg: 'bg-white',
      shadow: 'shadow-[0_4px_12px_rgba(168,85,247,0.15)]',
      hoverShadow: 'hover:shadow-[0_8px_20px_rgba(168,85,247,0.25)]',
      hoverBg: 'hover:bg-purple-50'
    }
  };

  return (
    <motion.div
      className={cn(
        'p-6 rounded-xl border-l-4 transition-all duration-300',
        'hover:-translate-y-1', // More subtle hover lift
        colorStyles[color].border,
        colorStyles[color].bg,
        colorStyles[color].shadow,
        colorStyles[color].hoverShadow,
        colorStyles[color].hoverBg,
        className
      )}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 20,
        delay: delay + 0.3
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <h3 className={`text-lg font-semibold mb-2 ${colorStyles[color].header}`}>
        {title}
      </h3>
      <p className="text-gray-700 text-sm">{description}</p>
    </motion.div>
  );
};

export default UserTypeCard;