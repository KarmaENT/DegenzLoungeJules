import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GlassButton, GlassCard, GlassInput } from '../components/ui/GlassmorphismElements';
import { FadeTransition, SlideTransition } from '../components/ui/AnimatedTransitions';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    input: ({ children, ...props }) => <input {...props}>{children}</input>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('UI Components Tests', () => {
  describe('GlassmorphismElements', () => {
    test('GlassButton renders correctly', () => {
      const handleClick = jest.fn();
      render(
        <GlassButton onClick={handleClick} variant="primary">
          Test Button
        </GlassButton>
      );
      
      const button = screen.getByText('Test Button');
      expect(button).toBeInTheDocument();
      
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
    
    test('GlassCard renders children correctly', () => {
      render(
        <GlassCard className="test-class">
          <div>Card Content</div>
        </GlassCard>
      );
      
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });
    
    test('GlassInput handles value changes', () => {
      const handleChange = jest.fn();
      render(
        <GlassInput 
          value="test" 
          onChange={handleChange} 
          placeholder="Enter text" 
        />
      );
      
      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('test');
    });
  });
  
  describe('AnimatedTransitions', () => {
    test('FadeTransition renders children correctly', () => {
      render(
        <FadeTransition>
          <div>Fade Content</div>
        </FadeTransition>
      );
      
      expect(screen.getByText('Fade Content')).toBeInTheDocument();
    });
    
    test('SlideTransition renders children correctly', () => {
      render(
        <SlideTransition direction="up">
          <div>Slide Content</div>
        </SlideTransition>
      );
      
      expect(screen.getByText('Slide Content')).toBeInTheDocument();
    });
  });
});
