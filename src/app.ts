import express from "express";
import compression from "compression";  // compresses requests
import bodyParser from "body-parser";
import path from "path";

// Controllers (route handlers)
import * as dummyController from "./controllers/dummy";

// Routes
import cardRouter from "./routes/card";

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

/**
 * API examples routes.
 */
app.get("/dummyapi", dummyController.dummyApi);
app.get("/api/card", cardRouter.getCards);
app.get("/api/card/:id", cardRouter.getCardById);

export default app;
