import React from 'react';
import { motion } from 'framer-motion';

// Button with hover and tap animations
interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | string; // Added variant prop
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({ 
  children, 
  onClick, 
  className = '', 
  disabled = false, 
  variant 
}) => {
  let buttonStyles = 'px-4 py-2 rounded'; // Base styles

  // Apply variant-specific styles
  if (variant === 'secondary') {
    buttonStyles += ' bg-gray-500 hover:bg-gray-600 text-white';
  } else if (variant === 'success') {
    buttonStyles += ' bg-green-500 hover:bg-green-600 text-white';
  } else if (variant === 'danger') {
    buttonStyles += ' bg-red-500 hover:bg-red-600 text-white';
  } else {
    // Default/primary styles or allow custom className to override
    buttonStyles += ' bg-blue-500 hover:bg-blue-600 text-white';
  }

  return (
    <motion.button
      className={`${buttonStyles} ${className}`.trim()} // Combine base, variant, and custom classNames
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
};

// Card with hover effect
export const AnimatedCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = '', onClick }) => {
  return (
    <motion.div
      className={`p-4 rounded-lg shadow ${className}`}
      whileHover={{ 
        y: -5,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

// Input field with focus animation
export const AnimatedInput: React.FC<{
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}> = ({ type = 'text', placeholder, value, onChange, className = '' }) => {
  return (
    <motion.div
      initial={{ borderColor: 'rgba(209, 213, 219, 1)' }}
      whileFocus={{ borderColor: 'rgba(59, 130, 246, 1)' }}
      className="relative"
    >
      <motion.input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border rounded focus:outline-none ${className}`}
        whileFocus={{ borderColor: '#3b82f6', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)' }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
};

// Dropdown menu with animation
export const AnimatedDropdown: React.FC<{
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ isOpen, children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ 
        opacity: isOpen ? 1 : 0,
        height: isOpen ? 'auto' : 0
      }}
      transition={{ duration: 0.2 }}
      className={`overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Notification badge with pulse animation
export const NotificationBadge: React.FC<{
  count: number;
  className?: string;
}> = ({ count, className = '' }) => {
  return (
    <motion.div
      className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full ${className}`}
      initial={{ scale: 0.8 }}
      animate={{ scale: [0.8, 1.2, 1] }}
      transition={{ duration: 0.5 }}
    >
      {count}
    </motion.div>
  );
};

// Loading spinner with continuous rotation
export const LoadingSpinner: React.FC<{
  size?: number;
  color?: string;
  className?: string;
}> = ({ size = 24, color = '#3b82f6', className = '' }) => {
  return (
    <motion.div
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.1)" />
        <path d="M12 2a10 10 0 0 1 10 10" />
      </svg>
    </motion.div>
  );
};

// Tooltip with fade animation
export const AnimatedTooltip: React.FC<{
  isVisible: boolean;
  content: string;
  className?: string;
}> = ({ isVisible, content, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 10
      }}
      transition={{ duration: 0.2 }}
      className={`absolute z-10 p-2 text-sm text-white bg-gray-800 rounded shadow-lg ${className}`}
    >
      {content}
    </motion.div>
  );
};

// List item with staggered animation for lists
export const AnimatedListItem: React.FC<{
  children: React.ReactNode;
  index: number;
  className?: string;
}> = ({ children, index, className = '' }) => {
  return (
    <motion.li
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={className}
    >
      {children}
    </motion.li>
  );
};

// Page transition wrapper
export const PageTransition: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

// Tab indicator animation
export const AnimatedTabIndicator: React.FC<{
  activeIndex: number;
  tabWidths: number[];
  className?: string;
}> = ({ activeIndex, tabWidths, className = '' }) => {
  // Calculate the left position based on the active tab index
  const getLeftPosition = () => {
    let position = 0;
    for (let i = 0; i < activeIndex; i++) {
      position += tabWidths[i] || 0;
    }
    return position;
  };

  return (
    <motion.div
      className={`absolute bottom-0 h-0.5 bg-blue-500 ${className}`}
      initial={false}
      animate={{ 
        left: getLeftPosition(),
        width: tabWidths[activeIndex] || 0
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    />
  );
};

// Toggle switch with animation
export const AnimatedToggle: React.FC<{
  isOn: boolean;
  onToggle: () => void;
  className?: string;
}> = ({ isOn, onToggle, className = '' }) => {
  return (
    <motion.div
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${
        isOn ? 'bg-blue-500' : 'bg-gray-300'
      } ${className}`}
      onClick={onToggle}
    >
      <motion.div
        className="bg-white w-4 h-4 rounded-full shadow-md"
        animate={{ x: isOn ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.div>
  );
};

