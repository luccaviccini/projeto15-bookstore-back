import { Router } from "express";
import { order } from "../controllers/sales.controller.js";

const sales = Router();

sales.post("/order", order);

export default sales;
