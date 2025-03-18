"use client"

import axios from "axios"
import { useCallback, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { server } from "../../constants/config"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import toast from "react-hot-toast"
import { calculateProfitAndLoss } from "../../utils/helper"

const Allbets = () => {
  const { user } = useSelector((state) => state.userReducer)
  // eslint-disable-next-line no-unused-vars
  const [allBets, setAllBets] = useState([])
  const [filteredBets, setFilteredBets] = useState([])
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false)
  const [selectedBetId, setSelectedBetId] = useState(null)
  const [itemsPerPage] = useState(10)

  const [filters, setFilters] = useState({
    status: "all",
    userId: "",
    selectionId: "",
    eventId: "",
    category: "",
    type: "",
  })

  const getTransactions = useCallback(async () => {
    if (!user || !user._id) return

    const token = localStorage.getItem("authToken")
    if (!token) {
      console.error("No token found")
      return
    }

    try {
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") {
          queryParams.append(key, value)
        }
      })

      const response = await axios.get(`${server}api/v1/bet/bets?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setAllBets(response.data.bets || [])
      setFilteredBets(response.data.bets || [])
    } catch (error) {
      console.error("Error fetching transactions:", error)
    }
  }, [user, filters])

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc"
    setSortConfig({ key, direction })

    const sorted = [...filteredBets].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1
      return 0
    })
    setFilteredBets(sorted)
  }

    // Calculate profit/loss for a bet
    const getProfitLoss = (bet) => {
      if (bet.status === "pending") {
        return "---"
      }
  
      const result = calculateProfitAndLoss(bet.stake, bet.odds, bet.type, bet.category)
  
      if (result.error) {
        return "Error"
      }
  
      if (bet.status === "won") {
        return result.profit.toFixed(2)
      } else {
        return result.loss.toFixed(2)
      }
    }
  

  const handleSearch = (value) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleStatusChange = async (betId, newStatus) => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    try {
      const res = await axios.post(
        `${server}api/v1/bet/change-status`,
        {
          betId,
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      toast.success(res.data.message)

      getTransactions()
      setIsStatusDropdownOpen(null)
      setIsSettleModalOpen(false)
    } catch (error) {
      console.error("Error changing bet status:", error)
    }
  }

  const openSettleModal = (betId) => {
    setSelectedBetId(betId)
    setIsSettleModalOpen(true)
  }

  useEffect(() => {
    getTransactions()
  }, [getTransactions])

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredBets.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredBets.length / itemsPerPage)
  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  return (
    <div className="container mx-auto pb-8">
      <div className="mb-6 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <input
          type="text"
          placeholder="Search by match..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="rounded-md border bg-[rgb(var(--color-background))] border-[rgb(var(--color-border))] px-4 py-2 focus:border-[rgb(var(--color-primary))] focus:outline-none text-[rgb(var(--color-text-primary))]"
        />
        <input
          type="text"
          placeholder="User ID"
          value={filters.userId}
          onChange={(e) => handleFilterChange("userId", e.target.value)}
          className="rounded-md border bg-[rgb(var(--color-background))] border-[rgb(var(--color-border))] px-4 py-2 focus:border-[rgb(var(--color-primary))] focus:outline-none text-[rgb(var(--color-text-primary))]"
        />
        <input
          type="text"
          placeholder="Selection ID"
          value={filters.selectionId}
          onChange={(e) => handleFilterChange("selectionId", e.target.value)}
          className="rounded-md border bg-[rgb(var(--color-background))] border-[rgb(var(--color-border))] px-4 py-2 focus:border-[rgb(var(--color-primary))] focus:outline-none text-[rgb(var(--color-text-primary))]"
        />
        <input
          type="text"
          placeholder="Event ID"
          value={filters.eventId}
          onChange={(e) => handleFilterChange("eventId", e.target.value)}
          className="rounded-md border bg-[rgb(var(--color-background))] border-[rgb(var(--color-border))] px-4 py-2 focus:border-[rgb(var(--color-primary))] focus:outline-none text-[rgb(var(--color-text-primary))]"
        />
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange("category", e.target.value)}
          className="rounded-md border bg-[rgb(var(--color-background))] border-[rgb(var(--color-border))] px-4 py-2 focus:border-[rgb(var(--color-primary))] focus:outline-none text-[rgb(var(--color-text-primary))]"
        >
          <option value="">All Categories</option>
          <option value="match odds">Match Odds</option>
          <option value="fancy">Fancy</option>
          <option value="bookmaker">Bookmaker</option>
        </select>
        <select
          value={filters.type}
          onChange={(e) => handleFilterChange("type", e.target.value)}
          className="rounded-md border bg-[rgb(var(--color-background))] border-[rgb(var(--color-border))] px-4 py-2 focus:border-[rgb(var(--color-primary))] focus:outline-none text-[rgb(var(--color-text-primary))]"
        >
          <option value="">All Types</option>
          <option value="back">Back</option>
          <option value="lay">Lay</option>
        </select>
        <div className="relative inline-block w-full">
          <button
            onClick={() => setIsStatusDropdownOpen(isStatusDropdownOpen ? null : "filter")}
            className="w-full rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-background))] px-4 py-2 text-left focus:border-[rgb(var(--color-primary))] focus:outline-none text-[rgb(var(--color-text-primary))]"
          >
            {filters.status === "all" ? "Filter by status" : filters.status}
          </button>
          {isStatusDropdownOpen === "filter" && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-background))] shadow-lg">
              <div className="py-1">
                {["all", "pending", "won", "lost"].map((status) => (
                  <button
                    key={status}
                    className="block w-full px-4 py-2 text-left hover:bg-[rgb(var(--color-background-hover))] text-[rgb(var(--color-text-primary))]"
                    onClick={() => {
                      handleFilterChange("status", status)
                      setIsStatusDropdownOpen(null)
                    }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[rgb(var(--color-border))]">
        <table className="min-w-full divide-y divide-[rgb(var(--color-border))]">
          <thead className="bg-[rgb(var(--color-background))]">
            <tr>
              <th
                onClick={() => handleSort("match")}
                className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))]"
              >
                Match{" "}
                {sortConfig.key === "match" && (
                  <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                )}
              </th>
              <th
                onClick={() => handleSort("match")}
                className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))]"
              >
                Selection{" "}
              </th>
              <th
                onClick={() => handleSort("type")}
                className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))]"
              >
                Type{" "}
                {sortConfig.key === "type" && (
                  <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                )}
              </th>
              <th
                onClick={() => handleSort("odds")}
                className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))]"
              >
                Odds{" "}
                {sortConfig.key === "odds" && (
                  <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                )}
              </th>
              <th
                onClick={() => handleSort("stake")}
                className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))]"
              >
                Stake{" "}
                {sortConfig.key === "stake" && (
                  <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                )}
              </th>
              <th className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                Category{" "}
              </th>
              <th
                onClick={() => handleSort("payout")}
                className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))]"
              >
                Profit/Loss{" "}
                {sortConfig.key === "payout" && (
                  <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                )}
              </th>
              <th className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                Placed Date{" "}
              </th>
              <th
                onClick={() => handleSort("status")}
                className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))]"
              >
                Status{" "}
                {sortConfig.key === "status" && (
                  <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                )}
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--color-border))] bg-[rgb(var(--color-background))]">
            {currentItems.map((bet) => {
               const profitLoss = getProfitLoss(bet)
                const isProfit = bet.status === "won"
             return (
              <tr key={bet._id} className="hover:bg-[rgb(var(--color-background-hover))] transition-colors">
                <td className="px-6 py-4 text-sm text-[rgb(var(--color-text-primary))]">{bet.match}</td>
                <td className="px-4 py-3 text-sm text-[rgb(var(--color-text-primary))]">
                  {bet.selection}
                  {bet?.fancyNumber && ` (${bet.fancyNumber})`}
                </td>
                <td className="px-6 py-4 text-sm text-[rgb(var(--color-text-primary))]">{bet.type}</td>
                <td className="px-6 py-4 text-sm text-[rgb(var(--color-text-primary))]">{bet.odds}</td>
                <td className="px-6 py-4 text-sm text-[rgb(var(--color-text-primary))]">{bet.stake}</td>
                <td className="px-6 py-4 text-sm text-[rgb(var(--color-text-primary))]">{bet.category}</td>
                <td
                      className={`px-4 py-3 text-sm ${isProfit ? "text-green-600 font-medium" : bet.status === "lost" ? "text-red-600 font-medium" : "text-[rgb(var(--color-text-primary))]"}`}
                    >
                      {profitLoss}
                    </td>
                <td className="px-4 py-3 text-sm text-[rgb(var(--color-text-primary))]">
                  {format(new Date(bet.createdAt), "yyyy-MM-dd HH:mm:ss")}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="relative">
                    <td
                      className={`capitalize w-24 text-center ${
                        bet.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : bet.status === "lost"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                      } rounded-lg px-4 py-1`}
                    >
                      {bet.status}
                    </td>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => openSettleModal(bet._id)}
                    className="rounded bg-[rgb(var(--color-primary))] px-3 py-1.5 text-white hover:bg-[rgb(var(--color-primary-dark))] focus:outline-none transition-colors"
                  >
                    Settle Bet
                  </button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-[rgb(var(--color-text-muted))]">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredBets.length)} of {filteredBets.length}{" "}
          entries
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded px-3 py-1 bg-[rgb(var(--color-background))] text-[rgb(var(--color-text-primary))] disabled:opacity-50 border border-[rgb(var(--color-border))]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1
            if (
              pageNumber === 1 ||
              pageNumber === totalPages ||
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1) ||
              (pageNumber <= 4 && currentPage <= 3)
            ) {
              return (
                <button
                  key={pageNumber}
                  onClick={() => paginate(pageNumber)}
                  className={`px-3 py-1 rounded ${
                    currentPage === pageNumber
                      ? "bg-[rgb(var(--color-primary))] text-white"
                      : "bg-[rgb(var(--color-background))] text-[rgb(var(--color-text-primary))] border border-[rgb(var(--color-border))]"
                  }`}
                >
                  {pageNumber}
                </button>
              )
            } else if (
              (pageNumber === currentPage - 2 && currentPage > 3) ||
              (pageNumber === currentPage + 2 && currentPage < totalPages - 2)
            ) {
              return (
                <span key={pageNumber} className="px-3 py-1 text-[rgb(var(--color-text-primary))]">
                  ...
                </span>
              )
            }
            return null
          })}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded px-3 py-1 bg-[rgb(var(--color-background))] text-[rgb(var(--color-text-primary))] disabled:opacity-50 border border-[rgb(var(--color-border))]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Settle Bet Modal */}
      {isSettleModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="rounded-lg bg-[rgb(var(--color-background))] p-6 border border-[rgb(var(--color-border))]">
            <h2 className="mb-4 text-lg font-semibold text-[rgb(var(--color-text-primary))]">Settle Bet</h2>
            <p className="mb-4 text-[rgb(var(--color-text-primary))]">Choose the outcome of the bet:</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleStatusChange(selectedBetId, "won")}
                className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 transition-colors"
              >
                Won
              </button>
              <button
                onClick={() => handleStatusChange(selectedBetId, "lost")}
                className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition-colors"
              >
                Lost
              </button>
            </div>
            <button
              onClick={() => setIsSettleModalOpen(false)}
              className="mt-4 rounded border border-[rgb(var(--color-border))] px-4 py-2 text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-background-hover))] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Allbets
