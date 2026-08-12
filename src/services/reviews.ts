import { Request, Response, Router } from "express";
import prisma from "../lib/prisma";

const reviewRouter = Router();

// Create Review
reviewRouter.post("/", async (req: Request, res: Response) => {
    try {
        const { userId, productId, rating, comment } = req.body;

        // Validate required fields
        if (!userId || !productId || rating === undefined) {
            return res.status(400).json({
                success: false,
                message: "userId, productId, and rating are required",
            });
        }

        // Validate rating
        if (
            typeof rating !== "number" ||
            rating < 1 ||
            rating > 5 ||
            !Number.isInteger(rating)
        ) {
            return res.status(400).json({
                success: false,
                message: "Rating must be an integer between 1 and 5",
            });
        }

        // Check user exists
        const user = await prisma.user.findFirst({
            where: {
                id: userId,
                isDeleted: false,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check product exists
        const product = await prisma.product.findFirst({
            where: {
                id: productId,
                isDeleted: false,
            },
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Create review
        const newReview = await prisma.review.create({
            data: {
                userId,
                productId,
                rating,
                comment,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                product: true,
            },
        });

        res.status(201).json({
            success: true,
            message: "Review created successfully",
            data: newReview,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error creating review",
            error: error.message,
        });
    }
});

// Get All Reviews
reviewRouter.get("/", async (req: Request, res: Response) => {
    try {
        const reviews = await prisma.review.findMany({
            where: {
                isDeleted: false,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                product: true,

            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.status(200).json({
            success: true,
            message: "Reviews fetched successfully",
            data: reviews,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error fetching reviews",
            error: error.message,
        });
    }
});

// Get Review By ID
reviewRouter.get("/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        const review = await prisma.review.findFirst({
            where: {
                id,
                isDeleted: false,
            },
            include: {
                user: {
                    select:{
                        id:true,
                        name:true,
                        email:true,
                    }
                },
                product: true,
            },
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Review fetched successfully",
            data: review,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error fetching review",
            error: error.message,
        });
    }
});

// Update Review
reviewRouter.patch("/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { rating, comment } = req.body;

        // Validate rating if provided
        if (rating !== undefined) {
            if (
                typeof rating !== "number" ||
                rating < 1 ||
                rating > 5 ||
                !Number.isInteger(rating)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Rating must be an integer between 1 and 5",
                });
            }
        }

        // Check review exists
        const existingReview = await prisma.review.findFirst({
            where: {
                id,
                isDeleted: false,
            },
        });

        if (!existingReview) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        // Update review
        const updatedReview = await prisma.review.update({
            where: {
                id,
            },
            data: {
                ...(rating !== undefined && { rating }),
                ...(comment !== undefined && { comment }),
            },
            include: {
                user: {
                    select:{
                        id:true,
                        name:true,
                        email:true,
                    }
                },
                product: true,
            },
        });

        res.status(200).json({
            success: true,
            message: "Review updated successfully",
            data: updatedReview,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error updating review",
            error: error.message,
        });
    }
});

// Delete Review - Soft Delete
reviewRouter.delete("/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        const existingReview = await prisma.review.findFirst({
            where: {
                id,
                isDeleted: false,
            },
        });

        if (!existingReview) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        const deletedReview = await prisma.review.update({
            where: {
                id,
            },
            data: {
                isDeleted: true,
            },
        });

        res.status(200).json({
            success: true,
            message: "Review deleted successfully",
            data: {
                id: deletedReview.id,
                message: "Review marked as deleted",
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error deleting review",
            error: error.message,
        });
    }
});

export default reviewRouter;