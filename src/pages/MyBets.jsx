"use client"

import axios from "axios"
import { format, isThisMonth, isThisWeek, isToday, isYesterday, parseISO } from "date-fns"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Search } from "lucide-react"
import { memo, useEffect, useState } from "react"
import { server } from "../constants/config"
import { calculateProfitAndLoss } from "../utils/helper"

const MyBetsComponent = () => {
  const [allBets, setAllBets] = useState([])
  const [filteredBets, setFilteredBets] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" })
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    const getTransactions = async () => {
      const token = localStorage.getItem("authToken")
      if (!token) {
        console.error("No token found")
        return
      }
      setLoading(true)

      try {
        const response = await axios.get(`${server}api/v1/bet/transactions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.data.success) {
          setAllBets(response.data.bets || [])
          setLoading(false)
        }
      } catch (error) {
        console.error("Error fetching transactions:", error)
        setLoading(false)
      }
    }

    getTransactions()
  }, [])

  // Filter and search logic
  useEffect(() => {
    let result = [...allBets]

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (bet) =>
          bet.match.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bet.selection?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((bet) => bet.status === statusFilter)
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((bet) => bet.category === categoryFilter)
    }

    // Apply date filter
    if (dateFilter !== "all") {
      result = result.filter((bet) => {
        const betDate = parseISO(bet.createdAt)
        switch (dateFilter) {
          case "today":
            return isToday(betDate)
          case "yesterday":
            return isYesterday(betDate)
          case "week":
            return isThisWeek(betDate)
          case "month":
            return isThisMonth(betDate)
          default:
            return true
        }
      })
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
      })
    }

    setFilteredBets(result)
    setCurrentPage(1)
  }, [allBets, searchTerm, statusFilter, categoryFilter, dateFilter, sortConfig])

  const categories = [...new Set(allBets.map((bet) => bet.category))]

  const requestSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (columnName) => {
    if (sortConfig.key !== columnName) {
      return <ChevronDown className="w-4 h-4 opacity-20" />
    }
    return sortConfig.direction === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredBets.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredBets.length / itemsPerPage)
  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  if (loading) {
    return (
      <div className="p-4 h-screen w-screen flex justify-center items-center rounded-lg">
        <p className="text-[rgb(var(--color-text-muted))]">Loading... your bets Hold On!!</p>
      </div>
    )
  }

  return (
    <div className="p-4 lg:pt-20 pt-24 rounded-lg">
      <div className="flex justify-between lg:flex-row flex-col items-center mb-6">
        <div className="flex flex-wrap justify-center items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--color-text-muted))] w-4 h-4" />
            <input
              type="text"
              placeholder="Search matches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[rgb(var(--color-background))] rounded-lg text-sm text-[rgb(var(--color-text-primary))] border border-[rgb(var(--color-border))] focus:outline-none focus:border-[rgb(var(--color-primary))]"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-2 bg-[rgb(var(--color-background))] rounded-lg text-sm text-[rgb(var(--color-text-primary))] border border-[rgb(var(--color-border))] focus:outline-none focus:border-[rgb(var(--color-primary))]"
            >
              <option value="all">All Result</option>
              <option value="pending">Pending</option>
              <option value="lost">Lost</option>
              <option value="won">Won</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2 py-2 bg-[rgb(var(--color-background))] rounded-lg text-sm text-[rgb(var(--color-text-primary))] border border-[rgb(var(--color-border))] focus:outline-none focus:border-[rgb(var(--color-primary))]"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-2 py-2 bg-[rgb(var(--color-background))] rounded-lg text-sm text-[rgb(var(--color-text-primary))] border border-[rgb(var(--color-border))] focus:outline-none focus:border-[rgb(var(--color-primary))]"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {filteredBets.length === 0 ? (
        <p className="text-[rgb(var(--color-text-muted))]">No bets found.</p>
      ) : (
        <div className="overflow-x-auto border border-[rgb(var(--color-border))] rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[rgb(var(--color-background))] border-b border-[rgb(var(--color-border))]">
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-[rgb(var(--color-text-muted))] cursor-pointer"
                  onClick={() => requestSort("match")}
                >
                  <div className="flex items-center gap-2">Event Name {getSortIcon("match")}</div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[rgb(var(--color-text-muted))]">
                  Selection
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-[rgb(var(--color-text-muted))] cursor-pointer"
                  onClick={() => requestSort("type")}
                >
                  <div className="flex items-center gap-2">Bet Type {getSortIcon("type")}</div>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-[rgb(var(--color-text-muted))] cursor-pointer"
                  onClick={() => requestSort("category")}
                >
                  <div className="flex items-center gap-2">Category {getSortIcon("category")}</div>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-[rgb(var(--color-text-muted))] cursor-pointer"
                  onClick={() => requestSort("odds")}
                >
                  <div className="flex items-center gap-2">Odds {getSortIcon("odds")}</div>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-[rgb(var(--color-text-muted))] cursor-pointer"
                  onClick={() => requestSort("stake")}
                >
                  <div className="flex items-center gap-2">Stake {getSortIcon("stake")}</div>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-[rgb(var(--color-text-muted))] cursor-pointer"
                  onClick={() => requestSort("payout")}
                >
                  <div className="flex items-center gap-2">Profit/Loss {getSortIcon("payout")}</div>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-[rgb(var(--color-text-muted))] cursor-pointer"
                  onClick={() => requestSort("status")}
                >
                  <div className="flex items-center gap-2">Status {getSortIcon("status")}</div>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-[rgb(var(--color-text-muted))] cursor-pointer"
                  onClick={() => requestSort("createdAt")}
                >
                  <div className="flex items-center gap-2">Placed Date {getSortIcon("createdAt")}</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--color-border))]">
              {currentItems.map((bet, index) => {
                const profitLoss = getProfitLoss(bet)
                const isProfit = bet.status === "won"

                return (
                  <tr
                    key={index}
                    className={`transition-colors ${
                      bet.status === "won" ? "bg-green-100" : bet.status === "lost" ? "bg-red-50" : "bg-yellow-50"
                    } hover:bg-[rgb(var(--color-background-hover))]`}
                  >
                    <td className="px-4 py-3 text-sm text-[rgb(var(--color-text-primary))]">{bet.match}</td>
                    <td className="px-4 py-3 text-sm text-[rgb(var(--color-text-primary))]">
                      {bet.selection}
                      {bet?.fancyNumber && ` (${bet.fancyNumber})`}
                    </td>
                    <td className="px-4 py-3 text-sm text-[rgb(var(--color-text-primary))] capitalize">{bet.type}</td>
                    <td className="px-4 py-3 text-sm text-[rgb(var(--color-text-primary))] capitalize">
                      {bet.category}
                    </td>
                    <td className="px-4 py-3 text-sm text-[rgb(var(--color-text-primary))]">{bet.odds}</td>
                    <td className="px-4 py-3 text-sm text-[rgb(var(--color-text-primary))]">{bet.stake.toFixed(2)}</td>
                    <td
                  className={`px-4 py-3 text-sm ${
                  bet.status === "cancelled"
                    ? "text-yellow-500 font-medium"
                    : isProfit
                    ? "text-green-600 font-medium"
                    : bet.status === "lost"
                    ? "text-red-600 font-medium"
                    : "text-[rgb(var(--color-text-primary))]"
                  }`}
                >
                  {bet.status === "cancelled" ? "NA (CANCELLED)" : profitLoss}
                </td>
                    <td className="px-4 py-3">
                      <span
                        className={`capitalize text-xs font-medium ${
                          bet.status === "pending"
                            ? "text-yellow-600"
                            : bet.status === "lost"
                            ? "text-red-600"
                            : bet.status === "cancelled"
                            ? "text-yellow-600"
                            : "text-[rgb(var(--color-text-primary))]"
                        }`}
                      >
                        {bet.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[rgb(var(--color-text-primary))]">
                      {format(new Date(bet.createdAt), "yyyy-MM-dd HH:mm:ss")}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-[rgb(var(--color-text-muted))]">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredBets.length)} of {filteredBets.length}{" "}
          entries
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] rounded text-[rgb(var(--color-text-primary))] disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
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
                      : "bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] text-[rgb(var(--color-text-primary))]"
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
            className="px-3 py-1 bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] rounded text-[rgb(var(--color-text-primary))] disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

const Mybets = memo(MyBetsComponent)
Mybets.displayName = "Mybets"

export default Mybets

