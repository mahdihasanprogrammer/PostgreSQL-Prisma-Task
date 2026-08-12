"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
// Initialize Express router for category-related routes
const categoryRouter = (0, express_1.Router)();
/**
 * ============================================
 * CATEGORY ROUTES - Complete CRUD Operations
 * ============================================
 *
 * Categories are used to organize products into logical groups.
 * This router handles:
 * - Creating product categories
 * - Retrieving categories with products
 * - Updating category information
 * - Deleting categories
 */
/**
 * POST /categories
 *
 * Create a new product category
 *
 * Expected Request Body:
 * {
 *   "name": "Electronics"
 * }
 *
 * Returns: Created category object with ID and timestamps
 */
categoryRouter.post("/", async (req, res) => {
    try {
        // Extract category data from request body
        const { name } = req.body;
        // Validate required fields
        if (!name || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Category name is required",
            });
        }
        // Create category in database using Prisma
        const newCategory = await prisma_1.default.category.create({
            data: {
                name: name.trim(),
            },
        });
        // Return success response with created category
        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: newCategory,
        });
    }
    catch (error) {
        // Handle duplicate category name error
        if (error.code === "P2002") {
            return res.status(400).json({
                success: false,
                message: "Category with this name already exists",
            });
        }
        res.status(500).json({
            success: false,
            message: "Error creating category",
            error: error.message,
        });
    }
});
/**
 * GET /categories
 *
 * Retrieve all categories
 *
 * Query Parameters:
 * - includeDeleted: Include soft-deleted categories (default: false)
 * - includeProducts: Include products in each category (default: false)
 *
 * Returns: Array of all categories with optional product details
 */
categoryRouter.get("/", async (req, res) => {
    try {
        // Fetch all categories from database
        const categories = await prisma_1.default.category.findMany({
            where: { isDeleted: false },
            include: {
                products: true
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        // Return success response with categories list
        res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            data: categories,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching categories",
            error: error.message,
        });
    }
});
/**
 * GET /categories/:id
 *
 * Retrieve a specific category by ID with its products
 *
 * Path Parameters:
 * - id: Category ID (UUID)
 *
 * Query Parameters:
 * - includeProducts: Include products in this category (default: true)
 *
 * Returns: Single category object with its products
 */
categoryRouter.get("/:id", async (req, res) => {
    try {
        // Extract category ID from URL parameters and cast to string
        const id = req.params.id;
        // Find category by ID in database
        const category = await prisma_1.default.category.findUnique({
            where: { id },
            include: {
                // Include products belonging to this category
                products: true,
            },
        });
        // Check if category exists
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }
        // Check if category is soft-deleted
        if (category.isDeleted) {
            return res.status(404).json({
                success: false,
                message: "Category not found (deleted)",
            });
        }
        // Return success response with category data
        res.status(200).json({
            success: true,
            message: "Category fetched successfully",
            data: category,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching category",
            error: error.message,
        });
    }
});
/**
 * PATCH /categories/:id
 *
 * Update category information
 *
 * Path Parameters:
 * - id: Category ID (UUID)
 *
 * Expected Request Body:
 * {
 *   "name": "Updated Category Name"
 * }
 *
 * Returns: Updated category object
 */
categoryRouter.patch("/:id", async (req, res) => {
    try {
        // Extract category ID from URL parameters and cast to string
        const id = req.params.id;
        // Extract update data from request body
        const { name } = req.body;
        // Validate that name is provided and not empty
        if (name !== undefined && name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Category name cannot be empty",
            });
        }
        // Check if another category has the same name
        if (name) {
            const existingCategory = await prisma_1.default.category.findUnique({
                where: { name: name.trim() },
            });
            if (existingCategory && existingCategory.id !== id) {
                return res.status(400).json({
                    success: false,
                    message: "Category name already in use",
                });
            }
        }
        // Update category in database
        const updatedCategory = await prisma_1.default.category.update({
            where: { id },
            data: name ? { name: name.trim() } : {},
        });
        // Return success response with updated category
        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: updatedCategory,
        });
    }
    catch (error) {
        // Handle not found error
        if (error.code === "P2025") {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }
        res.status(500).json({
            success: false,
            message: "Error updating category",
            error: error.message,
        });
    }
});
/**
 * DELETE /categories/:id
 *
 * Delete a category (soft delete - marks as deleted without removing from DB)
 *
 * Path Parameters:
 * - id: Category ID (UUID)
 *
 * Query Parameters:
 * - permanent: boolean (default: false) - Permanently delete from database
 *
 * Returns: Success message
 */
categoryRouter.delete("/:id", async (req, res) => {
    try {
        // Extract category ID from URL parameters and cast to string
        const id = req.params.id;
        // Soft delete: mark category as deleted instead of removing from database
        const deletedCategory = await prisma_1.default.category.update({
            where: { id },
            data: { isDeleted: true },
        });
        // Return success response
        res.status(200).json({
            success: true,
            message: "Category deleted successfully",
            data: {
                id: deletedCategory.id,
                message: "Category marked as deleted",
            },
        });
    }
    catch (error) {
        // Handle not found error
        if (error.code === "P2025") {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }
        res.status(500).json({
            success: false,
            message: "Error deleting category",
            error: error.message,
        });
    }
});
// Export router to be used in main application
exports.default = categoryRouter;
