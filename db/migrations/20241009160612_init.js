
export const up = function (knex) {
    return Promise.all([
        knex.raw('CREATE EXTENSION IF NOT EXISTS vector')
            .then(() => {
                console.log('Extension vector was created.');
            })
            .catch((err) => {
                console.log(err);
            }),
        knex.schema.createTable('track', (table) => {
            table.increments('id').primary();
            table.string('composer').notNullable();
            table.string('title').notNullable();
            table.string('all_music_url').notNullable();
            table.string('duration');
            table.string('genre');
            table.text('description');
            table.string('spotify_track_uri');
            table.specificType('embedding', 'vector(768)');
        })
            .then(() => {
                console.log('Table track was created.');
            })
            .catch((err) => {
                console.log(err);
            }),
        knex.schema.createTable('playlist', (table) => {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.text('description').notNullable();
            table.string('spotify_url').notNullable();
            table.string('spotify_playlist_id').notNullable();
            table.string('image_url').notNullable();
            table.jsonb('tracks').notNullable();
            table.string('book_id').notNullable();
            table.string('book_url').notNullable();
            table.string('book_title').notNullable();
            table.string('book_author').notNullable();
        })
            .then(() => {
                console.log('Table playlist was created.');
            })
            .catch((err) => {
                console.log(err);
            }),
    ]);
};

export const down = function (knex) {
    return Promise.all([
        knex.schema.dropTable('playlist')
            .then(() => {
                console.log('Table playlist was deleted.');
            })
            .catch((err) => {
                console.log(err);
            }),
        knex.schema.dropTable('track')
            .then(() => {
                console.log('Table track was deleted.');
            })
            .catch((err) => {
                console.log(err);
            }),
        knex.raw('DROP EXTENSION IF EXISTS vector')
            .then(() => {
                console.log('Extension vector was dropped.');
            })
            .catch((err) => {
                console.log(err);
            }),
    ]);
};
