"use client"

/* eslint-disable react/prop-types */
import { ChevronDown, ChevronRight } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"

// Sport ID mapping
const SPORT_IDS = {
  // FOOTBALL: 1,
  TENNIS: 2,
  CRICKET: 4,
  HORSE_RACING: 7,
}

// Sports configuration
const sportsConfig = [
  // {
  //   id: SPORT_IDS.FOOTBALL,
  //   name: "Football",
  //   icon: "⚽",
  //   route: "football",
  // },
  {
    id: SPORT_IDS.TENNIS,
    name: "Tennis",
    icon: "🎾",
    route: "tennis",
  },
  {
    id: SPORT_IDS.CRICKET,
    name: "Cricket",
    icon: "🏏",
    route: "cricket",
  },
  {
    id: SPORT_IDS.HORSE_RACING,
    name: "Horse Racing",
    icon: "🏇",
    route: "horse",
  },
  {
    id: null,
    name: "Basketball",
    icon: "🏀",
    route: "basketball",
  },
  {
    id: null,
    name: "Boxing",
    icon: "🥊",
    route: "boxing",
  },
  {
    id: null,
    name: "Politics",
    icon: "🗣️",
    route: "politics",
  },
  {
    id: null,
    name: "Kabaddi",
    icon: "🤼",
    route: "kabbadi",
  },
  {
    id: null,
    name: "Greyhound Racing",
    icon: "🐕",
    route: "greyhound",
  },
]

const AllGames = ({ sportsData }) => {
  const [openSport, setOpenSport] = useState(null)
  const [openSeries, setOpenSeries] = useState(null)
  const [processedSports, setProcessedSports] = useState([])
  const [totalGames, setTotalGames] = useState(0)

  const processSportsData = useCallback((data) => {
    try {
      if (!data || typeof data !== "object") {
        console.error("Invalid sports data format:", data)
        setProcessedSports(sportsConfig.map((sport) => ({ ...sport, count: 0, subItems: [] })))
        setTotalGames(0)
        return
      }

      // Process each sport from the configuration
      const processedSportsData = sportsConfig.map((sportConfig) => {
        // If sport has no ID or ID doesn't exist in data, return default structure
        if (!sportConfig.id || !data[sportConfig.id]) {
          return {
            ...sportConfig,
            count: 0,
            subItems: [],
          }
        }

        // Get the array for this sport ID
        const sportArray = data[sportConfig.id]

        if (!Array.isArray(sportArray) || sportArray.length === 0) {
          return {
            ...sportConfig,
            count: 0,
            subItems: [],
          }
        }

        // Process the sport data to extract series and games
        let subItems = []
        const gameCount = sportArray.length

        // Group games by series if the data structure allows
        try {
          // Group games by series
          const seriesGroups = {}

          sportArray.forEach((match) => {
            if (!match?.event?.series?.name) {
              // If match doesn't have series info, create a "General" category
              if (!seriesGroups["General"]) {
                seriesGroups["General"] = []
              }

              if (match?.event?.event?.id && match?.event?.event?.name) {
                seriesGroups["General"].push({
                  id: match.event.event.id,
                  name: match.event.event.name,
                  startDate: match.event.event.startDate,
                  inPlay: match.odds?.[0]?.inplay || false,
                })
              }
              return
            }

            const seriesName = match.event.series.name
            if (!seriesGroups[seriesName]) {
              seriesGroups[seriesName] = []
            }

            if (match.event?.event?.id && match.event?.event?.name) {
              seriesGroups[seriesName].push({
                id: match.event.event.id,
                name: match.event.event.name,
                startDate: match.event.event.startDate,
                inPlay: match.odds?.[0]?.inplay || false,
              })
            }
          })

          // Convert to subItems format
          subItems = Object.entries(seriesGroups).map(([series, matches]) => ({
            name: series,
            count: matches.length,
            games: matches,
          }))
        } catch (error) {
          console.error(`Error processing ${sportConfig.name} data:`, error)
          // Fallback to simple list if grouping fails
          subItems = [
            {
              name: "All Matches",
              count: sportArray.length,
              games: sportArray.map((match) => ({
                id: match.id || `match-${Math.random()}`,
                name: match.name || `${sportConfig.name} Match`,
                inPlay: false,
              })),
            },
          ]
        }

        return {
          ...sportConfig,
          count: gameCount,
          subItems: subItems,
        }
      })

      // Calculate total games
      const totalGamesCount = Object.values(data).reduce((acc, sportArray) => {
        return acc + (Array.isArray(sportArray) ? sportArray.length : 0)
      }, 0)

      setProcessedSports(processedSportsData)
      setTotalGames(totalGamesCount)
    } catch (error) {
      console.error("Error processing sports data:", error)
      // Set default values in case of error
      setProcessedSports(sportsConfig.map((sport) => ({ ...sport, count: 0, subItems: [] })))
      setTotalGames(0)
    }
  }, [])

  useEffect(() => {
    if (sportsData) {
      processSportsData(sportsData)
    }
  }, [sportsData, processSportsData])
  
  return (
    <div className=" min-h-screen h-fit lg:border mt-2 lg:rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-background))] text-[rgb(var(--color-text-primary))] p-4 w-full">
      <div className="mb-2">
        <span className="text-xs font-medium text-[rgb(var(--color-text-muted))]">SPORTS</span>
        <span className="float-right text-[rgb(var(--color-primary))] text-sm">{totalGames}</span>
      </div>

      <div className="space-y-1">
        {processedSports.map((sport) => (
          <div key={sport.name}>
            <button
              onClick={() => setOpenSport(openSport === sport.name ? null : sport.name)}
              className="flex items-center w-full px-2 py-1.5 hover:bg-[rgb(var(--color-background-hover))] rounded-lg transition-colors"
            >
              <span className="mr-2">{sport.icon}</span>
              <span className="">{sport.name}</span>
              <span className="ml-auto text-[rgb(var(--color-primary))]">{sport.count}</span>
              {sport.subItems?.length > 0 && (
                <span className="ml-2">
                  {openSport === sport.name ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </span>
              )}
            </button>

            {openSport === sport.name && sport.subItems?.length > 0 && (
              <div className="ml-7 space-y-1 mt-1">
                {sport.subItems.map((series) => (
                  <div key={series.name}>
                    <div
                      onClick={() => setOpenSeries(openSeries === series.name ? null : series.name)}
                      className="flex items-center px-2 py-1.5 hover:bg-[rgb(var(--color-background-hover))] rounded-lg transition-colors cursor-pointer"
                    >
                      <span className="text-sm">{series.name}</span>
                      <span className="ml-auto text-[rgb(var(--color-primary-light))]">{series.count}</span>
                      {series.games?.length > 0 && (
                        <ChevronRight
                          className={`w-4 h-4 ml-2 transition-transform ${
                            openSeries === series.name ? "rotate-90" : ""
                          }`}
                        />
                      )}
                    </div>

                    {/* Events under series */}
                    {openSeries === series.name && series.games?.length > 0 && (
                      <div className="ml-4 mt-1 space-y-1">
                        {series.games.map((game) => (
                          <div
                            key={game.id}
                            className="flex flex-col px-2 py-1.5 hover:bg-[rgb(var(--color-background-hover))] rounded-lg transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              {game.inPlay && <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />}
                              <Link
                                to={`/match/${sport.id}/${game.id}/${encodeURIComponent(game?.name)}`}
                                className="text-sm text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-primary-dark))] transition-colors"
                              >
                                {game.name}
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AllGames
