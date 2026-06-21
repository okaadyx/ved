import type { Response } from "express";

export const successResponse = (res: Response, message: string, data?: any, status = 200, meta?: any) => {
    return res.status(status).json({
        status: true,
        message,
        data,
        meta
    })
}

export const errorResponse = (res: Response, message: string, status = 500, error?: any) => {
    const debugInfo = error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        ...(error as any)

    } : error

    return res.status(status).json({
        status: false,
        message,
        debug: debugInfo,
        error: process.env.NODE_ENV === "development" ? debugInfo : undefined
    })
}