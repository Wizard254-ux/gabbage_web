import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Avatar,
  Grid
} from '@mui/material';
import { Person as PersonIcon, Save as SaveIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

export const Settings: React.FC = () => {
  const { admin } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    if (admin?.user) {
      setFormData({
        name: admin.user.name || '',
        email: admin.user.email || '',
        phone: admin.user.phone || ''
      });
    }
  }, [admin]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('admin') || '{}').token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showSnackbar('Profile updated successfully', 'success');
        // Update local storage
        const adminData = JSON.parse(localStorage.getItem('admin') || '{}');
        adminData.user = { ...adminData.user, ...formData };
        localStorage.setItem('admin', JSON.stringify(adminData));
      } else {
        const error = await response.json();
        showSnackbar(error.message || 'Error updating profile', 'error');
      }
    } catch (error) {
      showSnackbar('Error updating profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
        Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mr: 2 }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Profile Information</Typography>
                <Typography variant="body2" color="text.secondary">
                  Update your account details
                </Typography>
              </Box>
            </Box>

            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                variant="outlined"
              />
              
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                margin="normal"
                variant="outlined"
              />
              
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                margin="normal"
                variant="outlined"
              />

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  size="large"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Account Information</Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Role</Typography>
              <Typography variant="body1">Super Admin</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Account Status</Typography>
              <Typography variant="body1" color="success.main">Active</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Member Since</Typography>
              <Typography variant="body1">
                {admin?.user?.createdAt ? new Date(admin.user.createdAt).toLocaleDateString() : 'N/A'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};