"use client"
import React from "react";
import Image from "next/image";
import "./asidebar.css";
import { BiSolidDashboard, BiLogOut } from "react-icons/bi";
import { ImProfile } from "react-icons/im";
import { BsChatRightDots } from "react-icons/bs";
import { RiUserSettingsFill } from "react-icons/ri";
import { IoGameController } from "react-icons/io5";
import Link from "next/link";
import { useUserStore } from "@/store";
import { User } from "@/types";
import dynamic from "next/dynamic";


const AsideBarSrr = () => {
  const handleLogoutClick = () => {
    console.log('Custom click event triggered!');
    localStorage.removeItem("accessToken");
  };
  
  const user: User | null = useUserStore((state) => state.user);
  return (
    <aside
      id="logo-sidebar"
      className="fixed top-0 left-0 z-40 w-52 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700"
      aria-label="Sidebar"
    >
      <div className="logo-container">
        <img src="/assets/logo.png" alt="Description"/>
      </div>
      <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
        <ul className="space-y-2 font-medium">
          <li>
            <Link
              href="/dashboard"
              className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <BiSolidDashboard />
              <span className="ml-3">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              href={`/profile/${user?.id}`}
              className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <ImProfile />
              <span className="flex-1 ml-3 whitespace-nowrap">Profile</span>
            </Link>
          </li>
          <li>
            <Link
              href={`/chat/${user?.id}`}
              className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <BsChatRightDots />
              <span className="flex-1 ml-3 whitespace-nowrap">Chat</span>
            </Link>
          </li>
          <li>
            <Link
              href="/settings"
              className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <RiUserSettingsFill />
              <span className="flex-1 ml-3 whitespace-nowrap">Settings</span>
            </Link>
          </li>
          <li>
            <Link
              href="/game"
              className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <IoGameController />
              <span className="flex-1 ml-3 whitespace-nowrap">Plag Game</span>
            </Link>
          </li>
          <li>
            <Link
              href="/"
              className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              onClick={handleLogoutClick}
            >
              <BiLogOut />
              <span className="flex-1 ml-3 whitespace-nowrap">Logout</span>
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
};

const AsideBar = dynamic(() => Promise.resolve(AsideBarSrr), { ssr: false });

export default AsideBar;