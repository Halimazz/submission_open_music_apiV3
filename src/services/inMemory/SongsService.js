const { nanoid } = require('nanoid/non-secure');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongService {
  constructor() {
    this._songs = [];
  }

  addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const newSong = {
      id,
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
      createdAt,
      updatedAt,
    };

    this._songs.push(newSong);

    const isSuccess = this._songs.filter((song) => song.id === id).length > 0;
    if (!isSuccess) {
      throw new InvariantError('Song gagal ditambahkan');
    }
    return id;
  }

  getSongs(params = {}) {
    let filteredSongs = this._songs;

    if (params.title) {
      filteredSongs = filteredSongs.filter((song) => song.title.toLowerCase()
        .includes(params.title.toLowerCase()));
    }

    if (params.performer) {
      filteredSongs = filteredSongs.filter((song) => song.performer.toLowerCase()
        .includes(params.performer.toLowerCase()));
    }

    return filteredSongs.map((song) => ({
      id: song.id,
      title: song.title,
      performer: song.performer,
    }));
  }

  getSongById(id) {
    const song = this._songs.filter((item) => item.id === id)[0];
    if (!song) {
      throw new NotFoundError('Song tidak ditemukan');
    }
    return song;
  }

  editSongById(id, {
    title, year, genre, performer, duration,
  }) {
    const index = this._songs.findIndex((song) => song.id === id);
    if (index === -1) {
      throw new NotFoundError('Gagal memperbarui song. Id tidak ditemukan');
    }

    const updatedAt = new Date().toISOString();
    this._songs[index] = {
      ...this._songs[index],
      title,
      year,
      genre,
      performer,
      duration,
      updatedAt,
    };

    return this._songs[index];
  }

  deleteSongById(id) {
    const index = this._songs.findIndex((song) => song.id === id);
    if (index === -1) {
      throw new NotFoundError('Song gagal dihapus. Id tidak ditemukan');
    }

    this._songs.splice(index, 1);
    return { message: 'Song berhasil dihapus' };
  }
}

module.exports = SongService;
