import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import './index.css';

function App() {
  useEffect(() => {
    const applyTheme = () => {
      const settings = JSON.parse(localStorage.getItem('app-settings') || '{}');
      
      if (settings.theme === 'light') {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
      } else if (settings.theme === 'dark') {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
      } else {
        document.body.classList.remove('light-mode', 'dark-mode');
      }

      if (settings.primaryColor) {
        document.documentElement.style.setProperty('--primary', settings.primaryColor);
        document.documentElement.style.setProperty('--primary-hover', settings.primaryColor);
      } else {
        document.documentElement.style.removeProperty('--primary');
        document.documentElement.style.removeProperty('--primary-hover');
      }

      if (settings.wallpaper) {
        document.documentElement.style.setProperty('--chat-wallpaper', `url(${settings.wallpaper})`);
      } else {
        document.documentElement.style.removeProperty('--chat-wallpaper');
      }
    };

    applyTheme();
    window.addEventListener('theme-changed', applyTheme);
    return () => window.removeEventListener('theme-changed', applyTheme);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
