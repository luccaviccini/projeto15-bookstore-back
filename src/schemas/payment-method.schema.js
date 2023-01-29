import Joi from "joi";

export const paymentSchema = Joi.string().valid(
	"bank-slip",
	"pix",
	"credit-debit-card"
);
