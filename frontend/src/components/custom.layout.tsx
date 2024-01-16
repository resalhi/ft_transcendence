"use client";
import { usePathname } from "next/navigation";
import { AsideBar, NavBar } from ".";
import { useEffect } from "react";
import { useUserStore } from "@/store";

const CustomLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const excludelayoutPaths = ["/twofactors", "/"];

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken === null && pathname !== "/" && pathname !== "/twofactors") {
      window.location.href = "/";
    } else if (accessToken !== null && pathname === "/") {
     
      window.location.href = "dashboard";
    }
  }, []);


  return excludelayoutPaths.includes(pathname) ? (
    <div>{children}</div>
  ) : (
    <>
      <NavBar />
      <AsideBar />
      <div className="px-8 sm:ml-48 page-parent">
        <div className="page-container p-4 border-2 rounded-lg">{children}</div>
      </div>
    </>
  );
};

export default CustomLayout;
