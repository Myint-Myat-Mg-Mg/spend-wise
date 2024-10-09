// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient 
  implements OnModuleInit, OnModuleDestroy {

  constructor(){
    super();
    console.log('DATABASE_URL:' + process.env.DATABASE_URL);
  }
  async onModuleInit() {
    await this.$connect();
    console.log('Prisma connected to the database.');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Prisma disconnected from the database.');
  }
}
