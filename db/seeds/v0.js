import parquetjs from '@dsnp/parquetjs';

export const seed = async function(knex) {
  try {
    // Deletes ALL existing entries
    await knex('track').del()

    let reader = await parquetjs.ParquetReader.openFile('./compositions_v0.parquet');
    // create a new cursor
    let cursor = reader.getCursor();

    // read all records from the file and print them
    let record = null;
    while ((record = await cursor.next())) {
      const embeddings = record.embeddings.list.map(e => e.element);
      await knex('track').insert({
        composer: record.composer,
        title: record.title,
        all_music_url: record.url,
        duration: record.duration,
        genre: record.genre,
        description: record.description_text,
        spotify_track_uri: record.track_uri,
        embedding: knex.raw(`'[${embeddings.join(',')}]'::vector`)
      })
    }
    await reader.close();
  } catch (error) {
    console.error(error);
  }
};
