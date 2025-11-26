import express from 'express';
import logger from "./logger.js";
import parseResponse from "./parseResponse.js";

const app = express();
const PORT = process.env.PORT || 5000;

logger(app);
parseResponse(app);

app.get("/", (req, res) => {
    res.send('Hello World!').status(200);
})




app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));
