import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
} from '@mui/material';
import { Grid } from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as FileIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LocationOn as LocationIcon,
  AccountBalance as AccountBalanceIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  FilterList as FilterIcon,
  Today as TodayIcon,
  LocalShipping as BagIcon
} from '@mui/icons-material';
import { organizationService } from '../../shared/services/services/organizationService';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  route?: {
    id: number;
    name: string;
    path: string;
    description: string;
    isActive: boolean;
    organization_id: number;
    created_at: string;
    updated_at: string;
  };
  routeId?: string;
  pickUpDay: string;
  isActive: number;
  monthlyRate: string;
  clientType: 'residential' | 'commercial';
  numberOfUnits: number;
  accountNumber: string;
  gracePeriod: number;
  serviceStartDate: string;
  documents: string[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loadingClientDetails, setLoadingClientDetails] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [isDocumentEditMode, setIsDocumentEditMode] = useState(false);
  const [documentsToDelete, setDocumentsToDelete] = useState<string[]>([]);
  const [editDocumentsFiles, setEditDocumentsFiles] = useState<FileList | null>(null);
  const [newDocumentsFiles, setNewDocumentsFiles] = useState<FileList | null>(null);
  const [addingNewDocuments, setAddingNewDocuments] = useState(false);
  const [detailsTabValue, setDetailsTabValue] = useState(0);
  const [updatingClient, setUpdatingClient] = useState(false);
  const [addingClient, setAddingClient] = useState(false);
  const [clientPayments, setClientPayments] = useState<any[]>([]);
  const [clientInvoices, setClientInvoices] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [paymentPage, setPaymentPage] = useState(1);
  const [invoicePage, setInvoicePage] = useState(1);
  const [paymentPagination, setPaymentPagination] = useState<any>(null);
  const [invoicePagination, setInvoicePagination] = useState<any>(null);
  const [bagStartDate, setBagStartDate] = useState('');
  const [bagEndDate, setBagEndDate] = useState('');
  const [clientBags, setClientBags] = useState<any[]>([]);
  const [loadingBags, setLoadingBags] = useState(false);
  const [deletingDocuments, setDeletingDocuments] = useState<Set<string>>(new Set());
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [clientToToggle, setClientToToggle] = useState<Client | null>(null);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [invoiceFormData, setInvoiceFormData] = useState({
    title: '',
    amount: 0,
    due_date: '',
    description: ''
  });

  // Export functions
  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header] || '';
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPayments = () => {
    if (!clientPayments.length) {
      alert('No payment data to export');
      return;
    }
    
    const headers = ['trans_time', 'amount', 'payment_method', 'phone_number', 'trans_id', 'status', 'allocated_amount', 'remaining_amount'];
    const exportData = clientPayments.map(payment => ({
      trans_time: new Date(payment.trans_time || payment.created_at).toLocaleString(),
      amount: payment.amount,
      payment_method: payment.payment_method,
      phone_number: payment.phone_number,
      trans_id: payment.trans_id,
      status: payment.status,
      allocated_amount: payment.allocated_amount,
      remaining_amount: payment.remaining_amount
    }));
    
    exportToCSV(exportData, `${selectedClient?.name}_payments`, headers);
  };

  const handleExportInvoices = () => {
    if (!clientInvoices.length) {
      alert('No invoice data to export');
      return;
    }
    
    const headers = ['invoice_number', 'created_at', 'due_date', 'amount', 'paid_amount', 'balance', 'payment_status'];
    const exportData = clientInvoices.map(invoice => ({
      invoice_number: invoice.invoice_number,
      created_at: new Date(invoice.created_at).toLocaleDateString(),
      due_date: new Date(invoice.due_date).toLocaleDateString(),
      amount: invoice.amount,
      paid_amount: invoice.paid_amount,
      balance: (parseFloat(invoice.amount || '0') - parseFloat(invoice.paid_amount || '0')).toString(),
      payment_status: invoice.payment_status
    }));
    
    exportToCSV(exportData, `${selectedClient?.name}_invoices`, headers);
  };

  // Functions to fetch client data
  const fetchClientPayments = async () => {
    if (!selectedClient) return;
    setLoadingPayments(true);
    try {
      const response = await organizationService.getClientPayments(
        selectedClient.id,
        { page: paymentPage, limit: 10 }
      );
      console.log('Client payments response:', response.data);
      setClientPayments(response.data?.data?.payments || []);
      // setPaymentPagination(response.data.data.pagination || null);
    } catch (error) {
      console.error('Failed to fetch client payments:', error);
      setClientPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  const fetchClientInvoices = async () => {
    if (!selectedClient) return;
    setLoadingInvoices(true);
    try {
      const response = await organizationService.getClientInvoices(
        selectedClient.id,
        { page: invoicePage, limit: 10 }
      );
      console.log('Client invoices response:', response.data);
      setClientInvoices(response.data.data.invoices || []);
      setInvoicePagination(response.data.pagination || null);
    } catch (error) {
      console.error('Failed to fetch client invoices:', error);
      setClientInvoices([]);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const fetchClientBags = async () => {
    if (!selectedClient) return;
    setLoadingBags(true);
    try {
      const params: any = {};
      if (bagStartDate) params.startDate = bagStartDate;
      if (bagEndDate) params.endDate = bagEndDate;

      const response = await organizationService.getClientBagHistory(
        selectedClient.id,
        params
      );
      setClientBags(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch client bag history:', error);
      setClientBags([]);
    } finally {
      setLoadingBags(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    setCreatingInvoice(true);
    try {
      await organizationService.createInvoice({
        title: invoiceFormData.title,
        client_id: selectedClient.id,
        amount: invoiceFormData.amount,
        due_date: invoiceFormData.due_date,
        description: invoiceFormData.description,
        type: 'custom'
      });

      setShowCreateInvoiceModal(false);
      setInvoiceFormData({ title: '', amount: 0, due_date: '', description: '' });
      fetchClientInvoices();
      setSuccessMessage('Invoice created successfully!');
      setShowSuccessSnackbar(true);
    } catch (error) {
      console.error('Failed to create invoice:', error);
      setErrorMessage('Failed to create invoice');
      setShowErrorSnackbar(true);
    } finally {
      setCreatingInvoice(false);
    }
  };

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuClient, setMenuClient] = useState<Client | null>(null);

  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    route: '',
    isActive: true,
    clientType: 'residential',
    monthlyRate: 0,
    numberOfUnits: 1,
    gracePeriod: 5,
    pickUpDay: 'wednesday',
  });

  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    route: '',
    monthlyRate: 0,
    numberOfUnits: 1,
    isActive: true,
    role: 'client',
    clientType: 'residential',
    serviceStartDate: '',
    gracePeriod: 5,
    pickUpDay: 'wednesday',
  });

  const [documentsFiles, setDocumentsFiles] = useState<FileList | null>(null);

  useEffect(() => {
    fetchClients(1, ''); // Initial load with no search
    fetchRoutes();
  }, []);

  // Handle manual search
  const handleSearch = () => {
    if (searchTerm.trim() !== searchQuery) {
      setSearchQuery(searchTerm.trim());
      fetchClients(1, searchTerm.trim(), true);
    }
  };

  // Handle search input key press
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Auto-fetch when tabs are switched
  useEffect(() => {
    if (detailsTabValue === 2 && selectedClient && clientPayments.length === 0 && !loadingPayments) {
      fetchClientPayments();
    }
  }, [detailsTabValue, selectedClient]);

  useEffect(() => {
    if (detailsTabValue === 3 && selectedClient && clientInvoices.length === 0 && !loadingInvoices) {
      fetchClientInvoices();
    }
  }, [detailsTabValue, selectedClient]);

  useEffect(() => {
    if (detailsTabValue === 4 && selectedClient && clientBags.length === 0 && !loadingBags) {
      fetchClientBags();
    }
  }, [detailsTabValue, selectedClient]);


  // Refetch when pagination changes
  useEffect(() => {
    if (detailsTabValue === 2 && selectedClient && paymentPage > 1) {
      fetchClientPayments();
    }
  }, [paymentPage]);

  useEffect(() => {
    if (detailsTabValue === 3 && selectedClient && invoicePage > 1) {
      fetchClientInvoices();
    }
  }, [invoicePage]);

  // Refetch bags when date filters change
  useEffect(() => {
    if (detailsTabValue === 4 && selectedClient) {
      fetchClientBags();
    }
  }, [bagStartDate, bagEndDate]);


  const fetchClients = async (page = 1, search = '', isSearching = false, showLoading = true) => {
    try {
      if (isSearching) {
        setSearching(true);
      } else if (showLoading) {
        setLoading(true);
      }
      
      console.log('Fetching clients with params:', { page, search });
      const response = await organizationService.listClients({
        page: page.toString(),
        limit: '20',
        search
      });
      console.log('Clients API response:', response);
      
      setClients(response.data.data?.users || []);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      setClients([]);
    } finally {
      if (isSearching) {
        setSearching(false);
      } else if (showLoading) {
        setLoading(false);
      }
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await organizationService.getAllRoutes();
      setRoutes(response.data?.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch routes:', error);
      setRoutes([]);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, client: Client) => {
    setAnchorEl(event.currentTarget);
    setMenuClient(client);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuClient(null);
  };

  const handleEdit = async (client: Client) => {
    handleMenuClose();
    
    // Show dialog immediately with basic data
    setSelectedClient(client);
    setEditFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      route: client.route || client.routeId || '',
      isActive: client.isActive,
      clientType: client.clientType || 'residential',
      monthlyRate: client.monthlyRate || 0,
      numberOfUnits: client.numberOfUnits || 1,
      gracePeriod: client.gracePeriod || 5,
      pickUpDay: client.pickUpDay || 'wednesday',
    });
    setDocumentsToDelete([]);
    setEditDocumentsFiles(null);
    setShowEditModal(true);
    setLoadingEdit(true);

    // Fetch detailed data in background
    try {
      const response = await organizationService.getClientDetails(client.id || client.id || '');
      if (response.data && response.data.client) {
        const clientWithDocs = {
          ...client,
          ...response.data.client,
          ...response.data.client.user,
          documents: response.data.client.user?.documents || []
        };
        setSelectedClient(clientWithDocs);
      }
    } catch (error) {
      console.error('Failed to fetch client details:', error);
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleViewDetails = async (client: Client) => {
    handleMenuClose();
    setShowDetailsModal(true);
    setLoadingClientDetails(true);
    setIsDocumentEditMode(false);
    setSelectedClient(client);
    setDetailsTabValue(0);

    // Reset payment and invoice data
    setClientPayments([]);
    setClientInvoices([]);
    setPaymentPage(1);
    setInvoicePage(1);
    setPaymentPagination(null);
    setInvoicePagination(null);

    try {
      const response = await organizationService.getClientDetails(client.id || client.id || '');
      console.log('🔍 Client details response:', response.data);
      if (response.data && response.data.client) {
        const clientWithDocs = {
          ...client,
          ...response.data.client,
          ...response.data.client.user,
          documents: response.data.client.user?.documents || []
        };
        console.log('📄 Final client with docs:', clientWithDocs);
        setSelectedClient(clientWithDocs);
      }
    } catch (error) {
      console.error('Failed to fetch client details:', error);
    } finally {
      setLoadingClientDetails(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    console.log('🔄 Starting client update...');
    console.log('📋 Edit form data:', editFormData);
    console.log('👤 Selected client:', selectedClient);
    console.log('🗑️ Documents to delete:', documentsToDelete);
    console.log('📎 New documents files:', editDocumentsFiles);

    setUpdatingClient(true);
    try {
      const formData = new FormData();
      formData.append('name', editFormData.name);
      formData.append('email', editFormData.email);
      formData.append('phone', editFormData.phone);
      formData.append('address', editFormData.address);
      formData.append('route', typeof editFormData.route === 'object' ? editFormData.route?.id || '' : editFormData.route);
      formData.append('isActive', editFormData.isActive.toString());
      formData.append('clientType', editFormData.clientType);
      formData.append('monthlyRate', editFormData.monthlyRate.toString());
      formData.append('numberOfUnits', editFormData.numberOfUnits.toString());
      formData.append('gracePeriod', editFormData.gracePeriod.toString());
      formData.append('pickUpDay', editFormData.pickUpDay);

      documentsToDelete.forEach(docPath => {
        formData.append('documentsToDelete', docPath);
      });

      if (editDocumentsFiles) {
        for (let i = 0; i < editDocumentsFiles.length; i++) {
          formData.append('documents', editDocumentsFiles[i]);
        }
      }

      // Use client edit endpoint that supports documents
      formData.append('_method', 'PUT');
      
      console.log('📤 FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      console.log('🌐 Making API call to update client...');
      const response = await organizationService.editClient(selectedClient.id || selectedClient.id || '', formData);
      console.log('✅ Update response:', response);

      setShowEditModal(false);
      setSelectedClient(null);
      setDocumentsToDelete([]);
      setEditDocumentsFiles(null);
      fetchClients();

      setSuccessMessage('Client updated successfully!');
      setShowSuccessSnackbar(true);
    } catch (error) {
      console.error('❌ Failed to update client:', error);
    } finally {
      setUpdatingClient(false);
    }
  };

  const handleDelete = (client: Client) => {
    handleMenuClose();
    setClientToDelete(client);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;
    
    setDeleting(true);
    try {
      await organizationService.deleteClient(clientToDelete.id || clientToDelete.id || '');
      
      // Remove client from current list without reloading
      setClients(prev => prev.filter(c => c.id !== clientToDelete.id));
      
      setSuccessMessage('Client deleted successfully!');
      setShowSuccessSnackbar(true);
      setShowDeleteDialog(false);
      setClientToDelete(null);
    } catch (error) {
      console.error('Failed to delete client:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteDocument = async (clientId: string, documentPath: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDeletingDocuments(prev => new Set(prev).add(documentPath));
      try {
        await organizationService.deleteClientDocument(clientId, documentPath);

        // Update UI immediately
        if (selectedClient) {
          const updatedClient = {
            ...selectedClient,
            documents: selectedClient.documents?.filter(doc => doc !== documentPath) || []
          };
          setSelectedClient(updatedClient);
        }

        setSuccessMessage('Document deleted successfully!');
        setShowSuccessSnackbar(true);
      } catch (error) {
        console.error('Failed to delete document:', error);
        alert('Failed to delete document');
      } finally {
        setDeletingDocuments(prev => {
          const newSet = new Set(prev);
          newSet.delete(documentPath);
          return newSet;
        });
      }
    }
  };

  const handleDeleteDocumentInEditMode = async (documentPath: string) => {
    if (!selectedClient) return;

    if (window.confirm('Are you sure you want to delete this document permanently?')) {
      setDeletingDocuments(prev => new Set(prev).add(documentPath));
      try {
        await organizationService.deleteClientDocument(selectedClient.id, documentPath);

        // Update the selectedClient state to remove the document
        const updatedClient = {
          ...selectedClient,
          documents: selectedClient.documents.filter(doc => doc !== documentPath)
        };
        setSelectedClient(updatedClient);

        setSuccessMessage('Document deleted successfully!');
        setShowSuccessSnackbar(true);
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Failed to delete document');
      } finally {
        setDeletingDocuments(prev => {
          const newSet = new Set(prev);
          newSet.delete(documentPath);
          return newSet;
        });
      }
    }
  };

  const handleAddNewDocuments = async () => {
    if (!selectedClient || !newDocumentsFiles) return;

    setAddingNewDocuments(true);
    try {
      const formData = new FormData();

      for (let i = 0; i < newDocumentsFiles.length; i++) {
        formData.append('documents', newDocumentsFiles[i]);
      }

       const updateFormData = new FormData();
      for (let i = 0; i < newDocumentsFiles.length; i++) {
        updateFormData.append('documents', newDocumentsFiles[i]);
      }

      // Use the client update endpoint with documents
      formData.append('_method', 'PUT');
      await organizationService.editClient(selectedClient.id || selectedClient.id || '', formData);

      // Fetch fresh data to get new document URLs
      const response = await organizationService.getClientDetails(selectedClient.id || selectedClient.id || '');
      console.log('📝 After adding docs response:', response.data);
      if (response.data && response.data.data.client) {
        console.log('were in here');
        const updatedClient = {
          ...selectedClient,
          ...response.data.data.client,
          ...response.data.data.client.user,
          documents: response.data.data.client.user?.documents || []
        };
        console.log('📝 Updated client with new docs:', updatedClient);
        setSelectedClient(updatedClient);
      }

      setNewDocumentsFiles(null);
      setSuccessMessage('Documents added successfully!');
      setShowSuccessSnackbar(true);
    } catch (error) {
      console.error('Failed to add documents:', error);
    } finally {
      setAddingNewDocuments(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingClient(true);
    try {
      const formData = new FormData();
      formData.append('name', addFormData.name);
      formData.append('email', addFormData.email);
      formData.append('role', addFormData.role);
      formData.append('phone', addFormData.phone);
      formData.append('route', addFormData.route);
      formData.append('address', addFormData.address);
      formData.append('clientType', addFormData.clientType);
      formData.append('serviceStartDate', addFormData.serviceStartDate);
      formData.append('monthlyRate', addFormData.monthlyRate.toString());
      formData.append('gracePeriod', addFormData.gracePeriod.toString());
      formData.append('numberOfUnits', addFormData.numberOfUnits.toString());
      formData.append('pickUpDay', addFormData.pickUpDay);
      formData.append('isActive', 'true');
      
      console.log('FormData being sent:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      if (documentsFiles) {
        for (let i = 0; i < documentsFiles.length; i++) {
          formData.append('documents', documentsFiles[i]);
        }
      }

      const result = await organizationService.createClientWithMultipart(formData);
      console.log('➕ Client creation response:', result);
      
      if (result?.data?.status && result?.data?.data?.client) {
        const newClient = result.data.data.client;
        console.log('📝 New client data:', newClient);
        
        // Transform to match the expected Client interface format
        const clientData: Client = {
          id: newClient.id,
          name: newClient.name,
          email: newClient.email,
          phone: newClient.phone,
          address: newClient.address,
          isActive: newClient.isActive ? 1 : 0,
          accountNumber: newClient.accountNumber,
          clientType: newClient.clientType,
          monthlyRate: newClient.monthlyRate,
          numberOfUnits: newClient.numberOfUnits,
          pickUpDay: newClient.pickUpDay,
          gracePeriod: newClient.gracePeriod,
          serviceStartDate: newClient.serviceStartDate,
          route: newClient.route,
          documents: newClient.documents || []
        };
        
        console.log('✅ Transformed client data:', clientData);
        
        // Add to the beginning of the current list (newest clients first)
        setClients(prev => {
          const updatedClients = [clientData, ...prev];
          console.log('📋 Updated clients list:', updatedClients);
          return updatedClients;
        });
      }
      
      setShowAddModal(false);
      setAddFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        route: '',
        monthlyRate: 0,
        numberOfUnits: 1,
        isActive: true,
        role: 'client',
        clientType: 'residential',
        serviceStartDate: '',
        gracePeriod: 5,
        pickUpDay: 'wednesday',
      });
      setDocumentsFiles(null);

      setSuccessMessage('Client added successfully!');
      setShowSuccessSnackbar(true);
    } catch (error: any) {
      console.error('Failed to create client:', error);
      let message = error.response?.data?.message || error.message || 'Failed to create client';
      
      // Handle specific error cases - 500 error usually means duplicate email/phone
      if (error.response?.status === 500) {
        message = 'A user with this email or phone number already exists. Please use different contact details.';
      }
      
      setErrorMessage(message);
      setShowErrorSnackbar(true);
    } finally {
      setAddingClient(false);
    }
  };

  // Removed frontend filtering - now handled by backend

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <ImageIcon />;
    } else if (ext === 'pdf') {
      return <PdfIcon />;
    } else if (['doc', 'docx'].includes(ext || '')) {
      return <DescriptionIcon />;
    }
    return <FileIcon />;
  };

  const isImageFile = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Clients Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your customer base efficiently
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddModal(true)}
          sx={{
            background: 'linear-gradient(45deg, #4CAF50 30%, #45A049 90%)',
            boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
          }}
        >
          Add New Client
        </Button>
      </Box>

      {/* Stats and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={searching}
                  sx={{ minWidth: '100px' }}
                >
                  {searching ? <CircularProgress size={20} /> : 'Search'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={async () => {
                    setSearchTerm('');
                    setSearchQuery('');
                    setClearing(true);
                    try {
                      await fetchClients(1, '', false, false); // Pass false for isSearching and showLoading
                    } finally {
                      setClearing(false);
                    }
                  }}
                  disabled={searching || clearing}
                  sx={{ minWidth: '80px' }}
                >
                  {clearing ? 'Clearing...' : 'Clear'}
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 3, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#2196F3', borderRadius: '50%' }} />
                  <Typography variant="body2">Total: {clients.length}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#4CAF50', borderRadius: '50%' }} />
                  <Typography variant="body2">Active: {clients.filter(c => c.isActive === 1).length}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#F44336', borderRadius: '50%' }} />
                  <Typography variant="body2">Inactive: {clients.filter(c => c.isActive === 0).length}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Client</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Account No</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Address</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Units</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Rate/Unit</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Total Rate</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              // Show loading skeletons
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell><div style={{ height: '20px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}></div></TableCell>
                  <TableCell><div style={{ height: '40px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}></div></TableCell>
                  <TableCell><div style={{ height: '20px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}></div></TableCell>
                  <TableCell><div style={{ height: '20px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}></div></TableCell>
                  <TableCell><div style={{ height: '20px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}></div></TableCell>
                  <TableCell><div style={{ height: '20px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}></div></TableCell>
                  <TableCell><div style={{ height: '20px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}></div></TableCell>
                  <TableCell><div style={{ height: '20px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}></div></TableCell>
                </TableRow>
              ))
            ) : (
              clients.map((client, index) => (
              <TableRow
                key={client.id}
                hover
                sx={{ '&:hover': { bgcolor: 'grey.50' } }}
              >
                <TableCell>{index + 1}</TableCell>

                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'success.main',
                        width: 40,
                        height: 40,
                        fontSize: '0.875rem'
                      }}
                    >
                      {getInitials(client.name)}
                    </Avatar>
                    <Typography variant="body2" fontWeight="medium">
                      {client.name}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {client.accountNumber}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Box>
                    <Typography variant="body2">{client.email}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {client.phone}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap title={client.address}>
                    {client.address}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    label={client.clientType || 'residential'}
                    color={client.clientType === 'commercial' ? 'secondary' : 'primary'}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {client.numberOfUnits || 1}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" fontWeight="medium" color="primary.main">
                    KSH {parseFloat(client.monthlyRate || '0').toLocaleString()}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" fontWeight="medium" color="success.main">
                    KSH {(parseFloat(client.monthlyRate || '0') * (client.numberOfUnits || 1)).toLocaleString()}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    label={client.isActive === 1 ? 'Active' : 'Inactive'}
                    color={client.isActive === 1 ? 'success' : 'error'}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, client)}
                    size="small"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {clients.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <PersonIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No clients found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new client.'}
            </Typography>
          </Box>
        )}
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { mt: 1 }
        }}
      >
        <MenuItem onClick={() => menuClient && handleViewDetails(menuClient)}>
          <VisibilityIcon sx={{ mr: 2, fontSize: 20 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => menuClient && handleEdit(menuClient)}>
          <EditIcon sx={{ mr: 2, fontSize: 20 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuClient) {
              setClientToToggle(menuClient);
              setShowStatusDialog(true);
              handleMenuClose();
            }
          }}
          sx={{ color: 'primary.main' }}
        >
          {menuClient?.isActive === 1 ? <CancelIcon sx={{ mr: 2, fontSize: 20 }} /> : <CheckCircleIcon sx={{ mr: 2, fontSize: 20 }} />}
          {menuClient?.isActive === 1 ? 'Deactivate' : 'Activate'}
        </MenuItem>
        <MenuItem
          onClick={() => menuClient && handleDelete(menuClient)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 2, fontSize: 20 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Add Client Dialog */}
      <Dialog
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(45deg, #4CAF50 30%, #45A049 90%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 3
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AddIcon sx={{ fontSize: 28 }} />
            <Typography variant="h5" fontWeight="bold">
              Add New Client
            </Typography>
          </Box>
          <IconButton
            onClick={() => setShowAddModal(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleAdd}>
          <DialogContent sx={{ p: 4, bgcolor: 'grey.50', maxHeight: '60vh', overflowY: 'auto' }}>
            <Typography variant="h6" sx={{ mb: 3, color: 'text.primary', fontWeight: 600 }}>
              Client Information
            </Typography>

            {/* Personal Information Section */}
            <Card sx={{ mb: 3, boxShadow: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <PersonIcon color="primary" />
                  <Typography variant="h6" fontWeight="600">
                    Personal Details
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={addFormData.name}
                      onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                      required
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={addFormData.email}
                      onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                      required
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={addFormData.phone}
                      onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                      required
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Service Start Date"
                      type="date"
                      value={addFormData.serviceStartDate}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                        const pickUpDay = days[date.getDay()];
                        setAddFormData({ ...addFormData, serviceStartDate: e.target.value, pickUpDay });
                      }}
                      InputLabelProps={{ shrink: true }}
                      required
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      multiline
                      rows={3}
                      value={addFormData.address}
                      onChange={(e) => setAddFormData({ ...addFormData, address: e.target.value })}
                      required
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                            <LocationIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Service Configuration Section */}
            <Card sx={{ mb: 3, boxShadow: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <PaymentIcon color="primary" />
                  <Typography variant="h6" fontWeight="600">
                    Service Configuration
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required variant="outlined">
                      <InputLabel>Route</InputLabel>
                      <Select
                        value={addFormData.route}
                        label="Route"
                        onChange={(e) => setAddFormData({ ...addFormData, route: e.target.value })}
                        startAdornment={
                          <InputAdornment position="start">
                            <LocationIcon color="action" />
                          </InputAdornment>
                        }
                      >
                        {routes.filter(route => route.isActive).map(route => (
                          <MenuItem key={route.id} value={route.id}>
                            <Box>
                              <Typography variant="body1" fontWeight="medium">
                                {route.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {route.path}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required variant="outlined">
                      <InputLabel>Client Type</InputLabel>
                      <Select
                        value={addFormData.clientType}
                        label="Client Type"
                        onChange={(e) => setAddFormData({ ...addFormData, clientType: e.target.value })}
                      >
                        <MenuItem value="residential">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <PersonIcon color="primary" />
                            <Box>
                              <Typography>Residential</Typography>
                              <Typography variant="caption" color="text.secondary">Individual households</Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                        <MenuItem value="commercial">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <AccountBalanceIcon color="secondary" />
                            <Box>
                              <Typography>Commercial</Typography>
                              <Typography variant="caption" color="text.secondary">Businesses and offices</Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {addFormData.clientType === 'commercial' && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Number of Units"
                        type="number"
                        value={addFormData.numberOfUnits}
                        onChange={(e) => setAddFormData({ ...addFormData, numberOfUnits: parseInt(e.target.value) || 1 })}
                        required
                        inputProps={{ min: 1 }}
                        variant="outlined"
                        helperText="For commercial clients with multiple collection points"
                      />
                    </Grid>
                  )}

                  <Grid item xs={12} md={addFormData.clientType === 'commercial' ? 6 : 6}>
                    <TextField
                      fullWidth
                      label={addFormData.clientType === 'commercial' ? 'Monthly Rate per Unit (KSH)' : 'Monthly Rate (KSH)'}
                      type="number"
                      value={addFormData.monthlyRate}
                      onChange={(e) => setAddFormData({ ...addFormData, monthlyRate: parseFloat(e.target.value) || 0 })}
                      required
                      inputProps={{ min: 0 }}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PaymentIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      helperText={addFormData.clientType === 'commercial' ?
                        `Total: KSH ${(addFormData.monthlyRate * addFormData.numberOfUnits).toLocaleString()}` :
                        'Monthly service fee'
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Grace Period (Days)"
                      type="number"
                      value={addFormData.gracePeriod}
                      onChange={(e) => setAddFormData({ ...addFormData, gracePeriod: parseInt(e.target.value) || 5 })}
                      required
                      inputProps={{ min: 0, max: 30 }}
                      variant="outlined"
                      helperText="Days after due date before penalties apply"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required variant="outlined">
                      <InputLabel>Pickup Day</InputLabel>
                      <Select
                        value={addFormData.pickUpDay}
                        label="Pickup Day"
                        onChange={(e) => setAddFormData({ ...addFormData, pickUpDay: e.target.value })}
                      >
                        <MenuItem value="monday">Monday</MenuItem>
                        <MenuItem value="tuesday">Tuesday</MenuItem>
                        <MenuItem value="wednesday">Wednesday</MenuItem>
                        <MenuItem value="thursday">Thursday</MenuItem>
                        <MenuItem value="friday">Friday</MenuItem>
                        <MenuItem value="saturday">Saturday</MenuItem>
                        <MenuItem value="sunday">Sunday</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Documents Section */}
            <Card sx={{ boxShadow: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <UploadIcon color="primary" />
                  <Typography variant="h6" fontWeight="600">
                    Documents (Optional)
                  </Typography>
                </Box>

                <Box sx={{
                  border: '2px dashed #ddd',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  bgcolor: 'grey.50',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.50'
                  }
                }}>
                  <Button
                    variant="outlined"
                    component="label"
                    size="large"
                    startIcon={<UploadIcon />}
                    sx={{
                      py: 2,
                      px: 4,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem'
                    }}
                  >
                    Choose Files to Upload
                    <input
                      type="file"
                      hidden
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => setDocumentsFiles(e.target.files)}
                    />
                  </Button>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Upload client documents (PDF, Word, Images)
                  </Typography>
                  {documentsFiles && documentsFiles.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Chip
                        label={`${documentsFiles.length} file(s) selected`}
                        color="success"
                        variant="outlined"
                        icon={<CheckCircleIcon />}
                      />
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </DialogContent>

          <DialogActions sx={{ p: 4, bgcolor: 'white', borderTop: '1px solid #e0e0e0' }}>
            <Button
              onClick={() => setShowAddModal(false)}
              variant="outlined"
              size="large"
              sx={{ px: 4 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={addingClient}
              startIcon={addingClient ? <CircularProgress size={20} /> : <AddIcon />}
              size="large"
              sx={{
                px: 4,
                background: 'linear-gradient(45deg, #4CAF50 30%, #45A049 90%)',
                boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
              }}
            >
              {addingClient ? 'Adding Client...' : 'Add Client'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Edit Client
          <IconButton onClick={() => setShowEditModal(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleUpdate}>
          <DialogContent>
            <Box sx={{ ml: 3, mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editFormData.isActive}
                    onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                  />
                }
                label="Active Status"
              />
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={2}
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required variant="outlined">
                  <InputLabel>Pickup Day</InputLabel>
                  <Select
                    value={editFormData.pickUpDay}
                    label="Pickup Day"
                    onChange={(e) => setEditFormData({ ...editFormData, pickUpDay: e.target.value })}
                  >
                    <MenuItem value="monday">Monday</MenuItem>
                    <MenuItem value="tuesday">Tuesday</MenuItem>
                    <MenuItem value="wednesday">Wednesday</MenuItem>
                    <MenuItem value="thursday">Thursday</MenuItem>
                    <MenuItem value="friday">Friday</MenuItem>
                    <MenuItem value="saturday">Saturday</MenuItem>
                    <MenuItem value="sunday">Sunday</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Monthly Rate (KSH)"
                  type="number"
                  value={editFormData.monthlyRate}
                  onChange={(e) => setEditFormData({ ...editFormData, monthlyRate: parseFloat(e.target.value) || 0 })}
                  required
                  inputProps={{ min: 0 }}
                  variant="outlined"
                />
              </Grid>

              {/* Current Documents */}
              {selectedClient?.documents && selectedClient.documents.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Current Documents ({selectedClient.documents.length})
                  </Typography>
<Box sx={{ maxHeight: 300, overflow: 'auto' }}>
  <List>
    {selectedClient.documents.map((doc, index) => {
      const fileName = doc.split('/').pop() || `Document ${index + 1}`;
      const isMarkedForDeletion = documentsToDelete.includes(doc);

      return (
        <ListItem
          key={`edit-doc-${index}`}
          sx={{
            border: 1,
            borderColor: isMarkedForDeletion ? 'error.main' : 'divider',
            borderRadius: 1,
            mb: 1,
            bgcolor: isMarkedForDeletion ? 'error.light' : 'background.paper',
            opacity: isMarkedForDeletion ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            py: 1,
            px: 2
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {getFileIcon(fileName)}
          </ListItemIcon>
          <ListItemText
            primary={fileName}
            secondary={fileName.split('.').pop()?.toUpperCase() + ' file'}
            sx={{
              textDecoration: isMarkedForDeletion ? 'line-through' : 'none',
              flex: 1,
              mr: 2
            }}
          />
          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <IconButton
              size="small"
              onClick={() => window.open(organizationService.getSecureDocumentUrl(doc), '_blank')}
              sx={{ color: 'primary.main' }}
            >
              <VisibilityIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={async () => {
                try {
                  const response = await fetch(organizationService.getSecureDocumentUrl(doc));
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = fileName;
                  link.click();
                  window.URL.revokeObjectURL(url);
                } catch (error) {
                  console.error('Download failed:', error);
                }
              }}
              sx={{ color: 'info.main' }}
            >
              <DownloadIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDeleteDocumentInEditMode(doc)}
              color="error"
              disabled={deletingDocuments.has(doc)}
            >
              {deletingDocuments.has(doc) ? <CircularProgress size={16} /> : <DeleteIcon />}
            </IconButton>
          </Box>
        </ListItem>
      );
    })}
  </List>
</Box>                  {documentsToDelete.length > 0 && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      {documentsToDelete.length} document(s) will be permanently deleted when you update the client.
                    </Alert>
                  )}
                </Grid>
              )}

              {/* Add New Documents */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Add New Documents
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<UploadIcon />}
                  sx={{ py: 2 }}
                >
                  Upload Additional Documents
                  <input
                    type="file"
                    hidden
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => setEditDocumentsFiles(e.target.files)}
                  />
                </Button>
                {editDocumentsFiles && editDocumentsFiles.length > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {editDocumentsFiles.length} new file(s) selected
                  </Typography>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setShowEditModal(false)} disabled={updatingClient}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={updatingClient}
              startIcon={updatingClient ? <CircularProgress size={20} /> : <EditIcon />}
            >
              {updatingClient ? 'Updating...' : 'Update Client'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Client Details Dialog */}
      <Dialog
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Client Details
          <IconButton onClick={() => setShowDetailsModal(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {loadingClientDetails ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress size={40} />
              <Typography sx={{ ml: 2 }}>Loading client details...</Typography>
            </Box>
          ) : selectedClient && (
            <Box>
              {/* Client Info Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: 'success.main',
                    width: 80,
                    height: 80,
                    fontSize: '1.5rem'
                  }}
                >
                  {getInitials(selectedClient.name)}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {selectedClient.name}
                  </Typography>
                  <Chip
                    label={selectedClient.isActive === 1 ? 'Active' : 'Inactive'}
                    color={selectedClient.isActive === 1 ? 'success' : 'error'}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>

              <Tabs
                value={detailsTabValue}
                onChange={(_, newValue) => setDetailsTabValue(newValue)}
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
              >
                <Tab label="Basic Information" icon={<PersonIcon />} iconPosition="start" />
                <Tab label="Documents" icon={<DescriptionIcon />} iconPosition="start" />
                <Tab label="Payments" icon={<PaymentIcon />} iconPosition="start" />
                <Tab label="Invoices" icon={<ReceiptIcon />} iconPosition="start" />
              </Tabs>

              <TabPanel value={detailsTabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <EmailIcon color="primary" />
                          <Typography variant="h6">Email</Typography>
                        </Box>
                        <Typography>{selectedClient.email}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <PhoneIcon color="primary" />
                          <Typography variant="h6">Phone</Typography>
                        </Box>
                        <Typography>{selectedClient.phone}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <LocationIcon color="primary" />
                          <Typography variant="h6">Address</Typography>
                        </Box>
                        <Typography>{selectedClient.address}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <AccountBalanceIcon color="primary" />
                          <Typography variant="h6">Account Number</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                          {selectedClient.accountNumber}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <PaymentIcon color="primary" />
                          <Typography variant="h6">Monthly Rate</Typography>
                        </Box>
                        <Typography variant="h6" color="success.main">
                          KSH {selectedClient.monthlyRate?.toLocaleString() || 'N/A'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <CalendarIcon color="primary" />
                          <Typography variant="h6">Pickup Day</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {selectedClient.pickUpDay || 'Wednesday'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <LocationIcon color="primary" />
                          <Typography variant="h6">Route</Typography>
                        </Box>
                        <Typography variant="body2">
                          {selectedClient.route?.name ? (
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {selectedClient.route.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {selectedClient.route.path}
                              </Typography>
                              {selectedClient.route.active_drivers && selectedClient.route.active_drivers.length > 0 && (
                                <Typography variant="caption" color="primary.main" display="block">
                                  Active drivers: {selectedClient.route.active_drivers.map(d => d.name).join(', ')}
                                </Typography>
                              )}
                            </Box>
                          ) : (
                            selectedClient.routeId || 'N/A'
                          )}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <PersonIcon color="primary" />
                          <Typography variant="h6">Client Type</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {selectedClient.clientType || 'Residential'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <TodayIcon color="primary" />
                          <Typography variant="h6">Grace Period</Typography>
                        </Box>
                        <Typography variant="body2">
                          {selectedClient.gracePeriod || 5} days
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={detailsTabValue} index={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Documents ({selectedClient.documents?.length || 0})
                  </Typography>
                  <Button
                    variant={isDocumentEditMode ? "outlined" : "contained"}
                    onClick={() => setIsDocumentEditMode(!isDocumentEditMode)}
                    startIcon={isDocumentEditMode ? <CancelIcon /> : <EditIcon />}
                  >
                    {isDocumentEditMode ? 'Cancel Edit' : 'Edit Documents'}
                  </Button>
                </Box>

                {loadingClientDetails ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Loading documents...</Typography>
                  </Box>
                ) : selectedClient.documents && selectedClient.documents.length > 0 ? (
                  <Grid container spacing={2}>
                    {selectedClient.documents.map((doc, index) => {
                      const fileName = doc.split('/').pop() || `Document ${index + 1}`;
                      const isImage = isImageFile(fileName);

                      return (
                        <Grid item xs={12} sm={6} md={4}>
                          <Card
                            key={`doc-detail-${index}`}
                            variant="outlined"
                            sx={{
                              height: '100%',
                              transition: 'all 0.2s',
                              '&:hover': {
                                boxShadow: 3,
                                transform: 'translateY(-2px)'
                              }
                            }}
                          >
                            <Box sx={{ height: 160, overflow: 'hidden', position: 'relative' }}>
                              {isImage ? (
                                <img
                                  src={doc}
                                  alt={fileName}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                  onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.innerHTML = `
                                        <div style="display: flex; align-items: center; justify-content: center; height: 100%; background-color: #f5f5f5;">
                                          <div style="text-align: center; color: #666;">
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                              <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/>
                                            </svg>
                                            <div style="margin-top: 8px; font-size: 14px;">Image Preview</div>
                                          </div>
                                        </div>
                                      `;
                                    }
                                  }}
                                />
                              ) : (
                                <Box sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  height: '100%',
                                  bgcolor: 'grey.100'
                                }}>
                                  <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                                    {getFileIcon(fileName)}
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                      {fileName.split('.').pop()?.toUpperCase() || 'FILE'}
                                    </Typography>
                                  </Box>
                                </Box>
                              )}
                            </Box>
                            <CardContent>
                              <Typography
                                variant="body2"
                                fontWeight="medium"
                                noWrap
                                title={fileName}
                                gutterBottom
                              >
                                {fileName}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => window.open(organizationService.getSecureDocumentUrl(doc), '_blank')}
                                  startIcon={<VisibilityIcon />}
                                  sx={{ flex: 1, minWidth: 'auto' }}
                                >
                                  View
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(organizationService.getSecureDocumentUrl(doc));
                                      const blob = await response.blob();
                                      const url = window.URL.createObjectURL(blob);
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.download = fileName;
                                      link.click();
                                      window.URL.revokeObjectURL(url);
                                    } catch (error) {
                                      console.error('Download failed:', error);
                                    }
                                  }}
                                  startIcon={<DownloadIcon />}
                                  sx={{ flex: 1, minWidth: 'auto' }}
                                >
                                  Download
                                </Button>
                                {isDocumentEditMode && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    onClick={() => handleDeleteDocument(selectedClient.id, doc)}
                                    startIcon={deletingDocuments.has(doc) ? <CircularProgress size={16} /> : <DeleteIcon />}
                                    disabled={deletingDocuments.has(doc)}
                                    sx={{ flex: 1, minWidth: 'auto' }}
                                  >
                                    {deletingDocuments.has(doc) ? 'Deleting...' : 'Delete'}
                                  </Button>
                                )}
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <DescriptionIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No documents uploaded
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Documents will appear here once uploaded
                    </Typography>
                  </Box>
                )}

                {/* Add New Documents Section - Only in Edit Mode */}
                {isDocumentEditMode && (
                  <Card variant="outlined" sx={{ mt: 3, bgcolor: 'blue.50' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Add New Documents
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Button
                          variant="outlined"
                          component="label"
                          fullWidth
                          startIcon={<UploadIcon />}
                          sx={{ py: 2 }}
                        >
                          Choose Files to Upload
                          <input
                            type="file"
                            hidden
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => setNewDocumentsFiles(e.target.files)}
                          />
                        </Button>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Upload client documents (PDF, Word, Images)
                        </Typography>
                      </Box>
                      {newDocumentsFiles && newDocumentsFiles.length > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2">
                            {newDocumentsFiles.length} file(s) selected
                          </Typography>
                          <Button
                            variant="contained"
                            onClick={handleAddNewDocuments}
                            disabled={addingNewDocuments}
                            startIcon={addingNewDocuments ? <CircularProgress size={20} /> : <UploadIcon />}
                          >
                            {addingNewDocuments ? 'Adding...' : 'Add Documents'}
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabPanel>

              <TabPanel value={detailsTabValue} index={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Payment History
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    size="small"
                    onClick={handleExportPayments}
                    disabled={!clientPayments.length}
                  >
                    Export
                  </Button>
                </Box>
                
                {/* Payment History */}
                {loadingPayments ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Loading payment history...</Typography>
                  </Box>
                ) : clientPayments.length > 0 ? (
                  <Box>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'grey.50' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Method</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Receipt</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Invoices Processed</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Allocated Amount</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Remaining Amount</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {clientPayments.map((payment, index) => (
                            <TableRow key={payment.id || index} hover>
                              <TableCell>
                                <Typography variant="body2">
                                  {new Date(payment.trans_time || payment.created_at).toLocaleDateString()}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(payment.trans_time || payment.created_at).toLocaleTimeString()}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium" color="success.main">
                                  KSH {parseFloat(payment.amount || '0').toLocaleString()}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={payment.payment_method || 'Unknown'} 
                                  size="small" 
                                  variant="outlined"
                                  color={payment.payment_method === 'mpesa' ? 'success' : 'default'}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {payment.phone_number || 'N/A'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                  {payment.trans_id || 'N/A'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={
                                    payment.status === 'fully_allocated' ? 'Fully Allocated' :
                                    payment.status === 'partially_allocated' ? 'Partially Allocated' :
                                    payment.status === 'not_allocated' ? 'Not Allocated' :
                                    payment.status || 'Unknown'
                                  } 
                                  size="small"
                                  color={
                                    payment.status === 'fully_allocated' ? 'success' : 
                                    payment.status === 'partially_allocated' ? 'warning' : 
                                    'error'
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Box>
                                  {payment.invoices_processed && payment.invoices_processed.length > 0 ? (
                                    payment.invoices_processed.map((invoiceNumber, idx) => (
                                      <Chip
                                        key={idx}
                                        label={invoiceNumber}
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                        sx={{ mr: 0.5, mb: 0.5 }}
                                      />
                                    ))
                                  ) : (
                                    <Typography variant="caption" color="text.secondary">
                                      No invoices processed
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium" color="success.main">
                                  KSH {parseFloat(payment.allocated_amount || '0').toLocaleString()}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography 
                                  variant="body2" 
                                  fontWeight="medium" 
                                  color={parseFloat(payment.remaining_amount || '0') > 0 ? 'warning.main' : 'text.secondary'}
                                >
                                  KSH {parseFloat(payment.remaining_amount || '0').toLocaleString()}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    
                    {/* Payment Pagination */}
                    {paymentPagination && paymentPagination.totalPages > 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button 
                          onClick={() => setPaymentPage(paymentPage - 1)}
                          disabled={paymentPage === 1}
                          size="small"
                        >
                          Previous
                        </Button>
                        <Typography sx={{ mx: 2, alignSelf: 'center' }}>
                          Page {paymentPage} of {paymentPagination.totalPages}
                        </Typography>
                        <Button 
                          onClick={() => setPaymentPage(paymentPage + 1)}
                          disabled={paymentPage === paymentPagination.totalPages}
                          size="small"
                        >
                          Next
                        </Button>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <PaymentIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No Payment History
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          This client has no payment records yet
                        </Typography>
                        <Button 
                          variant="outlined" 
                          sx={{ mt: 2 }}
                          onClick={fetchClientPayments}
                        >
                          Refresh
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </TabPanel>

              <TabPanel value={detailsTabValue} index={3}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Invoice History
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      size="small"
                      onClick={() => setShowCreateInvoiceModal(true)}
                    >
                      Create Invoice
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      size="small"
                      onClick={handleExportInvoices}
                      disabled={!clientInvoices.length}
                    >
                      Export
                    </Button>
                  </Box>
                </Box>
                
                {/* Invoice History */}
                {loadingInvoices ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Loading invoice history...</Typography>
                  </Box>
                ) : clientInvoices.length > 0 ? (
                  <Box>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'grey.50' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Invoice #</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Issue Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Total Amount</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Amount Paid</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Balance</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Transaction IDs</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Payment Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {clientInvoices.map((invoice, index) => {
                            const remainingBalance = parseFloat(invoice.amount || '0') - parseFloat(invoice.paid_amount || '0');
                            const isOverdue = new Date() > new Date(invoice.due_date) && remainingBalance > 0;
                            return (
                              <TableRow 
                                key={invoice.id || index} 
                                hover
                                sx={{
                                  bgcolor: isOverdue ? 'error.50' : 'inherit',
                                  '&:hover': {
                                    bgcolor: isOverdue ? 'error.100' : 'grey.50'
                                  }
                                }}
                              >
                                <TableCell>
                                  <Typography variant="body2" fontWeight="medium">
                                    {invoice.invoice_number || `INV-${invoice.id}`}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {new Date(invoice.created_at).toLocaleDateString()}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography 
                                    variant="body2" 
                                    color={isOverdue ? 'error.main' : 'inherit'}
                                    fontWeight={isOverdue ? 'medium' : 'normal'}
                                  >
                                    {new Date(invoice.due_date).toLocaleDateString()}
                                    {isOverdue && (
                                      <Typography variant="caption" color="error.main" display="block">
                                        {Math.ceil((new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                                      </Typography>
                                    )}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontWeight="medium">
                                    KSH {parseFloat(invoice.amount || '0').toLocaleString()}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" color="success.main">
                                    KSH {parseFloat(invoice.paid_amount || '0').toLocaleString()}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography 
                                    variant="body2" 
                                    fontWeight="medium"
                                    color={(parseFloat(invoice.amount || '0') - parseFloat(invoice.paid_amount || '0')) > 0 ? 'error.main' : 'success.main'}
                                  >
                                    KSH {(parseFloat(invoice.amount || '0') - parseFloat(invoice.paid_amount || '0')).toLocaleString()}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Box>
                                    {invoice.transaction_ids && invoice.transaction_ids.length > 0 ? (
                                      invoice.transaction_ids.map((transId, idx) => (
                                        <Chip
                                          key={idx}
                                          label={transId}
                                          size="small"
                                          variant="outlined"
                                          color="info"
                                          sx={{ mr: 0.5, mb: 0.5, fontFamily: 'monospace', fontSize: '0.75rem' }}
                                        />
                                      ))
                                    ) : (
                                      <Typography variant="caption" color="text.secondary">
                                        No payments
                                      </Typography>
                                    )}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={
                                      invoice.payment_status === 'fully_paid' ? 'Paid' :
                                      invoice.payment_status === 'partially_paid' ? 'Partial' :
                                      invoice.payment_status === 'unpaid' ? 'Unpaid' :
                                      invoice.payment_status || 'Unknown'
                                    }
                                    size="small"
                                    color={
                                      invoice.payment_status === 'fully_paid' ? 'success' :
                                      invoice.payment_status === 'partially_paid' ? 'warning' :
                                      'error'
                                    }
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    
                    {/* Invoice Summary */}
                    <Card variant="outlined" sx={{ mt: 2, bgcolor: 'grey.50' }}>
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Total Invoiced</Typography>
                            <Typography variant="h6">
                              KSH {clientInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount || '0'), 0).toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Total Paid</Typography>
                            <Typography variant="h6" color="success.main">
                              KSH {clientInvoices.reduce((sum, inv) => sum + parseFloat(inv.paid_amount || '0'), 0).toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Outstanding Balance</Typography>
                            <Typography variant="h6" color="error.main">
                              KSH {clientInvoices.reduce((sum, inv) => sum + (parseFloat(inv.amount || '0') - parseFloat(inv.paid_amount || '0')), 0).toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Overdue Invoices</Typography>
                            <Typography variant="h6" color="warning.main">
                              {clientInvoices.filter(inv => new Date() > new Date(inv.due_date) && (parseFloat(inv.amount || '0') - parseFloat(inv.paid_amount || '0')) > 0).length}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                    
                    {/* Invoice Pagination */}
                    {invoicePagination && invoicePagination.totalPages > 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button 
                          onClick={() => setInvoicePage(invoicePage - 1)}
                          disabled={invoicePage === 1}
                          size="small"
                        >
                          Previous
                        </Button>
                        <Typography sx={{ mx: 2, alignSelf: 'center' }}>
                          Page {invoicePage} of {invoicePagination.totalPages}
                        </Typography>
                        <Button 
                          onClick={() => setInvoicePage(invoicePage + 1)}
                          disabled={invoicePage === invoicePagination.totalPages}
                          size="small"
                        >
                          Next
                        </Button>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <ReceiptIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No Invoice History
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          This client has no invoices yet
                        </Typography>
                        <Button 
                          variant="outlined" 
                          sx={{ mt: 2 }}
                          onClick={fetchClientInvoices}
                        >
                          Refresh
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </TabPanel>

              <TabPanel value={detailsTabValue} index={4}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Bag Distribution History
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    size="small"
                  >
                    Export
                  </Button>
                </Box>
                
                {/* Date Filters */}
                <Card variant="outlined" sx={{ mb: 3, bgcolor: 'grey.50' }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FilterIcon fontSize="small" />
                      Filter by Date Range
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Start Date"
                          type="date"
                          size="small"
                          value={bagStartDate}
                          onChange={(e) => setBagStartDate(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <TodayIcon fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="End Date"
                          type="date"
                          size="small"
                          value={bagEndDate}
                          onChange={(e) => setBagEndDate(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <TodayIcon fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setBagStartDate('');
                              setBagEndDate('');
                            }}
                          >
                            Clear
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={fetchClientBags}
                          >
                            Apply Filter
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                
                {/* Bag Distribution History */}
                {loadingBags ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Loading bag distribution history...</Typography>
                  </Box>
                ) : clientBags.length > 0 ? (
                  <Box>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'grey.50' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Distribution Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Number of Bags</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Delivered By</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Recipient Email</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Verification Code</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Verified At</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Notes</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {clientBags.map((bag, index) => (
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
                                  <BagIcon color="action" fontSize="small" />
                                  <Typography variant="body2" fontWeight="medium">
                                    {bag.number_of_bags}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {bag.driver?.name || bag.Driver?.name || 'Unknown Driver'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {bag.driver?.email || bag.Driver?.email || ''}
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
                    
                    {/* Bag Summary */}
                    <Card variant="outlined" sx={{ mt: 2, bgcolor: 'grey.50' }}>
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Total Distributions</Typography>
                            <Typography variant="h6">
                              {clientBags.length}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Total Bags Delivered</Typography>
                            <Typography variant="h6" color="primary.main">
                              {clientBags.reduce((sum, bag) => sum + (bag.number_of_bags || 0), 0)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Verified Distributions</Typography>
                            <Typography variant="h6" color="success.main">
                              {clientBags.filter(bag => bag.is_verified).length}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Pending Verification</Typography>
                            <Typography variant="h6" color="warning.main">
                              {clientBags.filter(bag => !bag.is_verified).length}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                    
                    {/* Bag Pagination */}
                    {bagPagination && bagPagination.totalPages > 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button 
                          onClick={() => setBagPage(bagPage - 1)}
                          disabled={bagPage === 1}
                          size="small"
                        >
                          Previous
                        </Button>
                        <Typography sx={{ mx: 2, alignSelf: 'center' }}>
                          Page {bagPage} of {bagPagination.totalPages}
                        </Typography>
                        <Button 
                          onClick={() => setBagPage(bagPage + 1)}
                          disabled={bagPage === bagPagination.totalPages}
                          size="small"
                        >
                          Next
                        </Button>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <BagIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No Bag Distribution History
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          This client has no bag distribution records
                          {(bagStartDate || bagEndDate) && ' for the selected date range'}
                        </Typography>
                        <Button 
                          variant="outlined" 
                          sx={{ mt: 2 }}
                          onClick={fetchClientBags}
                        >
                          Refresh
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </TabPanel>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setShowDetailsModal(false);
              setIsDocumentEditMode(false);
              setNewDocumentsFiles(null);
            }}
            variant="outlined"
            fullWidth
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccessSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSuccessSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setShowSuccessSnackbar(false)}
          severity="success"
          variant="filled"
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Create Invoice Dialog */}
      <Dialog
        open={showCreateInvoiceModal}
        onClose={() => setShowCreateInvoiceModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(45deg, #2196F3 30%, #1976D2 90%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 3
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ReceiptIcon sx={{ fontSize: 28 }} />
            <Typography variant="h5" fontWeight="bold">
              Create Invoice
            </Typography>
          </Box>
          <IconButton
            onClick={() => setShowCreateInvoiceModal(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleCreateInvoice}>
          <DialogContent sx={{ p: 4, bgcolor: 'grey.50' }}>
            <Card sx={{ boxShadow: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Invoice Title"
                      value={invoiceFormData.title}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, title: e.target.value })}
                      required
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DescriptionIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Amount (KSH)"
                      type="number"
                      value={invoiceFormData.amount}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, amount: parseFloat(e.target.value) || 0 })}
                      required
                      variant="outlined"
                      inputProps={{ min: 0, step: 0.01 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PaymentIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Due Date"
                      type="date"
                      value={invoiceFormData.due_date}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, due_date: e.target.value })}
                      required
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={4}
                      value={invoiceFormData.description}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, description: e.target.value })}
                      variant="outlined"
                      placeholder="Enter invoice description or notes..."
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                            <DescriptionIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </DialogContent>
          <DialogActions sx={{ p: 4, bgcolor: 'white', borderTop: '1px solid #e0e0e0' }}>
            <Button
              onClick={() => setShowCreateInvoiceModal(false)}
              disabled={creatingInvoice}
              variant="outlined"
              size="large"
              sx={{ px: 4 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={creatingInvoice}
              startIcon={creatingInvoice ? <CircularProgress size={20} /> : <ReceiptIcon />}
              size="large"
              sx={{
                px: 4,
                background: 'linear-gradient(45deg, #2196F3 30%, #1976D2 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
              }}
            >
              {creatingInvoice ? 'Creating...' : 'Create Invoice'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Status Toggle Confirmation Dialog */}
      <Dialog open={showStatusDialog} onClose={() => !togglingStatus && setShowStatusDialog(false)}>
        <DialogTitle>
          {clientToToggle?.isActive === 1 ? 'Deactivate Client' : 'Activate Client'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {clientToToggle?.isActive === 1 ? 'deactivate' : 'activate'} <strong>{clientToToggle?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStatusDialog(false)} disabled={togglingStatus}>
            Cancel
          </Button>
          <Button 
            onClick={async () => {
              if (!clientToToggle) return;
              
              setTogglingStatus(true);
              try {
                const newStatus = clientToToggle.isActive === 1 ? false : true;
                await organizationService.toggleClientStatus(clientToToggle.id, newStatus);
                
                // Update client status in the list
                setClients(prev => prev.map(client => 
                  client.id === clientToToggle.id 
                    ? { ...client, isActive: newStatus ? 1 : 0 }
                    : client
                ));
                
                setSuccessMessage(`Client ${newStatus ? 'activated' : 'deactivated'} successfully!`);
                setShowSuccessSnackbar(true);
                setShowStatusDialog(false);
                setClientToToggle(null);
              } catch (error) {
                console.error('Failed to toggle client status:', error);
              } finally {
                setTogglingStatus(false);
              }
            }}
            color="primary"
            variant="contained"
            disabled={togglingStatus}
            startIcon={togglingStatus ? <CircularProgress size={20} /> : (clientToToggle?.isActive === 1 ? <CancelIcon /> : <CheckCircleIcon />)}
          >
            {togglingStatus ? (clientToToggle?.isActive === 1 ? 'Deactivating...' : 'Activating...') : (clientToToggle?.isActive === 1 ? 'Deactivate' : 'Activate')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => !deleting && setShowDeleteDialog(false)}>
        <DialogTitle>Delete Client</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{clientToDelete?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={showErrorSnackbar}
        autoHideDuration={8000}
        onClose={() => setShowErrorSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setShowErrorSnackbar(false)}
          severity="error"
          variant="filled"
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};