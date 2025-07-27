import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

const isDev = import.meta.env.MODE === 'development'; // Vite-specific

createRoot(document.getElementById('root')).render(
  isDev ? <App /> : <StrictMode><App /></StrictMode>
);