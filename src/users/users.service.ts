import { Injectable } from '@nestjs/common';
import { desc } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service';
import { users } from '../database/schema';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async listUsers() {
    return this.databaseService.db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }
}
