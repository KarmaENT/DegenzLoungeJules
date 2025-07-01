import React from 'react';
import { motion } from 'framer-motion';

// Glassmorphism Card Component
export const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  blur?: number;
  opacity?: number;
  border?: boolean;
  hoverEffect?: boolean;
}> = ({ 
  children, 
  className = "", 
  blur = 10, 
  opacity = 0.2,
  border = true,
  hoverEffect = true
}) => {
  return (
    <motion.div 
      className={`rounded-xl ${border ? 'border border-white/20' : ''} ${className}`}
      style={{
        background: `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}
      whileHover={hoverEffect ? { 
        scale: 1.02,
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
      } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
};

// Glassmorphism Navigation Bar
export const GlassNavbar: React.FC<{
  children: React.ReactNode;
  className?: string;
  blur?: number;
  opacity?: number;
  position?: 'top' | 'bottom';
  sticky?: boolean;
}> = ({ 
  children, 
  className = "", 
  blur = 15, 
  opacity = 0.1,
  position = 'top',
  sticky = true
}) => {
  return (
    <div 
      className={`w-full ${position === 'top' ? 'top-0' : 'bottom-0'} ${sticky ? 'sticky' : 'fixed'} z-50 ${className}`}
      style={{
        background: `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        boxShadow: position === 'top' ? '0 4px 30px rgba(0, 0, 0, 0.1)' : '0 -4px 30px rgba(0, 0, 0, 0.1)'
      }}
    >
      {children}
    </div>
  );
};

// Glassmorphism Button
export const GlassButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  blur?: number;
  opacity?: number;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'neutral';
}> = ({ 
  children, 
  onClick, 
  className = "", 
  blur = 8, 
  opacity = 0.3,
  disabled = false,
  variant = 'primary'
}) => {
  // Define variant colors
  const getVariantStyles = () => {
    switch(variant) {
      case 'primary':
        return 'bg-blue-500/30 hover:bg-blue-500/40 text-blue-50 border-blue-400/30';
      case 'secondary':
        return 'bg-purple-500/30 hover:bg-purple-500/40 text-purple-50 border-purple-400/30';
      case 'success':
        return 'bg-green-500/30 hover:bg-green-500/40 text-green-50 border-green-400/30';
      case 'danger':
        return 'bg-red-500/30 hover:bg-red-500/40 text-red-50 border-red-400/30';
      case 'neutral':
      default:
        return 'bg-gray-500/30 hover:bg-gray-500/40 text-gray-50 border-gray-400/30';
    }
  };

  return (
    <motion.button 
      onClick={disabled ? undefined : onClick}
      className={`px-4 py-2 rounded-lg border ${getVariantStyles()} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      style={{
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
      }}
      whileHover={!disabled ? { scale: 1.05 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
};

// Glassmorphism Modal
export const GlassModal: React.FC<{
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  blur?: number;
  opacity?: number;
}> = ({ 
  children, 
  isOpen, 
  onClose, 
  className = "", 
  blur = 15, 
  opacity = 0.2
}) => {
  if (!isOpen) return null;

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div 
        className="absolute inset-0 bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <motion.div 
        className={`relative rounded-xl border border-white/20 max-w-md w-full max-h-[90vh] overflow-auto ${className}`}
        style={{
          background: `rgba(255, 255, 255, ${opacity})`,
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// Glassmorphism Input
export const GlassInput: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  blur?: number;
  opacity?: number;
}> = ({ 
  value, 
  onChange, 
  placeholder = "", 
  type = "text", 
  className = "", 
  blur = 5, 
  opacity = 0.15
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`px-4 py-2 rounded-lg border border-white/20 bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 text-white placeholder-white/50 ${className}`}
      style={{
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
      }}
    />
  );
};

// Glassmorphism Dropdown
export const GlassDropdown: React.FC<{
  children: React.ReactNode;
  isOpen: boolean;
  className?: string;
  blur?: number;
  opacity?: number;
}> = ({ 
  children, 
  isOpen, 
  className = "", 
  blur = 10, 
  opacity = 0.15
}) => {
  return (
    <motion.div 
      className={`rounded-lg border border-white/20 overflow-hidden ${className}`}
      initial={{ opacity: 0, height: 0 }}
      animate={{ 
        opacity: isOpen ? 1 : 0,
        height: isOpen ? 'auto' : 0
      }}
      transition={{ duration: 0.2 }}
      style={{
        background: `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}
    >
      {children}
    </motion.div>
  );
};

// Glassmorphism Tooltip
export const GlassTooltip: React.FC<{
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  blur?: number;
  opacity?: number;
}> = ({ 
  children, 
  content, 
  position = 'top', 
  className = "", 
  blur = 8, 
  opacity = 0.3
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  
  // Position styles
  const getPositionStyles = () => {
    switch(position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      <motion.div 
        className={`absolute z-50 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${getPositionStyles()} ${className}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: isVisible ? 1 : 0,
          scale: isVisible ? 1 : 0.8,
          pointerEvents: isVisible ? 'auto' : 'none'
        }}
        transition={{ duration: 0.2 }}
        style={{
          background: `rgba(0, 0, 0, ${opacity + 0.5})`,
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
        }}
      >
        {content}
      </motion.div>
    </div>
  );
};

// Glassmorphism Badge
export const GlassBadge: React.FC<{
  children: React.ReactNode;
  className?: string;
  blur?: number;
  opacity?: number;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'neutral';
}> = ({ 
  children, 
  className = "", 
  blur = 5, 
  opacity = 0.3,
  variant = 'primary'
}) => {
  // Define variant colors
  const getVariantStyles = () => {
    switch(variant) {
      case 'primary':
        return 'bg-blue-500/30 text-blue-50 border-blue-400/30';
      case 'secondary':
        return 'bg-purple-500/30 text-purple-50 border-purple-400/30';
      case 'success':
        return 'bg-green-500/30 text-green-50 border-green-400/30';
      case 'danger':
        return 'bg-red-500/30 text-red-50 border-red-400/30';
      case 'neutral':
      default:
        return 'bg-gray-500/30 text-gray-50 border-gray-400/30';
    }
  };

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getVariantStyles()} ${className}`}
      style={{
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
      }}
    >
      {children}
    </span>
  );
};

// Glassmorphism Sidebar
export const GlassSidebar: React.FC<{
  children: React.ReactNode;
  className?: string;
  blur?: number;
  opacity?: number;
  position?: 'left' | 'right';
}> = ({ 
  children, 
  className = "", 
  blur = 15, 
  opacity = 0.1,
  position = 'left'
}) => {
  return (
    <div 
      className={`h-full ${position === 'left' ? 'border-r' : 'border-l'} border-white/10 ${className}`}
      style={{
        background: `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        boxShadow: position === 'left' ? '4px 0 30px rgba(0, 0, 0, 0.1)' : '-4px 0 30px rgba(0, 0, 0, 0.1)'
      }}
    >
      {children}
    </div>
  );
};

export default {
  GlassCard,
  GlassNavbar,
  GlassButton,
  GlassModal,
  GlassInput,
  GlassDropdown,
  GlassTooltip,
  GlassBadge,
  GlassSidebar
};
