import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
    user?: any;
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction): void | any => {

    try {

        const token = req.headers.authorization

        if(!token) {
            return res.status(401).json({
                message: "No token"
            })
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        )

        req.user = decoded

        next()

    } catch (error) {

        res.status(401).json({
            message: "Invalid token"
        })
    }
}