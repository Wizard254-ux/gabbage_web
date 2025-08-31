// @ts-nocheck
import React, { useState } from "react";
import { format } from "date-fns";

interface Pickup {
  id: number;
  client_id: number;
  client: {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  route_id: number;
  route: {
    id: number;
    name: string;
    path: string;
  };
  driver_id: number | null;
  driver?: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  pickup_date: string;
  pickup_status: "scheduled" | "picked" | "missed";
  picked_at: string | null;
  created_at: string;
}

interface Driver {
  id: number;
  name: string;
}

interface PickupTableProps {
  pickups: Pickup[];
  drivers: Driver[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onStatusUpdate: (id: string, status: string, driverId?: string) => void;
}

export const PickupTable: React.FC<PickupTableProps> = ({
  pickups,
  drivers,
  currentPage,
  totalPages,
  onPageChange,
  onStatusUpdate,
}) => {
  const [editingPickup, setEditingPickup] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");

  // Function to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return format(date, "dd/MM/yyyy");
  };

  // Function to get status badge color
  const getStatusBadge = (status: string | undefined | null) => {
    if (!status) return "bg-gray-500 text-white";
    switch (status.toLowerCase()) {
      case "picked":
        return "bg-green-500 text-white";
      case "scheduled":
        return "bg-yellow-500 text-white";
      case "missed":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Calculate the starting index for the current page
  const startIndex =
    (currentPage - 1) * (pickups.length > 0 ? pickups.length : 10);

  const handleEdit = (pickup: Pickup) => {
    setEditingPickup(pickup.id.toString());
    setSelectedStatus(pickup.pickup_status);
    setSelectedDriverId(pickup.driver_id?.toString() || "");
  };

  const handleSave = (id: string) => {
    onStatusUpdate(id, selectedStatus, selectedDriverId || undefined);
    setEditingPickup(null);
  };

  const handleCancel = () => {
    setEditingPickup(null);
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 border-b text-left">#</th>
              <th className="py-3 px-4 border-b text-left">Client</th>
              <th className="py-3 px-4 border-b text-left">Route</th>
              <th className="py-3 px-4 border-b text-left">Pickup</th>
              <th className="py-3 px-4 border-b text-left">Scheduled </th>
              <th className="py-3 px-4 border-b text-left">Week</th>
              <th className="py-3 px-4 border-b text-left">Status</th>
              <th className="py-3 px-4 border-b text-left">Driver</th>
              <th className="py-3 px-4 border-b text-left">Completed </th>
              {/* <th className="py-3 px-4 border-b text-left">Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {pickups.map((pickup, index) => (
              <tr key={pickup.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b">{startIndex + index + 1}</td>
                <td className="py-3 px-4 border-b">
                  {pickup.client?.name || "Unknown Client"}
                </td>
                <td className="py-3 px-4 border-b">
                  {pickup.route?.name || "Unknown Route"} -{" "}
                  {pickup.route?.path || ""}
                </td>
                <td className="py-3 px-4 border-b">
                  {pickup.created_at &&
                  !isNaN(new Date(pickup.created_at).getTime())
                    ? format(new Date(pickup.created_at), "EEEE")
                    : "Unknown"}
                </td>
                <td className="py-3 px-4 border-b">
                  {formatDate(pickup.pickup_date)}
                </td>
                <td className="py-3 px-4 border-b">
                  {pickup.created_at &&
                  !isNaN(new Date(pickup.created_at).getTime())
                    ? `${Math.ceil(
                        new Date(pickup.created_at).getDate() / 7
                      )}th of ${format(new Date(pickup.created_at), "MMMM")}`
                    : "Unknown"}
                </td>
                <td className="py-3 px-4 border-b">
                  {editingPickup === pickup.id.toString() ? (
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="picked">Picked</option>
                      <option value="missed">Missed</option>
                    </select>
                  ) : (
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(
                        pickup.pickup_status
                      )}`}
                    >
                      {pickup.pickup_status
                        ? pickup.pickup_status.charAt(0).toUpperCase() +
                          pickup.pickup_status.slice(1)
                        : "Unknown"}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 border-b">
                  {editingPickup === pickup.id.toString() ? (
                    <select
                      value={selectedDriverId}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="">Unassigned</option>
                      {drivers?.map((driver) => (
                        <option key={driver?.id} value={driver?.id}>
                          {driver?.name || "Unknown Driver"}
                        </option>
                      )) || []}
                    </select>
                  ) : (
                    pickup.driver?.name || "Unassigned"
                  )}
                </td>
                <td className="py-3 px-4 border-b">
                  {pickup.picked_at ? formatDate(pickup.picked_at) : "-"}
                </td>
                {/* <td className="py-3 px-4 border-b">
                  {editingPickup === pickup.id.toString() ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSave(pickup.id.toString())}
                        className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(pickup)}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                    >
                      Edit
                    </button>
                  )}
                </td> */}
              </tr>
            ))}
            {pickups.length === 0 && (
              <tr>
                <td colSpan={10} className="py-4 text-center text-gray-500">
                  No pickups found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-4">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${
              currentPage === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white border border-gray-300 hover:bg-gray-100"
            }`}
          >
            &laquo;
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${
              currentPage === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white border border-gray-300 hover:bg-gray-100"
            }`}
          >
            &lsaquo;
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded ${
                page === currentPage
                  ? "bg-green-600 text-white"
                  : "bg-white border border-gray-300 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white border border-gray-300 hover:bg-gray-100"
            }`}
          >
            &rsaquo;
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white border border-gray-300 hover:bg-gray-100"
            }`}
          >
            &raquo;
          </button>
        </div>
      </div>
    </div>
  );
};
