import React, { useState } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Sidebar } from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Organizations from './pages/Organizations';
import Admins from './pages/Admins';
// import Settings from './pages/Settings';
import { IconButton } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32',
    },
    secondary: {
      main: '#4caf50',
    },
  },
});

interface AdminAppProps {
  onLogout: () => void;
}

export const AdminApp: React.FC<AdminAppProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem('adminActiveTab') || 'dashboard';
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleNavigation = (tab: string) => {
    setActiveTab(tab);
    sessionStorage.setItem('adminActiveTab', tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'organizations':
        return <Organizations />;
      case 'admins':
        return <Admins />;
      case 'settings':
        return <div className="p-4">Settings page coming soon...</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Sidebar 
          activeTab={activeTab} 
          onNavigate={handleNavigation}
          onLogout={onLogout}
          open={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <Box component="main" sx={{ 
          flexGrow: 1, 
          p: 3, 
          overflow: 'auto',
          ml: sidebarOpen ? 0 : '-280px',
          transition: 'margin-left 0.3s',
          position: 'relative'
        }}>
          {!sidebarOpen && (
            <IconButton
              onClick={() => setSidebarOpen(true)}
              sx={{
                position: 'fixed',
                top: 16,
                left: 16,
                zIndex: 1300,
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark'
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          {renderContent()}
        </Box>
      </Box>
    </ThemeProvider>
  );
};