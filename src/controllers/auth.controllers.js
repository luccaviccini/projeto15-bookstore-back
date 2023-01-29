
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { signInSchema } from "../schemas/auth.schema.js";
import db from "./../dataBase/db.js";

export async function signUp(req, res){
	try {
		const {name, email, password} = res.locals.user
		const user = await db.collection("users").findOne({ email });
		if (user) return res.sendStatus(409);
		const SALT = 10;
		const hash = bcrypt.hashSync(password, SALT);
		await db.collection("users").insertOne({ name, email, password: hash });
		return res.sendStatus(201);
	} catch (error) {
		return res.sendStatus(500);
	}
}

export async function signIn (req, res){
	try {
		const { email, password } = res.locals.user;
		const user = await db.collection("users").findOne({ email });
		if (!user) return res.sendStatus(404);
		if (bcrypt.compareSync(password, user.password)) {
			const token = uuid();
			const data = {
				token,
				userId: user._id,
			};
			await db.collection("sessions").insertOne(data);
			return res.send(data);
		}
	} catch (error) {
		return res.sendStatus(500);
	}
}