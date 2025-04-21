/* eslint-disable react/prop-types */
"use client"

import axios from "axios"
import isEqual from "lodash/isEqual"
import { ChevronRight } from "lucide-react"
import PropTypes from "prop-types"
import { lazy, memo, useCallback, useEffect, useState, Suspense } from "react"
import { server } from "../../constants/config"
import { calculateNewMargin, calculateProfitAndLoss } from "../../utils/helper"
import { betSelectionEvent } from "./bet-selection-event"

const BetSlip = lazy(() => import("../BetSlip"))

// Add a BetSlip placeholder to prevent layout shifts
const BetSlipPlaceholder = () => (
  <div className="lg:hidden w-full border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-background-lighter))] h-[200px] flex items-center justify-center">
    <div className="animate-pulse text-[rgb(var(--color-text-muted))]">Loading bet slip...</div>
  </div>
)

const OddsBox = ({ odds, value, type, onClick, isSelected }) => {
  const bgColor = type === "Back" ? "bg-[rgb(var(--back-odd))]" : "bg-[rgb(var(--lay-odd))]"
  const hoverColor = type === "Back" ? "hover:bg-[rgb(var(--back-odd-hover))]" : "hover:bg-[rgb(var(--lay-odd-hover))]"
  // Updated selected colors to be more vibrant and consistent
  const selectedColor = type === "Back" ? "bg-[#0077B3]" : "bg-[#FF4D55]"

  return (
    <button
      onClick={onClick}
      className={`${
        isSelected ? selectedColor : bgColor
      } ${hoverColor} sm:w-12 lg:min-w-[100px] min-w-[100px] md:w-16 rounded flex flex-col items-center justify-center transition-colors p-1`}
    >
      {odds > 0 ? (
        <>
          <span className={`font-semibold text-sm ${isSelected ? "text-white" : "text-[rgb(var(--color-text-primary))]"}`}>
            {odds?.toFixed(2)}
          </span>
          <span className={`text-[10px] lg:text-xs ${isSelected ? "text-white" : "text-[rgb(var(--color-text-primary))]"}`}>
            {Math.floor(value)}
          </span>
        </>
      ) : (
        <span className="text-xs font-semibold text-[rgb(var(--color-text-muted))]">Suspended</span>
      )}
    </button>
  )
}

const TeamRow = ({
  teamName,
  backOdds,
  layOdds,
  onOddsClick,
  matchData,
  stake,
  selectedOdd,
  selectionId,
  margin,
  selectedBet,
  betPlaced,
  setStake,
  onClose,
}) => {
  const previousMargin = margin?.selectionId === selectionId ? margin?.profit : margin?.loss

  let newProfit = 0
  let newLoss = 0
  let profit = 0
  let loss = 0

  if (selectedOdd) {
    const res = calculateProfitAndLoss(stake, selectedOdd.odds, selectedOdd.type, "bookmaker")
    profit = res.profit
    loss = res.loss

    const data = calculateNewMargin(margin, selectedOdd.selectionId, selectedOdd.type, profit, loss)

    newProfit = data.newProfit
    newLoss = data.newLoss
  }

  // Filter out zero value odds and take only first index
  const filteredBackOdds = backOdds.filter(([value]) => value > 0).slice(0, 1)
  const filteredLayOdds = layOdds.filter(([value]) => value > 0).slice(0, 1)

  const showBetSlip = selectedBet && selectedBet.selectionId === selectionId

  // Handle click without causing page scroll
  const handleOddsBoxClick = (matchData, teamName, type, odds, value, selectionId) => {
    // Save current scroll position
    const scrollPosition = window.scrollY

    // Call the original click handler
    onOddsClick(matchData, teamName, type, odds, value, selectionId)

    // Restore scroll position after a short delay to let the DOM update
    setTimeout(() => {
      window.scrollTo({
        top: scrollPosition,
        behavior: "auto",
      })
    }, 0)
  }

  return (
    <>
      <div className="flex gap-2 py-2 px-4 sm:flex-nowrap justify-between items-center border-b border-[rgb(var(--color-border))]">
        <div className="flex flex-col">
          <span className="text-[rgb(var(--color-text-primary))] text-sm w-20 sm:w-[200px] mb-0 font-semibold sm:mb-0">
            {teamName}
          </span>
          <span className="w-full flex justify-start text-xs items-center sm:w-[200px] mb-0 font-semibold sm:mb-0">
            {((previousMargin !== null && previousMargin !== undefined) || selectedOdd) && (
              <>
                <span
                  className={`text-xs ${
                    (margin?.selectionId === selectionId ? margin?.profit : margin?.loss) > 0
                      ? "text-green-600"
                      : (margin?.selectionId === selectionId ? margin?.profit : margin?.loss) < 0
                        ? "text-red-600"
                        : "text-[rgb(var(--color-text-muted))]"
                  }`}
                >
                  {margin
                    ? margin?.selectionId === selectionId
                      ? Math.abs(margin?.profit?.toFixed(0))
                      : Math.abs(margin?.loss?.toFixed(0))
                    : 0}
                </span>
                {selectedOdd &&
                  (margin ? (
                    <>
                      <span className="text-[rgb(var(--color-text-muted))] scale-75 text-[4px]">
                        <ChevronRight />
                      </span>
                      <span
                        className={`text-xs ${
                          (margin?.selectionId === selectionId ? newProfit : newLoss) > 0
                            ? "text-green-600"
                            : (margin?.selectionId === selectionId ? newProfit : newLoss) < 0
                              ? "text-red-600"
                              : "text-[rgb(var(--color-text-muted))]"
                        }`}
                      >
                        {margin?.selectionId === selectionId
                          ? Math.abs(newProfit?.toFixed(0))
                          : Math.abs(newLoss?.toFixed(0))}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[rgb(var(--color-text-muted))] scale-75 text-[4px]">
                        <ChevronRight />
                      </span>
                      <span
                        className={`text-xs ${
                          (
                            selectedOdd?.type === "back"
                              ? selectedOdd?.selectionId === selectionId
                                ? profit
                                : loss
                              : selectedOdd?.selectionId === selectionId
                                ? loss
                                : profit
                          ) > 0
                            ? "text-green-600"
                            : (selectedOdd?.type === "back"
                                  ? selectedOdd?.selectionId === selectionId
                                    ? profit
                                    : loss
                                  : selectedOdd?.selectionId === selectionId
                                    ? loss
                                    : profit) < 0
                              ? "text-red-600"
                              : "text-[rgb(var(--color-text-muted))]"
                        }`}
                      >
                        {Math.abs(
                          selectedOdd?.type === "back"
                            ? selectedOdd?.selectionId === selectionId
                              ? profit?.toFixed(0)
                              : loss?.toFixed(0)
                            : selectedOdd?.selectionId === selectionId
                              ? loss?.toFixed(0)
                              : profit?.toFixed(0),
                        )}
                      </span>
                    </>
                  ))}
              </>
            )}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:flex gap-1">
          {filteredBackOdds.map(([odds, value], i) => (
            <OddsBox
              key={`back-${i}`}
              odds={odds}
              value={value}
              type="Back"
              onClick={() => handleOddsBoxClick(matchData, teamName, "Back", odds, value, selectionId)}
              isSelected={
                selectedOdd &&
                selectedOdd.selectionId === selectionId &&
                selectedOdd.type === "back" &&
                selectedOdd.odds === odds
              }
            />
          ))}
          {filteredLayOdds.map(([odds, value], i) => (
            <OddsBox
              key={`lay-${i}`}
              odds={odds}
              value={value}
              type="Lay"
              onClick={() => handleOddsBoxClick(matchData, teamName, "Lay", odds, value, selectionId)}
              isSelected={
                selectedOdd &&
                selectedOdd.selectionId === selectionId &&
                selectedOdd.type === "lay" &&
                selectedOdd.odds === odds
              }
            />
          ))}
        </div>
      </div>
      {showBetSlip && (
        <div className="lg:hidden w-full border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-background-lighter))]">
          <Suspense fallback={<BetSlipPlaceholder />}>
            <BetSlip match={selectedBet} onClose={onClose} setStake={setStake} betPlaced={betPlaced} />
          </Suspense>
        </div>
      )}
    </>
  )
}

const BookmakerComponent = ({
  data,
  eventId,
  onBetSelect,
  setStake,
  stake,
  showBetSlip = true,
  marginAgain,
  betPlaced,
}) => {
  const [selectedBet, setSelectedBet] = useState(null)
  const [selectedOdd, setSelectedOdd] = useState(null)
  const [margin, setMargin] = useState(null)

  const bookmakerMarket = data.find(
    (market) =>
      market.market?.name?.includes("0%") &&
      Array.isArray(market.odds?.runners) &&
      market.odds.runners.length > 0,
  )

  const getMargins = useCallback(
    async (token) => {
      try {
        const response = await axios.get(`${server}api/v1/bet/margins?eventId=${eventId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.data.success) {
          const marginsData = response.data.margins[bookmakerMarket?.market?.id]
          setMargin(marginsData)
        }
      } catch (error) {
        console.error("Error fetching margins:", error.response?.data || error.message)
      }
    },
    [eventId, bookmakerMarket?.market?.id],
  )

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (token) {
      getMargins(token)
    }
  }, [getMargins, marginAgain])

  useEffect(() => {
    setSelectedOdd(null)
    setSelectedBet(null)
  }, [marginAgain])

  // Listen for bet selection events from other components
  useEffect(() => {
    const cleanup = betSelectionEvent.listen((event) => {
      const { source } = event.detail
      if (source !== "bookmaker") {
        // Clear selection if another component selected a bet
        setSelectedBet(null)
        setSelectedOdd(null)
      }
    })

    return cleanup
  }, [])

  const handleOddsClick = (market, teamName, type, odds, value, selectionId) => {
    // If clicking on the same odd, toggle it off
    if (
      selectedOdd &&
      selectedOdd.selectionId === selectionId &&
      selectedOdd.type === type?.toLowerCase() &&
      selectedOdd.odds === odds
    ) {
      setSelectedBet(null)
      setSelectedOdd(null)
      onBetSelect(null)
      return
    }

    if (!market || !type) {
      setSelectedBet(null)
      setSelectedOdd(null)
      onBetSelect(null)
      return
    }

    // Notify other components that a bet was selected here
    betSelectionEvent.dispatch("bookmaker")

    const betData = {
      home_team: market?.eventDetails?.runners?.[0]?.name || "Unknown",
      away_team: market?.eventDetails?.runners?.[1]?.name || "Unknown",
      eventId: market?.eventId || "",
      matchOddsMarketId: market?.eventDetails?.market?.id || "",
      marketId: market?.market?.id || "",
      selectionId: selectionId,
      stake: stake,
      fancyNumber: null,
      category: "bookmaker",
      type: type.toLowerCase(),
      gameId: market?.market?.id || "",
      eventName: teamName,
      selectedTeam: teamName,
      size: value || 0,
      betType: type,
      odds: odds || 0,
      marketName: market?.market?.name || "Unknown Market",
    }

    setSelectedBet(betData)
    setSelectedOdd({
      selectionId,
      type: type.toLowerCase(),
      odds,
    })
    onBetSelect(betData)
  }

  const handleCloseBetSlip = () => {
    setSelectedBet(null)
    setSelectedOdd(null)
    onBetSelect(null)
  }

  return (
    <div>
      {bookmakerMarket ? (
        <div className="bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] mt-2 mb-2 rounded-lg overflow-hidden">
          <div className="flex justify-between items-center px-3 py-3 bg-[rgb(var(--color-background))] border-b border-[rgb(var(--color-border))]">
            <h1 className="text-[rgb(var(--color-text-primary))] font-medium">Bookmaker</h1>
            <div className="flex flex-row sm:flex-nowrap items-center gap-1">
              <span className="text-xs bg-[rgb(var(--back-odd))] sm:text-sm text-center w-[100px] text-[rgb(var(--color-text-primary))] py-1 rounded font-semibold">
                Back
              </span>
              <span className="text-xs sm:text-sm bg-[rgb(var(--lay-odd))] w-[100px] text-center text-[rgb(var(--color-text-primary))] py-1 rounded font-semibold">
                Lay
              </span>
            </div>
          </div>

          <div className="">
            {bookmakerMarket.odds?.runners?.map((runner) => {
              const backOdds = (runner.back || []).map((odds) => [odds.price, odds.size]).reverse()
              const layOdds = (runner.lay || []).map((odds) => [odds.price, odds.size])

              return (
                <TeamRow
                  key={runner.selectionId}
                  teamName={runner.name}
                  backOdds={backOdds}
                  layOdds={layOdds}
                  onOddsClick={handleOddsClick}
                  matchData={bookmakerMarket}
                  stake={stake}
                  selectedOdd={selectedOdd}
                  selectionId={runner.selectionId}
                  margin={margin}
                  selectedBet={selectedBet}
                  betPlaced={betPlaced}
                  setStake={setStake}
                  onClose={handleCloseBetSlip}
                />
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] p-4 rounded-lg text-[rgb(var(--color-text-primary))] text-center">
          No bookmaker market available
        </div>
      )}

      {/* Remove the bottom BetSlip since it's now in each TeamRow */}
    </div>
  )
}

BookmakerComponent.propTypes = {
  data: PropTypes.array.isRequired,
  eventId: PropTypes.string.isRequired,
  onBetSelect: PropTypes.func.isRequired,
  stake: PropTypes.number,
  setStake: PropTypes.func,
  showBetSlip: PropTypes.bool,
}

const arePropsEqual = (prevProps, nextProps) => {
  return (
    isEqual(prevProps.data, nextProps.data) &&
    prevProps.onBetSelect === nextProps.onBetSelect &&
    prevProps.stake === nextProps.stake &&
    prevProps.eventId === nextProps.eventId &&
    prevProps.marginAgain === nextProps.marginAgain
  )
}

const Bookmaker = memo(BookmakerComponent, arePropsEqual)
Bookmaker.displayName = "Bookmaker"

export default Bookmaker
