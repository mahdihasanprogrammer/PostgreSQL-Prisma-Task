import { Router } from "express";
import productRouter from "../services/products";
import categoryRouter from "../services/categories";
import userRouter from "../services/users";
import reviewRouter from "../services/reviews";
import authRouter from "../services/auth";

const router = Router()

// auth route;
router.use("/auth",authRouter)

// users route;
router.use("/users",userRouter);

// categories route;
router.use("/categories", categoryRouter);

// products route;
router.use("/products", productRouter);


// reviews route;
router.use("/reviews", reviewRouter);



export default router