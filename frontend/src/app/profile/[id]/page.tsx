"use client";

import React from "react";
import { useParams } from "next/navigation";
import { fetchUser } from "@/services/userServices";
import useSWR from "swr";
import { Achievements, GameHistory, Loading, ProfileCover } from "@/components";

export default function Profile() {
  const params = useParams();
  const userId = params.id as string;

  const { data: user, error } = useSWR(`http://localhost:3001/user/${userId}`, fetchUser);

  console.log("🚀 ~ Profile ~ user:", user)
  // console.log("🚀 ~ Profile ~ user games:", user?.games)
  if (error) return <div style={{ color: "red" }}>User not found or failed to load user data</div>;
  if (!user) return <Loading />;
  return (
    <>
      <ProfileCover user={user} />
      <GameHistory games={user.games}/>
      <Achievements user={user}/>
    </>
  );
}
