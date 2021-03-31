"use strict";

import { Response, Request } from "express";

export const dummyApi = (req: Request, res: Response) => {
    res.send("Hello world!").end();
};