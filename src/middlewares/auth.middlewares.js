import {signUpSchema, signInSchema} from './../schemas/auth.schema.js'

export function signUpValidation(req, res, next) {
  const user = req.body
  const { name, email, password, confirmPassword } = user
  const { error } = signUpSchema.validate({
    name,
    email,
    password,
    confirmPassword,
  }, { abortEarly: false });
  if (error)
    return res
      .status(422)
      .send(error.details.map((detail) => detail.message));
  res.locals.user = user
  next()
}

export function signInValidation(req, res, next){
  const user = req.body
  const { email, password } = user
  const { error } = signInSchema.validate({ email, password },{abortEarly: false});
		if (error)
			return res
				.status(422)
				.send(error.details.map((detail) => detail.message));
  res.locals.user = user
  next()
}