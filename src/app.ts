import express from "express";
import compression from "compression";  // compresses requests
import bodyParser from "body-parser";
import path from "path";

// Route handlers
import squareRouter from "./routes/square";
import themeRouter from "./routes/theme";

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
app.get("/api/square", squareRouter.getSquares);
app.get("/api/square/:id", squareRouter.getSquareById);
app.get("/api/theme", themeRouter.getThemes);
app.get("/api/theme/:id", themeRouter.getThemeById);

export default app;
