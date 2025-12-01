import { Router } from "express";
import {createSheet} from "./createSheet.js";

const router = Router();

router.post('/', async (req, res) => {
    try {
        const url = await createSheet();
        res.json({ success: true, url});
    } catch (err) {
        console.error('Error creating sheet:', err);
        res.status(500).json({ success: false, error: 'Error creating sheet' });
    }
});

export default router;