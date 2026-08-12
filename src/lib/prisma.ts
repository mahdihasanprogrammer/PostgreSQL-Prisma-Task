import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import dotenv from "dotenv";
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not found in the environment variables. Please set it before running the application.");
}
const adapter = new PrismaPg({ connectionString:DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export default prisma;