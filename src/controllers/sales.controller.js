export async function order(req, res) {
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
}
