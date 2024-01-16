import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy{

    constructor(private config: ConfigService){
        super({
            datasources:{
                db:{
                    url: config.get("DATABASE_URL")
                }
            }
        })
    }

    async onModuleInit() {
        this.$connect()
    }

    async onModuleDestroy() {
        this.$disconnect()
    }
}
