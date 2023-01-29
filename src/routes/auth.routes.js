import {Router} from 'express'
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

import { signUpSchema, signInSchema } from "../schemas/auth.schema.js";
import db from "./../dataBase/db.js";
import { ObjectId } from "mongodb";

const auth = Router()

auth.post("/sign-up", async (req, res) => {
	const { name, email, password, confirmPassword } = req.body;
	try {
		const { error } = signUpSchema.validate({
			name,
			email,
			password,
			confirmPassword,
		},{abortEarly: false});
		if (error)
			return res
				.status(422)
				.send(error.details.map((detail) => detail.message));
		const user = await db.collection("users").findOne({ email });
		if (user) return res.sendStatus(409);
		const SALT = 10;
		const hash = bcrypt.hashSync(password, SALT);
		await db.collection("users").insertOne({ name, email, password: hash });
		return res.sendStatus(201);
	} catch (error) {
		return res.sendStatus(500);
	}
});

auth.post("/sign-in", async (req, res) => {
	const { email, password } = req.body;
	try {
		const { error } = signInSchema.validate({ email, password },{abortEarly: false});
		if (error)
			return res
				.status(422)
				.send(error.details.map((detail) => detail.message));
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
});

export default auth