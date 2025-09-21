import Joi from "joi";

const CollaborationPayloadSchema = Joi.object({
  userId: Joi.string().required(),
  playlistId: Joi.string().optional(),
});

export { CollaborationPayloadSchema };
