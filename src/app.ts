import express, { Request, Response, NextFunction } from "express";
import compression from "compression";  // compresses requests
import bodyParser from "body-parser";
import path from "path";
import { validate, ValidationError, Joi, schema } from "express-validation";

// Route handlers
import squareRouter from "./routes/squareRouter";
import themeRouter from "./routes/themeRouter";

// Request validators
import { squareIdValidator, squareQueryValidator, themeIdValidator } from "./validators";

// Create Express server
const app = express();


// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
    express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

// Routes
app.get("/api/square", validate(squareQueryValidator), squareRouter.getSquares);
app.get("/api/square/:id", validate(squareIdValidator), squareRouter.getSquareById);
app.get("/api/theme", themeRouter.getThemes);
app.get("/api/theme/:id", validate(themeIdValidator), themeRouter.getThemeById);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ValidationError) {
      return res.status(err.statusCode).json(err);
    }
  
    return res.status(500).json(err);
  });

export default app;
