export async function getAdress(req, res) {
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
}

export async function changeAdress(req, res) {
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
}
