import { Router } from "express";
import { order } from "../controllers/sales.controller";

const sales = Router();

sales.post("/order", order);

export default sales;
