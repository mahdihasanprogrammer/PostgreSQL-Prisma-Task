import { Request, Response, Router } from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}

const authRouter = Router();

authRouter.post("/register", async (req: Request, res: Response) => {
    try {
        const { name, email, password, image } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required",
            });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                image: image || null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                isDeleted: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Registration successful",
            data: newUser,
        });
    } catch (error: any) {
        // Handle duplicate email
        if (error.code === "P2002") {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Registration failed",
            error: error.message,
        });
    }
});


// login route;
authRouter.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Check user
        if (!user || user.isDeleted) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Compare password with hashed password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role,
            },
            JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        // Store JWT in HttpOnly cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Send response without password
        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                role: user.role,
            },
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Login failed",
            error: error.message,
        });
    }
});

export default authRouter;