import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
import router from "./routes/index";
import cookieParser from "cookie-parser";

const app = express();

// middlewares;
app.use(cors());
app.use(express.json());
app.use(cookieParser())

// routes;

// welcome route
app.get("/", (req:Request, res:Response) => {
  res.json({
    success: true,
    message: "Welcome to the PostgreSQL Prisma Task API",
  })
});

// all routes;
app.use("/api", router)

export default app;