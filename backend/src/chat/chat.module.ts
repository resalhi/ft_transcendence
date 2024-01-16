import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { channelService } from './channel.service';
import { directMessageService } from './directMessage.service';
import { notificationService } from './notification.service';


@Module({
  providers: [ChatGateway,
     channelService,
      directMessageService,
        notificationService
    ],
  imports: [PrismaModule],
})
export class ChatModule {}
