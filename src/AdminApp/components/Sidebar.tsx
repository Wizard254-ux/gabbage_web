import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Avatar,
  Divider,
  Button,
  IconButton
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  SupervisorAccount as AdminIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
  open: boolean;
  onToggle: () => void;
}

const drawerWidth = 280;

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onNavigate, onLogout, open, onToggle }) => {
  const { admin } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'organizations', label: 'Organizations', icon: <BusinessIcon /> },
    { id: 'admins', label: 'Admins', icon: <AdminIcon /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        transition: 'width 0.3s',
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: 'grey.900',
          color: 'white',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, textAlign: 'center', position: 'relative' }}>
        <IconButton
          onClick={onToggle}
          sx={{ 
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'white'
          }}
        >
          <MenuIcon />
        </IconButton>
        <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mx: 'auto', mb: 2 }}>
          <PersonIcon />
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
          {admin?.data?.user?.name || 'Admin User'}
        </Typography>
        <Typography variant="body2" sx={{ color: 'grey.400' }}>
          Super Admin
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'grey.700' }} />

      {/* Navigation */}
      <List sx={{ flexGrow: 1, px: 2, py: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => onNavigate(item.id)}
              sx={{
                borderRadius: 2,
                bgcolor: activeTab === item.id ? 'primary.main' : 'transparent',
                '&:hover': {
                  bgcolor: activeTab === item.id ? 'primary.dark' : 'grey.800',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: 'grey.700' }} />

      {/* Logout */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={onLogout}
          sx={{
            color: 'white',
            borderColor: 'grey.600',
            '&:hover': {
              borderColor: 'grey.400',
              bgcolor: 'grey.800',
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Drawer>
  );
};