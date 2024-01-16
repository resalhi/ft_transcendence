import { Injectable } from '@nestjs/common';
import { channel } from 'diagnostics_channel';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class channelService {
  constructor(private readonly prisma: PrismaService) {}

  // ------------------ create channel Message ------------------
  async createChannelMessage(data: {
    sender: string;
    channel: string;
    channelId: string;
    message: string;
  }) {
    try {
      if (data.channel === 'general') {
        // first case
        const chnnelname = await this.prisma.channel.findFirst({
          where: {
            name: data.channel,
          },
        });
        // user
        const user = await this.prisma.user.findUnique({
          where: {
            username: data.sender,
          },
        });
        if (!user) {
          throw new Error('User not found');
        }
        // create message
        const channelMessage = await this.prisma.channelMessage.create({
          data: {
            message: data.message,
            channel: {
              connect: {
                id: chnnelname.id,
              },
            },
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        });
        return channelMessage;
      }else{
        const user = await this.prisma.user.findUnique({
          where: {
            username: data.sender,
          },
        });
        if (!user) {
          throw new Error('User not found');
        }

        let isexist = await this.prisma.channel.findUnique({
          where: {
            id: data.channelId,
          },
        });

    
        if (!isexist) {
          throw new Error('Channel not found createChannelMessage');
        }
        
        const channelMessage = await this.prisma.channelMessage.create({
          data: {
            message: data.message,
            channel: {
              connect: {
                id: data.channelId,
              },
            },
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        });
        return channelMessage;
      }
    } catch (err) {
      console.log(err);
    }
  }

  // ------------------ list channels Messages ------------------

  async listChannelMessages(data: { sender: string; channel: string, channelId: string }) {
    if (!data.channel && !data.sender && !data.channelId) {
      console.log('Channel not found listChannelMessages data');
      return;
    }
    if (data.channel === 'general') {
      // first case becuase general channel is created by default and doesn't have id
      const chnnelname = await this.prisma.channel.findFirst({
        where: {
          name: data.channel,
        },
      });
      if (!chnnelname) {
        const channel = await this.prisma.channel.create({
          data: {
            name: data.channel,
            visibility: 'public',
            user: {
              connect: {
                username: data.sender,
              },
            },
          },
        });
      }
      
       // list all messages for a channel
      const messages = await this.prisma.channel.findMany({
        where: {
          id: chnnelname.id,
        },
        include: {
          // include name of channel
          ChannelMessage: {
            select: {
              channel: true,
              user: true,
              message: true,
            },
          },
        },
      });
      return messages;
    }
    else{
        const channelId = await this.prisma.channel.findUnique({
          where: {
            id: data.channelId,
          },
        });
        if (!channelId) {
          console.log('Channel not found in listChannelMessages');
          return;
        }


        // list all messages for a channel
        const messages = await this.prisma.channel.findMany({
          where: {
            id: channelId.id,
          },
          include: {
            // include name of channel
            ChannelMessage: {
              select: {
                channel: true,
                user: true,
                message: true,
              },
            },
          },
        });
        return messages;
  }
  }


}
