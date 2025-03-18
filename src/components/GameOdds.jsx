/* eslint-disable react/prop-types */
import { lazy, useState } from "react";
import { Link } from "react-router-dom";

const BetSlip = lazy(() => import("./BetSlip"));

const GameOdds = ({ liveData, onBetSelect,betPlaced }) => {
  // console.log(liveData);
  const [selectedBet, setSelectedBet] = useState(null);
  // Access the correct data structure

  const handleOddsClick = (game, team, type, odds) => {
    const betData = {
      home_team: game?.event?.runners?.[0]?.name || "Unknown",
      away_team: game?.event?.runners?.[1]?.name || "Unknown",
      eventId: game?.event?.event?.id || "",
      marketId: game?.odds?.[0]?.marketId || "",
      selectionId:
        game?.event?.runners?.find((r) => r.name === team)?.id || null,
      fancyNumber: null,
      stake: 0,
      odds: odds || 0,
      category: "match odds",
      type: type.toLowerCase(),
      gameId: game?.event?.event?.id || "",
      eventName: game?.event?.event?.name || "Unknown Market",
      selectedTeam: team,
      betType: type,
      size: 0,
    };
    setSelectedBet(betData);
    onBetSelect(betData);
  };


  // Helper function to get the best back/lay price
  const getBestPrice = (prices) => {
    if (!prices || prices?.length === 0) return "-";
    return prices[0].price.toFixed(2);
  };

  // Helper function to arrange runners with draw in middle
  const arrangeRunners = (runners = [], odds = []) => {
    if (!runners?.length || !odds?.length) return [];
    const draw = runners.find((r) => r?.name === "The Draw");
    const teams = runners.filter((r) => r?.name !== "The Draw");
    const arrangedRunners = [
      {
        runner: teams[0],
        odds: odds.find((o) => o?.selectionId === teams[0]?.id),
      },
      { runner: draw, odds: odds.find((o) => o?.selectionId === draw?.id) },
      {
        runner: teams[1],
        odds: odds.find((o) => o?.selectionId === teams[1]?.id),
      },
    ];
    return arrangedRunners;
  };

  const renderOddsBox = (game, runner, odds) => (
    <div className="flex flex-col gap-1 items-center">
      <h1 className="text-xs font-semibold truncate w-full text-center text-[rgb(var(--color-text-primary))]">
        {runner?.name || ""}
      </h1>
      <div className="grid grid-cols-2 gap-1 w-full">
        {runner && odds ? (
          <>
            <button
              onClick={() =>
                handleOddsClick(
                  game,
                  runner.name,
                  "Back",
                  getBestPrice(odds.back)
                )
              }
              className="w-full bg-[#72bbef] justify-center items-center rounded-sm h-8 text-[rgb(var(--color-text-primary))] text-xs font-semibold hover:bg-[rgb(var(--color-back-hover))] transition-colors"
            >
              {getBestPrice(odds.back)}
            </button>
            <button
              onClick={() =>
                handleOddsClick(
                  game,
                  runner.name,
                  "Lay",
                  getBestPrice(odds.lay)
                )
              }
              className="w-full bg-[#faa9ba] rounded-sm h-8 text-[rgb(var(--color-text-primary))] text-xs font-semibold flex items-center justify-center hover:bg-[rgb(var(--color-lay-hover))] transition-colors"
            >
              {getBestPrice(odds.lay)}
            </button>
          </>
        ) : (
          <>
            <div className="w-full h-8 bg-[rgb(var(--color-lay-muted))] rounded-sm flex items-center justify-center text-[rgb(var(--color-text-muted))]">-</div>
            <div className="w-full h-8 bg-[rgb(var(--color-back-muted))] rounded-sm flex items-center justify-center text-[rgb(var(--color-text-muted))]">-</div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="pt-2">
      <div className="flex gap-2 flex-col">
        {liveData && liveData?.length > 0 ? (
          liveData.map((game, index) => {
            const arrangedRunners = arrangeRunners(
              game.event?.runners,
              game.odds?.[0]?.runners
            );

            return (
              <div key={game.event?.event?.id || index}>
                <div className="bg-[rgb(var(--color-background))] border border-dashed border-[rgb(var(--color-border))] flex flex-col md:flex-row justify-between px-2 py-2 rounded-lg">
                  {/* Game Header */}
                  <div className="w-full md:w-2/3 mb-1 md:mb-0">
                    <div className="flex items-center gap-2 text-xs">
                      {game.odds[0]?.inplay && (
                        <div className="flex justify-center flex-col mr-3 items-center">
                          <h1 className="text-[10px] font-semibold text-green-600">
                            LIVE
                          </h1>
                          <span className="h-0.5 w-6 animate-ping bg-green-500" />
                        </div>
                      )}

                      <span className="text-[rgb(var(--color-primary))] text-[10px]  uppercase font-semibold">
                        {game.event?.sport?.name}
                      </span>
                      <span className="text-[rgb(var(--color-text-muted))]">•</span>
                      <span className="text-[rgb(var(--color-primary))]  text-[10px] uppercase font-semibold">
                        {game.event?.series?.name}
                      </span>
                    </div>
                    <Link
                      to={`/match/${game?.event?.sport?.id}/${game.event?.event?.id}/${encodeURIComponent(game.event?.event?.name)}`}
                      className="block  hover:text-[rgb(var(--color-primary))] transition-colors"
                    >
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex gap-2 justify-start items-center">
                          <h3 className="text-[rgb(var(--color-text-primary))] font-bold text-sm">
                            {arrangedRunners[0]?.runner?.name || "Team 1"}
                          </h3>
                          <h5 className="text-[rgb(var(--color-text-primary))] text-xs font-bold">v/s</h5>
                          <h3 className="text-[rgb(var(--color-text-primary))] font-bold text-sm">
                            {arrangedRunners[2]?.runner?.name || "Team 2"}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Odds Section */}
                  <div className="grid grid-cols-3 gap-2 w-full md:w-full md:ml-16">
                    {renderOddsBox(
                      game,
                      arrangedRunners[0]?.runner,
                      arrangedRunners[0]?.odds
                    )}
                    {arrangedRunners[1]?.runner ? (
                      renderOddsBox(
                        game,
                        arrangedRunners[1]?.runner,
                        arrangedRunners[1]?.odds
                      )
                    ) : (
                      <div className="flex flex-col gap-1 items-center">
                        <h1 className="text-xs font-semibold text-[rgb(var(--color-text-primary))]">The Draw</h1>
                        <div className="grid grid-cols-2 gap-1 w-full">
                          <div className="w-full flex justify-center items-center h-8 bg-[rgb(var(--color-lay-muted))] rounded-sm text-[rgb(var(--color-text-muted))]">
                            -
                          </div>
                          <div className="w-full flex justify-center items-center h-8 bg-[rgb(var(--color-back-muted))] rounded-sm text-[rgb(var(--color-text-muted))]">
                            -
                          </div>
                        </div>
                      </div>
                    )}
                    {renderOddsBox(
                      game,
                      arrangedRunners[2]?.runner,
                      arrangedRunners[2]?.odds
                    )}
                  </div>
                </div>
                {/* BetSlip for mobile */}
                {selectedBet &&
                  selectedBet.gameId === game.event?.event?.id && (
                    <div className="lg:hidden mt-2">
                      <BetSlip
                        match={selectedBet}
                        onClose={() => {
                          setSelectedBet(null);
                        }}
                        betPlaced={betPlaced}
                      />
                    </div>
                  )}
              </div>
            );
          })
        ) : (
          <div className="text-[rgb(var(--color-text-primary))] text-center py-4">
            Loading matches for you...
          </div>
        )}
      </div>
    </div>
  );
};

export default GameOdds;
