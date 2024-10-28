// Example usage
import { DatabaseFactory } from './persistence';
import type { DatabaseConfig } from './persistence';

async function example() {
  // SQLite configuration
  const sqliteConfig: DatabaseConfig = {
    filename: './database.sqlite',
    database: 'main'
  };
  
  // PostgreSQL configuration
  const postgresConfig: DatabaseConfig = {
    host: 'localhost',
    port: 5432,
    database: 'mydb',
    username: 'user',
    password: 'password'
  };

  // Create SQLite adapter
  const sqliteDb = DatabaseFactory.createAdapter('sqlite', sqliteConfig);
  await sqliteDb.connect();

  // Use transaction
  await sqliteDb.transaction(async (transaction) => {
    await transaction.execute(
      'CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, data JSON)'
    );
    await transaction.execute(
      'INSERT INTO events (id, data) VALUES (?, ?)',
      ['1', JSON.stringify({ type: 'UserCreated' })]
    );
  });
}
