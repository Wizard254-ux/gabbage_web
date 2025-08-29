import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Avatar,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { adminService } from '../../shared/services/services/axios';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    // Try 'admin' key first
    let userData = null;
    const admin = localStorage.getItem('admin');
    if (admin) {
      try {
        const adminData = JSON.parse(admin);
        userData = adminData.data?.user;
      } catch (error) {
        console.error('Error parsing admin data:', error);
      }
    }
    
    // Fallback to 'user' key
    if (!userData) {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userDataParsed = JSON.parse(user);
          userData = userDataParsed.data?.user || userDataParsed;
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
    
    console.log('Loaded user data:', userData);
    
    if (userData) {
      setUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
      });
    }
    setLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const response = await adminService.updateProfile(formData);
      
      // Update localStorage with new data
      const admin = localStorage.getItem('admin');
      if (admin) {
        try {
          const adminData = JSON.parse(admin);
          if (adminData.data?.user) {
            adminData.data.user = { ...adminData.data.user, ...formData };
            localStorage.setItem('admin', JSON.stringify(adminData));
          }
        } catch (error) {
          console.error('Error updating admin localStorage:', error);
        }
      }
      
      // Also update 'user' key if it exists
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          if (userData.data?.user) {
            userData.data.user = { ...userData.data.user, ...formData };
          } else {
            Object.assign(userData, formData);
          }
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error('Error updating user localStorage:', error);
        }
      }
      
      setUser(prev => prev ? { ...prev, ...formData } : null);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      if (error.response?.data?.details) {
        const details = error.response.data.details;
        const errorMessages = details.map((detail: any) => `${detail.field}: ${detail.message}`).join('\n');
        setErrorMessage(errorMessages);
      } else if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Failed to update profile. Please try again.');
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Profile
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      <Paper sx={{ p: 4, maxWidth: 600 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 64, height: 64 }}>
            <PersonIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h5">{user?.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
              {user?.role?.replace('_', ' ')}
            </Typography>
          </Box>
        </Box>

        <form onSubmit={handleUpdateProfile}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={updating}
              sx={{ alignSelf: 'flex-start' }}
            >
              {updating ? 'Updating...' : 'Update Profile'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Profile;