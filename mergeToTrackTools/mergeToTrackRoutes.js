import { Router } from "express";
import {mergeToTrack} from "./mergeToTrack.js";

const router = Router();

router.post('/', async (req, res) => {
    try {
        const inputSheetId = req.body.sheetIdInput;
        const sheetIdTrack = req.body.sheetIdTrack;

        await mergeToTrack(inputSheetId, sheetIdTrack);
        res.json({ success: true });
    } catch (err) {
        console.error('Error sync to Track', err);
        res.status(400).json({ success: false, error: 'Something went wrong' });
    }

})

export default router;