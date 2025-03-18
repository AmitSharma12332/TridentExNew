"use client"

/* eslint-disable react/prop-types */
import { lazy } from "react"

const GameOdds = lazy(() => import("../GameOdds"))

const Cricket = ({ liveData, onBetSelect, betPlaced }) => {
 

  if (!liveData || liveData.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-lg">No matches available at the moment</p>
      </div>
    )
  }

  return (
    <div className="">
      <GameOdds betPlaced={betPlaced} liveData={liveData} onBetSelect={onBetSelect} />
    </div>
  )
}

export default Cricket

