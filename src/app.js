import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

import { signUpSchema, signInSchema } from "./schemas/auth.schema.js";
import db from "./dataBase/db.js";
import { ObjectId } from "mongodb";

import authRoutes from "./routes/auth.routes.js";
import { paymentSchema } from "./schemas/payment-mehtod.schema.js";
import { adressSchema } from "./schemas/adress.schema.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use(authRoutes);

app.get("/books", async (req, res) => {
	const { authorization } = req.headers;
	const token = authorization?.replace("Bearer ", "");

	//check token in sessions
	try {
		const foundUserSession = await db
			.collection("sessions")
			.findOne({ token });
		if (!foundUserSession) return res.sendStatus(401);
		const books = await db.collection("books").find({}).toArray();
		return res.status(200).send(books);
	} catch (error) {
		return res.sendStatus(500);
	}
});

//individual page rendering
// app.get("/books/:id", async (req, res) => {
// 	const { id } = req.params;
// 	try {
// 		const book = await db.collection("books").findOne({ _id: new ObjectId(id) });
// 		if (!book) return res.sendStatus(404);
// 		return res.status(200).send(book);
// 	} catch (error) {
// 		return res.sendStatus(500);
// 	}
// });

app.post("/user-bag", async (req, res) => {
	const { bookId } = req.body;

	const { authorization } = req.headers;
	const token = authorization?.replace("Bearer ", "");

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
	const { authorization } = req.headers;
	const token = authorization?.replace("Bearer ", "");

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
		return res.status(200).send(bag);
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

app.get("/user-adress", async (req, res) => {
	const { authorization } = req.headers;
	const token = authorization?.replace("Bearer ", "");

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
		return res.sendStatus(500);
	}
});

app.post("/user-adress", async (req, res) => {
	const { authorization } = req.headers;
	const token = authorization?.replace("Bearer ", "");
	const adress = req.body;
	const { error } = adressSchema.validate(adress);
	console.log(adress);

	if (error)
		return res
			.status(422)
			.send(error.details.map((detail) => detail.message));

	try {
		const foundUserSession = await db
			.collection("sessions")
			.findOne({ token });
		if (!foundUserSession) return res.sendStatus(401);

		await db.collection("users").updateOne(
			{ _id: new ObjectId(foundUserSession.userId) },
			{
				$set: {
					adress: adress,
				},
			}
		);
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

app.post("/order", async (req, res) => {
	const { authorization } = req.headers;
	const token = authorization?.replace("Bearer ", "");
	const payment = req.body;
	const { error } = paymentSchema.validate(payment.method);

	console.log(token);
	if (error)
		return res
			.status(422)
			.send(error.details.map((detail) => detail.message));

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

		await db.collection("sales").insertOne({
			books: bag,
			adress: user.adress,
			user: user.name,
			userId: user._id,
			paymentMethod: payment.method,
		});
		return res.sendStatus(200);
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
	console.log(`rodando na porta ${port}`);
});
