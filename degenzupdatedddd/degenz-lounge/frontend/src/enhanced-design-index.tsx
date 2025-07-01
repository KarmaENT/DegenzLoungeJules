import React from 'react';
import { createRoot } from 'react-dom/client';
import EnhancedDesignApp from './components/showcase/EnhancedDesignApp';
import './styles/index.css'; // Ensure this path is correct and file exists

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <EnhancedDesignApp />
    </React.StrictMode>
  );
} else {
  console.error('Error: Root container not found. Ensure an element with id="root" exists in your HTML.');
}

