import { Request, Response, Router } from "express";
import prisma from "../lib/prisma";

const productRouter = Router();

productRouter.post("/", async (req: Request, res: Response) => {
    try {
        // Extract product data from request body
        const { title, description, price, stock, image, categoryId } = req.body;

        // Validate required fields
        if (!title || !price || stock === undefined || !categoryId) {
            return res.status(400).json({
                success: false,
                message: "Title, price, stock, and categoryId are required",
            });
        }

        // Validate that price and stock are positive numbers
        if (price <= 0 || stock < 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be greater than 0 and stock cannot be negative",
            });
        }

        // Verify that category exists before creating product;
        const category = await prisma.category.findUnique({
            where: { id: categoryId, isDeleted: false },
        })
       

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        // Create product in database using Prisma
        const status = stock === 0 ? "OUT_OF_STOCK" : "ACTIVE"
        const newProduct = await prisma.product.create({
            data: {
                title,
                description,
                price,
                stock,
                image,
                status,
                categoryId
            },
            include:{
                 category: true // Include category details in response
            }
        });
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: newProduct,
        });
    } catch (error:any) {
        res.status(500).json({
            success: false,
            message: "An error occurred while creating the product",
            error: error.message || "Internal Server Error",
        });
    }
});

export default productRouter;
