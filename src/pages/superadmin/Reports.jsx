"use client"

import { useState, useEffect, useMemo } from "react"
import axios from "axios"
import { server } from "../../constants/config"

export default function Reports() {
  const [depositHistory, setDepositHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [currencyFilter, setCurrencyFilter] = useState("all")
  const [dateRange, setDateRange] = useState({ from: "", to: "" })
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" })
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Fetch deposit history
  useEffect(() => {
    const fetchDepositHistory = async () => {
      setIsLoading(true)
      try {
        const token = localStorage.getItem("authToken")
        if (!token) {
          throw new Error("Authentication token not found")
        }

        const response = await axios.get(`${server}api/v1/payment/deposit-history`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.success) {
          setDepositHistory(response.data.history)
        } else {
          throw new Error(response.data.message || "Failed to fetch deposit history")
        }
      } catch (err) {
        console.error("Error fetching reports:", err)
        setError(err.response?.data?.message || err.message || "An error occurred while fetching deposit history")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDepositHistory()
  }, [])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, currencyFilter, dateRange, sortConfig])

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
    setCurrencyFilter("all")
    setDateRange({ from: "", to: "" })
    setSortConfig({ key: "createdAt", direction: "desc" })
    setCurrentPage(1)
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

  // Format amount with currency
  const formatAmount = (amount) => {
    return `${amount.toLocaleString()}`
  }

  // Apply all filters and sorting
  const filteredAndSortedData = useMemo(() => {
    // First filter the data
    let filtered = [...depositHistory]

    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (item) => item.userName.toLowerCase().includes(searchLower) || item.userId.toLowerCase().includes(searchLower),
      )
    }

    // Apply currency filter
    if (currencyFilter !== "all") {
      filtered = filtered.filter((item) => item.currency.toLowerCase() === currencyFilter.toLowerCase())
    }

    // Apply date range filter
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from)
      fromDate.setHours(0, 0, 0, 0)
      filtered = filtered.filter((item) => new Date(item.createdAt) >= fromDate)
    }

    if (dateRange.to) {
      const toDate = new Date(dateRange.to)
      toDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter((item) => new Date(item.createdAt) <= toDate)
    }

    // Then sort the filtered data
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        // Handle special cases
        if (sortConfig.key === "createdAt" || sortConfig.key === "updatedAt") {
          aValue = new Date(aValue)
          bValue = new Date(bValue)
        } else if (sortConfig.key === "amount") {
          aValue = Number(aValue)
          bValue = Number(bValue)
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
  }, [depositHistory, searchTerm, currencyFilter, dateRange, sortConfig])

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
    <div className="space-y-4">
     

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-lg font-semibold leading-none tracking-tight text-[rgb(var(--color-text-primary))]">
              Deposit History
            </h3>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              {/* Search input */}
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search by name or user ID..."
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
                {(currencyFilter !== "all" || dateRange.from || dateRange.to) && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-[rgb(var(--color-primary))] rounded-full">
                    {(currencyFilter !== "all" ? 1 : 0) + (dateRange.from || dateRange.to ? 1 : 0)}
                  </span>
                )}
              </button>

              {/* Sort button */}
              <div className="relative inline-block">
                <button
                  onClick={() => document.getElementById("sort-dropdown").classList.toggle("hidden")}
                  className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                  </svg>
                  Sort
                </button>
                <div
                  id="sort-dropdown"
                  className="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border "
                >
                  <div className="py-1">
                    <button
                      onClick={() => {
                        requestSort("createdAt")
                        document.getElementById("sort-dropdown").classList.add("hidden")
                      }}
                      className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${sortConfig.key === "createdAt" ? "font-bold" : ""}`}
                    >
                      Date {sortConfig.key === "createdAt" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </button>
                    <button
                      onClick={() => {
                        requestSort("userName")
                        document.getElementById("sort-dropdown").classList.add("hidden")
                      }}
                      className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${sortConfig.key === "userName" ? "font-bold" : ""}`}
                    >
                      User Name {sortConfig.key === "userName" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </button>
                    <button
                      onClick={() => {
                        requestSort("amount")
                        document.getElementById("sort-dropdown").classList.add("hidden")
                      }}
                      className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${sortConfig.key === "amount" ? "font-bold" : ""}`}
                    >
                      Amount {sortConfig.key === "amount" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </button>
                    <button
                      onClick={() => {
                        requestSort("currency")
                        document.getElementById("sort-dropdown").classList.add("hidden")
                      }}
                      className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${sortConfig.key === "currency" ? "font-bold" : ""}`}
                    >
                      Currency {sortConfig.key === "currency" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter panel */}
          {isFilterOpen && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={currencyFilter}
                    onChange={(e) => setCurrencyFilter(e.target.value)}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
                  >
                    <option value="all">All Currencies</option>
                    <option value="inr">INR</option>
                    <option value="usd">USD</option>
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
          {(currencyFilter !== "all" || dateRange.from || dateRange.to || searchTerm) && (
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

              {currencyFilter !== "all" && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Currency: {currencyFilter.toUpperCase()}
                  <button onClick={() => setCurrencyFilter("all")} className="ml-2 text-blue-600 hover:text-blue-800">
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
                  Date: {dateRange.from ? new Date(dateRange.from).toLocaleDateString() : "Any"}
                  {" to "}
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
              "Loading deposit history..."
            ) : (
              <>
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                <span className="font-medium">{Math.min(indexOfLastItem, totalItems)}</span> of{" "}
                <span className="font-medium">{totalItems}</span> deposits
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
          </div>
        ) : depositHistory.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md m-4">
            <p>No deposit history found.</p>
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
                  onClick={() => requestSort("userName")}
                >
                  <div className="flex items-center">
                    User
                    {sortConfig.key === "userName" && (
                      <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("currency")}
                >
                  <div className="flex items-center">
                    Currency
                    {sortConfig.key === "currency" && (
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
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  User ID
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.userName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.currency.toUpperCase()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatAmount(item.amount, item.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="font-mono">{item.userId}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No results found matching your filters. Try adjusting your search criteria.
                  </td>
                </tr>
              )}
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

     
    </div>
  )
}

