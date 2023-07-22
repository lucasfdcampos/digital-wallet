import { getDataSource } from '@common/connections/datasource';

export async function runMigrations() {
  const datasource = await getDataSource();

  try {
    await datasource.runMigrations();
  } catch (error) {
    throw new Error('Error at run Migrations');
  }
}
