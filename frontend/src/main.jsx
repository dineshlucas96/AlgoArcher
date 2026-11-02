import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// AlgoArcher Design System & Styles
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/auth.css';
import './styles/admin.css';
import './styles/faculty.css';
import './styles/student.css';

// Legacy compatibility fallbacks
import './extra.css';
import './theme.css';

createRoot(document.getElementById('root')).render(<App />);
