import Joi from "joi";

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().required(),
  cover: Joi.string().uri().optional(),
});

export { AlbumPayloadSchema };
