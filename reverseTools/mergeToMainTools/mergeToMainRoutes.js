import { Router } from "express";
import {mergeToMain} from "./mergeToMain.js";

const router = Router();

router.post('/', async (req, res) => {
    try {
        const sheetIdTrack = req.body.sheetIdTrack;
        const sheetIdWorks = req.body.sheetIdWorks;
        const sheetIdMain = req.body.sheetIdMain;
        const result = await mergeToMain(sheetIdTrack, sheetIdWorks, sheetIdMain);

        if (!result.ok) {
            return res.status(400).json({
                success: false,
                error: result.error,
                message: result.message
            });
        }

        res.status(200).json({ success: true, processedRows: result.processedRows });
    } catch (err) {
        console.error('Error sync to Main', err);
        res.status(400).json({ success: false, error: 'Something went wrong' });
    }
})

export default router;
