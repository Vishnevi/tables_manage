import { Router } from "express";
import {createTrackSheet, createWorksSheet} from "./createSheet.js";

const router = Router();

router.post('/', async (req, res) => {
    try {
        const urlTrack = await createTrackSheet();
        const urlWorks = await createWorksSheet();
        res.json({ success: true, urlTrack, urlWorks });
    } catch (err) {
        console.error('Error creating sheet:', err);
        res.status(500).json({ success: false, error: 'Error creating sheet' });
    }
});

export default router;