/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable("playlist_songs", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    playlist_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    song_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
  });

  pgm.addConstraint(
    "playlist_songs",
    "fk_playlist_songs.playlist_id_playlists.id",
    "FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE"
  );

  pgm.addConstraint(
    "playlist_songs",
    "fk_playlist_songs.song_id_songs.id",
    "FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE"
  );

  pgm.addConstraint(
    "playlist_songs",
    "unique_playlist_song",
    "UNIQUE(playlist_id, song_id)"
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable("playlist_songs");
};
