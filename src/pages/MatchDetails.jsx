/* eslint-disable no-unused-vars */
"use client";

/* eslint-disable react/prop-types */
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AllGames from "../components/AllGames";
import BetSlip from "../components/BetSlip";
import Loader from "../components/Loader";
import Bookmaker from "../components/matchdetails_ui/Bookmaker";
import CricketScore from "../components/matchdetails_ui/CircketScore";
import MatchOdds from "../components/matchdetails_ui/MatchOdds";
import Market from "../components/matchdetails_ui/Market";
import { server } from "../constants/config";
import OpenBetsMob from "../components/OpenBetsMob";
import Score from "../components/Score";

// Separate tabComponents definition to avoid recursive reference
const tabComponents = {
  bookmaker: Bookmaker, // Keep Bookmaker separate as it has unique functionality
  fancy: (props) => <Market {...props} title="Fancy" type="fancy" />,
  player: (props) => <Market {...props} title="Player" type="fancy" />,
  over: (props) => <Market {...props} title="Over" type="fancy" />,
  b_fancy: (props) => <Market {...props} title="B Fancy" type="fancy" />,
  odd_even: (props) => <Market {...props} title="Odd Even" type="fancy" />,
  line: (props) => <Market {...props} title="Line" type="fancy" />,
};

const AllComponents = ({
  data,
  marginAgain,
  setStake,
  eventId,
  stake,
  onBetSelect,
  betPlaced,
}) => {
  return (
    <>
      {Object.entries(data).map(([key, value]) => {
        const Component = tabComponents[key];
        return Component ? (
          <div key={key} className="mb-8">
            <Component
              marginAgain={marginAgain}
              stake={stake}
              eventId={eventId}
              setStake={setStake}
              data={value}
              onBetSelect={onBetSelect}
              betPlaced={betPlaced}
              showBetSlip={true}
            />
          </div>
        ) : null;
      })}
    </>
  );
};

const MatchDetails = ({ sportsData }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { eventId } = useParams();
  const { sportId } = useParams();
  const [selectedBet, setSelectedBet] = useState(null);
  const [marginAgain, setMarginAgain] = useState(false);
  const [stake, setStake] = useState(100);

  useEffect(() => {
    if (!eventId) {
      setError("Event ID is missing.");
      setLoading(false);
      return;
    }

    // Skip API calls for the specific eventIds
    if (String(eventId) === "34440606" || String(eventId) === "34448947") {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${server}api/v1/getMarkets?eventId=${eventId}&sportId=${sportId}`
        );

        if (response.status !== 200) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        setData(response.data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(
          err.response?.data?.message ||
            "Failed to fetch market data. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 1000);

    return () => clearInterval(intervalId);
  }, [eventId, sportId]);

  const categorizedData = useMemo(() => {
    if (!data) return null;

    const categorizeMarkets = (rawData) => {
      const categories = {
        bookmaker:
          rawData.getBookmaker.map((market) => ({
            ...market,
            eventDetails: rawData.eventDetail,
          })) || [],
        fancy: [],
        player: [],
        over: [],
        b_fancy: [],
        odd_even: [],
        line: [],
      };

      if (rawData.getFancy) {
        rawData.getFancy.forEach((market) => {
          const marketWithEventDetails = {
            ...market,
            eventDetails: rawData.eventDetail,
          };
          const name = market.market.name.toLowerCase();
          if (name.includes("only")) {
            categories.over.push(marketWithEventDetails);
          } else if (name.includes("over")) {
            categories.fancy.push(marketWithEventDetails);
          } else if (name.includes("total")) {
            categories.odd_even.push(marketWithEventDetails);
          } else if (
            name.includes("innings") ||
            name.includes("top") ||
            name.includes("most") ||
            name.includes("highest")
          ) {
            categories.line.push(marketWithEventDetails);
          } else if (
            name.startsWith("fall of") ||
            name.startsWith("caught") ||
            name.startsWith("match ")
          ) {
            categories.b_fancy.push(marketWithEventDetails);
          } else {
            categories.player.push(marketWithEventDetails);
          }
        });
      }
      return Object.fromEntries(
        Object.entries(categories).filter(([key, value]) => value.length > 0)
      );
    };

    return categorizeMarkets(data);
  }, [data]);

  const betPlaced = useCallback(() => {
    setSelectedBet(null);
    setMarginAgain((prev) => !prev);
  }, []);

  const handleBetSelection = useCallback((bet) => {
    setSelectedBet(bet);
  }, []);

  const handleStakeChange = useCallback((newStake) => {
    setStake(newStake);
  }, []);

  const activeComponent = useMemo(() => {
    if (!categorizedData) return null;

    if (activeTab === "all") {
      return (
        <AllComponents
          data={categorizedData}
          marginAgain={marginAgain}
          setStake={handleStakeChange}
          eventId={eventId}
          stake={stake}
          onBetSelect={handleBetSelection}
          betPlaced={betPlaced}
        />
      );
    }

    const ActiveComponent = tabComponents[activeTab];
    if (!ActiveComponent || !categorizedData[activeTab]?.length) return null;

    return (
      <ActiveComponent
        marginAgain={marginAgain}
        stake={stake}
        eventId={eventId}
        setStake={handleStakeChange}
        onBetSelect={handleBetSelection}
        data={categorizedData[activeTab]}
        betPlaced={betPlaced}
        showBetSlip={true}
      />
    );
  }, [
    activeTab,
    marginAgain,
    handleStakeChange,
    eventId,
    categorizedData,
    handleBetSelection,
    stake,
    betPlaced,
  ]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Check for specific eventIds and show glitch error
  if (String(eventId) === "34440606" || String(eventId) === "34448947" || String(eventId) === "34439603" || String(eventId) === "34439613") {
    return (
      <div className="px-2 pt-24 lg:pt-16">
        <div className="max-w-full flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-center p-8 bg-red-50 border-2 border-red-200 rounded-lg shadow-lg">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-red-600 mb-4">
              Odd Glitch Error
            </h1>
            <p className="text-red-500 text-lg mb-2">
              Something went wrong with the odds calculation!
            </p>
            <p className="text-red-400">
              Event ID: {eventId} is experiencing technical difficulties.
            </p>
            <div className="mt-6 animate-pulse">
              <div className="text-red-300 text-sm">
                System Error Code: GLT-404-ODD
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <Loader message="Loading match details..." />;
  if (error)
    return <p className="text-red-500 p-4 text-center">Error: {error}</p>;

  return (
    <div className="px-2 pt-28 lg:pt-20">
      <div className="max-w-full grid grid-cols-1 md:grid-cols-12 lg:h-[calc(100vh-68px)]">
        <div className="md:col-span-2 lg:flex hidden overflow-y-auto">
          <AllGames sportsData={sportsData} />
        </div>

        <div className="lg:col-span-7 md:col-span-12 rounded-lg p-2 lg:pt-2 lg:overflow-y-auto">
          <div className="p-4 bg-[rgb(var(--color-background))] border-[rgb(var(--color-border))] rounded-lg border">
            <div className="flex flex-col">
              <h1 className="text-2xl font-semibold text-[rgb(var(--color-text-primary))]">
                {data?.eventDetail?.event.name}
              </h1>
            </div>
            <div className="flex items-start justify-between flex-col md:flex-row mt-1">
              <p className="text-[rgb(var(--color-text-muted))]">
                {formatDate(data?.eventDetail?.event.startDate)}
              </p>
              <p className="text-[rgb(var(--color-primary))]">
                {data?.eventDetail?.series.name}
              </p>
            </div>
          </div>

          {sportId === "4" ? (
            <CricketScore eventId={eventId} />
          ) : (
            <Score eventId={eventId} />
          )}
          <OpenBetsMob eventId={eventId} marginAgain={marginAgain} />

          <MatchOdds
            stake={stake}
            marginAgain={marginAgain}
            eventId={eventId}
            setStake={handleStakeChange}
            onBetSelect={handleBetSelection}
            showBetSlip={true}
            betPlaced={betPlaced}
          />

          {/* Navigation Tabs */}
          <div className="flex gap-1 my-2 lg:gap-2 bg-[rgb(var(--color-background))] border-[rgb(var(--color-border))] overflow-x-auto rounded-lg border p-2">
            <button
              key="all"
              className={`px-6 rounded-md py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === "all"
                  ? "bg-[rgb(var(--color-primary))] text-white"
                  : "text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-primary))]"
              }`}
              onClick={() => setActiveTab("all")}
            >
              ALL
            </button>
            {Object.keys(categorizedData || {}).map((tab) => (
              <button
                key={tab}
                className={`px-3 rounded-md py-2 text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab
                    ? "bg-[rgb(var(--color-primary))] text-white"
                    : "text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-primary))]"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Dynamic Content Rendering */}
          {activeComponent}
        </div>

        {/* Bet Slip - Fixed on Right for Large Screens, Moves Below for Small Screens */}
        <div className="md:col-span-3 lg:flex hidden overflow-y-auto border-[rgb(var(--color-border))]">
          <BetSlip
            betPlaced={betPlaced}
            eventId={eventId}
            setStake={handleStakeChange}
            match={selectedBet}
            onClose={() => setSelectedBet(null)}
          />
        </div>
      </div>
    </div>
  );
};

export default MatchDetails;
