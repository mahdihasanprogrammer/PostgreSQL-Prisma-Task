import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const app = express();

// middlewares;
app.use(cors());
app.use(express.json());

// routes;
app.get("/", (req:Request, res:Response) => {
  res.json({
    success: true,
    message: "Welcome to the PostgreSQL Prisma Task API",
  })
});

export default app;