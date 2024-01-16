import { Socket } from 'socket.io';
import { Player } from './infos.dto';
import { User } from '@prisma/client';

export default class GameQueue {
    private players: Player[];

    constructor() {
        this.players = [];
    }

    addPlayerToQueue(client: Socket, user: User): Player[] | null {
        // client.emit('wait', "Wait for other player...");
        if (this.players.length > 0){
            if (this.players[0].user.id == user.id)
                return null;
        }
        const player: Player = {
            socket: client,
            user: user
        };
        this.players.push(player);
        if (this.players.length != 2){
            return null;
        }
        this.players[0].socket.emit('wait', "you can play");
        this.players[1].socket.emit('wait', "you can play");
        return this.players;
    }
    emptyplayers(){
        if (this.players.length == 2)
            this.players = [];
    }
    userquit(client: Socket): void{
        this.players = this.players.filter(item => item.socket !== client);
    }
}