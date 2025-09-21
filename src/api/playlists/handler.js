import autoBind from "auto-bind";
class PlaylistsHandler {
  constructor(service, validator, playlistSongsValidator) {
    this._service = service;
    this._validator = validator;
    this._playlistSongsValidator = playlistSongsValidator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePlaylistPayload(request.payload);
      const { name } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      const playlistId = await this._service.addPlaylist({
        name,
        owner: credentialId,
      });

      const response = h.response({
        status: "success",
        message: "Playlist berhasil ditambahkan",
        data: {
          playlistId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: "Gagal menambahkan playlist",
      });
      response.code(error.statusCode || 500);
      return response;
    }
  }

  async getPlaylistsHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const playlists = await this._service.getPlaylists(credentialId);

      return {
        status: "success",
        data: {
          playlists,
        },
      };
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: "Gagal mendapatkan daftar playlist",
      });
      response.code(error.statusCode || 500);
      return response;
    }
  }

  async deletePlaylistByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyPlaylistOwner(id, credentialId);
      await this._service.deletePlaylistById(id);

      return {
        status: "success",
        message: "Playlist berhasil dihapus",
      };
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: "Gagal menghapus playlist. Id tidak ditemukan",
      });
      response.code(error.statusCode || 500);
      return response;
    }
  }

  async postSongToPlaylistHandler(request, h) {
    try {
      this._playlistSongsValidator.validatePlaylistSongPayload(request.payload);
      const { id: playlistId } = request.params;
      const { songId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      await this._service.addSongToPlaylist(playlistId, songId);
      await this._service.addActivity(playlistId, songId, credentialId, "add");

      const response = h.response({
        status: "success",
        message: "Lagu berhasil ditambahkan ke playlist",
      });
      response.code(201);
      return response;
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: "Gagal menambahkan lagu ke playlist. Id tidak ditemukan",
      });
      response.code(error.statusCode || 500);
      return response;
    }
  }

  async getPlaylistSongsHandler(request, h) {
    try {
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      const result = await this._service.getPlaylistSongs(playlistId);

      return {
        status: "success",
        data: result,
      };
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: error.message,
      });
      response.code(error.statusCode || 500);
      return response;
    }
  }

  async deleteSongFromPlaylistHandler(request, h) {
    try {
      this._playlistSongsValidator.validatePlaylistSongPayload(request.payload);
      const { id: playlistId } = request.params;
      const { songId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      await this._service.deleteSongFromPlaylist(playlistId, songId);
      await this._service.addActivity(
        playlistId,
        songId,
        credentialId,
        "delete"
      );

      return {
        status: "success",
        message: "Lagu berhasil dihapus dari playlist",
      };
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: "Gagal menghapus lagu dari playlist. Id tidak ditemukan",
      });
      response.code(error.statusCode || 500);
      return response;
    }
  }

  async getPlaylistActivitiesHandler(request, h) {
    try {
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      const activities = await this._service.getPlaylistActivities(playlistId);

      return {
        status: "success",
        data: {
          playlistId,
          activities,
        },
      };
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: "Gagal mendapatkan aktivitas playlist",
      });
      response.code(error.statusCode || 500);
      return response;
    }
  }
}

export default PlaylistsHandler;
