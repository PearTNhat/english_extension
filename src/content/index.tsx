import { createRoot } from 'react-dom/client';
import { ContentApp } from './ContentApp';
import '../index.css';

// Initialize the root component
const init = () => {
  const rootDiv = document.createElement('div');
  rootDiv.id = 'vocabulary-translator-extension-root';
  
  // Create a fixed, top-level overlay that doesn't affect page layout
  Object.assign(rootDiv.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '0',
    height: '0',
    overflow: 'visible',
    zIndex: '2147483647', // Maximum z-index
    pointerEvents: 'none' // Allow clicking through the container
  });
  
  document.body.appendChild(rootDiv);

  const root = createRoot(rootDiv);
  root.render(<ContentApp />);
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
