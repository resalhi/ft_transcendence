"use client"
import React, { useRef, useState, useEffect } from 'react';
import MapSelection from "@/components/MapSelection/MapSelection";
import Score from '@/components/scores/scores';
import { useUserStore } from '@/store';
import { User } from '@/types';
import { Room } from './../../../../backend/src/game/infos.dto';
import './../game/game.css'


const collision = (b: any, p: any) => {
  b.top = b.y - 15;
  b.bottom = b.y + 15;
  b.left = b.x - 15;
  b.right = b.x + 15;
  
  p.top = p.y;
  p.bottom = p.y + 200;
  p.left = p.x;
  p.right = p.x + 10;
  
  return b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom;
};

const resetball = (room: Room): Room => {
  room.ball.x = room.width/2;
  room.ball.y = room.height/2;
  room.ball.speed = 5;
  room.ball.velocityY = 5;
  return room;
};

export const update = (room: Room): Room => {
  room.user2.x = room.width - 10;
  room.ball.x += room.ball.velocityX;
  room.ball.y += room.ball.velocityY;
  const ballradius = 15;
  if (room.ball.y + ballradius >= room.height ){
    room.ball.y = room.height - ballradius;
    room.ball.velocityY *= -1;
  }
  if (room.ball.y - ballradius <= 0){
    room.ball.y = ballradius;
    room.ball.velocityY *= -1;
  }
  let player = (room.ball.x < room.width/2) ? room.user1 : room.user2;
  if (collision(room.ball, player)){
    let collidepoint = room.ball.y - (player.y + 100);
    collidepoint = collidepoint/(100);
    
    let angle = collidepoint * Math.PI/4;
    let dir = (room.ball.x < room.width/2) ? 1 : -1;
    room.ball.velocityX = dir * room.ball.speed * Math.cos(angle);
    room.ball.velocityY = room.ball.speed * Math.sin(angle);
    
    room.ball.speed += 1;
  }
  if (room.ball.x < 0){
    room.user2.score++;
    room.ball.velocityX = -5;
    room = resetball(room);
  }
  else if (room.ball.x > room.width) {
    room.user1.score++;
    room.ball.velocityX = 5;
    room = resetball(room);
  }
  if (room.user1.score == 5){
    room.user1.status = true;
  }
  if (room.user2.score == 5){
    room.user2.status = true;
  }
  return room;
}

const user:User | null = useUserStore.getState().user;

const HomePage: React.FC = () => {
  const cvsRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isGameStarted, setGameStarted] = useState(false);
  const [selectedMap, setSelectedMap] = useState<number>(0);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  console.log("🚀 ~ selectedMap:", selectedMap)
  let players: Room = {
    user1: {
        socket: null,
        user: user,
        x: 0,
        y: 400,
        score: 0,
        status: false
    },
    user2: {
        socket: null,
        user: user,
        x : 1390,
        y : 400,
        score : 0,
        status: false
    },
    ball: {
        x: 700,
        y: 400,
        speed: 5,
        velocityX: -5,
        velocityY: -5,
    },
    delay: 3,
    timer: 0,
    interval: 0,
    width: 1400,
    height: 800
  };
  const net = {
    x: 0,
    y: 0,
    width: 2,
    height: 10,
    color: "WHITE",
  };
  interface map {
    id: number;
    name: string;
    imageUrl?: string;
  }

  const maps: map[] = [
    { id: 0, name: 'Default' },
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
    const move = (evt: any) => {
      if (players.user1.y >= 0 && players.user1.y <= 800){
        if (evt.keyCode == 40)
          players.user1.y += 30;
        else if (evt.keyCode == 38)
          players.user1.y -= 30;
      }
      if (players.user1.y > 600)
        players.user1.y = 600;
      if (players.user1.y < 0)
        players.user1.y = 0;
    }
    window.addEventListener("keydown", move);
    const gameloop = () => {
        if (players.timer <= 120) {
            if (!(players.timer % 40)) {
              if (players.delay) {
                players.delay -= 1;
              }
            }
            players.timer += 1;
            if (players.delay){
              if (selectedMap != 0){
                const image = new Image();
                image.src = String(maps[selectedMap].imageUrl);
                ctx.drawImage(image, 0, 0, cvs.width, cvs.height);
              }
              else
                drawrect(0, 0, cvs.width, cvs.height, "BLACK");
              drawtext(players.delay, cvs.width / 2.5 , 2 * cvs.height / 3, "WHITE", "500px fantasy");
            }
            return;
        }
        let comlvl = 0.1;
        players.user2.y += (players.ball.y - (players.user2.y + 100)) * comlvl;
        players = update(players);
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
        if (players.user1.status || players.user2.status){
            if (players.user1.status)
                drawtext("YOU WON", cvs.width / 3 , cvs.height / 2, "WHITE", "100px fantasy");
            else
                drawtext("YOU LOST", cvs.width / 3 , cvs.height / 2, "WHITE", "100px fantasy");
            clearInterval(interval);
            return;
        }
    }
    let interval = setInterval(gameloop, 1000/60);
    return () => {
        window.removeEventListener("keydown", move);
    };
  }, [isGameStarted]);

  if (isGameStarted){
    return (
      <div className="square">
          <Score player1score={player1Score} player2score={player2Score} player1avatar={players.user1.user?.avatarUrl} player2avatar={players.user2.user?.avatarUrl} isAI={true}/>
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
