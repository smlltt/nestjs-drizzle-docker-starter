import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import * as schema from './schema';
import { databaseUrl, env } from '../config/env';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly pool = new Pool({ connectionString: databaseUrl });
  readonly db: NodePgDatabase<typeof schema> = drizzle(this.pool, { schema });

  async onModuleInit(): Promise<void> {
    if (!env.runMigrations) {
      this.logger.log('Skipping migrations (RUN_MIGRATIONS=false).');
      return;
    }

    await migrate(this.db, { migrationsFolder: 'drizzle' });
    this.logger.log('Database migrations executed.');
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async ping(): Promise<boolean> {
    try {
      await this.db.execute(sql`select 1`);
      return true;
    } catch {
      return false;
    }
  }
}
