import React from 'react';
import './scores.css'
import { Room } from './../../../../backend/src/game/infos.dto';
interface ScoreProps {
  player1score: number;
  player2score: number;
  player1avatar: string;
  player2avatar: string;
  isAI: boolean;
}

const Score: React.FC<ScoreProps> = ({ player1score, player2score, player1avatar, player2avatar, isAI}) => {
  return (
    <div className="score-bar">
      <div className='score-img'><img src={player1avatar} alt="" /></div>
      <div className="left-score">{player1score}</div>
      <div className="right-score">{player2score}</div>
      {isAI && <div className='score-img'><img src="https://www.marktechpost.com/wp-content/uploads/2023/05/7309681-scaled.jpg" alt="" /></div>}
      {!isAI && <div className='score-img'><img src={player2avatar} alt="" /></div>}
    </div>
  );
};

export default Score;
