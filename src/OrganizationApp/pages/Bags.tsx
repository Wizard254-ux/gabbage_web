import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Button,
  CircularProgress,

  Chip,
  Avatar
} from '@mui/material';
import Grid from '@mui/material/Grid';

import {
  Search as SearchIcon,
  Download as DownloadIcon,
  LocalShipping as BagIcon,
  FilterList as FilterIcon,
  Today as TodayIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { organizationService } from '../../services/organizationService';

interface BagDistribution {
  id: string;
  client_id: string;
  recipient_email: string;
  number_of_bags: number;
  verification_code: string;
  is_verified: boolean;
  verification_timestamp?: string;
  distribution_timestamp: string;
  driver_id: string;
  notes?: string;
  createdAt: string;
  driver?: {
    name: string;
    email: string;
  };
  client?: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  accountNumber: string;
}

const Bags: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [bags, setBags] = useState<BagDistribution[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState<unknown>(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch bag distribution history
  const fetchBags = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (selectedClient) params.clientId = selectedClient;
      
      const response = await organizationService.getBagDistributionHistory(params);
      setBags(response.data.data || []);
      setPagination(response.data.pagination || null);
    } catch (error) {
      console.error('Failed to fetch bag distribution history:', error);
      setBags([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch clients for filtering
  const fetchClients = async () => {
    try {
      const response = await organizationService.listClients();
      setClients(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    fetchBags();
  }, [page, startDate, endDate, selectedClient]);

  // Filter bags based on search term and status
  const filteredBags = bags.filter(bag => {
    const matchesSearch = !searchTerm || 
      bag.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bag.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bag.recipient_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bag.verification_code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || 
      (statusFilter === 'verified' && bag.is_verified) ||
      (statusFilter === 'pending' && !bag.is_verified);
    
    return matchesSearch && matchesStatus;
  });

  // Calculate summary statistics
  const totalBags = filteredBags.reduce((sum, bag) => sum + bag.number_of_bags, 0);
  const verifiedCount = filteredBags.filter(bag => bag.is_verified).length;
  const pendingCount = filteredBags.filter(bag => !bag.is_verified).length;

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setSelectedClient('');
    setStatusFilter('');
    setPage(1);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Bag Distribution Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Track and manage garbage bag distributions to clients
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => {
            // TODO: Implement export functionality
          }}
        >
          Export Data
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {filteredBags.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Distributions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                {totalBags}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Bags Delivered
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                {verifiedCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Verified Distributions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main">
                {pendingCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Verification
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon />
            Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                placeholder="Search by client, driver, email..."
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5, color: 'text.secondary', fontSize: '0.75rem' }}>
                  Client
                </Typography>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  style={{
                    width: '100%',
                    height: '56px',
                    padding: '16px 14px',
                    border: '1px solid #d0d7de',
                    borderRadius: '4px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    marginBottom:10,
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                  onBlur={(e) => e.target.style.borderColor = '#d0d7de'}
                >
                  <option value="">All Clients</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </Box>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5, color: 'text.secondary', fontSize: '0.75rem' }}>
                  Status
                </Typography>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    width: '100%',
                    height: '56px',
                    padding: '16px 14px',
                    border: '1px solid #d0d7de',
                    borderRadius: '4px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                  onBlur={(e) => e.target.style.borderColor = '#d0d7de'}
                >
                  <option value="">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                </select>
              </Box>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TodayIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TodayIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={clearFilters}
                sx={{ height: '56px' }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading bag distribution data...</Typography>
            </Box>
          ) : filteredBags.length > 0 ? (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Distribution Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Client</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Bags</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Driver</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Recipient Email</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Verification Code</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Verified At</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredBags.map((bag, index) => (
                      <TableRow key={bag.id || index} hover>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(bag.distribution_timestamp || bag.createdAt).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(bag.distribution_timestamp || bag.createdAt).toLocaleTimeString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              <PersonIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {bag.client?.name || 'Unknown Client'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {bag.client?.email || ''}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BagIcon color="action" fontSize="small" />
                            <Typography variant="body2" fontWeight="medium">
                              {bag.number_of_bags}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {bag.driver?.name || 'Unknown Driver'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {bag.driver?.email || ''}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                            {bag.recipient_email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: 'monospace', 
                              bgcolor: 'grey.100', 
                              p: 0.5, 
                              borderRadius: 1,
                              fontSize: '0.75rem'
                            }}
                          >
                            {bag.verification_code}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={bag.is_verified ? 'Verified' : 'Pending'} 
                            size="small"
                            color={bag.is_verified ? 'success' : 'warning'}
                            icon={bag.is_verified ? <CheckCircleIcon /> : <CancelIcon />}
                          />
                        </TableCell>
                        <TableCell>
                          {bag.verification_timestamp ? (
                            <Box>
                              <Typography variant="body2">
                                {new Date(bag.verification_timestamp).toLocaleDateString()}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(bag.verification_timestamp).toLocaleTimeString()}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Not verified
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 150 }} noWrap title={bag.notes}>
                            {bag.notes || 'No notes'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Button 
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    size="small"
                  >
                    Previous
                  </Button>
                  <Typography sx={{ mx: 2, display: 'flex', alignItems: 'center' }}>
                    Page {page} of {pagination.totalPages}
                  </Typography>
                  <Button 
                    onClick={() => setPage(page + 1)}
                    disabled={page >= pagination.totalPages}
                    size="small"
                  >
                    Next
                  </Button>
                </Box>
              )}
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <BagIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Bag Distributions Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || startDate || endDate || selectedClient || statusFilter
                  ? 'No distributions match your current filters.'
                  : 'No bag distributions have been recorded yet.'
                }
              </Typography>
              {(searchTerm || startDate || endDate || selectedClient || statusFilter) && (
                <Button 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Bags;