"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { server } from "../../constants/config";

export default function MyWithdrawls() {
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch withdrawal history
  const fetchWithdrawalHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await axios.get(
        `${server}api/v1/payment/user-withdrawal-history`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setWithdrawalHistory(response.data.history || []);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch withdrawal history"
        );
      }
    } catch (err) {
      console.error("Error fetching withdrawal history:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      toast.error("Failed to load withdrawal history");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawalHistory();
  }, [fetchWithdrawalHistory, refreshTrigger]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle withdrawal request form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.post(
        `${server}api/v1/payment/withdrawal-request`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Withdrawal request submitted successfully!");
        setShowRequestModal(false);
        setFormData({
          amount: "",
        });
        // Refresh the withdrawal history
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit request");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format amount
  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Capitalize first letter
  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Withdrawal History Section */}
      <div className="overflow-x-auto bg-white rounded-lg shadow border border-[rgb(var(--color-border))]">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold leading-none tracking-tight text-[rgb(var(--color-text-primary))]">
            My Withdrawal History
          </h3>
          <button
            onClick={() => setShowRequestModal(true)}
            className="inline-flex items-center justify-center rounded-md bg-[rgb(var(--color-primary))] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[rgb(var(--color-primary-dark))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Request Withdrawal
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[rgb(var(--color-primary))]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md m-4">
            <p>Error: {error}</p>
            <button
              onClick={() => {
                setError(null);
                setRefreshTrigger((prev) => prev + 1);
              }}
              className="mt-2 text-sm font-medium text-red-700 underline hover:text-red-800"
            >
              Try again
            </button>
          </div>
        ) : withdrawalHistory.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md m-4">
            <p>
              You haven&apos;t made any withdrawal requests yet. Use the
              &quot;Request Withdrawal&quot; button to make your first request.
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>

                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {withdrawalHistory.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(item.createdAt)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatAmount(item.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {capitalize(item.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Request Withdrawal Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">Request Withdrawal</h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Amount*
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="p-4 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[rgb(var(--color-primary))] rounded-md text-white hover:bg-opacity-90 transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
