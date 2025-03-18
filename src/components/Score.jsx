"use client"

/* eslint-disable react/prop-types */
import { useState, useEffect } from "react"
import axios from "axios"
import { server } from "../constants/config"

export default function Score({ eventId }) {
  const [scoreData, setScoreData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchScoreData = async () => {
      try {
        const response = await axios.get(`${server}api/v1/scores/scores?eventId=${eventId}`)
        if (response.data.success) setScoreData(response.data.score)
        setIsLoading(false)
      } catch (err) {
        setError("Failed to fetch score data")
        setIsLoading(false)
        console.error("Error fetching score data:", err)
      }
    }

    // Initial fetch
    fetchScoreData()

    // Set up polling to refresh data every 1 second
    const intervalId = setInterval(fetchScoreData, 1000)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [eventId])

  if (isLoading && !scoreData) {
    return (
      <div className="flex justify-center items-center h-44">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--color-primary))]"></div>
      </div>
    )
  }

  if (error && !scoreData) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center h-44 flex flex-col justify-center">
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 inline-flex items-center justify-center rounded-md bg-[rgb(var(--color-primary))] px-3 py-1 text-xs font-medium text-white"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!scoreData || !scoreData.length) {
    return (
      <div className="rounded-lg border border-[rgb(var(--color-border))] bg-white p-3 text-center h-44 flex items-center justify-center">
        <p className="text-[rgb(var(--color-text-muted))] text-sm">No score data available</p>
      </div>
    )
  }

  const matchData = scoreData[0]

  if (!matchData || !matchData.score) {
    return (
      <div className="rounded-lg border border-[rgb(var(--color-border))] bg-white p-3 text-center h-44 flex items-center justify-center">
        <p className="text-[rgb(var(--color-text-muted))] text-sm">Score Not Available</p>
      </div>
    )
  }
  
  const { home, away } = matchData.score

  // Determine if this is a tennis match
  const isTennis =
    matchData.eventTypeId === 2 ||
    (home.sets !== undefined && home.sets !== "") ||
    (home.games !== undefined && home.games !== "")

  // Format match status for football
  const formatMatchStatus = (status) => {
    if (!status) return ""
    if (status === "FirstHalfEnd") return "Half Time"
    if (status === "SecondHalfEnd") return "Full Time"

    // Add other status mappings as needed
    return status.replace(/([A-Z])/g, " $1").trim() // Add spaces before capital letters
  }

  // Format time display for football
  const formatTime = (elapsed, added) => {
    if (matchData.status === "FirstHalfEnd") return "HT"
    if (matchData.status === "SecondHalfEnd") return "FT"

    return added > 0 ? `${elapsed}+${added}'` : `${elapsed}'`
  }

  return (
    <div className="rounded-lg mt-2 border border-[rgb(var(--color-border))] bg-white shadow-sm overflow-hidden max-h-44">
      <div className="bg-[rgb(var(--color-primary-lighter))] py-2 px-3 border-b border-[rgb(var(--color-border))]">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
            {isTennis ? "Tennis Match" : "Football Match"}
          </h2>
          {isTennis ? (
            <p className="text-xs text-[rgb(var(--color-text-muted))]">
              Set: {matchData.currentSet || "?"} • Game: {matchData.currentGame || "?"}
            </p>
          ) : (
            <div className="flex items-center">
              <span className="text-xs font-medium bg-[rgb(var(--color-primary))] text-white px-2 py-0.5 rounded">
                {formatMatchStatus(matchData.status)}
              </span>
              <span className="text-xs ml-2 font-bold">
                {formatTime(matchData.elapsedRegularTime, matchData.elapsedAddedTime)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-2 overflow-y-auto" style={{ maxHeight: "calc(11rem - 36px)" }}>
        {isTennis ? (
          // Tennis Match Display
          <>
            {/* Players and Score */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              <div className="col-span-3">
                <p className="text-xs text-[rgb(var(--color-text-muted))]">Players</p>
              </div>
              <div className="col-span-1 text-center">
                <p className="text-xs text-[rgb(var(--color-text-muted))]">Sets</p>
              </div>
              <div className="col-span-1 text-center">
                <p className="text-xs text-[rgb(var(--color-text-muted))]">Games</p>
              </div>
              <div className="col-span-2 text-center">
                <p className="text-xs text-[rgb(var(--color-text-muted))]">Current</p>
              </div>

              {/* Home Player */}
              <div className="col-span-3 flex items-center">
                <div
                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${home.isServing ? "bg-[rgb(var(--color-primary))]" : "bg-transparent"}`}
                ></div>
                <div className={`flex-1 text-xs truncate ${home.highlight ? "font-bold" : "font-medium"}`}>
                  {home.name}
                </div>
              </div>
              <div className="col-span-1 text-center text-xs font-semibold">{home.sets || "0"}</div>
              <div className="col-span-1 text-center text-xs font-semibold">{home.games || "0"}</div>
              <div className="col-span-2 text-center">
                <span className={`text-sm font-bold ${home.highlight ? "text-[rgb(var(--color-primary))]" : ""}`}>
                  {home.score || "0"}
                </span>
              </div>

              {/* Away Player */}
              <div className="col-span-3 flex items-center">
                <div
                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${away.isServing ? "bg-[rgb(var(--color-primary))]" : "bg-transparent"}`}
                ></div>
                <div className={`flex-1 text-xs truncate ${away.highlight ? "font-bold" : "font-medium"}`}>
                  {away.name}
                </div>
              </div>
              <div className="col-span-1 text-center text-xs font-semibold">{away.sets || "0"}</div>
              <div className="col-span-1 text-center text-xs font-semibold">{away.games || "0"}</div>
              <div className="col-span-2 text-center">
                <span className={`text-sm font-bold ${away.highlight ? "text-[rgb(var(--color-primary))]" : ""}`}>
                  {away.score || "0"}
                </span>
              </div>
            </div>

            {/* Game Sequence */}
            {home.gameSequence && away.gameSequence && (
              <div className="border-t border-[rgb(var(--color-border))] pt-1">
                <div className="grid grid-cols-2 gap-2">
                  {/* Home Games */}
                  <div>
                    <div className="flex items-center mb-1">
                      <span className="text-xs font-medium truncate">{home.name.split(" ")[0]}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {home.gameSequence.map((game, index) => (
                        <div
                          key={`home-game-${index}`}
                          className="w-5 h-5 flex items-center justify-center rounded bg-[rgb(var(--color-primary-lighter))] text-[rgb(var(--color-text-primary))] text-xs"
                        >
                          {game}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Away Games */}
                  <div>
                    <div className="flex items-center mb-1">
                      <span className="text-xs font-medium truncate">{away.name.split(" ")[0]}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {away.gameSequence.map((game, index) => (
                        <div
                          key={`away-game-${index}`}
                          className="w-5 h-5 flex items-center justify-center rounded bg-[rgb(var(--color-primary-lighter))] text-[rgb(var(--color-text-primary))] text-xs"
                        >
                          {game}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          // Football Match Display
          <>
            {/* Teams and Score */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              <div className="col-span-3">
                <p className="text-xs text-[rgb(var(--color-text-muted))]">Teams</p>
              </div>
              <div className="col-span-1 text-center">
                <p className="text-xs text-[rgb(var(--color-text-muted))]">Score</p>
              </div>
              <div className="col-span-1 text-center">
                <p className="text-xs text-[rgb(var(--color-text-muted))]">HT</p>
              </div>
              <div className="col-span-2 text-center">
                <p className="text-xs text-[rgb(var(--color-text-muted))]">Stats</p>
              </div>

              {/* Home Team */}
              <div className="col-span-3 flex items-center">
                <div className="flex-1 text-xs truncate font-medium">{home.name}</div>
              </div>
              <div className="col-span-1 text-center text-sm font-bold">{home.score}</div>
              <div className="col-span-1 text-center text-xs">{home.halfTimeScore}</div>
              <div className="col-span-2 flex justify-center space-x-2 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-400 mr-1"></div>
                  <span>{home.numberOfYellowCards || 0}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-600 mr-1"></div>
                  <span>{home.numberOfRedCards || 0}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs">⛳</span>
                  <span className="ml-1">{home.numberOfCorners || 0}</span>
                </div>
              </div>

              {/* Away Team */}
              <div className="col-span-3 flex items-center">
                <div className="flex-1 text-xs truncate font-medium">{away.name}</div>
              </div>
              <div className="col-span-1 text-center text-sm font-bold">{away.score}</div>
              <div className="col-span-1 text-center text-xs">{away.halfTimeScore}</div>
              <div className="col-span-2 flex justify-center space-x-2 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-400 mr-1"></div>
                  <span>{away.numberOfYellowCards || 0}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-600 mr-1"></div>
                  <span>{away.numberOfRedCards || 0}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs">⛳</span>
                  <span className="ml-1">{away.numberOfCorners || 0}</span>
                </div>
              </div>
            </div>

            {/* Match Timeline */}
            <div className="border-t border-[rgb(var(--color-border))] pt-2">
              <div className="flex justify-between items-center">
                <div className="text-xs font-medium">Match Timeline</div>
                <div className="text-xs text-[rgb(var(--color-text-muted))]">
                  Total Corners: {matchData.score.numberOfCorners || 0}
                </div>
              </div>

              <div className="mt-1 relative h-4 bg-gray-100 rounded overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-[rgb(var(--color-primary-lighter))]"
                  style={{ width: `${Math.min(((matchData.timeElapsed || 0) / 90) * 100, 100)}%` }}
                ></div>
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                  <span className="text-[10px] font-medium">
                    {matchData.status === "FirstHalfEnd" ? "Half Time" : `${matchData.timeElapsed || 0} min`}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
