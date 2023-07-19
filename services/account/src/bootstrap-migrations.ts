import { getDataSource } from 'src/common/connections/datasource';

export async function runMigrations() {
  const datasource = await getDataSource();

  try {
    await datasource.runMigrations();
  } catch (error) {
    throw new Error(error);
  }
}
