import { Socket } from 'socket.io';
import { Room } from './infos.dto';


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
  room.ball.speed = 10;
  room.ball.velocityY = 5;
  return room;
};
    
export const update = (room: Room): Room => {;
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
