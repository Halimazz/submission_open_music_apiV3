import AlbumsHandler from "./handler.js";
import routes from "./routes.js";
export default {
  name: "albums",
  version: "1.0.0",
  register: async (server, { service, validator, uploadsValidator }) => {
    const albumsHandler = new AlbumsHandler(
      service,
      validator,
      uploadsValidator
    );
    server.route(routes(albumsHandler));
  },
};
