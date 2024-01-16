"use client"
// Import statements...
import { Socket } from 'socket.io'
import { io } from 'socket.io-client';
import React, { useRef, useState, useEffect } from 'react';
import Head from 'next/head';
import Ball from '@/components/ball/ball';
import Bar from '@/components/gamebar/gamebar';
import MapSelection from "@/components/MapSelection/MapSelection";
import WaitStage from '@/components/waitStage/waitStage';
import Score from '@/components/scores/scores';
import './game.css';
import { useUserStore } from '@/store';
import { User } from '@/types';
import { useStore } from 'zustand';

const socket:Socket = io("http://localhost:3001");
const user:User | null = useUserStore.getState().user;

const HomePage: React.FC = () => {
  const cvsRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isGameStarted, setGameStarted] = useState(false);
  const [selectedMap, setSelectedMap] = useState<number>(0);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [players, setStr2] = useState<any>({
    user1: {
      x : 0,
      y : 400,
      score : 0,
      user: null
    },
    user2: {
        x : 0,
        y : 400,
        score : 0,
        user: null
    },
    ball : {
        x: 0,
        y: 0
    },
    delay: 0
  });
  const net = {
    x: 0,
    y: 0,
    width: 2,
    height: 10,
    color: "WHITE",
  };
  let [string, setstr] = useState<any>("haha");
  interface map {
    id: number;
    name: string;
    imageUrl?: string;
  }

  const maps: map[] = [
    { id: 0, name: 'Default'},
    { id: 1, name: 'Map 1', imageUrl: '/img1.jpg' },
    { id: 2, name: 'Map 2', imageUrl: '/img2.jpg' },
    { id: 3, name: 'Map 3', imageUrl: '/img3.jpg' },
    { id: 4, name: 'Map 4', imageUrl: '/img4.jpg' },
    { id: 5, name: 'Map 5', imageUrl: '/img5.webp' },
  ];

  const handleSelectMap = (mapId: string | null) => {
    setSelectedMap(mapId);
  };

  const handleStartGame = () => {
    if (selectedMap !== null) {
      setGameStarted(true);
    }
  };

  useEffect(() => {
    const cvs = cvsRef.current;
    const ctx = cvs?.getContext("2d");
    
    ctxRef.current = ctx;
    
    if (!cvs || !ctx) return;
    const drawNet = () => {
      for (let i = 0; i <= cvs.height; i += 15) {
        drawrect(cvs.width / 2 - 1, net.y + i, net.width, net.height, net.color);
      }
    };
    
    const drawrect = (x: number, y: number, w: number, h: number, color: string) => {
      if (ctx) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
      }
    };
    
    const drawcircle = (x: number, y: number, r: number, color: string) => {
      if (ctx) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
      }
    };
    
    const drawtext = (text: any, x: number, y: number, color: string, font: string) => {
      if (ctx) {
        ctx.fillStyle = color;
        ctx.font = font;
        ctx.fillText(text.toString(), x, y);
      }
    };


    if (string != "you can play"){
      socket.emit('AddUserToRoom', user);
      const queuehundler = (str: string) => {
        setstr(str);
      }
      socket.on('wait', queuehundler);
      
      if (selectedMap != 0){
        const image = new Image();
        image.src = String(maps[selectedMap].imageUrl);
        ctx.drawImage(image, 0, 0, cvs.width, cvs.height);
      }
      else
        drawrect(0, 0, cvs.width, cvs.height, "BLACK");
      drawtext("WAIT FOR OTHER PLAYER", cvs.width / 3, cvs.height / 2, "WHITE", "50px fantasy");
    }
    if (string == "you can play"){
      const hundler = (init : any) => {
        setStr2(init);
      };
      socket.on('userposition', hundler);
      const move = (evt: any) => {
        let user;
        if (players.user1.socket == socket.id)
          user = players.user1;
        else
          user = players.user2;
        if (user.y >= 0 && user.y <= 800){
          if (evt.keyCode == 40)
            user.y += 30;
          else if (evt.keyCode == 38)
            user.y -= 30;
        }
        if (user.y > 600)
          user.y = 600;
        if (user.y < 0)
          user.y = 0;
        socket.emit('dataofmouse', user.y);
      }
      window.addEventListener("keydown", move);
      setPlayer1Score(players.user1.score);
      setPlayer2Score(players.user2.score);
  
      if (selectedMap != 0){
        const image = new Image();
        image.src = String(maps[selectedMap].imageUrl);
        ctx.drawImage(image, 0, 0, cvs.width, cvs.height);
      }
      else
        drawrect(0, 0, cvs.width, cvs.height, "BLACK");
      drawNet();
      
      drawrect(players.user1.x, players.user1.y, 10, 200, "WHITE");
      drawrect(players.user2.x, players.user2.y, 10, 200, "WHITE");
      
      drawcircle(players.ball.x, players.ball.y, 15, "WHITE");
      if (players.delay)
        drawtext(players.delay, cvs.width / 2.5 , 2 * cvs.height / 3, "WHITE", "500px fantasy");
      if (players.user1.status || players.user2.status){
        let user;
        if (players.user1.socket == socket.id)
          user = players.user1;
        else
          user = players.user2;
        if (user.status)
          drawtext("YOU WON", cvs.width / 3 , cvs.height / 2, "WHITE", "100px fantasy");
        else
          drawtext("YOU LOST", cvs.width / 3 , cvs.height / 2, "WHITE", "100px fantasy");
      }
      return () => {
        socket.off('userposition', hundler);
        window.removeEventListener("keydown", move);
        };
    }
  }, [players, string, isGameStarted]);
  
  if (isGameStarted){
    return (
      <div className="square">
          <Score player1score={players.user1.score} player2score={players.user2.score} player1avatar={players.user1.user?.avatarUrl} player2avatar={players.user2.user?.avatarUrl} isAI={false}/>
          <canvas className="canvas-container" width="1400" height="800" ref={cvsRef}></canvas>
      </div>
    );
  }
  else
  {
    return (
      <div className='square'>
        <MapSelection
          maps={maps}
          onSelectMap={handleSelectMap}
          onStartGame={handleStartGame}
        />
      </div>
    );
  }
}

export default HomePage;
