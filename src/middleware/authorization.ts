import { Request, Response, NextFunction } from "express";
import sessionService from "../services/sessionService";

const authorize = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { token } = req.cookies;

        if (typeof token !== "string")
        {
            throw new Error("Request cookie is invalid.");
        }

        const session = await sessionService.getSessionByToken(token);

        if (!session)
        {
            throw new Error("Session was not found");
        }

        next();
    }
    catch (err) {
        res.status(401).end();
    }
};

export default authorize;
