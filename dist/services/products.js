"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const productRouter = (0, express_1.Router)();
productRouter.post("/", async (req, res) => {
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
        const category = await prisma_1.default.category.findUnique({
            where: { id: categoryId, isDeleted: false },
        });
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }
        // Create product in database using Prisma
        const status = stock === 0 ? "OUT_OF_STOCK" : "ACTIVE";
        const newProduct = await prisma_1.default.product.create({
            data: {
                title,
                description,
                price,
                stock,
                image,
                status,
                categoryId
            },
            include: {
                category: true // Include category details in response
            }
        });
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: newProduct,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while creating the product",
            error: error.message || "Internal Server Error",
        });
    }
});
// get all products
productRouter.get("/", async (req, res) => {
    try {
        const products = await prisma_1.default.product.findMany({
            where: { isDeleted: false },
            include: {
                category: true,
            },
        });
        res.status(200).json({
            success: true,
            message: "Products retrieved successfully",
            data: products,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while retrieving products",
            error: error.message || "Internal Server Error",
        });
    }
});
// get product by id
productRouter.get("/:id", async (req, res) => {
    try {
        // Extract product ID from URL parameters and cast to string
        const id = req.params.id;
        // Find product by ID in database with related data
        const product = await prisma_1.default.product.findUnique({
            where: { id },
            include: {
                category: true, // Include category information
            },
        });
        // Check if product exists
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }
        // Check if product is soft-deleted
        if (product.isDeleted) {
            return res.status(404).json({
                success: false,
                message: "Product not found (deleted)",
            });
        }
        // Return success response with product data
        res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            data: product,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching product",
            error: error.message,
        });
    }
});
// PATCH /products/:id, update product information
productRouter.patch("/:id", async (req, res) => {
    try {
        // Extract product ID from URL parameters and cast to string
        const id = req.params.id;
        // Extract update data from request body
        const updateData = req.body;
        // Validate price if provided
        if (updateData.price !== undefined && updateData.price <= 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be positive",
            });
        }
        // Validate stock if provided
        if (updateData.stock !== undefined && updateData.stock < 0) {
            return res.status(400).json({
                success: false,
                message: "Stock cannot be negative",
            });
        }
        // Verify category exists if categoryId is being updated
        if (updateData.categoryId) {
            const category = await prisma_1.default.category.findUnique({
                where: { id: updateData.categoryId },
            });
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found",
                });
            }
        }
        // Update product in database
        const updatedProduct = await prisma_1.default.product.update({
            where: { id },
            data: updateData,
            include: {
                category: true,
            },
        });
        // Return success response with updated product
        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: updatedProduct,
        });
    }
    catch (error) {
        // Handle not found error
        if (error.code === "P2025") {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }
        res.status(500).json({
            success: false,
            message: "Error updating product",
            error: error.message,
        });
    }
});
// DELETE /products/:id, soft delete product by marking it as deleted
productRouter.delete("/:id", async (req, res) => {
    try {
        // Extract product ID from URL parameters and cast to string
        const id = req.params.id;
        // Soft delete: mark product as deleted instead of removing from database
        const deletedProduct = await prisma_1.default.product.update({
            where: { id },
            data: { isDeleted: true },
        });
        // Return success response
        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            data: {
                id: deletedProduct.id,
                message: "Product marked as deleted",
            },
        });
    }
    catch (error) {
        // Handle not found error
        if (error.code === "P2025") {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }
        res.status(500).json({
            success: false,
            message: "Error deleting product",
            error: error.message,
        });
    }
});
exports.default = productRouter;
