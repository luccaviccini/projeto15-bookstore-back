import { ObjectId } from "mongodb";
import db from "../dataBase/db.js";

export async function addNewItemToBag(req, res) {
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
}

export async function getUserBag(req, res) {
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
}
