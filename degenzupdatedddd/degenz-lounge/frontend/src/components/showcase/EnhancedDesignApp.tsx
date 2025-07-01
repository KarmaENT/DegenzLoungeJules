import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RouteTransition, PageTransition } from '../ui/AnimatedTransitions';
import { GlassCard, GlassNavbar, GlassButton, GlassSidebar } from '../ui/GlassmorphismElements';
import { WaveBackground } from '../ui/CustomIllustrations';
import { Scene3D, AgentAvatar3D } from '../ui/ThreeDElements';
import { AnimatedButton, AnimatedCard } from '../ui/MicroInteractions';
import ThreeDShowcase from '../showcase/ThreeDShowcase';
import GlassmorphismShowcase from '../showcase/GlassmorphismShowcase';
import IllustrationsShowcase from '../showcase/IllustrationsShowcase';
import TransitionsShowcase from '../showcase/TransitionsShowcase';

// Main App with all visual enhancements integrated
const EnhancedDesignApp: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Background style with gradient
  const backgroundStyle = {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    minHeight: '100vh',
    position: 'relative' as 'relative',
    overflow: 'hidden',
  };

  return (
    <div style={backgroundStyle}>
      {/* Animated background */}
      <div className="absolute inset-0 z-0 opacity-20">
        <WaveBackground 
          primaryColor="#3b82f6" 
          secondaryColor="#8b5cf6" 
          animate={true}
        />
      </div>
      
      {/* Glass Navbar */}
      <GlassNavbar className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 mr-3">
              <AgentAvatar3D letter="D" color="#3b82f6" size="40px" />
            </div>
            <h1 className="text-xl font-bold text-white">DeGeNz Lounge</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <AnimatedButton 
              className="text-white"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? '← Hide Sidebar' : '→ Show Sidebar'}
            </AnimatedButton>
          </div>
        </div>
      </GlassNavbar>
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Glass Sidebar with navigation */}
        <motion.div
          initial={{ width: isSidebarOpen ? 250 : 0 }}
          animate={{ width: isSidebarOpen ? 250 : 0 }}
          transition={{ duration: 0.3 }}
          className="h-full overflow-hidden"
        >
          {isSidebarOpen && (
            <GlassSidebar className="w-[250px] p-4">
              <div className="mb-6">
                <div className="h-[150px] mb-4 rounded-lg overflow-hidden">
                  <Scene3D height="150px" logoText="DeGeNz" />
                </div>
                <div className="text-sm text-white/70 mb-1">Visual Design Showcase</div>
              </div>
              
              <nav className="space-y-2">
                <NavLink to="/" label="Dashboard" active={location.pathname === '/'} />
                <NavLink to="/micro-interactions" label="Micro-Interactions" active={location.pathname === '/micro-interactions'} />
                <NavLink to="/3d-elements" label="3D Elements" active={location.pathname === '/3d-elements'} />
                <NavLink to="/glassmorphism" label="Glassmorphism" active={location.pathname === '/glassmorphism'} />
                <NavLink to="/illustrations" label="Custom Illustrations" active={location.pathname === '/illustrations'} />
                <NavLink to="/transitions" label="Animated Transitions" active={location.pathname === '/transitions'} />
              </nav>
            </GlassSidebar>
          )}
        </motion.div>
        
        {/* Main content area with route transitions */}
        <div className="flex-grow overflow-auto p-6">
          <RouteTransition location={location}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/micro-interactions" element={<MicroInteractionsPage />} />
              <Route path="/3d-elements" element={<ThreeDElementsPage />} />
              <Route path="/glassmorphism" element={<GlassmorphismPage />} />
              <Route path="/illustrations" element={<IllustrationsPage />} />
              <Route path="/transitions" element={<TransitionsPage />} />
            </Routes>
          </RouteTransition>
        </div>
      </div>
    </div>
  );
};

// Navigation Link component with animations
const NavLink: React.FC<{ to: string; label: string; active: boolean }> = ({ to, label, active }) => {
  return (
    <Link to={to} className="block">
      <motion.div
        className={`px-4 py-2 rounded-lg ${active ? 'bg-white/20' : 'hover:bg-white/10'} transition-colors`}
        whileHover={{ x: 5 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-white">{label}</span>
      </motion.div>
    </Link>
  );
};

// Dashboard page
const Dashboard: React.FC = () => {
  return (
    <PageTransition>
      <h2 className="text-3xl font-bold text-white mb-6">Visual Design Enhancements</h2>
      
      <p className="text-white/80 mb-8 max-w-3xl">
        Welcome to the DeGeNz Lounge visual design showcase. This application demonstrates the various visual enhancements 
        implemented to create a modern, engaging user interface. Explore the different sections to see each enhancement in action.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard 
          title="Micro-Interactions" 
          description="Subtle animations for user actions that provide feedback and enhance engagement."
          link="/micro-interactions"
        />
        
        <FeatureCard 
          title="3D Elements" 
          description="Tasteful 3D design elements that add depth and visual interest to the interface."
          link="/3d-elements"
        />
        
        <FeatureCard 
          title="Glassmorphism" 
          description="Frosted glass effects for cards and modals that create a modern, translucent appearance."
          link="/glassmorphism"
        />
        
        <FeatureCard 
          title="Custom Illustrations" 
          description="Unique SVG illustrations for different sections that add personality and context."
          link="/illustrations"
        />
        
        <FeatureCard 
          title="Animated Transitions" 
          description="Smooth transitions between pages and states that create a cohesive user experience."
          link="/transitions"
        />
        
        <GlassCard className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">All Features Combined</h3>
            <p className="text-white/80">
              These visual enhancements work together to create a polished, modern interface that engages users and improves usability.
            </p>
          </div>
          
          <div className="mt-4 h-[150px] rounded-lg overflow-hidden">
            <Scene3D height="150px" logoText="DeGeNz" />
          </div>
        </GlassCard>
      </div>
    </PageTransition>
  );
};

// Feature card component
const FeatureCard: React.FC<{ title: string; description: string; link: string }> = ({ title, description, link }) => {
  return (
    <AnimatedCard className="h-full">
      <GlassCard className="p-6 h-full flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
          <p className="text-white/80">{description}</p>
        </div>
        
        <Link to={link} className="mt-4 block">
          <GlassButton className="w-full">
            Explore
          </GlassButton>
        </Link>
      </GlassCard>
    </AnimatedCard>
  );
};

// Individual feature pages
const MicroInteractionsPage: React.FC = () => (
  <PageTransition>
    <h2 className="text-3xl font-bold text-white mb-6">Micro-Interactions</h2>
    <p className="text-white/80 mb-8">
      Subtle animations for user actions that provide feedback and enhance engagement.
    </p>
    
    {/* This would be a custom component showing micro-interactions */}
    <div className="bg-white/5 p-6 rounded-lg">
      <p className="text-white/80 mb-4">
        This page would showcase the micro-interactions implemented in the application.
        For now, you can see examples of these interactions throughout the interface,
        such as button hover effects, card animations, and navigation transitions.
      </p>
      
      <div className="flex flex-wrap gap-4">
        <AnimatedButton>Hover Me</AnimatedButton>
        <AnimatedButton variant="secondary">Click Me</AnimatedButton>
        <AnimatedButton variant="success">Animated Button</AnimatedButton>
      </div>
    </div>
  </PageTransition>
);

const ThreeDElementsPage: React.FC = () => (
  <PageTransition>
    <h2 className="text-3xl font-bold text-white mb-6">3D Elements</h2>
    <p className="text-white/80 mb-8">
      Tasteful 3D design elements that add depth and visual interest to the interface.
    </p>
    
    <ThreeDShowcase />
  </PageTransition>
);

const GlassmorphismPage: React.FC = () => (
  <PageTransition>
    <h2 className="text-3xl font-bold text-white mb-6">Glassmorphism</h2>
    <p className="text-white/80 mb-8">
      Frosted glass effects for cards and modals that create a modern, translucent appearance.
    </p>
    
    <GlassmorphismShowcase />
  </PageTransition>
);

const IllustrationsPage: React.FC = () => (
  <PageTransition>
    <h2 className="text-3xl font-bold text-white mb-6">Custom Illustrations</h2>
    <p className="text-white/80 mb-8">
      Unique SVG illustrations for different sections that add personality and context.
    </p>
    
    <IllustrationsShowcase />
  </PageTransition>
);

const TransitionsPage: React.FC = () => (
  <PageTransition>
    <h2 className="text-3xl font-bold text-white mb-6">Animated Transitions</h2>
    <p className="text-white/80 mb-8">
      Smooth transitions between pages and states that create a cohesive user experience.
    </p>
    
    <TransitionsShowcase />
  </PageTransition>
);

export default EnhancedDesignApp;
