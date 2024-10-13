import knex from 'knex';

import 'dotenv/config'

const environment = process.env.NODE_ENV || 'development';

const config = (environment) => {
  return {
    client: 'pg',
    connection: {
        host: process.env.NUXT_DB_HOST,
        user: process.env.NUXT_DB_USER,
        password: process.env.NUXT_DB_PASS,
        database: process.env.NUXT_DB_NAME,
        port: process.env.NUXT_DB_PORT,
    },
    migrations: {
      directory: 'db/migrations'
    },
    seeds: {
      directory: 'db/seeds'
    },
    pool: {
      min: 0,
      max: 10
    },
  };
}

const connection = knex(config(environment));

export default connection;
