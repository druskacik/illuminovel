import 'dotenv/config'

export default {

    development: {
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
        }
    },

    production: {
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
        }
    },
};
