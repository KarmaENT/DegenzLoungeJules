import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Page transition variants
export const pageTransitionVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
};

// Staggered children variants
export const staggerContainerVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerItemVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.3,
    },
  },
};

// Fade transition component
export const FadeTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
}> = ({ children, className = "", duration = 0.4, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Slide transition component
export const SlideTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  duration?: number;
  delay?: number;
}> = ({ 
  children, 
  className = "", 
  direction = "up", 
  distance = 50,
  duration = 0.4,
  delay = 0
}) => {
  const getInitialPosition = () => {
    switch (direction) {
      case "up": return { y: distance };
      case "down": return { y: -distance };
      case "left": return { x: distance };
      case "right": return { x: -distance };
      default: return { y: distance };
    }
  };

  const getFinalPosition = () => {
    switch (direction) {
      case "up": return { y: 0 };
      case "down": return { y: 0 };
      case "left": return { x: 0 };
      case "right": return { x: 0 };
      default: return { y: 0 };
    }
  };

  const getExitPosition = () => {
    switch (direction) {
      case "up": return { y: -distance };
      case "down": return { y: distance };
      case "left": return { x: -distance };
      case "right": return { x: distance };
      default: return { y: -distance };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...getInitialPosition() }}
      animate={{ opacity: 1, ...getFinalPosition() }}
      exit={{ opacity: 0, ...getExitPosition() }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1.0] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Scale transition component
export const ScaleTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
  initialScale?: number;
  duration?: number;
  delay?: number;
}> = ({ 
  children, 
  className = "", 
  initialScale = 0.9,
  duration = 0.4,
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: initialScale }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: initialScale }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1.0] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Page transition wrapper component
export const PageTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Staggered children container
export const StaggerContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  delayChildren?: number;
  staggerDelay?: number;
}> = ({ 
  children, 
  className = "",
  delayChildren = 0.2,
  staggerDelay = 0.1
}) => {
  const customVariants = {
    ...staggerContainerVariants,
    animate: {
      ...staggerContainerVariants.animate,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delayChildren,
      },
    },
  };

  return (
    <motion.div
      variants={customVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Staggered child item
export const StaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return (
    <motion.div
      variants={staggerItemVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Route transition wrapper
export const RouteTransition: React.FC<{
  children: React.ReactNode;
  location: any;
}> = ({ children, location }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Tab content transition
export const TabTransition: React.FC<{
  children: React.ReactNode;
  activeTab: string;
  tabId: string;
  direction?: "left" | "right" | "up" | "down";
}> = ({ 
  children, 
  activeTab, 
  tabId,
  direction = "left"
}) => {
  const isActive = activeTab === tabId;
  
  const getDirectionVariants = () => {
    switch (direction) {
      case "left":
        return {
          enter: { x: 20, opacity: 0 },
          center: { x: 0, opacity: 1 },
          exit: { x: -20, opacity: 0 }
        };
      case "right":
        return {
          enter: { x: -20, opacity: 0 },
          center: { x: 0, opacity: 1 },
          exit: { x: 20, opacity: 0 }
        };
      case "up":
        return {
          enter: { y: 20, opacity: 0 },
          center: { y: 0, opacity: 1 },
          exit: { y: -20, opacity: 0 }
        };
      case "down":
        return {
          enter: { y: -20, opacity: 0 },
          center: { y: 0, opacity: 1 },
          exit: { y: 20, opacity: 0 }
        };
      default:
        return {
          enter: { x: 20, opacity: 0 },
          center: { x: 0, opacity: 1 },
          exit: { x: -20, opacity: 0 }
        };
    }
  };

  const variants = getDirectionVariants();

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          initial="enter"
          animate="center"
          exit="exit"
          variants={variants}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Modal transition
export const ModalTransition: React.FC<{
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}> = ({ 
  children, 
  isOpen, 
  onClose,
  className = ""
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className={`fixed z-50 ${className}`}
            style={{ 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)' 
            }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// List item transition for adding/removing items
export const ListItemTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ 
  children, 
  className = ""
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className={`overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default {
  pageTransitionVariants,
  staggerContainerVariants,
  staggerItemVariants,
  FadeTransition,
  SlideTransition,
  ScaleTransition,
  PageTransition,
  StaggerContainer,
  StaggerItem,
  RouteTransition,
  TabTransition,
  ModalTransition,
  ListItemTransition
};
