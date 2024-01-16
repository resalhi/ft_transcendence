
"use client"

import React from "react";
import "./loading.css";

const Loading = () => {
  return (
    <div className="loading-container">
      <div className="loader">
        <li className="ball"></li>
        <li className="ball"></li>
        <li className="ball"></li>
      </div>
    </div>
  );
};

export default Loading;
