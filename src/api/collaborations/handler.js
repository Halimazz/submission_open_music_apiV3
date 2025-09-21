import autoBind from "auto-bind";

class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    try {
      this._validator.validateCollaborationPayload(request.payload);

      const playlistId = request.params.id || request.payload.playlistId;
      const { userId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      if (!playlistId) {
        const response = h.response({
          status: "fail",
          message: "Gagal menambahkan kolaborasi, playlistId tidak ditemukan",
        });
        response.code(400);
        return response;
      }

      await this._playlistsService.verifyPlaylistOwner(
        playlistId,
        credentialId
      );

      const collaborationId =
        await this._collaborationsService.addCollaboration(playlistId, userId);

      const response = h.response({
        status: "success",
        message: "Kolaborasi berhasil ditambahkan",
        data: {
          collaborationId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: "Gagal menambahkan kolaborasi",
      });
      response.code(error.statusCode || 500);
      return response;
    }
  }

  async deleteCollaborationHandler(request, h) {
    try {
      this._validator.validateCollaborationPayload(request.payload);

      const playlistId = request.params.id || request.payload.playlistId;
      const { userId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      if (!playlistId) {
        const response = h.response({
          status: "fail",
          message: "Gagal menghapus kolaborasi, playlistId tidak ditemukan",
        });
        response.code(400);
        return response;
      }

      await this._playlistsService.verifyPlaylistOwner(
        playlistId,
        credentialId
      );
      await this._collaborationsService.deleteCollaboration(playlistId, userId);

      return {
        status: "success",
        message: "Kolaborasi berhasil dihapus",
      };
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: "Gagal menghapus kolaborasi",
      });
      response.code(error.statusCode || 500);
      return response;
    }
  }
}

export default CollaborationsHandler;
