import { Router } from "express";
import { createSheet } from "./createSheet.js";

const router = Router();

router.post('/', async (req, res) => {
    try {
        const link = await createSheet();
        res.json({ success: true, link });
    } catch (err) {
        console.error('Error creating sheet:', err);
        res.status(500).json({ success: false, error: 'Something went wrong' });
    }
});

export default router;