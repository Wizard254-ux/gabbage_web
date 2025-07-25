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
  _id: string;
  name: string;
  path: string;
}

interface Driver {
  _id: string;
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
      const params: any = { page, limit: 10 };
      
      // Add filters if they exist
      if (status) params.status = status;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (selectedRouteId) params.routeId = selectedRouteId;
      if (selectedDriverId) params.driverId = selectedDriverId;
      if (selectedPickupDay) params.pickupDay = selectedPickupDay;
      
      const response = await organizationService.getPickups(params);
      
      if (response.data.success) {
        setPickups(response.data.data);
        setPagination(response.data.pagination);
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
      if (response.data.success) {
        setRoutes(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch routes:', err);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await organizationService.getPickupDrivers();
      if (response.data.success) {
        setDrivers(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch drivers:', err);
    }
  };

  useEffect(() => {
    fetchPickups();
    fetchRoutes();
    fetchDrivers();
  }, []);

  const handlePageChange = (page: number) => {
    fetchPickups(page);
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPickups(1); // Reset to first page when filtering
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
      <h1 className="text-2xl font-bold mb-6">Pickups</h1>
      
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
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="missed">Missed</option>
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
                    <option key={route._id} value={route._id}>
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
                    <option key={driver._id} value={driver._id}>
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
    </div>
  );
};