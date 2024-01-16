"use client";
import React, { useEffect, useState } from "react";
import "./navbar.css";
import { useUserStore } from "@/store";
import { User } from "@/types";
import "flowbite"
import SearchBar from "./search/searchBar";
import Notification from "./notification/notification";
import dynamic from "next/dynamic";

const NavBar = () => {
  const user: User | null = useUserStore((state) => state.user);
  const [image, setImage] = useState<string>("");
  useEffect(() => {
    console.log("useEffect in navbar render...");
    user && setImage(user.avatarUrl);
  }, [user]);
  const toggleSideBar = () => {
    console.log("toggleSideBar");
    const logoSidebar = document?.getElementById("logo-sidebar");
    if (logoSidebar)
    {
      logoSidebar.classList.toggle("-translate-x-full");
    }
  }
  document.querySelector("body")?.addEventListener('click', (e) => {
    const logoSidebar = document.getElementById("logo-sidebar");
    if (logoSidebar){
      if (e.target !== logoSidebar && !logoSidebar?.contains(e.target as Node)) {
        logoSidebar.classList.add("-translate-x-full");
      }
    }
  })
  return (
    <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="nav-items flex items-center justify-between">
          <div className="nav-logo flex items-center justify-start">
            <button
              type="button"
              onClick={toggleSideBar}
              className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            >
              <span className="sr-only">Open sidebar</span>
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clipRule="evenodd"
                  fillRule="evenodd"
                  d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                ></path>
              </svg>
            </button>
          </div>
          <SearchBar />
          <div className="nav-avatars flex items-center">
            <div className="flex items-center ml-3">
              <div>
                <button
                  type="button"
                  className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                  aria-expanded="false"
                >
                  <span className="sr-only">Open user menu</span>

                  {image &&<img
                    className="w-8 h-8 rounded-full"
                    src={image}
                    alt="user photo"
                  />}
                </button>
              </div>
            </div>
            <Notification user={user}/>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavBarr = dynamic(() => Promise.resolve(NavBar), { ssr: false });

export default NavBarr;

