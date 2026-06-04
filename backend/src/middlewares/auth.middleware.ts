import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
    user?: any;
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction): void | any => {

    try {

        const tokenHeader = req.headers.authorization;

        if(!tokenHeader) {
            return res.status(401).json({
                message: "No token"
            })
        }

        const token = tokenHeader.startsWith("Bearer ") ? tokenHeader.split(" ")[1] : tokenHeader;

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