import "dotenv/config";
import Hapi from "@hapi/hapi";
import Inert from "@hapi/inert";
import Jwt from "@hapi/jwt";
import path from "path";
import ClientError from "./exceptions/ClientError.js";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// songs
import songs from "./api/songs/index.js";
import SongsService from "./services/postgres/SongsService.js";
import SongsValidator from "./validator/songs/index.js";

// albums
import albums from "./api/albums/index.js";
import AlbumsService from "./services/postgres/AlbumsService.js";
import AlbumsValidator from "./validator/albums/index.js";

//users
import users from "./api/users/index.js";
import UsersService from "./services/postgres/UsersService.js";
import UsersValidator from "./validator/users/index.js";

//Authentications
import authentications from "./api/authentications/index.js";
import AuthenticationsService from "./services/postgres/AuthenticationsService.js";
import TokenManager from "./tokenize/TokenManager.js";
import AuthenticationsValidator from "./validator/authentications/index.js";
// Playlists
import playlists from "./api/playlists/index.js";
import PlaylistsService from "./services/postgres/PlaylistsService.js";
import PlaylistsValidator from "./validator/playlists/index.js";
import PlaylistSongsValidator from "./validator/playlist-songs/index.js";
// Collaborations
import collaborations from "./api/collaborations/index.js";
import CollaborationsService from "./services/postgres/CollaborationsService.js";
import CollaborationsValidator from "./validator/collaborations/index.js";
//exports
import _exports from "./api/exports/index.js";
import ExportsValidator from "./validator/exports/index.js";
import ProducerService from "./services/rabbitmq/ProducerService.js";

//uploads
import StorageService from "./services/storage/StorageService.js";
import UploadsValidator from "./validator/uploads/index.js";

//cache
import CacheService from "./services/redis/CacheService.js";

const init = async () => {
  const cacheService = new CacheService();
  const albumsService = new AlbumsService(cacheService);
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const storageService = new StorageService(
    path.resolve(__dirname, "src/api/albums/file/covers")
  );

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST !== "production" ? "localhost" : "0.0.0.0",
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  server.auth.strategy("openmusic_jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  server.ext("onPreResponse", (request, h) => {
    const { response } = request;
    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: "fail",
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }
      if (!response.isServer) {
        return h.continue;
      }
      const newResponse = h.response({
        status: "error",
        message: "terjadi kegagalan pada server kami",
      });
      console.log(response);
      newResponse.code(500);
      return newResponse;
    }
    return h.continue;
  });

  server.route({
    method: "GET",
    path: "/upload/images/{param*}",
    handler: {
      directory: {
        path: path.resolve(__dirname, "api/albums/file/covers"),
      },
    },
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: { albumsService, storageService },
        validator: AlbumsValidator,
        uploadsValidator: UploadsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
        playlistSongsValidator: PlaylistSongsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        service: collaborationsService,
        playlistsService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        validator: ExportsValidator,
        playlistsService,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
