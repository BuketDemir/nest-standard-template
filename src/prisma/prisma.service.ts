import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';


@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {

  constructor() {
    super();
  }
  async onModuleInit() {
    await this.$connect();
    await this.main();

    // Sql query execute bigger than 2 second
    this.$on('query' as never, (event: any) => {
      const durationMs = Number(event.duration);

      if (durationMs > 2000) {
        console.log("")
      }
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async main() {}
}
