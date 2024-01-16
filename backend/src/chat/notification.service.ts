import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class notificationService {
    
    constructor (private readonly prisma: PrismaService) {}

    // ------------------ add friend ------------------
    async sendFriendRequest(data: { receiverInvite : string, senderInvite : string }) {
        try{
            const senderUser = await this.prisma.user.findUnique({
                where: {
                    username: data.senderInvite,
                },
            });

            const reciverUser = await this.prisma.user.findUnique({
                where: {
                    id: data.receiverInvite,
                },
            });

            // check if the user is already a friend to each other
            const friendRequest = await this.prisma.friendRequest.findFirst({
                where: {
                    senderId: senderUser.id,
                    receiverId: reciverUser.id,
                },
            });
            if (friendRequest) {
                return friendRequest;
            }

            const friend = await this.prisma.friendRequest.create({
                data: {
                    senderId: senderUser.id,
                    receiverId: reciverUser.id,
                    status: "pending",
                },
                include: {
                    senderRequests: true,
                    receiverRequests: true,
                },
            });
            
            return friend;
            
        }
        catch(err){
            throw err;
        }
        
    }


    // ------------------ list notification ------------------
    async listFriendRequest(data: { username : string}) {

        // we list just the pending friend request
        try{
            const user = await this.prisma.user.findUnique({
                where: {
                    username: data.username,
                },
            });
            
            const friendRequests = await this.prisma.friendRequest.findMany({
                where: {
                    receiverId: user.id,
                    status: "pending",
                },
                include: {
                    senderRequests: true,
                    receiverRequests: true,
                },
                
            });
            return friendRequests;
            
        }
        catch(err){
            throw err;
        }
        
    }


    // ------------------ accept friend ------------------
    async acceptFriendRequest(data: { sender : string, receiver : string }) {

        try{
            const senderUser = await this.prisma.user.findUnique({
                where: {
                    username: data.sender,
                },
            });

            const reciverUser = await this.prisma.user.findUnique({
                where: {
                    username: data.receiver,
                },
            });

            // check if the user is already a friend to each other
            const friendRequest = await this.prisma.friendRequest.findFirst({
                where: {
                    senderId: senderUser.id,
                    receiverId: reciverUser.id,
                },
            });

            if (!friendRequest) {
                return;
            }

            // update status
            const updateStatus = await this.prisma.friendRequest.update({
                where: {
                    id: friendRequest.id,
                },
                data: {
                    status: "accepted",
                },
            });

            // create friendship for the user
            const friendship = await this.prisma.friends.create({
                data: {
                    MefriendsOfId: reciverUser.id,
                    MyfriendId: senderUser.id,
                    status: "accepted",
                },
            });

            // create friendship for the user
            const friendship2 = await this.prisma.friends.create({
                data: {
                    MefriendsOfId: senderUser.id,
                    MyfriendId: reciverUser.id,
                    status: "accepted",   
                },
            });

            return friendship2;


          
        }
        catch(err){
            throw err;
        }
    }


    // ------------------ show invitation channel notification ------------------
    async sendInviteToChannel(data: { channel : string, sender : string, friend : string, status : string }) {
        try{
            const senderUser = await this.prisma.user.findUnique({
                where: {
                    username: data.sender,
                },
            });

            const reciverUser = await this.prisma.user.findUnique({
                where: {
                    username: data.friend,
                },
            });
            if (!reciverUser) {
                return;
            }
            const channel = await this.prisma.channel.findFirst({
                where: {
                    name: data.channel,
                },
            });
            if (!channel) {
                return;
            }

            const isexist = await this.prisma.channelInvite.findFirst({
                where: {
                    senderId: senderUser.id,
                    receiverId: reciverUser.id,
                    channelId: channel.id,
                },
                include: {
                    channel: true,
                    receiver: true,
                    sender: true,
                },
            });

            if (isexist) {
                // update status
                const updateStatus = await this.prisma.channelInvite.update({
                    where: {
                        id: isexist.id,
                    },
                    data: {
                        status: data.status,
                    },
                });
                return isexist;

            }

            const invite = await this.prisma.channelInvite.create({
                data: {
                    senderId: senderUser.id,
                    receiverId: reciverUser.id,
                    channelId: channel.id,
                    status: data.status,
                },
            });
           
            return invite;
        }
        catch(err){
            throw err;
        }
    }

    // ---------------------- saveAcceptedChannelToDB ------------------
    async saveAcceptedChannelToDB(data: {   friend : string, status : string, channelId: string }) {
        // save id of the channel to user the acceptedChannelInvite table in the database
        try{
            const reciverUser = await this.prisma.user.findUnique({
                where: {
                    username: data.friend,
                },
            });
            if (!reciverUser) {
                return;
            }
            const channel = await this.prisma.channel.findFirst({
                where: {
                    id: data.channelId,
                },
            });
            if (!channel) {
                return;
            }

            const isexist = await this.prisma.acceptedChannelInvite.findFirst({
                where: {
                    userId: reciverUser.id,
                    channelId: channel.id,
                },
                include: {
                    user: true,
                },
            });

            if (isexist) {
                return isexist;
            }

            const invite = await this.prisma.acceptedChannelInvite.create({
                data: {
                    userId: reciverUser.id,
                    channelId: channel.id,
                    idOfChannel: data.channelId,
                    role: "member",
                },
            });

            // // create membership for the user as a member
            const membership = await this.prisma.channelMembership.create({
                data: {
                    userId: reciverUser.id,
                    channelId: channel.id,
                    roleId: "member",
                },
            });
            return invite;
        }
        catch(err){
            throw err;
        }
    }

    // ------------------ invite to game ------------------
    async sendInviteToGame(data: { sender: string; receiver: string;  status: string; }) {
        try{
            if (data.status === "pending") {
                const senderUser = await this.prisma.user.findUnique({
                    where: {
                        username: data.sender,
                    },
                });
                if (!senderUser) {
                    return;
                }
                const reciverUser = await this.prisma.user.findUnique({
                    where: {
                        username: data.receiver,
                    },
                });
                if (!reciverUser) {
                    return;
                }

                const invite = await this.prisma.gameInvite.create({
                    data: {
                        senderId: senderUser.id,
                        receiverId: reciverUser.id,
                        status: data.status,
                    },
                });

                return invite;
            }else{
             // update status   
             const senderUser = await this.prisma.user.findUnique({
                where: {
                    username: data.sender,
                },
            });
            if (!senderUser) {
                return;
            }   
            const reciverUser = await this.prisma.user.findUnique({
                where: {
                    username: data.receiver,
                },
            });

            if (!reciverUser) {
                return;
            }

            const invite = await this.prisma.gameInvite.findFirst({
                where: {
                    senderId: senderUser.id,
                    receiverId: reciverUser.id,
                },
            });
            if (!invite) {
                return;
            }
            const updateStatus = await this.prisma.gameInvite.update({
                where: {
                    id: invite.id,
                },
                data: {
                    status: data.status,
                },
            });
            return updateStatus;
            }


        }
           
        catch(err){
            throw err;
        }
    }
        
}