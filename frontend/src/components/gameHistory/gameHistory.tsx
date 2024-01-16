"use client"
import React from "react";
import "./gameHistory.css";
import GameItem from "./gameItem/gameItem";

const GameHistory = ({ games }: any) => {
  const limitedGames = games.slice(0, 4);

  return (
    <div id="gameHistory">
      <h2 className="section-title">Game History</h2>
      {games.length === 0 ? (
        <p>No game history available.</p>
      ) : (
        <div className="gameHistory-items">
          {games.map((game: any, index: number) => (
            <GameItem game={game} key={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default GameHistory;
