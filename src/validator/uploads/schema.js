import Joi from "joi";

const ImageHeadersSchema = Joi.object({
  "content-type": Joi.string()
    .pattern(/^image\//)
    .required(),
}).unknown();

export { ImageHeadersSchema };
