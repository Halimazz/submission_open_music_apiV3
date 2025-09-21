const AlbumsMapDB = ({
  id,
  name,
  year,
  cover_url: coverUrl,
  created_at: createdAt,
  updated_at: updatedAt,
}) => ({
  id,
  name,
  year,
  coverUrl,
  createdAt,
  updatedAt,
});

const SongsMapDB = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id: albumId,
  created_at: createdAt,
  updated_at: updatedAt,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId,
  createdAt,
  updatedAt,
});

export { AlbumsMapDB, SongsMapDB };
