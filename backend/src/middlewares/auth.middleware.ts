import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { STATUS_CODES } from "../constants/statusCodes";
import { MESSAGES } from "../constants/messages";

export interface AuthRequest extends Request {
    user?: any;
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction): void | any => {

    try {

        const tokenHeader = req.headers.authorization;

        if(!tokenHeader) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json({
                message: MESSAGES.NO_TOKEN
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

        res.status(STATUS_CODES.UNAUTHORIZED).json({
            message: MESSAGES.INVALID_TOKEN
        })
    }
}