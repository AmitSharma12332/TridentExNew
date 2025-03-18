"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, X } from "lucide-react";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../constants/config";
import PropTypes from "prop-types";

const OpenBetsMob = ({ eventId, isLoadingTransactions = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [allBets, setAllBets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.userReducer);

  const fetchTransactions = useCallback(async () => {
    if (!eventId || !user) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("No authentication token found");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(
        `${server}api/v1/bet/transactions?eventId=${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const pendingBets = response.data.bets.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setAllBets(pendingBets);
      setError(null);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Failed to fetch transactions");
    } finally {
      setIsLoading(false);
    }
  }, [eventId, user]);

  // Fetch transactions initially and set up polling
  useEffect(() => {
    fetchTransactions();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchTransactions, 5000);

    return () => clearInterval(interval);
  }, [fetchTransactions]);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleOpen}
        className={`fixed lg:hidden right-0 top-1/2 -translate-y-1/2 z-40 
          bg-yellow-500 text-white
          p-2 rounded-l-lg shadow-lg
          transition-transform duration-300 flex items-center gap-2
          ${isOpen ? "translate-x-full" : ""}`}
        aria-label="Toggle open bets"
      >
        <ChevronLeft className="h-6 w-6" />
        <span className="pr-1">
          Bets {allBets.length > 0 && `(${allBets.length})`}
        </span>
      </button>

      {/* Sliding Container */}
      <div
        className={`fixed right-0 top-0 h-full w-[85%] max-w-md z-[99]
          bg-[rgb(var(--color-background))] shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--color-border))]">
          <h2 className="font-semibold text-[rgb(var(--color-primary))]">
            Open Bets {allBets.length > 0 && `(${allBets.length})`}
          </h2>
          <button
            onClick={toggleOpen}
            className="p-2 text-black hover:bg-[rgb(var(--color-background-hover))] rounded-full"
            aria-label="Close open bets"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {user && eventId && (
          <div className="flex-1 overflow-hidden flex flex-col h-[calc(100%-64px)]">
            <div className="flex justify-between items-center p-4">
              <h3 className="font-semibold underline text-[rgb(var(--color-primary))]">
                Open Bets:
              </h3>
              {(isLoading || isLoadingTransactions) && (
                <span className="text-sm text-[rgb(var(--color-text-muted))]">
                  Loading...
                </span>
              )}
            </div>

            {error && (
              <div className="px-4 py-2 mb-4 text-red-500 text-sm bg-red-50">
                {error}
              </div>
            )}

            <div className="overflow-y-auto flex-1 px-4 pb-4">
              {allBets.length > 0 ? (
                <div className="w-full rounded-lg overflow-hidden border border-[rgb(var(--color-border))]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[rgb(var(--color-background-hover))]">
                        <th className="p-2 text-xs font-semibold text-[rgb(var(--color-text-primary))]">
                          Selection
                        </th>
                        <th className="p-2 text-xs font-semibold text-[rgb(var(--color-text-primary))]">
                          Stake
                        </th>
                        <th className="p-2 text-xs font-semibold text-[rgb(var(--color-text-primary))]">
                          Odds
                        </th>
                        {allBets.some((bet) => bet.fancyNumber) && (
                          <th className="p-2 text-xs font-semibold text-[rgb(var(--color-text-primary))]">
                            Run
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {allBets.map((bet, index) => (
                        <tr
                          key={index}
                          className={`transition-all duration-200 
                            ${
                              bet.type === "back"
                                ? "bg-[rgb(var(--color-back))]"
                                : "bg-[rgb(var(--color-lay))]"
                            }`}
                        >
                          <td className="p-2 text-xs text-[rgb(var(--color-text-primary))] border-t border-[rgb(var(--color-border))]">
                            {bet.selection}
                          </td>
                          <td className="p-2 text-xs text-[rgb(var(--color-text-primary))] border-t border-[rgb(var(--color-border))]">
                            {bet.stake.toFixed(2)}
                          </td>
                          <td className="p-2 text-xs text-[rgb(var(--color-text-primary))] border-t border-[rgb(var(--color-border))]">
                            {bet.odds}
                          </td>
                          {allBets.some((bet) => bet.fancyNumber) && (
                            <td className="p-2 text-xs text-[rgb(var(--color-text-primary))] border-t border-[rgb(var(--color-border))] capitalize">
                              {bet.fancyNumber || "-"}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-[rgb(var(--color-text-muted))]">
                  {isLoading ? "Loading bets..." : "No open bets"}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={toggleOpen}
          aria-hidden="true"
        />
      )}
    </>
  );
};
OpenBetsMob.propTypes = {
  eventId: PropTypes.string.isRequired,
  isLoadingTransactions: PropTypes.bool,
};

export default OpenBetsMob;
