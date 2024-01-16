"use client"

import React from "react";
import "./leaderBoard.css";

const Leaderboard = ({ leaderBoard }: any) => (
  <div className="leaderboard">
    <h3 className="mhtitle">Leader board</h3>
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
                      Goals
                    </th>
                  </tr>
                </thead>
                <tbody className="[&amp;_tr:last-child]:border-0">
                  {leaderBoard.map((user: any, index: number) => (
                    <tr
                      key={user.id} // Make sure to include a unique key for each item in the array
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0 font-medium">
                        {index + 1}
                      </td>
                      <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                        <span className="relative flex shrink-0 overflow-hidden rounded-full w-10 h-10">
                          <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                            <img src={user.avatarUrl} alt="" />
                          </span>
                        </span>
                      </td>
                      <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0 font-medium">
                        {user.username}
                      </td>
                      <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0 text-right">
                        {user.total_goals}
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
);

export default Leaderboard;
