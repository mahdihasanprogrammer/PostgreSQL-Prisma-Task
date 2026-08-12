import { Router } from "express";
import productRouter from "../services/products";
import categoryRouter from "../services/categories";

const router = Router()

// categories route;
router.use("/categories", categoryRouter);

// products route;
router.use("/products", productRouter);




export default router