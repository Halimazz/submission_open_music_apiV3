export const up = (pgm) => {
  pgm.createTable("songs", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    title: {
      type: "TEXT",
      notNull: true,
    },
    year: {
      type: "INT",
      notNull: true,
    },
    performer: {
      type: "TEXT",
      notNull: true,
    },
    genre: {
      type: "TEXT",
    },
    duration: {
      type: "INT",
    },
    created_at: {
      type: "TIMESTAMP WITH TIME ZONE",
      notNull: true,
    },
    updated_at: {
      type: "TIMESTAMP WITH TIME ZONE",
      notNull: true,
    },
    album_id: {
      type: "VARCHAR(50)",
      references: "albums",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  });
};

export const down = (pgm) => {
  pgm.dropTable("songs");
};
