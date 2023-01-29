import { Router } from "express";
import { changeAdress, getAdress } from "../controllers/adress.controller";
import { addNewItemToBag, getUserBag } from "../controllers/bag.controller";
import { order } from "../controllers/sales.controller";

const user = Router();

user.post("/user-adress", changeAdress);
user.get("/user-adress", getAdress);
user.post("/user-bag", addNewItemToBag);
user.get("/user-bag", getUserBag);

export default user;
