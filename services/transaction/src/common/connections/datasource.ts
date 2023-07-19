import { join } from 'path';
import { DataSource } from 'typeorm';

/**
 * @description - This const returns the DataSource object of the
 * database
 */
export const mainDataSource: DataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [],
  migrations: [join(__dirname, '../../migrations/*{.ts,.js}')],
  logging: true,
});

/**
 * @description - This function returns the dataSource connection of the
 * database
 */
export async function getDataSource(): Promise<DataSource> {
  const dataSource = mainDataSource;

  if (dataSource.isInitialized) {
    return dataSource;
  }

  await dataSource.initialize();
  return dataSource;
}
