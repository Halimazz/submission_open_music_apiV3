import PlaylistsHandler from "./handler.js";
import routes from "./routes.js";

export default {
  name: "playlists",
  version: "1.0.0",
  register: async (server, { service, validator, playlistSongsValidator }) => {
    const playlistsHandler = new PlaylistsHandler(
      service,
      validator,
      playlistSongsValidator
    );
    server.route(routes(playlistsHandler));
  },
};
