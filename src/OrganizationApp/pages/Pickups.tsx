import React, { useEffect, useState } from 'react';
import { organizationService } from '../../services/organizationService';
import { PickupTable } from '../components/PickupTable';

interface Pickup {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    accountNumber: string;
  };
  routeId: {
    _id: string;
    name: string;
    path: string;
  };
  driverId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  scheduledDate: string;
  status: 'scheduled' | 'completed' | 'missed';
  completedAt: string | null;
  notes: string;
  createdAt: string;
}

interface Route {
  id: number;
  name: string;
  path: string;
}

interface Driver {
  id: number;
  name: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalPickups: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const Pickups: React.FC = () => {
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalPickups: 0,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [status, setStatus] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [selectedPickupDay, setSelectedPickupDay] = useState<string>('');

  const fetchPickups = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params: any = { page, limit: 50 };
      
      // Add filters if they exist
      if (status) params.status = status;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (selectedRouteId) params.route_id = selectedRouteId;
      if (selectedDriverId) params.driver_id = selectedDriverId;
      if (selectedPickupDay) params.pickup_day = selectedPickupDay;
      
      console.log('Filter states:', { status, startDate, endDate, selectedRouteId, selectedDriverId, selectedPickupDay });
      console.log('Final params:', params);
      
      const response = await organizationService.getPickups(params);
      
      if (response.data.status) {
        const responseData = response.data.data;
        let allPickups = [];
        
        // Handle different response formats
        if (responseData?.pickups) {
          allPickups = responseData.pickups;
        } else if (responseData?.picked || responseData?.unpicked) {
          // Combine picked and unpicked arrays
          allPickups = [...(responseData.picked || []), ...(responseData.unpicked || [])];
        } else if (Array.isArray(responseData)) {
          // Direct array response
          allPickups = responseData;
        }
        
        setPickups(allPickups);
        console.log('pickups ', responseData)
        // Use pagination from API response or set default
        setPagination(responseData?.pagination || {
          currentPage: page,
          totalPages: Math.ceil(allPickups.length / 50),
          totalPickups: allPickups.length,
          hasNext: false,
          hasPrev: false
        });
      } else {
        setError('Failed to fetch pickups');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching pickups');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await organizationService.getPickupRoutes();
      if (response.data.status) {
        setRoutes(response.data.data?.data || []);
        console.log('fetched routes ', response.data)
      }
    } catch (err) {
      console.error('Failed to fetch routes:', err);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await organizationService.getPickupDrivers();
      if (response.data.status) {
        setDrivers(response.data.data?.users || []);
        console.log('fetched drivers ', response.data.data)
      }
    } catch (err) {
      console.error('Failed to fetch drivers:', err);
    }
  };

  useEffect(() => {
    fetchPickups();
    fetchRoutes();
    fetchDrivers();
    fetchClients();
  }, []);

  const handlePageChange = (page: number) => {
    fetchPickups(page);
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPickups(1); // This will use the current filter state values
  };

  const handleClearFilters = () => {
    setStatus('');
    setStartDate('');
    setEndDate('');
    setSelectedRouteId('');
    setSelectedDriverId('');
    setSelectedPickupDay('');
    fetchPickups(1);
  };

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [pickupDate, setPickupDate] = useState<string>('');
  const [pickupStatus, setPickupStatus] = useState<string>('unpicked');
  const [clients, setClients] = useState<any[]>([]);
  const [clientSearchTerm, setClientSearchTerm] = useState<string>('');
  const [searchedClients, setSearchedClients] = useState<any[]>([]);

  const fetchClients = async () => {
    try {
      const response = await organizationService.listClients();
      if (response.data.status) {
        setClients(response.data.data?.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    }
  };

  const handleCreatePickup = async () => {
    try {
      setLoading(true);
      const response = await organizationService.createPickup({
        client_id: selectedClient,
        driver_id: selectedDriver || null,
        pickup_date: pickupDate,
        status: pickupStatus
      });
      if (response.data.status) {
        alert('Pickup created successfully');
        // Append new pickup to existing list
        const newPickup = response.data.data.pickup;
        setPickups(prevPickups => [newPickup, ...prevPickups]);
        setShowCreateModal(false);
        // Reset form
        setSelectedClient('');
        setSelectedDriver('');
        setPickupDate('');
        setPickupStatus('unpicked');
        setClientSearchTerm('');
        setSearchedClients([]);
      }
    } catch (err: any) {
      alert('Failed to create pickup: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClients = async () => {
    if (!clientSearchTerm.trim()) return;
    
    try {
      const response = await organizationService.searchClients({ name: clientSearchTerm });
      if (response.data.status) {
        setSearchedClients(response.data.data?.users || []);
      }
    } catch (err) {
      console.error('Failed to search clients:', err);
    }
  };

  const handleStatusUpdate = async (id: string, status: string, driverId?: string) => {
    try {
      await organizationService.updatePickupStatus(id, { status, driverId });
      fetchPickups(pagination.currentPage); // Refresh current page
    } catch (err) {
      console.error('Failed to update pickup status:', err);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 font-medium">
          Filter Pickups
        </div>
        <div className="p-4">
          <form onSubmit={handleFilterSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">All Statuses</option>
                  <option value="unpicked">Unpicked</option>
                  <option value="picked">Picked</option>
                  <option value="skipped">Skipped</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                <select 
                  value={selectedRouteId} 
                  onChange={(e) => setSelectedRouteId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">All Routes</option>
                  {routes.map(route => (
                    <option key={route.id} value={route.id}>
                      {route.name} - {route.path}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                <select 
                  value={selectedDriverId} 
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">All Drivers</option>
                  <option value="unassigned">Unassigned</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Day</label>
                <select 
                  value={selectedPickupDay} 
                  onChange={(e) => setSelectedPickupDay(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">All Days</option>
                  <option value="monday">Monday</option>
                  <option value="tuesday">Tuesday</option>
                  <option value="wednesday">Wednesday</option>
                  <option value="thursday">Thursday</option>
                  <option value="friday">Friday</option>
                  <option value="saturday">Saturday</option>
                  <option value="sunday">Sunday</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button 
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Apply Filters
              </button>
              <button 
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Clear Filters
              </button>
              <button 
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Create Pickup
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 font-medium">
          Pickup List
        </div>
        <div className="p-4">
          {loading ? (
            <div className="text-center py-8">Loading pickups...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <PickupTable 
              pickups={pickups} 
              drivers={drivers}
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              onStatusUpdate={handleStatusUpdate}
            />
          )}
        </div>
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
          Showing {pickups.length} of {pagination.totalPickups} pickups
        </div>
      </div>

      {/* Create Pickup Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Create Pickup</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Search</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={clientSearchTerm}
                    onChange={(e) => setClientSearchTerm(e.target.value)}
                    placeholder="Enter client name"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <button
                    type="button"
                    onClick={handleSearchClients}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Search
                  </button>
                </div>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Select Client</option>
                  {(searchedClients.length > 0 ? searchedClients : clients).map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Unassigned</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={pickupStatus}
                  onChange={(e) => setPickupStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="unpicked">Unpicked</option>
                  <option value="picked">Picked</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePickup}
                disabled={!selectedClient || !pickupDate || loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Pickup'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};