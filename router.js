import { Router } from "express";
import { createSheetViaDrive } from "./createSheet.js";

const router = Router();

router.post('/', async (req, res) => {
    try {
        const url = await createSheetViaDrive();
        res.json({ success: true, url});
    } catch (err) {
        console.error('Error creating sheet:', err);
        res.status(500).json({ success: false, error: 'Something went wrong' });
    }
});

export default router;