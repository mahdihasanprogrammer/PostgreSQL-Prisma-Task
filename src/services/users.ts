import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";

// Initialize Express router for user-related routes
const userRouter = Router();

/**
 * ============================================
 * USER ROUTES - Complete CRUD Operations
 * ============================================
 * 
 * This router handles all user-related operations including:

 * - Retrieving user data
 * - Updating user information
 * - Deleting users
 */



/**
 * GET /users
 * 
 * Retrieve all users
 * 
 * Query Parameters:
 * - includeDeleted: boolean (default: false) - Include soft-deleted users
 * 
 * Returns: Array of all users (excluding deleted users by default)
 */
userRouter.get("/", async (req: Request, res: Response) => {
  try {
    // // Check if deleted users should be included
    // const includeDeleted = req.query.includeDeleted === "true";

    // Fetch all users from database
    // By default, only include active users (isDeleted = false)
    const users = await prisma.user.findMany({
      where:  { isDeleted: false },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password from response for security
      },
    });

    // Return success response with users list
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
});

/**
 * GET /users/:id
 * 
 * Retrieve a specific user by ID
 * 
 * Path Parameters:
 * - id: User ID (UUID)
 * 
 * Returns: Single user object with all details
 */

userRouter.get("/profile", authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user?.userId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            data: user,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error fetching profile",
            error: error.message,
        });
    }
});

userRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    // Extract user ID from URL parameters and cast to string
    const id = req.params.id as string;

    // Find user by ID in database
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
        // Include related orders and cart items
        reviews:{where: { isDeleted: false }},
      },
    });

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is soft-deleted
    if (user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "User not found (deleted)",
      });
    }

    // Return success response with user data
    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
});

/**
 * PATCH /users/:id
 * 
 * Update user information
 * 
 * Path Parameters:
 * - id: User ID (UUID)
 * 
 * Expected Request Body (all fields optional):
 * {
 *   "name": "Jane Doe",
 *   "email": "jane@example.com",
 *   "role": "ADMIN"
 * }
 * 
 * Returns: Updated user object
 */
userRouter.patch("/:id", async (req: Request, res: Response) => {
  try {
    // Extract user ID from URL parameters and cast to string
    const id = req.params.id as string;
    // Extract update data from request body
    const updateData = req.body;

    // Prevent updating email if it already exists
    if (updateData.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: updateData.email },
      });

      if (existingUser && existingUser.id !== id) {
        return res.status(400).json({
          success: false,
          message: "Email already in use by another user",
        });
      }
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Return success response with updated user
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    // Handle not found error
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
});

/**
 * DELETE /users/:id
 * 
 * Delete a user (soft delete - marks as deleted without removing from DB)
 * 
 * Path Parameters:
 * - id: User ID (UUID)
 * 
 * Query Parameters:
 * - permanent: boolean (default: false) - Permanently delete from database
 * 
 * Returns: Success message
 */
userRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    // Extract user ID from URL parameters and cast to string
    const id = req.params.id as string;
    // Check if permanent deletion is requested
    const permanent = req.query.permanent === "true";

    if (permanent) {
      // Permanently delete user from database
      // This will also cascade delete related records (orders, cart items)
      await prisma.user.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        message: "User permanently deleted",
      });
    }

    // Soft delete: mark user as deleted instead of removing from database
    const deletedUser = await prisma.user.update({
      where: { id },
      data: { isDeleted: true },
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: {
        id: deletedUser.id,
        message: "User marked as deleted",
      },
    });
  } catch (error: any) {
    // Handle not found error
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
});

// Export router to be used in main application
export default userRouter;
