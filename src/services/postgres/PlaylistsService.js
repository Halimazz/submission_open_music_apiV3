import { nanoid } from "nanoid";
import { Pool } from "pg";
import  NotFoundError  from "../../exceptions/NotFoundError.js";
import  InvariantError  from "../../exceptions/InvariantError.js";
import  AuthenticationError from "../../exceptions/AuthenticationError.js";
import  AuthorizationError from "../../exceptions/AuthorizationError.js";

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, owner }) {
    await this.verifyOwnerExists(owner);

    const id = `playlist-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO playlists (id, name, owner, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, owner, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async verifyOwnerExists(userId) {
    const query = {
      text: 'SELECT id FROM users WHERE id = $1',
      values: [userId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new AuthenticationError('User tidak ditemukan');
    }
  }

  async getPlaylists(owner) {
    const query = {
      text: 'SELECT p.id, p.name, u.username FROM playlists p LEFT JOIN users u ON u.id = p.owner LEFT JOIN playlist_collaborations pc ON pc.playlist_id = p.id WHERE p.owner = $1 OR pc.user_id = $1',
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getPlaylistById(id) {
    const query = {
      text: 'SELECT id, name, owner FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    return result.rows[0];
  }

  async editPlaylistById(id, { name }) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: 'UPDATE playlists SET name = $1, updated_at = $2 WHERE id = $3 RETURNING id',
      values: [name, updatedAt, id],
    };

    const { rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Gagal memperbarui playlist. Id tidak ditemukan');
    }
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof AuthorizationError) {
        try {
          await this._collaborationsService.verifyCollaborator(
            playlistId,
            userId,
          );
        } catch {
          throw error;
        }
      } else {
        throw error;
      }
    }
  }

  async verifySongExists(songId) {
    const query = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [songId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
  }

  async addSongToPlaylist(playlistId, songId) {
    await this.verifySongExists(songId);

    const id = `playlist-song-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs (id, playlist_id, song_id) VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }
  }

  async addActivity(playlistId, songId, userId, action) {
    const id = `activity-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_activities (id, playlist_id, song_id, user_id, action) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      values: [id, playlistId, songId, userId, action],
    };

    await this._pool.query(query);
  }

  async getPlaylistSongs(playlistId) {
    const playlistQuery = {
      text: 'SELECT p.id, p.name, u.username FROM playlists p LEFT JOIN users u ON u.id = p.owner WHERE p.id = $1',
      values: [playlistId],
    };

    const playlistResult = await this._pool.query(playlistQuery);
    if (!playlistResult.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const songsQuery = {
      text: 'SELECT s.id, s.title, s.performer FROM songs s INNER JOIN playlist_songs ps ON ps.song_id = s.id WHERE ps.playlist_id = $1',
      values: [playlistId],
    };

    const songsResult = await this._pool.query(songsQuery);

    return {
      playlist: {
        ...playlistResult.rows[0],
        songs: songsResult.rows,
      },
    };
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal dihapus dari playlist');
    }
  }

  async getPlaylistActivities(playlistId) {
    const query = {
      text: 'SELECT u.username, s.title, pa.action, pa.time FROM playlist_activities pa LEFT JOIN users u ON u.id = pa.user_id LEFT JOIN songs s ON s.id = pa.song_id WHERE pa.playlist_id = $1 ORDER BY pa.time ASC',
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

export default PlaylistsService;
