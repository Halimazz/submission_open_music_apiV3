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
  pgm.createTable("playlist_collaborations", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    playlist_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    user_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    created_at: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.addConstraint(
    "playlist_collaborations",
    "fk_playlist_collaborations.playlist_id_playlists_id",
    "FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE"
  );

  pgm.addConstraint(
    "playlist_collaborations",
    "fk_playlist_collaborations.user_id_users_id",
    "FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE"
  );

  pgm.addConstraint(
    "playlist_collaborations",
    "unique_playlist_collaboration",
    "UNIQUE(playlist_id, user_id)"
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("playlist_collaborations");
};
