import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import db from "./dataBase/db.js";
import { ObjectId } from "mongodb";

import authRoutes from "./routes/auth.routes.js";
import { adressSchema } from "./schemas/adress.schema.js";
import salesRoutes from "./routes/sales.routes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use([authRoutes, salesRoutes]);

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

const port = process.env.PORT || 5000;

app.listen(port, () => {
	console.log(`rodando na porta ${port}`);
});
