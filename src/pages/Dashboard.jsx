"use client"

/* eslint-disable react/prop-types */
import { lazy, useCallback, useEffect, useRef, useState } from "react"
import Footer from "../components/Footer"

const AllGames = lazy(() => import("./../components/AllGames"))
const GamesHeader = lazy(() => import("./../components/GamesHeader"))
const BetSlip = lazy(() => import("../components/BetSlip"))
const Cricket = lazy(() => import("../components/ui/Cricket"))
const ImageCarousel = lazy(() => import("../components/ImageCarousel"))

// Sport ID mapping
const SPORT_IDS = {
  FOOTBALL: 1,
  TENNIS: 2,
  CRICKET: 4,
  HORSE_RACING: 7,
}

const Dashboard = ({ showsidebar, toggleSidebar, sportsData }) => {
  const [activeTab, setActiveTab] = useState("cricket")
  const [selectedBet, setSelectedBet] = useState(null)
  const sidebarRef = useRef(null)

  // Get sports data by ID from the object structure
  const getFilteredSportsData = (sportId) => {
    if (!sportsData || typeof sportsData !== 'object') {
      // console.log("Invalid sports data:", sportsData);
      return [];
    }
    
    // Access the array directly using the sport ID as key
    const sportArray = sportsData[sportId];
    
    if (!Array.isArray(sportArray)) {
      // console.log(`No array found for sport ID ${sportId}`);
      return [];
    }
    
    // Filter out any null or undefined values
    return sportArray.filter(item => item != null);
  }

  const handleBetSelection = (betData) => {
    setSelectedBet(betData)
  }

  const betPlaced = useCallback(() => {
    setSelectedBet(null)
  }, [])

  // Function to handle clicks outside of sidebar
  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        toggleSidebar(false)
      }
    }

    if (showsidebar) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showsidebar, toggleSidebar])

  const renderActiveComponent = () => {
    let filteredData = [];
    let sportId = null;

    // Map active tab to sport ID
    switch (activeTab) {
      case "cricket":
        sportId = SPORT_IDS.CRICKET;
        break;
      case "football":
        sportId = SPORT_IDS.FOOTBALL;
        break;
      case "tennis":
        sportId = SPORT_IDS.TENNIS;
        break;
      case "horse":
        sportId = SPORT_IDS.HORSE_RACING;
        break;
      case "basketball":
      case "boxing":
      case "politics":
      case "kabbadi":
        sportId = null;
        break;
      default:
        sportId = null;
    }

    // Get data for the active sport
    if (sportId) {
      filteredData = getFilteredSportsData(sportId);
      // console.log(`Data for ${activeTab} (ID: ${sportId}):`, filteredData);
    }

    // If no data is available for the selected sport
    if ((!filteredData || filteredData.length === 0) && 
        ["basketball", "boxing", "politics", "kabbadi"].includes(activeTab)) {
      return (
        <div className="p-4 text-center">
          <p className="text-lg">No data available for this sport</p>
        </div>
      );
    }

    // Use Cricket component for all sports
    return (
      <Cricket 
        betPlaced={betPlaced} 
        liveData={filteredData} 
        onBetSelect={handleBetSelection}
        sportId={sportId} // Pass the sport ID to help with sport-specific rendering if needed
      />
    );
  }

  return (
    <>
      <div className="px-2 pt-24 lg:pt-16">
        <div className="max-w-full grid grid-cols-1 md:grid-cols-12 lg:h-[calc(100vh-68px)]">
          {/* Sidebar */}
          <div className="md:col-span-2 lg:flex hidden overflow-y-auto">
            <AllGames sportsData={sportsData} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-7 md:col-span-12 rounded-lg p-2 lg:pt-2 lg:overflow-y-auto">
            <ImageCarousel />
            <GamesHeader activeTab={activeTab} setActiveTab={setActiveTab} />
            {renderActiveComponent()}
            <Footer />
          </div>

          {/* Right Sidebar */}
          <div className="md:col-span-3 lg:flex hidden overflow-y-auto">
            <BetSlip match={selectedBet} betPlaced={betPlaced} onClose={() => setSelectedBet(null)} />
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard
