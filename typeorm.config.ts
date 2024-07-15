import { env } from 'process';
import { DataSource } from 'typeorm';


export default new DataSource({
    name: 'default',
    type: 'mysql',
    host: env.DBSERVICE_AUTH_HOST,
    port: parseInt(env.DBSERVICE_AUTH_PORT ?? '3306'),
    username: env.DBSERVICE_AUTH_USER,
    password: env.DBSERVICE_AUTH_PASSWORD,
    database: env.DBSERVICE_AUTH_DATABASE,
    entities: [
        'src/**/**/*.entity{.ts,.js}'
    ],
    synchronize: true,
    migrations: [
        'src/db/migrations/*{.ts,.js}'
    ],
    migrationsTableName: 'migrations_typeorm',
    migrationsRun: true
});