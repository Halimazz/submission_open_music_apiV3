import { nanoid } from "nanoid/non-secure";
import { Pool } from "pg";
import  NotFoundError  from "../../exceptions/NotFoundError.js";
import  InvariantError  from "../../exceptions/InvariantError.js";
import { SongsMapDB } from "../../utils/index.js";


class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO songs (id, title, year, genre, performer, duration, album_id, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [
        id,
        title,
        year,
        genre,
        performer,
        duration,
        albumId,
        createdAt,
        updatedAt,
      ],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Song gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getSongs(params = {}) {
    let query = 'SELECT id, title, performer FROM songs';
    const values = [];
    const conditions = [];

    if (params.title) {
      conditions.push(`title ILIKE $${values.length + 1}`);
      values.push(`%${params.title}%`);
    }

    if (params.performer) {
      conditions.push(`performer ILIKE $${values.length + 1}`);
      values.push(`%${params.performer}%`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    const result = await this._pool.query(query, values);
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song tidak ditemukan');
    }
    return SongsMapDB(result.rows[0]);
  }

  async editSongById(id, {
    title, year, genre, performer, duration,
  }) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, updated_at = $6 WHERE id = $7 RETURNING *',
      values: [title, year, performer, genre, duration, updatedAt, id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui song. Id tidak ditemukan');
    }
    return SongsMapDB(result.rows[0]);
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Song gagal dihapus. Id tidak ditemukan');
    }
    return result.rows[0].id;
  }
}

export default SongsService;
