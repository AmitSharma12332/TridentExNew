"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { server } from "../../constants/config"

export default function SuperAdminDashboard() {
  const [withdrawalHistory, setWithdrawalHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null)
  const [actionType, setActionType] = useState("") // "approve" or "reject"
  const [isProcessing, setIsProcessing] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState({ from: "", to: "" })
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

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

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, dateRange, sortConfig])

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

  // Sorting function
  const requestSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setDateRange({ from: "", to: "" })
    setSortConfig({ key: "createdAt", direction: "desc" })
    setCurrentPage(1)
  }

  // Apply all filters and sorting
  const filteredAndSortedData = useMemo(() => {
    // First filter the data
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

    // Apply date range filter
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from)
      fromDate.setHours(0, 0, 0, 0)
      filtered = filtered.filter((item) => new Date(item?.createdAt) >= fromDate)
    }

    if (dateRange.to) {
      const toDate = new Date(dateRange.to)
      toDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter((item) => new Date(item?.createdAt) <= toDate)
    }

    // Then sort the filtered data
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        // Handle special cases
        if (sortConfig.key === "createdAt") {
          aValue = new Date(aValue)
          bValue = new Date(bValue)
        } else if (sortConfig.key === "amount") {
          aValue = Number.parseFloat(aValue)
          bValue = Number.parseFloat(bValue)
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
      })
    }

    return filtered
  }, [withdrawalHistory, searchTerm, statusFilter, dateRange, sortConfig])

  // Pagination calculations
  const totalItems = filteredAndSortedData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredAndSortedData.slice(indexOfFirstItem, indexOfLastItem)

  // Generate page numbers for pagination
  const pageNumbers = []
  const maxPageNumbersToShow = 5

  if (totalPages <= maxPageNumbersToShow) {
    // Show all page numbers
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i)
    }
  } else {
    // Show limited page numbers with ellipsis
    if (currentPage <= 3) {
      // Near the start
      for (let i = 1; i <= 4; i++) {
        pageNumbers.push(i)
      }
      pageNumbers.push("...")
      pageNumbers.push(totalPages)
    } else if (currentPage >= totalPages - 2) {
      // Near the end
      pageNumbers.push(1)
      pageNumbers.push("...")
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Middle
      pageNumbers.push(1)
      pageNumbers.push("...")
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pageNumbers.push(i)
      }
      pageNumbers.push("...")
      pageNumbers.push(totalPages)
    }
  }

  return (
    <div className="space-y-6">
     

      {/* Withdrawal History Section */}
      <div className="overflow-x-auto bg-white rounded-lg shadow border border-[rgb(var(--color-border))]">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-lg font-semibold leading-none tracking-tight text-[rgb(var(--color-text-primary))]">
              Withdrawal Requests
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
                {(statusFilter !== "all" || dateRange.from || dateRange.to) && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-[rgb(var(--color-primary))] rounded-full">
                    {(statusFilter !== "all" ? 1 : 0) + (dateRange.from || dateRange.to ? 1 : 0)}
                  </span>
                )}
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

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}

          {/* Active filters display */}
          {(statusFilter !== "all" || dateRange.from || dateRange.to || searchTerm) && (
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

              {(dateRange.from || dateRange.to) && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Date: {dateRange.from ? new Date(dateRange.from).toLocaleDateString() : "Any"} to{" "}
                  {dateRange.to ? new Date(dateRange.to).toLocaleDateString() : "Any"}
                  <button
                    onClick={() => setDateRange({ from: "", to: "" })}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
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

        {/* Results count and items per page */}
        <div className="px-6 py-3 bg-gray-50 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="text-sm text-gray-500">
            {isLoading ? (
              "Loading withdrawal history..."
            ) : (
              <>
                Showing <span className="font-medium">{totalItems === 0 ? 0 : indexOfFirstItem + 1}</span> to{" "}
                <span className="font-medium">{Math.min(indexOfLastItem, totalItems)}</span> of{" "}
                <span className="font-medium">{totalItems}</span> withdrawals
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value))
                setCurrentPage(1) // Reset to first page when changing items per page
              }}
              className="border rounded p-1 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-500">per page</span>
          </div>
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
        ) : filteredAndSortedData.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md m-4">
            <p>No results found matching your filters. Try adjusting your search criteria.</p>
            <button
              onClick={resetFilters}
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
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("createdAt")}
                >
                  <div className="flex items-center">
                    Date
                    {sortConfig.key === "createdAt" && (
                      <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
             
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("amount")}
                >
                  <div className="flex items-center">
                    Amount
                    {sortConfig.key === "amount" && (
                      <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("status")}
                >
                  <div className="flex items-center">
                    Status
                    {sortConfig.key === "status" && (
                      <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
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
              {currentItems.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.createdAt)}</td>
               
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
                    {item.status === "pending" && (
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

        {/* Pagination */}
        {!isLoading && totalItems > 0 && (
          <div className="px-6 py-4 bg-white border-t flex flex-col sm:flex-row justify-between items-center">
            <div className="text-sm text-gray-700 mb-4 sm:mb-0">
              Page {currentPage} of {totalPages}
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {pageNumbers.map((number, index) =>
                number === "..." ? (
                  <span key={`ellipsis-${index}`} className="px-3 py-1">
                    ...
                  </span>
                ) : (
                  <button
                    key={number}
                    onClick={() => setCurrentPage(number)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === number
                        ? "bg-[rgb(var(--color-primary))] text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {number}
                  </button>
                ),
              )}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
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
    </div>
  )
}

