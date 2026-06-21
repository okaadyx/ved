import type { Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prismaClient.js";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { successResponse, errorResponse } from "../utils/responseHelper.js";

const JWT_SECRET = process.env.JWT_SECRET || "aether-jwt-secret-key-change-me-in-production";

export const register = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password) {
            return errorResponse(res, "Email and password are required", 400);
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return errorResponse(res, "User with this email already exists", 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name
            }
        });

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

        return successResponse(res, "User registered successfully", {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.error("Error in registration:", error);
        return errorResponse(res, error instanceof Error ? error.message : String(error), 500);
    }
};

export const login = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return errorResponse(res, "Email and password are required", 400);
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return errorResponse(res, "Invalid email or password", 401);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return errorResponse(res, "Invalid email or password", 401);
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

        return successResponse(res, "User logged in successfully", {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.error("Error in login:", error);
        return errorResponse(res, error instanceof Error ? error.message : String(error), 500);
    }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return errorResponse(res, "Unauthorized", 401);
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user) {
            return errorResponse(res, "User not found", 404);
        }

        return successResponse(res, "User profile retrieved successfully", {
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.error("Error in getMe:", error);
        return errorResponse(res, error instanceof Error ? error.message : String(error), 500);
    }
};
