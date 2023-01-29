import Joi from "joi";

export const adressSchema = Joi.object({
	name: Joi.string().min(5).required(),
	phone: Joi.number().min(8).required(),
	city: Joi.string().min(3).required(),
	zipCode: Joi.number().min(6).required(),
	adressLine: Joi.string().min(10).required(),
});
