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

      if (settings.preventScreenshots) {
        document.body.classList.add('prevent-screenshots');
      } else {
        document.body.classList.remove('prevent-screenshots');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const settings = JSON.parse(localStorage.getItem('app-settings') || '{}');
      if (settings.preventScreenshots) {
        if (e.key === 'PrintScreen' || (e.ctrlKey && e.key === 'p') || (e.metaKey && e.shiftKey && (e.key === 's' || e.key === '3' || e.key === '4'))) {
          e.preventDefault();
          document.body.style.opacity = '0';
          setTimeout(() => { document.body.style.opacity = '1'; }, 1000);
          alert('Screenshots and printing are restricted for privacy.');
        }
      }
    };
    
    const handleCopy = (e: ClipboardEvent) => {
      const settings = JSON.parse(localStorage.getItem('app-settings') || '{}');
      if (settings.preventScreenshots) {
        e.preventDefault();
        alert('Copying text is restricted for privacy.');
      }
    };

    const handleVisibilityChange = () => {
      const settings = JSON.parse(localStorage.getItem('app-settings') || '{}');
      if (settings.preventScreenshots) {
        if (document.hidden) {
          document.body.style.filter = 'blur(15px)';
        } else {
          document.body.style.filter = 'none';
        }
      } else {
        document.body.style.filter = 'none';
      }
    };

    applyTheme();
    window.addEventListener('theme-changed', applyTheme);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('copy', handleCopy);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('theme-changed', applyTheme);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('copy', handleCopy);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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
