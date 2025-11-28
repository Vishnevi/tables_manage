import express from 'express';
import logger from "./logger.js";
import parseResponse from "./parseResponse.js";
import { google } from "googleapis";
import createRoute from "./router.js";
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
logger(app);
parseResponse(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

export const auth = new google.auth.GoogleAuth({
   keyFile: './google.json',
   scopes: [
       'https://www.googleapis.com/auth/spreadsheets',
       'https://www.googleapis.com/auth/drive'
   ]
});

app.use('/create-sheet', createRoute);



app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));
