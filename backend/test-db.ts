import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User],
  synchronize: false,
});

AppDataSource.initialize()
  .then(() => {
    console.log('✅ Database connection established successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error during Data Source initialization:', err);
    process.exit(1);
  });
