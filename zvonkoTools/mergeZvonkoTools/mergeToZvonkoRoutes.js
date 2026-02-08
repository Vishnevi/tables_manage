import { Router } from "express";
import {mergeToZvonko} from "./mergeToZvonko.js";

const router = Router();

router.post('/', async (req, res) => {
    try {
        const inputSheetId = req.body.sheetIdInput;
        const sheetIdZvonko = req.body.sheetIdZvonko;
        const result = await mergeToZvonko(inputSheetId, sheetIdZvonko);

        if (!result.ok) {
            return res.status(400).json({
                success: false,
                errors: result.errors || [],
                error: result.error,
                message: result.message
            });
        }

        res.status(200).json({ success: true })
    } catch (err) {
        console.error('Error sync to Zvonko', err);
        res.status(400).json({ success: false, error: 'Something went wrong' });
    }
})

export default router;