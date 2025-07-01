import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedDesignApp from '../components/showcase/EnhancedDesignApp';

// Mock the framer-motion and react-router-dom
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    g: ({ children, ...props }) => <g {...props}>{children}</g>,
    path: ({ children, ...props }) => <path {...props}>{children}</path>,
    circle: ({ children, ...props }) => <circle {...props}>{children}</circle>,
    text: ({ children, ...props }) => <text {...props}>{children}</text>,
    rect: ({ children, ...props }) => <rect {...props}>{children}</rect>,
    line: ({ children, ...props }) => <line {...props}>{children}</line>,
    polygon: ({ children, ...props }) => <polygon {...props}>{children}</polygon>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ element }) => element,
  Link: ({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a>,
  useLocation: () => ({ pathname: '/' }),
}));

// Mock the Three.js components
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div className="mock-canvas">{children}</div>,
  useFrame: () => {},
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div>OrbitControls</div>,
  useTexture: () => {},
  Environment: () => <div>Environment</div>,
  Float: ({ children }) => <div>{children}</div>,
  Text3D: ({ children }) => <div>{children}</div>,
  Center: ({ children }) => <div>{children}</div>,
}));

describe('EnhancedDesignApp', () => {
  test('renders the main application components', () => {
    render(<EnhancedDesignApp />);
    
    // Check for main elements
    expect(screen.getByText('DeGeNz Lounge')).toBeInTheDocument();
    expect(screen.getByText('Visual Design Showcase')).toBeInTheDocument();
    
    // Check for navigation links
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Micro-Interactions')).toBeInTheDocument();
    expect(screen.getByText('3D Elements')).toBeInTheDocument();
    expect(screen.getByText('Glassmorphism')).toBeInTheDocument();
    expect(screen.getByText('Custom Illustrations')).toBeInTheDocument();
    expect(screen.getByText('Animated Transitions')).toBeInTheDocument();
    
    // Check for dashboard content
    expect(screen.getByText('Visual Design Enhancements')).toBeInTheDocument();
    expect(screen.getByText('All Features Combined')).toBeInTheDocument();
  });
});
