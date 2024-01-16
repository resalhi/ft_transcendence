"use client";

import React from "react";
import "./gameItem.css";
import Image from "next/image";

const GameHistory = ({game}:any) => {
    return <div className="gameHistory-item flex flex-col justify-center items-center w-full max-w-sm rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
    <div className="gameHistory-content flex flex-col items-center justify-center p-5"
        style={{boxShadow:game.user_score < game.opp_score ? "0px 0px 8px 0px #E04F5F" : "0px 0px 8px 0px #4BAE4F"}}
        >
      <img
        className="w-24 h-24 mb-3 rounded-full shadow-lg"
        src={game.oppenent.avatarUrl}
        alt="Bonnie image"
      />
      <h5 className="mb-1 text-base font-medium text-gray-900 dark:text-white">{game.oppenent.username}</h5>
      <span className="font-bold text-lg pt-5  text-gray-500 dark:text-gray-400">{game.user_score} : {game.opp_score}</span>
    </div>
    <img src={game.user_score < game.opp_score ? "/assets/lost-icon.svg" : "/assets/win-icon.svg"} alt=""/>
  </div>

}

export default GameHistory;