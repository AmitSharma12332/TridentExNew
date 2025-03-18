"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { server } from "../../constants/config"

export default function AdminDashboard() {
  const [withdrawalHistory, setWithdrawalHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null)
  const [actionType, setActionType] = useState("") // "approve" or "reject"
  const [isProcessing, setIsProcessing] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [formData, setFormData] = useState({
    amount: "",
    accNo: "",
    ifsc: "",
    contact: "",
    bankName: "",
    receiverName: "",
  })

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Fetch withdrawal history
  const fetchWithdrawalHistory = useCallback(async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await axios.get(`${server}api/v1/payment/withdrawal-history`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.success) {
        setWithdrawalHistory(response.data.history || [])
      } else {
        throw new Error(response.data.message || "Failed to fetch withdrawal history")
      }
    } catch (err) {
      console.error("Error fetching withdrawal history:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast.error("Failed to load withdrawal history")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWithdrawalHistory()
  }, [fetchWithdrawalHistory, refreshTrigger])

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Handle withdrawal request form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem("authToken")

    try {
      const response = await axios.post(`${server}api/v1/payment/withdrawal-request`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.success) {
        toast.success("Withdrawal request submitted successfully!")
        setShowRequestModal(false)
        setFormData({
          amount: "",
          accNo: "",
          ifsc: "",
          contact: "",
          bankName: "",
          receiverName: "",
        })
        // Refresh the withdrawal history
        setRefreshTrigger((prev) => prev + 1)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit request")
    }
  }

  // Handle withdrawal status update
  const handleStatusUpdate = async () => {
    if (!selectedWithdrawal || !actionType) return

    setIsProcessing(true)
    const token = localStorage.getItem("authToken")

    try {
      const response = await axios.post(
        `${server}api/v1/payment/withdrawal-status`,
        {
          withdrawId: selectedWithdrawal._id,
          status: actionType === "approve" ? "approved" : "rejected",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (response.data.success) {
        toast.success(`Withdrawal ${actionType === "approve" ? "approved" : "rejected"} successfully`)

        // Refresh data after update
        setRefreshTrigger((prev) => prev + 1)
      } else {
        throw new Error(response.data.message || `Failed to ${actionType} withdrawal`)
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          `An error occurred while ${actionType === "approve" ? "approving" : "rejecting"} the withdrawal`,
      )
      console.error(`Error ${actionType}ing withdrawal:`, err)
    } finally {
      setIsProcessing(false)
      closeConfirmModal()
    }
  }

  // Open confirmation modal
  const openConfirmModal = (withdrawal, action) => {
    setSelectedWithdrawal(withdrawal)
    setActionType(action)
    setIsConfirmModalOpen(true)
  }

  // Close confirmation modal
  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false)
    setSelectedWithdrawal(null)
    setActionType("")
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Format amount
  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Capitalize first letter
  const capitalize = (str) => {
    if (!str) return ""
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  // Apply filters
  const filteredData = useMemo(() => {
    let filtered = [...withdrawalHistory]

    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          (item?.receiverName || "").toLowerCase().includes(searchLower) ||
          (item?.bankName || "").toLowerCase().includes(searchLower) ||
          (item?.accNo || "").toString().includes(searchTerm) ||
          (item?.ifsc || "").toLowerCase().includes(searchLower) ||
          (item?.contact || "").toString().includes(searchTerm),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => (item?.status || "").toLowerCase() === statusFilter)
    }

    return filtered
  }, [withdrawalHistory, searchTerm, statusFilter])

  // Check if the withdrawal is from a user (admin can only approve/reject user withdrawals)
  const isUserWithdrawal = (withdrawal) => {
    // This is a placeholder logic - you'll need to adjust based on your actual data structure
    // For example, if withdrawals have a 'role' field or if user IDs have a specific format
    return withdrawal?.userRole === "user" || !withdrawal?.userRole
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-[rgb(var(--color-border))] bg-white p-6 shadow-sm">
          <div className="flex flex-col space-y-1.5 pb-2">
            <h3 className="text-lg font-semibold leading-none tracking-tight text-[rgb(var(--color-text-primary))]">
              Total Users
            </h3>
            <p className="text-sm text-[rgb(var(--color-text-muted))]">Users under your management</p>
          </div>
          <div className="pt-0">
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-[rgb(var(--color-text-muted))]">+28 from last month</p>
          </div>
        </div>

        <div className="rounded-lg border border-[rgb(var(--color-border))] bg-white p-6 shadow-sm">
          <div className="flex flex-col space-y-1.5 pb-2">
            <h3 className="text-lg font-semibold leading-none tracking-tight text-[rgb(var(--color-text-primary))]">
              Active Tickets
            </h3>
            <p className="text-sm text-[rgb(var(--color-text-muted))]">Support tickets requiring attention</p>
          </div>
          <div className="pt-0">
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-[rgb(var(--color-text-muted))]">-3 from last week</p>
          </div>
        </div>

        <div className="rounded-lg border border-[rgb(var(--color-border))] bg-white p-6 shadow-sm">
          <div className="flex flex-col space-y-1.5 pb-2">
            <h3 className="text-lg font-semibold leading-none tracking-tight text-[rgb(var(--color-text-primary))]">
              Pending Withdrawals
            </h3>
            <p className="text-sm text-[rgb(var(--color-text-muted))]">Withdrawal requests awaiting approval</p>
          </div>
          <div className="pt-0">
            <div className="text-2xl font-bold">
              {withdrawalHistory.filter((item) => item.status === "pending").length}
            </div>
            <p className="text-xs text-[rgb(var(--color-text-muted))]">
              {withdrawalHistory.filter((item) => item.status === "pending").length > 0
                ? "Requires your attention"
                : "No pending requests"}
            </p>
          </div>
        </div>
      </div>

      {/* Withdrawal History Section */}
      <div className="overflow-x-auto bg-white rounded-lg shadow border border-[rgb(var(--color-border))]">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-lg font-semibold leading-none tracking-tight text-[rgb(var(--color-text-primary))]">
              Withdrawal Management
            </h3>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              {/* Search input */}
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search by name, bank, account..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {/* Filter button */}
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                    clipRule="evenodd"
                  />
                </svg>
                Filters
                {statusFilter !== "all" && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-[rgb(var(--color-primary))] rounded-full">
                    1
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowRequestModal(true)}
                className="px-4 py-2 bg-[rgb(var(--color-primary))] rounded-lg text-white hover:bg-[rgb(var(--color-primary-dark))] transition-colors"
              >
                Request Withdrawal
              </button>
            </div>
          </div>

          {/* Filter panel */}
          {isFilterOpen && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setStatusFilter("all")
                    setSearchTerm("")
                  }}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}

          {/* Active filters display */}
          {(statusFilter !== "all" || searchTerm) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm("")} className="ml-2 text-blue-600 hover:text-blue-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              )}

              {statusFilter !== "all" && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                  <button onClick={() => setStatusFilter("all")} className="ml-2 text-blue-600 hover:text-blue-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
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
                setError(null)
                setRefreshTrigger((prev) => prev + 1)
              }}
              className="mt-2 text-sm font-medium text-red-700 underline hover:text-red-800"
            >
              Try again
            </button>
          </div>
        ) : withdrawalHistory.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md m-4">
            <p>No withdrawal history found. Withdrawal requests will appear here once users submit them.</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md m-4">
            <p>No results found matching your filters. Try adjusting your search criteria.</p>
            <button
              onClick={() => {
                setStatusFilter("all")
                setSearchTerm("")
              }}
              className="mt-2 text-sm font-medium text-yellow-700 underline hover:text-yellow-800"
            >
              Reset all filters
            </button>
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
                  Bank Details
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Receiver
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
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.bankName}</div>
                    <div className="text-sm text-gray-500">Acc: {item.accNo}</div>
                    <div className="text-sm text-gray-500">IFSC: {item.ifsc}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.receiverName}</div>
                    <div className="text-sm text-gray-500">{item.contact}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatAmount(item.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        item.status,
                      )}`}
                    >
                      {capitalize(item.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.status === "pending" && isUserWithdrawal(item) && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openConfirmModal(item, "approve")}
                          className="inline-flex items-center px-2.5 py-1.5 border border-green-300 text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openConfirmModal(item, "reject")}
                          className="inline-flex items-center px-2.5 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[rgb(var(--color-text-primary))]">
                {actionType === "approve" ? "Approve" : "Reject"} Withdrawal
              </h3>
              <button
                onClick={closeConfirmModal}
                className="rounded-full p-1 text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-primary-lighter))] hover:text-[rgb(var(--color-primary-dark))]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="mb-4 text-[rgb(var(--color-text-primary))]">
                Are you sure you want to {actionType === "approve" ? "approve" : "reject"} this withdrawal request?
              </p>

              {selectedWithdrawal && (
                <div className="rounded-md bg-gray-50 p-3 text-sm">
                  <p>
                    <span className="font-medium">Receiver:</span> {selectedWithdrawal.receiverName}
                  </p>
                  <p>
                    <span className="font-medium">Bank:</span> {selectedWithdrawal.bankName}
                  </p>
                  <p>
                    <span className="font-medium">Amount:</span> {formatAmount(selectedWithdrawal.amount)}
                  </p>
                </div>
              )}

              {actionType === "approve" ? (
                <p className="mt-4 text-sm text-green-600">
                  This will approve the withdrawal request and mark it as processed.
                </p>
              ) : (
                <p className="mt-4 text-sm text-red-600">
                  This will reject the withdrawal request and return the funds to the user&apos;s account.
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeConfirmModal}
                className="inline-flex items-center justify-center rounded-md border border-[rgb(var(--color-border))] bg-white px-4 py-2 text-sm font-medium text-[rgb(var(--color-text-primary))] transition-colors hover:bg-[rgb(var(--color-primary-lighter))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:ring-offset-2"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStatusUpdate}
                disabled={isProcessing}
                className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  actionType === "approve"
                    ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                    : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                } ${isProcessing ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : actionType === "approve" ? (
                  "Approve"
                ) : (
                  "Reject"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Withdrawal Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">Request Withdrawal to SuperAdmin</h3>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
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

                <div className="space-y-2">
                  <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">
                    Bank Name*
                  </label>
                  <input
                    type="text"
                    id="bankName"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="accNo" className="block text-sm font-medium text-gray-700">
                    Account Number*
                  </label>
                  <input
                    type="text"
                    id="accNo"
                    name="accNo"
                    value={formData.accNo}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="ifsc" className="block text-sm font-medium text-gray-700">
                    IFSC Code*
                  </label>
                  <input
                    type="text"
                    id="ifsc"
                    name="ifsc"
                    value={formData.ifsc}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="receiverName" className="block text-sm font-medium text-gray-700">
                    Account Holder Name*
                  </label>
                  <input
                    type="text"
                    id="receiverName"
                    name="receiverName"
                    value={formData.receiverName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
                    Contact Number*
                  </label>
                  <input
                    type="tel"
                    id="contact"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
                    required
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
  )
}

