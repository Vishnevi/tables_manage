import express from 'express';
import logger from "./core/logger.js";
import parseResponse from "./core/parseResponse.js";
import { google } from "googleapis";
import path from 'path';
import { fileURLToPath } from 'url';
import routes from "./core/routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
logger(app);
parseResponse(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));


routes(app);



app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));
