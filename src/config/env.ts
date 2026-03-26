export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  dbHost: process.env.DB_HOST ?? 'localhost',
  dbPort: Number(process.env.DB_PORT ?? 5432),
  dbUser: process.env.DB_USER ?? 'postgres',
  dbPassword: process.env.DB_PASSWORD ?? 'postgres',
  dbName: process.env.DB_NAME ?? 'nestjs_drizzle',
  runMigrations:
    (process.env.RUN_MIGRATIONS ??
      (process.env.NODE_ENV === 'test' ? 'false' : 'true')) === 'true',
};

export const databaseUrl =
  process.env.DATABASE_URL ??
  `postgresql://${env.dbUser}:${env.dbPassword}@${env.dbHost}:${env.dbPort}/${env.dbName}`;
