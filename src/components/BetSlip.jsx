/* eslint-disable react/prop-types */
import axios from "axios";
import { Minus, Plus } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { server } from "../constants/config";

// Custom hook for managing transactions
const useTransactions = (eventId) => {
  const [allBets, setAllBets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
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
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setAllBets(pendingBets);
      setError(null);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Failed to fetch transactions");
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  return { allBets, isLoading, error, fetchTransactions };
};

const BetSlip = memo(({ match, onClose, setStake, eventId, betPlaced }) => {
  const [betAmount, setBetAmount] = useState(100);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const { user } = useSelector((state) => state.userReducer);
  const prevMatchRef = useRef(null);
  const matchRef = useRef(match);

  const {
    allBets,
    isLoading: isLoadingTransactions,
    error: transactionError,
    fetchTransactions,
  } = useTransactions(eventId);

  // Constants
  const MAX_BET = 500000;

  useEffect(() => {
    if (JSON.stringify(match) !== JSON.stringify(prevMatchRef.current)) {
      matchRef.current = match;
      prevMatchRef.current = match;
    }
  }, [match]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const quickBets = useMemo(
    () => [
      { label: "100", value: 100 },
      { label: "1K", value: 1000 },
      { label: "5K", value: 5000 },
      { label: "10K", value: 10000 },
      { label: "25K", value: 25000 },
      { label: "50K", value: 50000 },
      { label: "100K", value: 100000 },
      { label: "500K", value: 500000 },
    ],
    []
  );

  const handleQuickBet = useCallback(
    (amount) => {
      setBetAmount(amount);
      setStake(amount);
    },
    [setStake]
  );

  const handleBetChange = useCallback(
    (value) => {
      const newAmount = Math.min(value, MAX_BET);
      setBetAmount(newAmount);
      setStake(newAmount);
    },
    [setStake]
  );


  const placeBet = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    const currentMatch = matchRef.current;

    try {
      setIsPlacingBet(true);
      const { data } = await axios.post(
        `${server}api/v1/bet/place`,
        {
          eventId: currentMatch.eventId,
          selection: currentMatch.selectedTeam,
          match: `${currentMatch.home_team} vs ${currentMatch.away_team}`,
          marketId: currentMatch.marketId,
          selectionId: currentMatch.selectionId,
          fancyNumber: currentMatch.fancyNumber,
          stake: betAmount,
          odds: currentMatch.odds,
          category: currentMatch.category,
          type: currentMatch.type,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (data.success) {
        toast.success(data.message);
        await fetchTransactions();
        setIsPlacingBet(false);
        betPlaced();
        onClose();
      } else {
        toast.error(data.message);
        setIsPlacingBet(false);
        betPlaced();
        onClose();
      }
    } catch (error) {
      setIsPlacingBet(false);
      console.error("Bet placement error:", error);
      toast.error(error.response.data.message);
      (error.response?.data?.message);
    } 
  }, [betAmount, onClose, betPlaced, fetchTransactions]);

  const currentMatch = matchRef.current;

  if (transactionError) {
    toast.error(transactionError);
  }

  return (
    <div className="lg:rounded-md rounded-none md:border border-[rgb(var(--color-border))]  bg-[rgb(var(--color-background))] text-[rgb(var(--color-text-primary))] w-full md:p-4 md:pt-2 my-2 mt-2 md:rounded-lg p-4 flex flex-col h-full lg:h-[calc(100vh-64px)]">
    <div className="flex justify-between items-start">
      <div>
        <h2 className="text-lg capitalize max-w-52 mb-2 flex font-bold">
          {currentMatch ? `${currentMatch.home_team} vs ${currentMatch.away_team}` : "Select a bet"}
        </h2>
      </div>

      <div className="text-sm">
        <h1>Max : {MAX_BET}</h1>
      </div>
    </div>

    <div className="mb-2 text-sm lg:text-base">
      <h1 className="p-2 uppercase">{match?.category}</h1>
      <div className="md:p-2 p-2 max-w-full rounded inline-block bg-[rgb(var(--color-background-hover))]">
        <span
          className={`font-semibold ${
            currentMatch?.betType === "Lay" || currentMatch?.betType === "No"
              ? "text-red-500"
              : "text-blue-500"
          }`}
        >
          {currentMatch?.selectedTeam}{" "}
        </span>
        <span className="text-[rgb(var(--color-text-muted))]">
          ({currentMatch?.betType} @ {currentMatch?.odds})
        </span>
      </div>
    </div>

    <div className="flex items-center lg:flex-row gap-2 mb-2 md:mb-2">
      <div className="flex gap-2 items-center">
        <button
          onClick={() => handleBetChange(betAmount - 1)}
          className="bg-[rgb(var(--color-primary))] text-white p-2 rounded-lg disabled:opacity-50 hover:bg-[rgb(var(--color-primary-dark))] transition-colors"
          disabled={betAmount <= 0 || isPlacingBet}
        >
          <Minus size={20} />
        </button>
        <input
          type="number"
          value={betAmount}
          onChange={(e) => handleBetChange(Number(e.target.value))}
          className="bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] text-center w-32 p-2 rounded-lg"
          min={0}
          max={MAX_BET}
          disabled={isPlacingBet}
        />
        <button
          onClick={() => handleBetChange(betAmount + 1)}
          className="bg-[rgb(var(--color-primary))] text-white p-2 rounded-lg disabled:opacity-50 hover:bg-[rgb(var(--color-primary-dark))] transition-colors"
          disabled={betAmount >= MAX_BET || isPlacingBet}
        >
          <Plus size={20} />
        </button>
      </div>
    </div>

    <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 my-3 md:my-2">
      {quickBets.map((bet) => (
        <button
          key={bet.value}
          onClick={() => handleQuickBet(bet.value)} // Using handleQuickBet
          className={`border border-[rgb(var(--color-border))] py-2 px-4 rounded text-center hover:bg-[rgb(var(--color-background-hover))] transition-colors ${
            bet.value > user?.amount || isPlacingBet ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={bet.value > user?.amount || isPlacingBet}
        >
          {bet.label}
        </button>
      ))}
    </div>

    <div className="flex gap-2">
      <button
        onClick={()=>{betPlaced(); onClose();}}
        className="flex-1 border border-red-500 text-red-500 py-2 rounded-lg font-medium transition duration-300 hover:bg-red-500 hover:text-white disabled:opacity-50"
        disabled={isPlacingBet}
      >
        Cancel
      </button>
      <button
        onClick={placeBet}
        className="flex-1 bg-green-500 text-white py-2 px-8 rounded-lg font-medium transition duration-300 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isPlacingBet || !currentMatch}
      >
        {isPlacingBet ? "Placing Bet..." : "Place Bet"}
      </button>
    </div>

    {user && eventId && (
      <div className="mt-4 flex-1 lg:flex hidden overflow-hidden flex-col">
        <div className="flex justify-between items-center mb-2">
          <h1 className="font-semibold underline text-[rgb(var(--color-primary))]">Open Bets:</h1>
          {isLoadingTransactions && <span className="text-sm text-[rgb(var(--color-text-muted))]">Loading...</span>}
        </div>
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[rgb(var(--color-background-hover))]">
                <th className="p-2 text-xs font-semibold text-[rgb(var(--color-text-primary))]">Selection</th>
                <th className="p-2 text-xs font-semibold text-[rgb(var(--color-text-primary))]">Stake</th>
                <th className="p-2 text-xs font-semibold text-[rgb(var(--color-text-primary))]">Odds</th>
                {allBets.some((bet) => bet.fancyNumber) && (
                  <th className="p-2 text-xs font-semibold text-[rgb(var(--color-text-primary))]">Run</th>
                )}
              </tr>
            </thead>
            <tbody>
              {allBets.map((bet, index) => (
                <tr
                  key={index}
                  className={`${
                    bet.type === "back" ? "bg-[rgb(var(--color-back))]" : "bg-[rgb(var(--color-lay))]"
                  } transition-all duration-200`}
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
      </div>
    )}

  </div>
  );
});

BetSlip.displayName = "BetSlip";

export default BetSlip;
