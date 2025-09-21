import autoBind from "auto-bind";
import ClientError from "../../exceptions/ClientError.js";

class ExportsHandler {
  constructor(service, validator, playlistsService) {
    this._service = service;
    this._validator = validator;
    this._playlistsService = playlistsService;

    autoBind(this);
  }

  async postExportPlaylistsHandler(request, h) {
    try {
      this._validator.validateExportsPlaylistPayload(request.payload);

      const { playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistAccess(
        playlistId,
        credentialId
      );

      const message = {
        userId: credentialId,
        playlistId,
        targetEmail: request.payload.targetEmail,
      };

      await this._service.sendMessage(
        "export:playlists",
        JSON.stringify(message)
      );

      const response = h.response({
        status: "success",
        message: "Permintaan Anda dalam antrian",
      });
      response.code(201);
      response.type("application/json");
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        response.type("application/json");
        return response;
      }

      // Server error fallback
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami.",
      });
      response.code(500);
      response.type("application/json");
      return response;
    }
  }
}

export default ExportsHandler;
