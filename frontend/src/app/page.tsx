"use client";
// import 'flowbite'
import React from "react";
import Head from 'next/head';

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>ft_transcendence</title>
        <meta name="description" content="Join the ultimate online multiplayer pong game" />
      </Head>

      <div className="btn landing-page"><a href="http://localhost:3001/auth/login">
      <button>
        P L A Y
        <div id="clip">
            <div id="leftTop" class="corner"></div>
            <div id="rightBottom" class="corner"></div>
            <div id="rightTop" class="corner"></div>
            <div id="leftBottom" class="corner"></div>
        </div>
        <span id="rightArrow" class="arrow"></span>
        <span id="leftArrow" class="arrow"></span>
        </button>
        </a></div>
    </>
  );
};

