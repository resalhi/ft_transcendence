import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { channelService } from './channel.service';
import { directMessageService } from './directMessage.service';
import { notificationService } from './notification.service';
import { emit } from 'process';
import * as bcrypt from 'bcrypt';
import { channel } from 'diagnostics_channel';
import  GameQueue  from '../game/gamequeue';
import  GameRoom  from '../game/gameroom';
import { User } from '@prisma/client';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})

export class ChatGateway implements OnGatewayDisconnect{
  @WebSocketServer()
  server: Server;
  private queue: GameQueue;
  private room: GameRoom;
  
  constructor(
    private readonly directMessageService: directMessageService,
    private readonly channelService: channelService,
    private readonly prisma: PrismaService,
    private readonly notificationService: notificationService,
    ) {
      this.queue = new GameQueue();
      this.room = new GameRoom(prisma);
     }
    
    
  
  @SubscribeMessage('AddUserToRoom')
  handlequeue(client: Socket, user: User): void {
    const match = this.queue.addPlayerToQueue(client, user);
    if (match){
      this.queue.emptyplayers();
      this.room.startgame(match);
    }
  }
  
  @SubscribeMessage('dataofmouse')
  handlemouse(client: Socket, position: number): void {
    this.room.setmouseposition(client, position);
  }
  
  handleDisconnect(clinet: Socket){
    this.queue.userquit(clinet);
    this.room.userdisconnect(clinet);
  }

  // Join a specific channel room
  @SubscribeMessage('joinChannel')
  async joinChannel(
    @MessageBody()
    data: { channel: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.channel); // this is how you join a channel room
    // .join() is a built-in method from Socket.IO that allows you to join a specific channel room
  }

  // channalMessage
  @SubscribeMessage('channelMessage')
  async channelMessage(
    @MessageBody()
    data: {
      sender: string;
      channel: string;
      channelId: string;
      message: string;
    },
    // @ConnectedSocket() client: Socket,
  ) {
  
    const saveMessage = await this.channelService.createChannelMessage(data);
    this.server.to(data.channel).emit('channelMessage', saveMessage);
    return saveMessage;
  }


  // list messages for a channel
  @SubscribeMessage('listChannelMessages')
  async listChannelMessages(
    @MessageBody()
    data: {
      channel: string;
      sender: string;
      channelId: string;
    },
    // @ConnectedSocket() client: Socket,
  ) {
    try {
      // save the messages in an array where ChannelMessage is an object with the message and user
      const messages = await this.channelService.listChannelMessages(data);
      if (messages && messages.length > 0) {
        let msg = [];
        messages.forEach((element) => {
          if (element.ChannelMessage) {
            element.ChannelMessage.forEach((el) => {
              msg.push(el);
            });
          }
        });
        this.server.to(data.channel).emit('listChannelMessages', { msg });
      } else {
        console.error('No messages found.');
        return;
      }
    } catch (error) {
      console.error('Error while fetching messages:', error);
      throw error; // Rethrow the error to handle it in your calling code
    }
  }

  // saveChannelName to database
  @SubscribeMessage('saveChannelName')
  async saveChannelName(
    @MessageBody()
    data: {
      channel: string;
      channelType: string;
      sender: string;
      channelId: string;
      password: string;
    },
    // @ConnectedSocket() client: Socket,
  ) {
    if (!data.channel && !data.channelType && !data.sender && !data.channelId) {
      console.log('Channel not found saveChannelName data');
      return;
    }
    if(data.password){
      // firt we will hash the password
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(data.password, salt);
      data.password = hashedPassword;
      // then we will save the channel in the db

      // case of protected channel
      const user = await this.prisma.user.findUnique({
        where: {
          username: data.sender,
        },
      });
       
      const checkChannel = await this.prisma.channel.findUnique({
        where: {
          id: data.channelId,
        },
      });
      if (checkChannel) {
        this.server.emit('saveChannelName', checkChannel);
        return checkChannel;
      }
      const saveChannel = await this.prisma.channel.create({
        data: {
          name: data.channel,
          visibility: data.channelType,
          password: data.password,
          ChannelMembership:{
            create: {
              roleId: 'admin',
              user: {
                connect: {
                  username: user.username,
                },
              },
            },
          },
          role: 'owner',
          user: {
            connect: {
              username: user.username,
            },
          },
        },
        include: {
          user: true,
        },
      });
      this.server.emit('saveChannelName', saveChannel);
      return saveChannel;
      
    }else{
      const user = await this.prisma.user.findUnique({
        where: {
          username: data.sender,
        },
      });

      const checkChannel = await this.prisma.channel.findUnique({
        where: {
          id: data.channelId,
        },
      });
      if (checkChannel) {
        this.server.emit('saveChannelName', checkChannel);
        return checkChannel;
      }
      const saveChannel = await this.prisma.channel.create({
        data: {
          name: data.channel,
          visibility: data.channelType,
          role: 'owner',
          ChannelMembership:{
            create: {
              isAdmin: true,
              roleId: 'admin',
              user: {
                connect: {
                  username: user.username,
                },
              },
            },
          },
          user: {
            connect: {
              username: user.username,
            },
          },
        },
      });
      this.server.emit('saveChannelName', saveChannel);
      return saveChannel;
    }
  }

  // check if password is correct
  @SubscribeMessage('checkPassword')
  async checkPassword(
    @MessageBody()
    data: {
      password: string;
      channelId: string;
      sender: string;
    },
    // @ConnectedSocket() client: Socket,
  ) {
    const channel = await this.prisma.channel.findUnique({
      where: {
        id: data.channelId,
      },
    });
    if (!channel) {
      console.log('Channel not found checkPassword data');
      return;
    }
    if (channel.visibility !== 'protected') return; // becuse it require password and hash 
    const checkPassword = await bcrypt.compare(data.password, channel.password);
    if (checkPassword) {
      this.server.emit('checkPassword', checkPassword);
      return checkPassword;
    } else {
      this.server.emit('checkPassword', checkPassword);
      return checkPassword;
    }
  }

  //listAcceptedChannels
  @SubscribeMessage('listAcceptedChannels')
  async listAcceptedChannels(
    @MessageBody()
    data: {
      sender: string;
    },
    // @ConnectedSocket() client: Socket,
  ) {
    const channels = await this.prisma.acceptedChannelInvite.findMany({
      where: {
        user: {
          username: data.sender,
        },
      },
    });
    if (!channels) {
      console.log('Channel not found listAcceptedChannels data');
      this.server.emit('listAcceptedChannels', channels);
      return;
    }

    const arrOfChannels = [];
    // find the channel name
    for (let i = 0; i < channels.length; i++) {
      const channel = await this.prisma.channel.findUnique({
        where: {
          id: channels[i].channelId,
        },
        include: {
          user: true,
        },
      });

      arrOfChannels.push(channel);
    }
    this.server.emit('listAcceptedChannels', arrOfChannels);
  }

  // listPublicChannels
  // list all public channels in database
  @SubscribeMessage('listPublicChannels')
  async listPublicChannels(
    @MessageBody() data: { sender: string; },
    // @ConnectedSocket() client: Socket,
  ) {
    const channels = await this.prisma.channel.findMany({
      where: {
        visibility: 'public',
      },
      include: {
        user: true,
      },
    });
    this.server.emit('listPublicChannels', channels);
    return channels;
  }

  // listPrivateChannels
  // list all private channels in database
  @SubscribeMessage('listPrivateChannels')
  async listPrivateChannels(
    @MessageBody() data: { sender: string; },
    // @ConnectedSocket() client: Socket,
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: data.sender,
      },
    });
    if (!user) {
      console.log('user not found');
      return;
    }
    const channels = await this.prisma.channel.findMany({
      where: {
        visibility: 'private',
        userId: user.id,
      },
      include: {
        user: true,
      },
    });
    this.server.emit('listPrivateChannels', channels);
    return channels;
  }

  // listProtectedChannels
  // list all protected channels in database
  @SubscribeMessage('listProtectedChannels')
  async listProtectedChannels(
    @MessageBody() data: { sender: string; },
    // @ConnectedSocket() client: Socket,
  ) {
    
    const channels = await this.prisma.channel.findMany({
      where: {
        visibility: 'protected',
      },
    });
    this.server.emit('listProtectedChannels', channels);
    return channels;
  }

  // save password for a protected channel
  @SubscribeMessage('savePassword')
  async savePassword(
    @MessageBody()
    data: {
      channel: string;
      password: string;
      sender: string;
    },
    // @ConnectedSocket() client: Socket,
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: data.sender,
      },
    });
    const channel = await this.prisma.channel.findUnique({
      where: {
        id: data.channel,
      },
    });
    const savePassword = await this.prisma.channel.update({
      where: {
        id: channel.id,
      },
      data: {
        password: data.password,
        user: {
          connect: {
            username: user.username,
          },
        },
      },
    });
    this.server.emit('savePassword', savePassword);
    return savePassword;
  }

  //removePassword 
  @SubscribeMessage('removePassword')
  async removePassword(
    @MessageBody()
    data: {
      channelId: string;
      sender: string;
    },
    // @ConnectedSocket() client: Socket,
  ) {
    if (!data.channelId && !data.sender) {
      console.log('Channel not found removePassword data');
      return;
    }

    const user = await this.prisma.user.findUnique({
      where: {
        username: data.sender,
      },
    });
    if (!user) {
      console.log('user not found');
      return;
    }
    // check if the user is owner
    const checkOwner = await this.prisma.channel.findFirst({
      where: {
        id: data.channelId,
        userId: user.id,
        role: 'owner',
      },
    });
    if (!checkOwner) {
      console.log('you are not owner');
      this.server.emit('removePassword', checkOwner);
      return;
    }else{

      const channel = await this.prisma.channel.findUnique({
        where: {
          id: data.channelId,
        },
      });
    const removePassword = await this.prisma.channel.update({
      where: {
        id: channel.id,
      },
      data: {
        password: null,
        user: {
          connect: {
            username: user.username,
          },
        },
      },
    });
    this.server.emit('removePassword', removePassword);
    return removePassword;
  }
  }

  // changePassword
  @SubscribeMessage('changePassword')
  async changePassword(
    @MessageBody()
    data: {
      channelId: string;
      password: string;
      sender: string;
    },
    // @ConnectedSocket() client: Socket,
  ) {
    if (!data.channelId && !data.password && !data.sender) {
      console.log('Channel not found changePassword data');
      return;
    }
    const user = await this.prisma.user.findUnique({
      where: {
        username: data.sender,
      },
    });
    
    const channel = await this.prisma.channel.findUnique({
      where: {
        id: data.channelId,
      },
    });

    if (!channel || !user) {
      console.log('channel not found');
      return;
    }

    // check if the user is owner
    const checkOwner = await this.prisma.channel.findFirst({
      where: {
        id: channel.id,
        userId: user.id,
        role: 'owner',
      },
    });

    if (!checkOwner) {
      console.log('you are not owner');
      this.server.emit('changePassword', checkOwner);
      return;
    }else{
      // hash the password
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(data.password, salt);
      data.password = hashedPassword;
      const changePassword = await this.prisma.channel.update({
        where: {
          id: channel.id,
        },
        data: {
          password: data.password,
          user: {
            connect: {
              username: user.username,
            },
          },
        },
        select: {
          user: true,
        },
      });
      this.server.emit('changePassword', changePassword);
      return changePassword;
    }
    
  }

  // get channel name by id
  @SubscribeMessage('getChannelById')
  async getChannelById(
    @MessageBody()
    data: {
      id: string;
    },
    // @ConnectedSocket() client: Socket,
  ) {
    if (!data.id) {
      console.log('Channel not found getChannelById data');
      return;
    }
    const channel = await this.prisma.channel.findUnique({
      where: {
        id: data.id,
      },
      include: {
        user: true,
      },
    });
    this.server.emit('getChannelById', channel);
    return channel;
  }

  // list all channelMembers
  @SubscribeMessage('ChannelMembers')
  async ChannelMembers(
    @MessageBody()
    data: {
      channelId: string;
      sender: string;
    },
  ) {
    if (!data.channelId && !data.sender) {
      console.log('Channel not found ChannelMembers data');
      return;
    }

    const channel = await this.prisma.channel.findUnique({
      where: {
        id: data.channelId,
      },
    });
    const channelMembers = await this.prisma.channelMembership.findMany({
      where: {
        channel: {
          id: channel.id,
        },
      },
    });

    const members = []; // get just the user 
    for (let i = 0; i < channelMembers.length; i++) {
      const member = await this.prisma.user.findUnique({
        where: {
          id: channelMembers[i].userId,
        },
      });
      members.push(member);
    }
   
    this.server.emit('ChannelMembers', members);
  }

  // GetChannelAdmins
  @SubscribeMessage('GetChannelAdmins')
  async GetChannelAdmins(
    @MessageBody()
    data: {
      channelId: string;
    },
  ) {
    if (!data.channelId ) {
      console.log('Channel not found GetChannelAdmins data');
      return;
    }
    const channel = await this.prisma.channel.findUnique({
      where: {
        id: data.channelId,
      },
    });

    const channelAdmins = await this.prisma.channelMembership.findMany({
      where: {
        channel: {
          id: channel.id,
        },
        roleId: 'admin',
      },
      select: {
        user: true,
      },
    });
    this.server.emit('GetChannelAdmins', channelAdmins);    
  }

  // make user admin
  @SubscribeMessage('makeAdmin')
  async makeAdmin(
    @MessageBody()
    data: {
      sender: string;
      member: string;
      channelId: string;
    },
  ) {
    if (!data.sender || !data.member || !data.channelId) {
      console.log('Channel not found makeAdmin data');
      return;
    }else if (data.sender === data.member) {
      console.log('you can not make your self admin');
      this.server.emit('makeAdmin', "you can not make your self admin");
      return;
    }

    // CASE OF JUST MEMBER
    const channel = await this.prisma.channel.findUnique({
      where: {
        id: data.channelId,
      },
    });

    const user = await this.prisma.user.findUnique({
      where: {
        username: data.member,
      },
    });
    
    // check if the user is owner
    const owner = await this.prisma.user.findUnique({
      where: {
        username: user.username,
      },
    });

    if (!owner) {
      console.log('owner not found: ', data.sender);
      return;
    }

    // check if the user is owner
    const checkOwner = await this.prisma.channel.findFirst({
      where: {
        id: channel.id,
        userId: owner.id,
        role: 'owner',
      },
    });

    if (!checkOwner) {

      // CASE OF ADMIN
      // check if the user is admin
      const user = await this.prisma.user.findUnique({
        where: {
          username: data.sender,
        },
      });

      const checkAdmin = await this.prisma.channelMembership.findFirst({
        where: {
          channelId: channel.id,
          userId: user.id,
          roleId: 'admin',
          isAdmin: true,
        },
      });

      if (!checkAdmin) {
        console.log(data.sender, ' is not admin', checkAdmin);
        this.server.emit('makeAdmin', checkAdmin);
        return;
      }

      const member = await this.prisma.user.findUnique({
        where: {
          username: data.member,
        },
      });

      const checkMember = await this.prisma.channelMembership.findFirst({
        where: {
          channelId: channel.id,
          userId: member.id,
        },
      });

      if (!checkMember) {
        console.log('member not found', checkMember);
        return;
      }

      const makeAdmin = await this.prisma.channelMembership.update({
        where: {
          id: checkMember.id,
        },
        data: {
          isAdmin: true,
          roleId: 'admin',
        },
      });

      this.server.emit('makeAdmin', makeAdmin);
      return makeAdmin;
      }
      else{

        // CASE OF OWNER
      // first we will search for channel id
      const channel = await this.prisma.channel.findUnique({
        where: {
          id: data.channelId,
        },
      });

      // then we will search for the member id
      const member = await this.prisma.user.findUnique({
        where: {
          username: data.member,
        },
      });

      // then we will search for the member id in channelMembership
      const checkMember = await this.prisma.channelMembership.findFirst({
        where: {
          channelId: channel.id,
          userId: member.id,
        },
      });

      // if the member is not found
      if (!checkMember) {
        console.log('member not found', checkMember);
        return;
      }

      // if the member is found we will make him admin
      const makeAdmin = await this.prisma.channelMembership.update({
        where: {
          id: checkMember.id,
        },
        data: {
          isAdmin: true,
          roleId: 'admin',
        },
      });
      this.server.emit('makeAdmin', makeAdmin);

    }
  }

  // kickMember
  @SubscribeMessage('kickMember')
  async kickMember(
    @MessageBody()
    data: {
      sender: string;
      member: string;
      channelId: string;
    },
  ) {
    if (!data.sender || !data.member || !data.channelId) {
      console.log('Channel not found kickMember data');
      return;
    }else if (data.sender === data.member) {
      console.log('you can not kick your self');
      this.server.emit('kickMember', "you can not kick your self");
      return;
    }
    // a owner can kick an admin or a member
    // an admin can kick a member
    // a member can not kick anyone 
    // a admin can not kick an admin or owner

    // first we will check if the sender has just the role member becuse he can not kick anyone
    const member = await this.prisma.user.findUnique({
      where: {
        username: data.sender,
      },
    });

    if (!member) {
      console.log('member not found', data.sender);
      throw new Error('member not found');
    }

    const checkMember = await this.prisma.channelMembership.findFirst({
      where: {
        channelId: data.channelId,
        userId: member.id,
        roleId: 'member',
      },
    });

    if (checkMember) {
      // so the sender is just a member
      console.log('you are just a member you can not kick anyone');
      this.server.emit('kickMember', checkMember);
      return;
    }


    // check if the sender is owner
    const owner = await this.prisma.user.findUnique({
      where: {
        username: data.sender,
      },
    });

    const checkOwner = await this.prisma.channel.findFirst({
      where: {
        id: data.channelId,
        userId: owner.id,
        role: 'owner',
      },
    });

    if (!checkOwner) {
      // so the sender is an admin
      // this case the sender can kick a member but not an admin or owner
      const member = await this.prisma.user.findUnique({
        where: {
          username: data.member,
        },
      });

      const checkMember = await this.prisma.channelMembership.findFirst({
        where: {
          channelId: data.channelId,
          userId: member.id,
          roleId: 'member',
        },
      });

      if (!checkMember) {
        console.log('you can not kick an admin or owner', data.member);
        this.server.emit('kickMember', checkMember);
        return;
      }

      const kickMember = await this.prisma.channelMembership.delete({
        where: {
          id: checkMember.id,
        },
      });

      this.server.emit('kickMember', kickMember);
      return kickMember;
      
    }else{
        // so the sender is an owner
        // this case the sender can kick anyone
    
        const member2 = await this.prisma.user.findUnique({
          where: {
            username: data.member,
          },
        });
    
        const checkMember2 = await this.prisma.channelMembership.findFirst({
          where: {
            channelId: data.channelId,
            userId: member2.id,
            roleId: 'member',
          },
        });
    
        if (!checkMember2) {
          console.log('member not found', checkMember2);
          // so owern will kick an admin 
          const admin = await this.prisma.user.findUnique({
            where: {
              username: data.member,
            },
          });
    
          const checkAdmin = await this.prisma.channelMembership.findFirst({
            where: {
              channelId: data.channelId,
              userId: admin.id,
              roleId: 'admin',
              isAdmin: true,
            },
          });
    
          if (!checkAdmin) {
            console.log('you can not kick an owner', data.member);
            this.server.emit('kickMember', checkAdmin); // return null and in front i catch it to render connot kick an owner
            return;
          }
    
          // delete from admisn table
          const deleteAdmin = await this.prisma.channelMembership.delete({
            where: {
              id: checkAdmin.id,
            },
          });
    
    
          const removeAcceptedChannelInvite = await this.prisma.acceptedChannelInvite.deleteMany({
            where: {
              channelId: data.channelId,
              userId: admin.id,
            },
          });
    
          this.server.emit('kickMember', deleteAdmin);
          return;
        }
    
        // so owern will kick a member
    
        const kickMember2 = await this.prisma.channelMembership.delete({
          where: {
            id: checkMember2.id,
          },
        });
    
        const removeAcceptedChannelInvite = await this.prisma.acceptedChannelInvite.deleteMany({
          where: {
            channelId: data.channelId,
            userId: member2.id,
          },
        });
    
    
        this.server.emit('kickMember', kickMember2);
        return kickMember2;
    }

  }



  // BanMember 
  @SubscribeMessage('BanMember')
  async BanMember(
    @MessageBody()
    data: {
      sender: string;
      member: string;
      channelId: string;
    },
  ){
    if (!data.sender || !data.member || !data.channelId) {
      console.log('Channel not found BanMember data');
      return;
    }else if (data.sender === data.member) {
      console.log('you can not ban your self');
      this.server.emit('BanMember', "you can not ban your self");
      return;
    }
    // a owner can ban an admin or a member
    // an admin can ban a member
    // a member can not ban anyone 
    // a admin can not ban an admin or owner

    // first we will check if the sender has just the role member becuse he can not ban anyone
    const member = await this.prisma.user.findUnique({
      where: {
        username: data.sender,
      },
    });

    if (!member) {
      console.log('member not found1', data.sender);
      return;
    }

    const checkMember = await this.prisma.channelMembership.findFirst({
      where: {
        channelId: data.channelId,
        userId: member.id,
        roleId: 'member',
      },
    });

    if (checkMember) {
      // so the sender is just a member
      console.log('you are just a member you can not ban anyone');
      this.server.emit('BanMember', checkMember);
      return;
    }

    
    // check if the sender is owner
    const owner = await this.prisma.user.findUnique({
      where: {
        username: data.sender,
      },
    });

    const checkOwner = await this.prisma.channel.findFirst({
      where: {
        id: data.channelId,
        userId: owner.id,
        role: 'owner',
      },
    });

    if (!checkOwner) {
      // so the sender is an admin
      // this case the sender can ban a member but not an admin or owner
      const member = await this.prisma.user.findUnique({
        where: {
          username: data.member,
        },
      });

      const checkMember = await this.prisma.channelMembership.findFirst({
        where: {
          channelId: data.channelId,
          userId: member.id,
          roleId: 'member',
        },
      });

      if (!checkMember) {
        console.log('you can not ban an admin or owner');
        this.server.emit('BanMember', checkMember);
        return;
      }

      const BanedMember = await this.prisma.channelMembership.update({
        where: {
          id: checkMember.id,
        },
        data: {
          isBanned: true,
        },
      });


      this.server.emit('BanMember', BanedMember);
      return BanedMember;
      
    }else{
      // so the sender is an owner
  
      // this case the sender can ban anyone
  
      const member2 = await this.prisma.user.findUnique({
        where: {
          username: data.member,
        },
      });
  
      const checkMember2 = await this.prisma.channelMembership.findFirst({
        where: {
          OR: [
            {
              channelId: data.channelId,
              userId: member2.id,
              roleId: 'member',
            },
            {
              channelId: data.channelId,
              userId: member2.id,
              roleId: 'admin',
              isAdmin: true,
            },
          ],
          
        },
      });
  
      if (!checkMember2)
        {
          console.log('member not found2', checkMember2);
          this.server.emit('BanMember', checkMember2);
          return;
        }
  
      const banMember2 = await this.prisma.channelMembership.update({
        where: {
          id: checkMember2.id,
        },
        data: {
          isBanned: true,
        },
      });
  
  
      this.server.emit('BanMember', banMember2);
      return banMember2;
    }



  }


  @SubscribeMessage('MuteMember')
  async MuteMember(
    @MessageBody()
    data: {
      sender: string;
      member: string;
      channelId: string;
      Muted: boolean;
    },
  ) {
    if (!data.sender || !data.member || !data.channelId) {
      console.log('Channel not found MuteMember data');
      return;
    }else if (data.sender === data.member) {
      console.log('you can not mute your self');
      this.server.emit('MuteMember', "you can not mute your self");
      return;
    }

    // first we will check if the sender has just the role member becuse he can not mute anyone
    const member = await this.prisma.user.findUnique({
      where: {
        username: data.sender,
      },
    });

    if (!member) {
      console.log('member not found1', member);
      return;
    }

    const checkMember = await this.prisma.channelMembership.findFirst({
      where: {
        channelId: data.channelId,
        userId: member.id,
        roleId: 'member',
      },
    });

    if (checkMember) {
      // so the sender is just a member
      console.log('you are just a member');
      this.server.emit('MuteMember', "you are just a member");
      return;
    }

    
    // check if the sender is owner
    const owner = await this.prisma.user.findUnique({
      where: {
        username: data.sender,
      },
    });

    const checkOwner = await this.prisma.channel.findFirst({
      where: {
        id: data.channelId,
        userId: owner.id,
        role: 'owner',
      },
    });

    //TODO: THIS CASE FOR ADMIN
    if (!checkOwner) {
      // so the sender is an admin
      // this case the sender can mute a member but not an admin or owner
      const member = await this.prisma.user.findUnique({
        where: {
          username: data.member,
        },
      });

      const checkMember = await this.prisma.channelMembership.findFirst({
        where: {
          channelId: data.channelId,
          userId: member.id,
          roleId: 'member',
        },
      });

      if (!checkMember) {
        console.log('you can not mute an admin or owner');
        this.server.emit('MuteMember', "you can not mute an admin or owner");
        return;
      }

      if (data.Muted) {
        const isMutedMember = await this.prisma.channelMembership.update({
          where: {
            id: checkMember.id,
          },
          data: {
            isMuted: false,
          },
        });

        this.server.emit('MuteMember', isMutedMember);
        return isMutedMember;
      }else{
        const MutedMember = await this.prisma.channelMembership.update({
          where: {
            id: checkMember.id,
          },
          data: {
            isMuted: true,
          },
        });
        this.server.emit('MuteMember', MutedMember);
        return MutedMember;
      }
      
    }else{
      // so the sender is an owner
  
      // TODO: this case the sender can mute anyone
  
      const member2 = await this.prisma.user.findUnique({
        where: {
          username: data.member,
        },
      });
  
      const checkMember2 = await this.prisma.channelMembership.findFirst({
        where: {
          OR: [
            {
              channelId: data.channelId,
              userId: member2.id,
              roleId: 'member',
            },
            {
              channelId: data.channelId,
              userId: member2.id,
              roleId: 'admin',
            },
          ],
          
        },
      });
  
      if (!checkMember2){
        console.log('member not found2', checkMember2);
        return;
      }
  
      if (data.Muted) {
        const isMutedMember2 = await this.prisma.channelMembership.update({
          where: {
            id: checkMember2.id,
          },
          data: {
            isMuted: false,
          },
        });
  
        this.server.emit('MuteMember', isMutedMember2);
        return isMutedMember2;
      }
  
      const muteMember2 = await this.prisma.channelMembership.update({
        where: {
          id: checkMember2.id,
        },
  
        data: {
          isMuted: true,
        },
  
      });
  
      this.server.emit('MuteMember', "owner muted member");
      return muteMember2;
    }
  }




  // checkIfTheUserIsBaned
  @SubscribeMessage('checkIfTheUserIsBaned')
  async checkIfTheUserIsBaned(
    @MessageBody()
    data: {
      sender: string;
      channelId: string;
    },
  ) {
    if (!data.sender && !data.channelId) {
      return;
    }
    const user = await this.prisma.user.findUnique({
      where: {
        username: data.sender,
      },
    });

    const checkIfTheUserIsBaned = await this.prisma.channelMembership.findFirst({
      where: {
        channelId: data.channelId,
        userId: user.id,
        isBanned: true,
      },
      include: {
        channel: true,
        user: true,
      },
    });

    let isBanned = false;
    if (checkIfTheUserIsBaned) {
      isBanned = true;
    }
    this.server.emit('checkIfTheUserIsBaned', checkIfTheUserIsBaned);
    return checkIfTheUserIsBaned;
  }

  // checkIfTheUserIsMuted  
  @SubscribeMessage('checkIfTheUserIsMuted')
  async checkIfTheUserIsMuted(
    @MessageBody()
    data: {
      sender: string;
      channelId: string;
    },
  ) {
    if (!data.sender && !data.channelId) {
      return;
    }
    const user = await this.prisma.user.findUnique({
      where: {
        username: data.sender,
      },
    });

    const checkIfTheUserIsMuted = await this.prisma.channelMembership.findFirst({
      where: {
        channelId: data.channelId,
        userId: user.id,
        isMuted: true,
      },
      include: {
        channel: true,
        user: true,
      },
    });

    let isMuted = false;
    if (checkIfTheUserIsMuted) {
      isMuted = true;
    }
    this.server.emit('checkIfTheUserIsMuted', checkIfTheUserIsMuted);
  }

  

  // leaveChannel
  @SubscribeMessage('leaveChannel')
  async leaveChannel(
    @MessageBody()
    data: {
      channelId: string;
      sender: string;
    },
    // @ConnectedSocket() client: Socket,
    ) {
      if (!data.channelId && !data.sender) {
        console.log('Channel not found leaveChannel data');
        return;
      }

      const user = await this.prisma.user.findUnique({
        where: {
          username: data.sender,
        },  
      });  
      const channel = await this.prisma.channel.findUnique({
        where: {
        id: data.channelId,
      },  
    });

    if (!channel || !user) {
      console.log('channel or user not found');
      return;
    }

    // check if user is owner of the channel if yes delete the channel
    const checkOwner = await this.prisma.channel.findFirst({
      where: {
        id: channel.id,
        userId: user.id,
        role: 'owner',
      },
    });

    
    if (checkOwner) {
      // delete the channel from the user
      const deleteChannel = await this.prisma.channelMembership.deleteMany({
        where: {
          userId: user.id,
          channelId: channel.id,
        },  
      });  
  
      // delete the channel from the user
      const deleteAcceptedChannelInvite = await this.prisma.acceptedChannelInvite.deleteMany({
        where: {
          userId: user.id,
          channelId: channel.id,
        },  
      });  
  
      // delete the channel from the user
      const deleteChannelMessage = await this.prisma.channelMessage.deleteMany({
        where: {
          channelId: channel.id,
        },  
      });  
  
      // delete the channel from the user
      const deleteChannelInvite = await this.prisma.channelInvite.deleteMany({
        where: {
          channelId: channel.id,
        },  
      });  
  
      
      // delete the channel from the user
      const deleteChannelMembership2 = await this.prisma.channelMembership.deleteMany({
        where: {
          channelId: channel.id,
        },  
      });  
      const deleteChannelOwnership = await this.prisma.channel.delete({
        where: {
          id: channel.id,
        },  
      });  
      this.server.emit('leaveChannel', deleteChannelOwnership);
      return deleteChannelOwnership;
    }
      // TODO: 
      //FIXME: IF THE USER IS JUST A MEMBER SO DELETE HIM FROM THE CHANNEL MEMBERSHIP
  }

  //------------------------end channel------------------------

  // get all users
  @SubscribeMessage('getAllUsers')
  async listUsers(
    @MessageBody() data: { sender: string },
    // @ConnectedSocket() client: Socket,
  ) {
    const users = await this.prisma.user.findMany({
      include: {
        channel: true,
      },
    });
    this.server.emit('getAllUsers', users);
    return users;
  }

  // directMessage
  @SubscribeMessage('directMessage')
  async directMessage(
    @MessageBody()
    data: {
      sender: string;
      reciever: string;
      message: string;
    },
    // @ConnectedSocket() client: Socket,
  ) {
    const saveMessage = await this.directMessageService.createDirectMessage(data);
    this.server.emit('directMessage', saveMessage);
    return saveMessage;
  }

  // listDirectMessages for a both users
  @SubscribeMessage('listDirectMessages')
  async listDirectMessages(
    @MessageBody()
    data: {
      sender: string;
      reciever: string;
    },
    // @ConnectedSocket() client: Socket,
  ) {
    try {
      // save the messages in an array where ChannelMessage is an object with the message and user
      const messages = await this.directMessageService.listDirectMessages(data);
      
      if (messages && messages.length > 0) {
        let msg = [];
        messages.forEach((element) => {
          if (element.message) {
            msg.push(element);
          }
        });
        this.server.emit('listDirectMessages', { msg });
        // return as array of objects
        return msg;
      } else {
        console.error('No messages found.');
        return []; // Return an empty array or handle it according to your application's logic
      }
    } catch (error) {
      console.error('Error while fetching messages:', error);
      throw error; // Rethrow the error to handle it in your calling code
    }
  }

  // search for a user
  @SubscribeMessage('searchUser')
  async searchUser(
    @MessageBody()
    data: {
      user: string;
    },
    // @ConnectedSocket() client: Socket,
  ) {
    try {
      const user = await this.prisma.user.findMany({
        where: {
          username: {
            contains: data.user,
          },
        },
      });
      this.server.emit('searchUser', user); // this will return all users
      return user;
    } catch (error) {
      console.error('Error while fetching messages:', error);
      throw error; // Rethrow the error to handle it in your calling code
    }
  }

  @SubscribeMessage('sendInviteToChannel')
  async sendInviteToChannel(
    @MessageBody()
    data: {
      sender: string;
      friend: string;
      channel: string;
      status: string;
    },
  ) {
    try {
      const friend = await this.notificationService.sendInviteToChannel(data);
      this.server.emit('sendInviteToChannel', friend); // this will return all users
      return friend;
    } catch (error) {
      console.error('Error while fetching messages:', error);
      throw error; // Rethrow the error to handle it in your calling code
    }
  }

  // saveAcceptedChannelToDB
  @SubscribeMessage('saveAcceptedChannelToDB')
  async saveAcceptedChannelToDB(
    @MessageBody()
    data: {
      friend: string;
      status: string;
      channelId: string;
    },
  ) {
    try {
      const friend = await this.notificationService.saveAcceptedChannelToDB(data);
      this.server.emit('saveAcceptedChannelToDB', friend); // this will return all users
      return friend;
    } catch (error) {
      console.error('Error while fetching messages:', error);
      throw error; // Rethrow the error to handle it in your calling code
    }
  }

  // listinviteChannel
  @SubscribeMessage('listinviteChannel')
  async listinviteChannel(
    @MessageBody()
    data: {
      username: string;
    },
  ) {
    try {
      if (!data.username) {
        return;
      }
      const user = await this.prisma.user.findUnique({
        where: {
          username: data.username,
        },
      });

      const inviteChannel = await this.prisma.channelInvite.findMany({
        where: {
          receiverId: user.id,
          status: 'pending',
        },
      });

      this.server.emit('listinviteChannel', inviteChannel); // this will return all users
      return inviteChannel;
    } catch (error) {
      console.error('Error while fetching messages:', error);
      throw error; // Rethrow the error to handle it in your calling code
    }
  }
  


  // add friend to user by id
  @SubscribeMessage('sendFriendRequest')
  async sendFriendRequest(
    @MessageBody()
    data: {
      receiverInvite: string;
      senderInvite: string;
    },
  ) {
    try {
      if (!data.receiverInvite || !data.senderInvite) {
        return;
      }
      const friend = await this.notificationService.sendFriendRequest(data);
      this.server.emit('sendFriendRequest', friend); // this will return all users
      return friend;
    } catch (error) {
      console.error('Error while fetching messages:', error);
      throw error; // Rethrow the error to handle it in your calling code
    }
  }

  // list all notification for a user
  @SubscribeMessage('notification')
  async listFriendRequest(
    @MessageBody()
    data: {
      username: string;
    },
  ) {
    try {
      const notification = await this.notificationService.listFriendRequest(data);
      this.server.emit('notification', notification); // this will return all users
      return notification;
    } catch (error) {
      console.error('Error while fetching messages:', error);
      throw error; // Rethrow the error to handle it in your calling code
    }
  }

  // on accept friend request add friend to user
  @SubscribeMessage('acceptFriendRequest')
  async addFriend(
    @MessageBody()
    data: {
      sender: string;
      receiver: string;
    },
  ) {
    try {
      const friend = await this.notificationService.acceptFriendRequest(data);
      this.server.emit('addFriend', friend); // this will return all users
      return friend;
    } catch (error) {
      console.error('Error while fetching messages:', error);
      throw error; // Rethrow the error to handle it in your calling code
    }
  }

  // get user by id 
  @SubscribeMessage('getUserById')
  async getUserById(
    @MessageBody()
    data: {
      id: string;
    },
  ) {
    try {
      if (!data.id) {
        return;
      }
      const user = await this.prisma.user.findUnique({
        where: {
          id: data.id,
        },
      });
      if (!user) {
        console.log('user not found', data.id);
        return;
      }
      this.server.emit('getUserById', user);
      return user;
    } catch (error) {
      console.error('Error while fetching user by id:', error);
      throw error;
    }
  }

  // get all friends for a user
  @SubscribeMessage('getAllUsersFriends')
  async getAllUsersFriends(
    @MessageBody()
    data: {
      sender: string;
    },
  ) {
    // FIXME: HNA KHASNI NSIFT CLIENT ONTCHIKI ILA KAN MKHTALF 3LA SENDER RJA3 F FRONT

    try {
      const user = await this.prisma.user.findUnique({
        where: {
          username: data.sender,
        },
      });

      if (!user) {
        console.log('friend not found', data.sender);
        return;
      }
      const friends = await this.prisma.friends.findMany({
        where: {
          MefriendsOfId: user.id,
        },
        include: {
          MefriendOf: true,
          friend: true,
        },
      });

      this.server.emit('getAllUsersFriends', friends); // this will return all users
      return friends;
    } catch (error) {
      console.error('Error while fetching messages:', error);
      throw error; // Rethrow the error to handle it in your calling code
    }
  }
  // blockUser
  @SubscribeMessage('blockUser')
  async blockUser(
    @MessageBody()
    data: {
      willbocked: string;
      whoblocked: string;
        },
  ) {
    try {
      const user =  await this.prisma.user.findUnique({
        where: {
          username: data.whoblocked,
        },
      });
      const check = await this.prisma.blockedUsers.findMany({
        where: {
          blocker: {
            username: user.username,
          },
        },
      });

      // filter the blocked users if there is a duplicate console log it
      const checkDuplicate = check.filter((el) => { return el.getblockedid === el.getblockedid });
      if (checkDuplicate.length > 0) {
        console.log('user already blocked');
        return;
      }

      const blocked = await this.prisma.blockedUsers.create({
        data: {
          blocker: {
            connect: {
              username: user.username,
            },
          },
          getblocked: {
            connect: {
              username: data.willbocked,
            },
          },
        },
      });
            
      this.server.emit('blockUser', blocked); // this will return all users
      return blocked;
    } catch (error) {
      console.error('Error while fetching messages:', error);
      throw error; // Rethrow the error to handle it in your calling code
    }
  }


  // getblockUser
  @SubscribeMessage('getblockUser')
  async getblockUser(
    @MessageBody()
    data: {
      username: string;
    },
  ) {
    try {
      if (!data.username) {
        return;
      }
      const user = await this.prisma.user.findUnique({
        where: {
          username: data.username,
        },
      });
      const blocked = await this.prisma.blockedUsers.findMany({
        where: {
          blocker: {
            username: user.username,
          },
        },
        include: {
          blocker: true,
          getblocked: true,
        },
      });
      if (!blocked) {
        console.log('no blocked users');
      }
      this.server.emit('getblockUser', blocked); // this will return all users
      return blocked;
    } catch (error) {
      console.error('Error while fetching user by id:', error);
      throw error;
    }
  }

  //checkIfTheUserIsBlocked
  @SubscribeMessage('checkIfTheUserIsBlocked')
  async checkIfTheUserIsBlocked(
    @MessageBody()
    data: {
      sender: string;
      receiver: string;
    },
  ) {
    try {
      if (!data.sender && !data.receiver) {
        return;
      }
      const user = await this.prisma.user.findUnique({
        where: {
          username: data.sender,
        },
      });
      const blocked = await this.prisma.blockedUsers.findMany({
        where: {
          blocker: {
            username: user.username,
          },
          getblocked: {
            username: data.receiver,
          },
        },
      });

      if (!blocked) {
        console.log('no blocked users');
      }

      this.server.emit('checkIfTheUserIsBlocked', blocked); // this will return all users
    } catch (error) {
      console.error('Error while fetching user by id:', error);
      throw error;
    }
  }

  // handle online status for a user
  @SubscribeMessage('onlineStatus')
  async onlineStatus(
    @MessageBody()
    data: {
      username: string;
      status: string;
    },
  ) {
    try {
      if (!data.username) {
        return;
      }
      const user = await this.prisma.user.findUnique({
        where: {
          username: data.username,
        },
      });
      const status = await this.prisma.user.update({
        where: {
          username: user.username,
        },
        data: {
          status: data.status,
        },
      });
      this.server.emit('onlineStatus', status); // this will return all users
      return status;
    } catch (error) {
      console.error('Error while fetching user by id:', error);
      throw error;
    }
  }

  //getUserStatus
  @SubscribeMessage('getUserStatus')
  async getUserStatus(
    @MessageBody()
    data: {
      username: string;
    },
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          username: data.username,
        },
      });
      this.server.emit('getUserStatus', user); // this will return all users
      return user;
    } catch (error) {
      console.error('Error while fetching user by id:', error);
      throw error;
    }
  }

  // inviteToGame
  @SubscribeMessage('inviteToGame')
  async inviteToGame(
    @MessageBody()
    data: {
      sender: string;
      receiver: string;
      status: string;
    },
  ) {
    try {
      const invite = await this.notificationService.sendInviteToGame(data);
      this.server.emit('inviteToGame', invite); // this will return all users
      return invite;
    } catch (error) {
      console.error('Error while fetching user by id:', error);
      throw error;
    }
  }

  // listinviteGame
  @SubscribeMessage('listinviteGame')
  async listinviteGame(
    @MessageBody()
    data: {
      username: string;
    },
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          username: data.username,
        },
      });

      const inviteGame = await this.prisma.gameInvite.findMany({
        where: {
          receiverId: user.id,
          status: 'pending',
        },
      });

      this.server.emit('listinviteGame', inviteGame); // this will return all users
      return inviteGame;
    } catch (error) {
      console.error('Error while fetching user by id:', error);
      throw error;
    }
  }
}



