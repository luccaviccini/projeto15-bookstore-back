import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

import { signUpSchema, signInSchema } from "./schemas/auth.schema.js";
import db from "./dataBase/db.js";
import { ObjectId } from "mongodb";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.post("/sign-up", async (req, res) => {
	const { name, email, password, confirmPassword } = req.body;
	try {
		const { error } = signUpSchema.validate({
			name,
			email,
			password,
			confirmPassword,
		});
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

app.post("/sign-in", async (req, res) => {
	const { email, password } = req.body;
	try {
		const { error } = signInSchema.validate({ email, password });
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

app.post("/user-bag", async (req, res) => {
	const { bookId } = req.body;
	const { token } = req.headers;

	try {
		const foundUserSession = await db
			.collection("sessions")
			.findOne({ token });
		if (!foundUserSession) return res.sendStatus(401);

		const foundBook = await db
			.collection("books")
			.findOne({ _id: new ObjectId(bookId) });
		if (!foundBook) return res.sendStatus(404);

		const user = await db
			.collection("users")
			.findOne({ _id: new ObjectId(foundUserSession.userId) });

		if (user.userBag) {
			const isBookAlreadyOnBag = user.userBag.find(
				(item) => item.bookId === bookId
			);
			if (isBookAlreadyOnBag) return res.sendStatus(409);
		}

		await db.collection("users").findOneAndUpdate(
			{ _id: new ObjectId(foundUserSession.userId) },
			{
				$push: {
					userBag: { bookId },
				},
			}
		);

		return res.sendStatus(200);
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

app.get("/user-bag", async (req, res) => {
	const { token } = req.headers;

	try {
		const foundUserSession = await db
			.collection("sessions")
			.findOne({ token });
		if (!foundUserSession) return res.sendStatus(401);

		const user = await db
			.collection("users")
			.findOne({ _id: new ObjectId(foundUserSession.userId) });

		if (!user.userBag) res.status(200).send([]);

		const obj_ids = user.userBag.map(function (item) {
			return ObjectId(item.bookId);
		});

		const bag = await db
			.collection("books")
			.find({ _id: { $in: obj_ids } })
			.toArray();

		console.log(bag);
		return res.status(200).send(bag);
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

app.get("/user-adress", async (req, res) => {
	const { token } = req.headers;

	try {
		const foundUserSession = await db
			.collection("sessions")
			.findOne({ token });
		if (!foundUserSession) return res.sendStatus(401);

		const user = await db
			.collection("users")
			.findOne({ _id: new ObjectId(foundUserSession.userId) });

		if (!user.adress) res.status(200).send(null);
		return res.status(200).send(user.adress);
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

app.post("/user-adress", async (req, res) => {
	const { token } = req.headers;
	const adress = req.body;

	const { error } = adressSchema.validate({ adress });
	if (error)
		return res
			.status(422)
			.send(error.details.map((detail) => detail.message));

	try {
		const foundUserSession = await db
			.collection("sessions")
			.findOne({ token });
		if (!foundUserSession) return res.sendStatus(401);

		await db.collection("users").findOneAndUpdate(
			{ _id: new ObjectId(foundUserSession.userId) },
			{
				$push: {
					adress: adress,
				},
			}
		);
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
	console.log(`rodando na porta ${port}`);
});
