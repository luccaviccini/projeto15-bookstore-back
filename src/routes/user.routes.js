import { Router } from "express";
import { changeAdress, getAdress } from "../controllers/adress.controller.js";
import { addNewItemToBag, getUserBag } from "../controllers/bag.controller.js";

const user = Router();

user.post("/user-adress", changeAdress);
user.get("/user-adress", getAdress);
user.post("/user-bag", addNewItemToBag);
user.get("/user-bag", getUserBag);

export default user;
