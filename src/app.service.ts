import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database/database.service';

@Injectable()
export class AppService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getHealth(): Promise<{ status: string; database: string }> {
    const isDatabaseUp = await this.databaseService.ping();

    return {
      status: 'ok',
      database: isDatabaseUp ? 'up' : 'down',
    };
  }
}
