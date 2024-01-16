import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class directMessageService {
  constructor(private readonly prisma: PrismaService) {}

  // ------------------ create direct Message ------------------
  async createDirectMessage(data: {
    sender: string;
    reciever: string;
    message: string;
  }) {

    
    const user = await this.prisma.user.findUnique({
      where: {
        username: data.sender,
      },
    });
    const reciever = await this.prisma.user.findUnique({
      where: {
        username: data.reciever,
      },
    });
    if (!user) {
      console.log('User not found');
      return;
    }
    if (!reciever) {
      console.log('reciever not found');
      return;
    }
    const createDirectMessage = await this.prisma.directMessage.create({
      data: {
        message: data.message,
        sender: {
          connect: {
            username: data.sender,
          },
        },
        receiver: {
          connect: {
            username: data.reciever,
          },
        },
      },
    });
    return createDirectMessage;
  }


  //listDirectMessages 
  async listDirectMessages(data: {
    sender: string;
    reciever: string;
  }) {
    if (!data.sender || !data.reciever) {
      console.log('sender not found');
      return;
    }
    const user = await this.prisma.user.findUnique({
      where: {
        username: data.sender,
      },
    });
    
    const reciever = await this.prisma.user.findUnique({
      where: {
        username: data.reciever,
      },
    });
    
    if (!user) {
      console.log('User not found', user);
    }
    if (!reciever) {
      console.log('reciever not found', reciever);
    }

    // list both sender and reciever messages
    const listDirectMessages = await this.prisma.directMessage.findMany({
      where: {
        OR: [
          {
            sender: {
              username: data.sender,
            },
            receiver: {
              username: data.reciever,
            },
          },
          {
            sender: {
              username: data.reciever,
            },
            receiver: {
              username: data.sender,
            },
          },
        ],
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        sender: true,
        receiver: true,
      },
    });
    console.log(listDirectMessages)
    return listDirectMessages;
  }
}
