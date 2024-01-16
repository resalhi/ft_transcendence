"use client"
import React from 'react';
import './matchHistory.css';
import dynamic from 'next/dynamic';

const MatchHistory = ({games}:any) => {  
  return <>
  <div className='matchHistory '>
    <h3 className='mhtitle'>Matches/History</h3>
    <div className="board">
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex flex-col gap-4 p-4 md:p-6">
          <div className="overflow-auto">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&amp;_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0 w-[80px]">
                      Rank
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0 w-[80px]">
                      Avatar
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                      Name
                    </th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0 text-right">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody className="[&amp;_tr:last-child]:border-0">
                  {games.map((game: any, index: number) => (
                    <tr
                      key={index} // Make sure to include a unique key for each item in the array
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0 font-medium">
                        <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                            <img className='dashBoard_game_img' src={game.user_score < game.opp_score ? "/assets/lost-icon.svg" : "/assets/win-icon.svg"}alt="" />
                        </span>
                      </td>
                      <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                        <span className="relative flex shrink-0 overflow-hidden rounded-full w-10 h-10">
                          <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                            <img src={game.oppenent.avatarUrl} alt="" />
                          </span>
                        </span>
                      </td>
                      <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0 font-medium">
                        {game.oppenent.username}
                      </td>
                      <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0 text-right">
                        {game.user_score} : {game.opp_score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </>

};


const MatchHistory2 = dynamic(() => Promise.resolve(MatchHistory), { ssr: false });

export default MatchHistory2;