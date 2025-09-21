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
  pgm.createTable("album_likes", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    user_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    album_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    created_at: {
      type: "TEXT",
      notNull: true,
    },
  });

  pgm.addConstraint(
    "album_likes",
    "unique_user_album_like",
    "UNIQUE(user_id, album_id)"
  );

  pgm.addConstraint(
    "album_likes",
    "fk_album_likes_user_id",
    "FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE"
  );
  pgm.addConstraint(
    "album_likes",
    "fk_album_likes_album_id",
    "FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE"
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("album_likes");
};
