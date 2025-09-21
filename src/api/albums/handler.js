import autoBind from "auto-bind";

class AlbumsHandler {
  constructor(service, validator, uploadsValidator) {
    this._albumsService = service.albumsService;
    this._storageService = service.storageService;
    this._validator = validator;
    this._uploadsValidator = uploadsValidator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { name, year } = request.payload;
      const albumId = await this._albumsService.addAlbum({ name, year });

      const response = h.response({
        status: "success",
        message: "Album berhasil ditambahkan",
        data: {
          albumId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: error.message,
      });
      response.code(error.statusCode || 500);
      return response;
    }
  }

  async getAlbumsHandler() {
    const albums = await this._albumsService.getAlbums();
    return {
      status: "success",
      data: {
        albums,
      },
    };
  }

  async getAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const album = await this._albumsService.getAlbumById(id);

      const response = h.response({
        status: "success",
        data: {
          album,
        },
      });
      response.type("application/json");
      return response;
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: error.message,
      });
      response.code(error.statusCode || 500);
      response.type("application/json");
      return response;
    }
  }

  async putAlbumByIdHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { id } = request.params;
      const { name, year } = request.payload;

      await this._albumsService.editAlbumById(id, { name, year });

      return {
        status: "success",
        message: "Album berhasil diperbarui",
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

  async deleteAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._albumsService.deleteAlbumById(id);

      return {
        status: "success",
        message: "Album berhasil dihapus",
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

  async postUploadCoverHandler(request, h) {
    try {
      const { cover } = request.payload;
      const { id } = request.params;

      if (!cover) {
        return h
          .response({
            status: "fail",
            message: "Cover file is required",
          })
          .code(400)
          .type("application/json");
      }

      this._uploadsValidator.validateImageHeaders(cover.hapi.headers);

      const fileSize = cover.hapi.headers["content-length"] || 0;
      if (fileSize > 512000) {
        return h
          .response({
            status: "fail",
            message:
              "Payload content length greater than maximum allowed: 512000",
          })
          .code(413)
          .type("application/json");
      }

      const filename = await this._storageService.writeFile(cover, cover.hapi);

      const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

      await this._albumsService.editAlbumCoverById(id, fileLocation);

      return h
        .response({
          status: "success",
          message: "Sampul berhasil diunggah",
        })
        .code(201)
        .type("application/json");
    } catch (error) {
      console.error("Upload error:", error);

      return h
        .response({
          status: "fail",
          message: error.message,
        })
        .code(error.statusCode || 500)
        .type("application/json");
    }
  }

  async postAlbumLikesHandler(request, h) {
    try {
      const { id: albumId } = request.params;
      const { id: userId } = request.auth.credentials;

      await this._albumsService.postLikeAlbum(albumId, userId);

      const response = h.response({
        status: "success",
        message: "Berhasil menambahkan like pada album",
      });
      response.code(201);
      return response;
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: error.message,
      });
      response.code(error.statusCode || 500);
      return response;
    }
  }

  async getAlbumLikesHandler(request, h) {
    try {
      const { id: albumId } = request.params;
      const likesData = await this._albumsService.getLikesCountByAlbumId(
        albumId
      );

      const response = h.response({
        status: "success",
        data: {
          likes: likesData.count || likesData, // Handle both object and number response
        },
      });

      // ✅ Set X-Data-Source header based on data source
      if (likesData.source === "cache") {
        response.header("X-Data-Source", "cache");
      }

      return response;
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: error.message,
      });
      response.code(error.statusCode || 500);
      return response;
    }
  }

  async deleteAlbumLikesHandler(request, h) {
    try {
      const { id: albumId } = request.params;
      const { id: userId } = request.auth.credentials;

      await this._albumsService.deleteLikeAlbum(albumId, userId);

      const response = h.response({
        status: "success",
        message: "Berhasil membatalkan like pada album",
      });
      return response;
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: error.message,
      });
      response.code(error.statusCode || 500);
      return response;
    }
  }
}

export default AlbumsHandler;
