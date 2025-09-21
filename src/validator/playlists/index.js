import { PlaylistPayloadSchema } from "./schema.js";
import InvariantError from "../../exceptions/InvariantError.js";
const PlaylistsValidator = {
  validatePlaylistPayload: (payload) => {
    const validationResult = PlaylistPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

export default PlaylistsValidator;
