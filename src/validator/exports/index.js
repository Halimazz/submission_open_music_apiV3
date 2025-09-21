import { ExportsPlaylistPayloadSchema } from "./schema.js";
import InvariantError from "../../exceptions/InvariantError.js";

const ExportsValidator = {
  validateExportsPlaylistPayload: (payload) => {
    const validateResult = ExportsPlaylistPayloadSchema.validate(payload);
    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  },
};

export default ExportsValidator;
