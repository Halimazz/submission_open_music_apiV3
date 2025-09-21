import { nanoid } from "nanoid";
import { Pool } from "pg";
import NotFoundError from "../../exceptions/NotFoundError.js";
import InvariantError from "../../exceptions/InvariantError.js";
import AuthenticationError from "../../exceptions/AuthenticationError.js";
import bcrypt from "bcrypt";

class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  async addUser({ username, password, fullname }) {
    await this.verifyUserNewUsername(username);

    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = {
      text: "INSERT INTO users (id, username, password, fullname) VALUES ($1, $2, $3, $4) RETURNING id",
      values: [id, username, hashedPassword, fullname],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError("User gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async verifyUserNewUsername(username) {
    const query = {
      text: "SELECT username FROM users WHERE username = $1",
      values: [username],
    };

    const result = await this._pool.query(query);
    if (result.rows.length > 0) {
      throw new InvariantError(
        "Gagal menambahkan user. Username sudah digunakan"
      );
    }
  }

  async getUserById(userId) {
    const query = {
      text: "SELECT id, username, fullname FROM users WHERE id = $1",
      values: [userId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Gagal mendapatkan user. Id tidak ditemukan");
    }
    return result.rows[0];
  }

  async verifyUserCredential(username, password) {
    const query = {
      text: "SELECT id, password FROM users WHERE username = $1",
      values: [username],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new AuthenticationError("Kredensial yang Anda berikan salah");
    }

    const { id, password: hashedPassword } = result.rows[0];

    const match = await bcrypt.compare(password, hashedPassword);
    if (!match) {
      throw new AuthenticationError("Kredensial yang Anda berikan salah");
    }
    return id;
  }
}

export default UsersService;
