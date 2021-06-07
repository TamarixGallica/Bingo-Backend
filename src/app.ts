import express, { Request, Response, NextFunction } from "express";
import compression from "compression";  // compresses requests
import cookieParser from "cookie-parser";
import path from "path";
import { validate, ValidationError } from "express-validation";

// Route handlers
import squareRouter from "./routes/squareRouter";
import themeRouter from "./routes/themeRouter";
import cardRouter from "./routes/cardRouter";
import userRouter from "./routes/userRouter";

// Request validators
import { themeAddValidator, squareIdValidator, squareQueryValidator, squareUpdateValidator, themeIdValidator, themeQueryValidator, squareAddValidator, themeUpdateValidator } from "./validators";
import { cardValidator } from "./validators/cardValidator";
import { loginUserValidator, registerUserValidator } from "./validators/userValidator";

// Middleware
import authorize from "./middleware/authorization";

// Create Express server
const app = express();


// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
    express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

// Routes
app.get("/api/card", validate(cardValidator), cardRouter.getCards);
app.get("/api/square", validate(squareQueryValidator), squareRouter.getSquares);
app.post("/api/square", validate(squareAddValidator), authorize, squareRouter.addSquare);
app.get("/api/square/:id", validate(squareIdValidator), squareRouter.getSquareById);
app.put("/api/square/:id", validate(squareUpdateValidator, { context: true }), authorize, squareRouter.updateSquare);
app.delete("/api/square/:id", validate(squareIdValidator), authorize, squareRouter.deleteSquareById);
app.get("/api/theme", validate(themeQueryValidator) ,themeRouter.getThemes);
app.post("/api/theme", validate(themeAddValidator), authorize, themeRouter.addTheme);
app.get("/api/theme/:id", validate(themeIdValidator), themeRouter.getThemeById);
app.put("/api/theme/:id", validate(themeUpdateValidator, { context: true }), authorize, themeRouter.updateTheme);
app.delete("/api/theme/:id", validate(themeIdValidator), authorize, themeRouter.deleteThemeById);
app.post("/api/user/login", validate(loginUserValidator), userRouter.loginUser);
app.post("/api/user/register", validate(registerUserValidator), userRouter.registerUser);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ValidationError) {
      return res.status(err.statusCode).json(err);
    }
  
    return res.status(500).json(err);
  });

export default app;
